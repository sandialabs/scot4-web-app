import { GetterTree } from 'vuex';
import { UserState, User, ApiKey, Notification } from './types';
import { RootState } from '@/store/types';

export const getters: GetterTree<UserState, RootState> = {
    isLoggedIn(state): boolean {
        return state.user != undefined;
    },
    loginInProgress(state): boolean {
        return state.loginInProgress
    },
    loginExpiration(state): Date | null {
        return state.loginExpiration
    },
    currentUser(state): User | undefined {
        return state.user
    },
    userApiKeys(state): Array<ApiKey> {
        return state.userApiKeys
    },
    firehose(state):EventSource | undefined {
        return state.firehose
    },
    
    notifications(state):Array<Notification>| undefined {
            return state.user?.notifications
    },

    unAckdNotifications(state): number| undefined {
        const filteredNotifications = state.user?.notifications.filter((el:any) => el.ack == false)
        return filteredNotifications?.length
    },
    searchResults(state):any | undefined {
        return state.searchResults
    },

    currentUserPreferences(state): Record<string, any> | undefined {
        if (state.user && state.user.preferences != null) {
            return state.user.preferences
        }
        return {}
    },

    darkMode(state): boolean {
        if (state.user && state.user.preferences != null) {
            if ("darkMode" in state.user.preferences) {
                return state.user.preferences['darkMode']
            }
            else {
                return false
            }
        }
        else {
            return false
        }

    },

    inboxView(state): boolean {
        if (state.user && state.user.preferences != null) {
            if ("inboxView" in state.user.preferences) {
                return state.user.preferences['inboxView']
            }
            else {
                return false
            }
        }
        else {
            return false
        }

    },
    showQuickSettings(state): boolean {
        return state.showQuickSettings
    },

    showSearchOverlay(state): boolean{
        return state.showSearchOverlay
    }
};