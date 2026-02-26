import { IItem } from "./interfaces/item";

export const Bones: IItem = {
    name: "bones",
    texture: "bones",
    inventoryTexture: "bones",
    stackable: false,
    despawnRate: 10,
}

export const ITEMS: {[key: string]: IItem} = {
    bones: Bones,
};