import { IManifest } from "hagamets/dist/core/interfaces/manifest.js";
import { CLIENT_MESSAGES, Player, SERVER_MESSAGES } from "@hascape/common";

import LoginMenuData from "./assets/scenes/client_menu.json";
import RuntimeData from "./assets/scenes/runtime.json";
import RunescapeFont from "./assets/fonts/RuneScape_Regular.json";

import { LoginMenu } from "./scenes/loginMenu";
import { Renderer } from "hagamets/dist/common/systems/renderer.js";
import { UI } from "hagamets/dist/common/systems/ui.js";
import { Scripts } from "hagamets/dist/common/systems/scripts.js";
import { Login } from "./scripts/login";
import { Behavior } from "hagamets/dist/common/components/behavior.js";
import { FontData } from "three/examples/jsm/Addons.js";
import { Runtime } from "./scenes/runtime";
import { CameraController } from "./scripts/cameraController";
import {Players} from "@hascape/common";
import { PlayerController } from "./scripts/playerController";
import { ChatBox } from "./scripts/chatBox";

export const Manifest: IManifest = {
    systems: [
        Renderer,
        UI,
        Scripts,
        Players,
    ],
    components: [
        Behavior,
        Player,
    ],
    scripts: [
        Login,
        CameraController,
        PlayerController,
        ChatBox,
    ],
    scenes: {
        login_menu: {
            data: LoginMenuData,
            ctr: LoginMenu,
        },
        runtime: {
            data: RuntimeData,
            ctr: Runtime
        }
    },
    assets: {
        fonts: [
            {       
                name: 'runescape',
                data: RunescapeFont as unknown as FontData,
            }
        ]
    },
    startScene: "login_menu",
    client: {
        address: {
            host: "127.0.0.1",
            port: 4200
        },
        clientMessages: CLIENT_MESSAGES,
        serverMessages: SERVER_MESSAGES,
    }
};