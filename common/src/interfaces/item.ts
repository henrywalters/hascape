import { Int, String } from "hagamets/dist/core/reflection.js";
import { Random } from "hcore/dist/random";

export class ItemInstance {
    @String()
    item: string;

    @String()
    instanceId: string;

    @Int()
    amount: number = 1;

    constructor(item: string, amount: number = 1) {
        this.item = item;
        this.amount = amount;
        this.instanceId = Random.alphanumeric(6);
    }
}

export interface IItem {
    name: string;
    stackable: boolean;
    texture: string;
    inventoryTexture: string;
    despawnRate: number;
}