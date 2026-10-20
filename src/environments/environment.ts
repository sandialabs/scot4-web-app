export const environment = {
    APIHost: import.meta.env.VITE_APP_API_BASE || "http://localhost:8000/api/v1",
    NATSServer: import.meta.env.VITE_APP_NATS_BASE || "ws://localhost:4223/",
    NATSSubjectRoot: import.meta.env.VITE_APP_NATS_SUBJECT_ROOT || "scot",
    APIKey: ""
};
