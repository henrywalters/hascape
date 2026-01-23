import { IManifest } from "hagamets/dist/core/interfaces/manifest.js";
import { Runtime } from "./runtime";
import { CLIENT_MESSAGES, SERVER_MESSAGES } from "@hascape/common/messages";
import { Player, Players } from "@hascape/common";

export const Manifest: IManifest = {
    systems: [
        Players,
    ],
    components: [
        Player,
    ],
    scripts: [],
    scenes: {
        runtime: {
            data: {
                entities: []
            },
            ctr: Runtime,
        }
    },
    assets: {},
    startScene: "runtime",
    server: {
        address: {
            host: "127.0.0.1",
            port: 4200
        },
        clientMessages: CLIENT_MESSAGES,
        serverMessages: SERVER_MESSAGES,
    }
};