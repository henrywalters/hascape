import { IManifest } from "hagamets/dist/core/interfaces/manifest.js";
import { Runtime } from "./runtime";
import { CLIENT_MESSAGES, SERVER_MESSAGES } from "@hascape/common/messages";
import { Smooth } from "hagamets/dist/common/components/smooth.js";
import { Character, HealthBar, ItemOnGround, NPC, NPCSpawner, Player } from "@hascape/common";
import { MeshPrimitive, TextMesh } from "hagamets/dist/common/components/mesh.js";
import { Animations } from "hagamets/dist/common/components/animation.js";
import { SpriteSheet } from "hagamets/dist/common/components/spriteSheet.js";
import { BoxCollider2D } from "hagamets/dist/common/components/collider.js";
import { NPCHandler } from "./systems/npcHandler";
import { CharacterMovement } from "./systems/characterMovement";
import { CombatSystem } from "./systems/combat";
import { ItemSystem } from "./systems/items";
import { WizardsAssistant } from "./systems/quests/wizardsAssistant";
import { InventorySystem } from "./systems/inventory";
import { InteractionSystem } from "./systems/interactions";
import { ActionSystem } from "./systems/actions";

export const Manifest: IManifest = {
    systems: [
        CharacterMovement,
        NPCHandler,
        CombatSystem,
        ItemSystem,
        InventorySystem,
        InteractionSystem,
        WizardsAssistant,
        ActionSystem,
    ],
    components: [
        Character,
        Smooth,
        MeshPrimitive,
        Animations,
        SpriteSheet,
        TextMesh,
        BoxCollider2D,
        NPCSpawner,
        NPC,
        Player,
        HealthBar,
        ItemOnGround,
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
            secure: false,
            socketAddress: {
                host: process.env.SERVER_HOST || "127.0.0.1",
                port: (process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT) : 4200)
            }
        },
        clientMessages: CLIENT_MESSAGES,
        serverMessages: SERVER_MESSAGES,
    }
}; 