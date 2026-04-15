import { System } from "hagamets/dist/ecs/system.js";
import { ItemOnGround, ITEMS } from "@hascape/common";
import { Runtime } from "../runtime";
import { State } from "../state";
import { BaseSystem } from "./base";

export class ItemSystem extends BaseSystem {
    onUpdate(dt: number): void {

        const runtime = this.scene as Runtime;

        const despawn: Map<string, string[]> = new Map();

        this.scene.components.forEach(ItemOnGround, (item) => {
            if (item.despawnRate > 0) {
                item.spawnedFor += dt;

                if (item.spawnedFor > item.despawnRate) {
                    if (!despawn.has(item.map)) {
                        despawn.set(item.map, []);
                    }
                    despawn.get(item.map)!.push(item.instanceId);
                }
            }
        })

        for (const [name, items] of despawn) {
            this.despawnItems(name, items);
        }
    }
}