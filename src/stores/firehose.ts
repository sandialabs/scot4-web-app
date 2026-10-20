import { ref, reactive } from "vue";
import { defineStore } from "pinia";
import { useSnackBarStore } from "./snackbar";
import { useAuthStore, useNotificationStore } from "@/stores";
import { IRElementType } from "@/types/irelement";
import { useBusStore } from "./bus";
import { useStorage } from "@/storage/storage";
import { environment as env } from "@/environments/environment";
import {
    wsconnect as natsconnect,
    type NatsConnection,
    type Subscription,
} from "@nats-io/transport-node";

export const useFirehoseStore = defineStore("firehose", () => {
    const SnackBar = useSnackBarStore();
    const Auth = useAuthStore();
    const Bus = useBusStore();
    const Storage = useStorage();
    const notificationStore = useNotificationStore();

    const selectedElement: any = reactive({});
    const selectedElementType = ref<IRElementType>();
    const entryIds = ref([] as number[]);
    const firehoseReconnectTask = ref(null);
    const isConnected = ref(false);
    const isConnecting = ref(false);
    const isReconnecting = ref(false)

    let nc: NatsConnection | undefined = undefined;
    let subscriptions: Subscription[] = [];

    const natsServer = env.NATSServer;

    async function connect(reconnect: boolean = false) {
        if (isConnected.value || isConnecting.value) {
            return;
        }

        isConnecting.value = true;
        const natsToken = await Storage.getItem("accessToken");

        if (typeof natsToken !== "string" || !natsToken) {
            isConnecting.value = false;
            SnackBar.ShowSnackBarError(
                new Error("Unable to connect to NATS: missing access token"),
            );
            return;
        }

        // Force-kill current nats connection if reconnect isn't specified
        if (nc && !nc.isClosed() && !reconnect) {
            await disconnect();
        }
        // Don't reconnect if the nats client is already in its reconnect loop
        else if (nc && isReconnecting.value && reconnect) {
            return;
        }

        try {
            nc = await natsconnect({
                servers: natsServer,
                token: natsToken,
            });

            isConnected.value = true;
            const natsSubjects = [
                `${env.NATSSubjectRoot}.irelement.>`,
                `${env.NATSSubjectRoot}.notification.broadcast.>`,
                `${env.NATSSubjectRoot}.notification.user.${Auth.GetUser.id}.>`,
            ];
            subscriptions = natsSubjects.map((subject) => nc!.subscribe(subject));

            monitorConnection(nc);
            subscriptions.forEach(readSubscription);

            if (reconnect) {
                console.log("Reconnected to firehose");
                Bus.ToggleReloadQueueView();
                if (selectedElementType.value) {
                    Bus.ToggleReloadSelectedView();
                }
                notificationStore.GET_Notifications();
            }
        } catch (e) {
            isConnected.value = false;
            nc = undefined;
            subscriptions = [];
            SnackBar.ShowSnackBarError(e);
        } finally {
            isConnecting.value = false;
        }
    }
    async function readSubscription(subscription: Subscription) {
        try {
            for await (const msg of subscription) {
                try {
                    const payload = parseResponse(msg);
                    await useFirehoseStore().handleEvent(payload);
                } catch (e) {
                    console.error("Failed to parse or handle NATS message:", e, msg);
                }
            }
        } catch (e) {
            console.error("NATS subscription loop ended with error:", e);
            SnackBar.ShowSnackBarError(e);
        } finally {
            console.warn("NATS subscription loop exited");
            subscriptions = subscriptions.filter((item) => item !== subscription);
        }
    }

    function monitorConnection(connection: NatsConnection) {
        (async () => {
            try {
                for await (const status of connection.status()) {
                    if (status.type === "reconnect") {
                        isConnected.value = true;
                        isReconnecting.value = false
                        console.log("NATS reconnected");

                        Bus.ToggleReloadQueueView();
                        if (selectedElementType.value) {
                            Bus.ToggleReloadSelectedView();
                        }
                        notificationStore.GET_Notifications();
                    }

                    if (status.type === "disconnect") {
                        isConnected.value = false;
                        console.warn("NATS disconnected");
                    }

                    if (status.type === "reconnecting") {
                        isReconnecting.value = true;
                    }

                    if (status.type == "close") {
                        isReconnecting.value = false;
                        isConnected.value = false;
                    }
                }
            } catch (e) {
                console.error("Error monitoring NATS status:", e);
            }
        })();
        (async () => {
            try {
                const err = await connection.closed();
                isConnected.value = false;
                isConnecting.value = false;
                nc = undefined;
                subscriptions = [];

                if (err) {
                    console.error("NATS connection closed with error:", err);
                    SnackBar.ShowSnackBarError(err);
                } else {
                    console.log("NATS connection closed");
                }
            } catch (e) {
                console.error("Error waiting for NATS close:", e);
            }
        })();
    }
    async function disconnect() {
        try {
            subscriptions.forEach((subscription) => subscription.unsubscribe());
            subscriptions = [];

            if (nc) {
                await nc.close();
            }
        } catch (e) {
            SnackBar.ShowSnackBarError(e);
        } finally {
            isConnected.value = false;
            isConnecting.value = false;
            nc = undefined;
        }
    }
    function setFirehoseReconnect(reconnect: boolean) {
        if (reconnect && !firehoseReconnectTask.value) {
            firehoseReconnectTask.value = setInterval(() => {
                if (!isConnected.value && !isConnecting.value) {
                    connect(true);
                }
            }, 30000);
        } else if (!reconnect && firehoseReconnectTask.value) {
            clearInterval(firehoseReconnectTask.value);
            firehoseReconnectTask.value = null;
        }
    }
    function parseResponse(msg: any) {
        const subjectRoot = `${env.NATSSubjectRoot}.`;
        const subject = msg.subject.startsWith(subjectRoot)
            ? msg.subject.slice(subjectRoot.length)
            : msg.subject;
        const parts = subject.split(".");
        if (parts[0] !== "irelement" && parts[0] !== "notification") {
            throw new Error(`Unexpected subject format: ${msg.subject}`);
        }
        let data: any = {};
        try {
            data = msg.json();
        } catch {
            throw new Error(
                `Invalid JSON payload for subject ${msg.subject}: ${msg.data}`,
            );
        }
        const element_id = data.element_id;
        const element_type = data.element_type;
        const what = data.what;
        const when = data.when;
        const username = data.username;
        const thisevent = { what, when, element_type, element_id, username };

        if (element_type == "link") {
            thisevent["v0_id"] = data.v0_id;
            thisevent["v0_type"] = data.v0_type;
            thisevent["v1_id"] = data.v1_id;
            thisevent["v1_type"] = data.v1_type;
        } else if (element_type == "entry") {
            thisevent["target_id"] = data.target_id;
            thisevent["target_type"] = data.target_type;
        } else if (element_type == "enrichment") {
            thisevent["entity_id"] = data.entity_id;
        } else if (element_type == "notification") {
            thisevent["user_id"] = data.user_id
            thisevent["broadcast"] = data.broadcast || false
            thisevent["data"] = data.data
        }

        return thisevent;
    }
    async function handleEvent(event: any) {
        // short random delay to ease instantaneous load on the api
        await new Promise((r) => setTimeout(r, Math.random() * 1000));
        try {
            if (
                event.what == "create" ||
                event.what == "delete" ||
                event.what == "update"
            ) {
                // pull notification for this user
                if (
                    event.element_type == "notification" &&
                    (event.user_id == Auth.GetUser.id || event.broadcast)
                ) {
                    if (event.what == "update" && event?.data?.ack) {
                        notificationStore.setNotificationsAcked([event.element_id]);
                    } else {
                        notificationStore.GET_Notifications();
                    }
                }
            }
        } catch (e) {
            SnackBar.ToggleSnackbar(e);
        }
    }

    return {
        connect,
        disconnect,
        setFirehoseReconnect,
        handleEvent,
        selectedElement,
        selectedElementType,
        entryIds,
        isConnected,
        isConnecting,
    };
});
