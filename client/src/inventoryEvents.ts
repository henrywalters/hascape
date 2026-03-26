import { InventoryItem } from "@hascape/common";

export enum InventoryEvents {
    AddItemToInventory,
    RemoveItemFromInventory,
    MoveItemInInventory,
}

export interface InventoryEvent {
    type: InventoryEvents;
    item: InventoryItem;
}