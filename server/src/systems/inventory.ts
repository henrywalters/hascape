import { ClientMessages, ServerMessages } from "@hascape/common";
import { BaseSystem } from "./base";

export class InventorySystem extends BaseSystem {
    onInit(): void {
        this.scene.game.server.installFilter([ClientMessages.PickupItem], (msg) => {
            console.log(msg);
        })
    }
}