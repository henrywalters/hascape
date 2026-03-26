import { Int, String } from "hagamets/dist/core/reflection.js";
import { Random } from "hcore/dist/random";

export class ItemInstance {
    @String()
    item: string;

    @String()
    instanceId: string;

    @Int()
    quantity: number = 1;

    constructor(item: string, quantity: number = 1) {
        this.item = item;
        this.quantity = quantity;
        this.instanceId = Random.alphanumeric(6);
    }
}

export class InventoryItem {
    @String()
    item: string;

    @String()
    instanceId: string;

    @Int()
    position: number; 

    @Int()
    quantity: number = 1;
}

export interface IItem {
    name: string;
    stackable: boolean;
    texture: string;
    inventoryTexture: string;
    despawnRate: number;
}
