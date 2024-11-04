declare global {
    namespace NodeJS {
        interface ProcessEnv {
            TOKEN: string;
            OPS_CHANNELS: string;
            MATTERMOST_WEBHOOK_PING: string;
            MATTERMOST_TEAM_PING: string;
            MATTERMOST_WEBHOOK_PING_ANYWHERE_IN_CHANNEL: string;
        }
    }
}

export {};
