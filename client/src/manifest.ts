import { IManifest } from "hagamets/dist/core/interfaces/manifest.js";
import { Character, CLIENT_MESSAGES, HealthBar, ItemOnGround, ItemPickup, NPC, Player, SERVER_MESSAGES } from "@hascape/common";

import LoginMenuData from "./assets/scenes/client_menu.json";
import RuntimeData from "./assets/scenes/runtime.json";
import RunescapeFont from "./assets/fonts/RuneScape_Regular.json";

import WarriorWalk from "./assets/spriteSheets/warrior_walk.json";
import WarriorIdle from "./assets/spriteSheets/warrior_idle.json"
import WarriorAttack from "./assets/spriteSheets/warrior_attack.json"
import OrcIdle from "./assets/spriteSheets/orc_idle.json";
import OrcWalk from "./assets/spriteSheets/orc_walk.json";
import Interact from "./assets/spriteSheets/interact.json";

import { LoginMenu } from "./scenes/loginMenu";
import { Renderer } from "hagamets/dist/common/systems/renderer.js";
import { UI } from "hagamets/dist/common/systems/ui.js";
import { Scripts } from "hagamets/dist/common/systems/scripts.js";
import { Login } from "./scripts/login";
import { Behavior } from "hagamets/dist/common/components/behavior.js";
import { FontData } from "three/examples/jsm/Addons.js";
import { Runtime } from "./scenes/runtime";
import { CameraController } from "./scripts/cameraController";
import { PlayerController } from "./scripts/playerController";
import { ChatBox } from "./scripts/chatBox";
import { Animation } from "./systems/animation";
import { BoxCollider2D } from "hagamets/dist/common/components/collider.js";
import { Animations } from "hagamets/dist/common/components/animation.js";
import { HealthSystem } from "./systems/health";
import { CameraZoom } from "hagamets/dist/common/components/camera.js";
import { LevelUpMenu } from "./scripts/levelUpMenu";
import { StatDisplay } from "./scripts/statDisplay";
import { CameraControllers } from "hagamets/dist/common/systems/cameraControllers.js";
import { InteractMenu, InteractOption } from "./scripts/interactMenu";
import { SpriteSheetSystem } from "hagamets/dist/common/systems/spriteSheet.js";
import { Inventory } from "./scripts/inventory";
import { Profiler } from "./scripts/profiler";
import { Disconnected } from "./scripts/disconnected";

export const Manifest: IManifest = {
    systems: [
        Renderer,
        UI,
        Scripts,
        Animation,
        HealthSystem,
        CameraControllers,
        SpriteSheetSystem,
    ],
    components: [
        Behavior,
        Character,
        BoxCollider2D,
        Animations,
        Player,
        NPC,
        HealthBar,
        CameraZoom,
        ItemOnGround,
    ],
    scripts: [
        Login,
        CameraController,
        PlayerController,
        ChatBox,
        LevelUpMenu,
        StatDisplay,
        InteractMenu,
        InteractOption,
        Inventory,
        Profiler,
        Disconnected,
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
        ],
        textures: [
            {
                name: 'creepy_smile',
                url: 'https://hascape.sfo3.cdn.digitaloceanspaces.com/textures/creepy_smile.png?v=2'
            },
            {
                name: 'bones',
                url: 'https://hascape.sfo3.cdn.digitaloceanspaces.com/textures/bones.png',
            },
            {
                name: 'strength',
                url: 'https://hascape.sfo3.cdn.digitaloceanspaces.com/textures/strength.png'
            },
            {
                name: 'dexterity',
                url: 'https://hascape.sfo3.cdn.digitaloceanspaces.com/textures/dexterity.png'
            },
            {
                name: 'constitution',
                url: 'https://hascape.sfo3.cdn.digitaloceanspaces.com/textures/constitution.png'
            },
            {
                name: 'wizard',
                url: 'https://hascape.sfo3.cdn.digitaloceanspaces.com/textures/wizard.png',
            },
            {
                name: 'interact',
                url: 'https://hascape.sfo3.cdn.digitaloceanspaces.com/textures/interact.png'
            }
        ],
        spriteSheets: [
            WarriorWalk,
            WarriorIdle,
            WarriorAttack,
            OrcIdle,
            OrcWalk,
            Interact,
        ]
    },
    startScene: "login_menu",
    client: {
        address: {
            url: "localhost:4200",
            secure: false,
        },
        clientMessages: CLIENT_MESSAGES,
        serverMessages: SERVER_MESSAGES,
    }
};