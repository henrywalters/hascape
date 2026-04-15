import { Vector2 } from "three";
import { BaseSystem, BulkItemSpawn } from "../base";

import { ItemInstance } from "@hascape/common";
import { State } from "../../state";

export class WizardsAssistant extends BaseSystem {
    onInit(): void {
        const items: BulkItemSpawn[] = [];
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                items.push({
                    item: new ItemInstance('bones'),
                    position: this.cellPos(new Vector2(0, 0)),
                    despawnRate: 0,
                });
            }
        }

        this.spawnItems('Overworld', items); 
    }
}