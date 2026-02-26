import { Character, HealthBar } from "@hascape/common";
import { MeshPrimitive } from "hagamets/dist/common/components/mesh.js";
import { System } from "hagamets/dist/ecs/system.js";

export class HealthSystem extends System {
    onUpdate(dt: number): void {
        this.scene.components.forEach(HealthBar, (bar) => {
            const mesh = bar.entity.getComponent(MeshPrimitive);
            const character = bar.entity.parent!.getComponent(Character);

            if (!mesh || !character) {
                console.warn(`Health Bar Entity ${bar.id} is missing MeshPrimitive and Parent Character`);
                return;
            }

            const healthPercent = character.health / character.totalHealth;

            mesh.width = 50 * healthPercent;

            mesh.entity.transform.position.x = -(50 - mesh.width) / 2;
            
            mesh.notifyUpdate();
        })
    }
}