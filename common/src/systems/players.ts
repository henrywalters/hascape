import { System } from "hagamets/dist/ecs/system.js";
import { Player } from "../components/player";
import { EntityEvents } from "hagamets/dist/core/events.js";
import { Transform } from "hagamets/dist/common/components/transform.js";

export class Players extends System {
    onUpdate(dt: number): void {
        this.scene.components.forEach(Player, (player) => {
            if (player.direction.x !== 0 || player.direction.y !== 0 || player.direction.z !== 0) {
                player.entity.transform.position.add(player.direction.clone().multiplyScalar(dt * player.speed));
                this.scene.entityEvents.emit({
                    type: EntityEvents.UpdateComponent,
                    entity: player.entity,
                    component: player.entity.transform as  Transform,
                });
            }
        });
    }
}