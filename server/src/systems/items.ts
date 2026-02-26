import { System } from "hagamets/dist/ecs/system.js";
import { ItemOnGround, ITEMS } from "@hascape/common";
import { Runtime } from "../runtime";
import { State } from "../state";
import { BaseSystem } from "./base";

export class ItemSystem extends BaseSystem {
    onUpdate(dt: number): void {

        const runtime = this.scene as Runtime;

        const despawn: string[] = [];

        this.scene.components.forEach(ItemOnGround, (item) => {
            if (item.despawnRate > 0) {
                item.spawnedFor += dt;

                if (item.spawnedFor > item.despawnRate) {
                    despawn.push(item.instanceId);
                }
            }
        })

        if (despawn.length > 0) {
            this.despawnItems(despawn);
        }
    }
}