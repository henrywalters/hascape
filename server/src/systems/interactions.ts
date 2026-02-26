import { CharacterInteract, ClientMessages } from "@hascape/common";
import { BaseSystem } from "./base";
import { State } from "../state";

export class InteractionSystem extends BaseSystem {
    onInit(): void {
        this.scene.game.server.installFilter([ClientMessages.CharacterInteract], (msg) => {
            const interact = msg.message as CharacterInteract;
            const entity = State.playerSessions.get(interact.sessionId);
            if (!entity) return;

            const items = State.items.get(this.cellIndex(entity.position as any) as any);
            if (items) {
                for (const item of items) {
                    console.log(item.id);
                }
            }
        })
    }
}