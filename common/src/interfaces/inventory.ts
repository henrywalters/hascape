import { Random } from "hcore/dist/random";
import { INVENTORY_SLOTS } from "../constants";
import { ITEMS } from "../items";
import { InventoryItem, ItemInstance } from "./item";


export type InventorySlot = InventoryItem | null;

export class Inventory {

    private count: number = 0;

    private slots: InventorySlot[];

    private items: Map<string, InventoryItem> = new Map();

    constructor() {
        this.slots = [];
        for (let i = 0; i < INVENTORY_SLOTS; i++) {
            this.slots.push(null);
        }
    }

    initialize(items: InventoryItem[]) {
        for (const item of items) {
            this.count++;   
            this.slots[item.position] = item;
            this.items.set(item.instanceId, item);
        }
    }

    private findExistingItem(item: string): InventoryItem | null {
        for (const slot of this.slots) {
            if (slot && slot.item === item) {
                return slot;
            }
        }

        return null;
    }

    canAdd(): boolean {
        return this.count < INVENTORY_SLOTS;
    }

    addItem(item: ItemInstance): InventoryItem {
        if (!this.canAdd()) {
            throw new Error("Inventory already full");
        }

        let openSlot = 0;

        const def = ITEMS[item.item];

        if (def.stackable) {
            const existing = this.findExistingItem(item.item);
            if (existing) {
                existing.quantity += item.quantity;
                return existing;
            }
        }

        for (let i = 0; i < this.slots.length; i++) {
            if (!this.slots[i]) {
                openSlot = i;
                break;
            }
        }

        this.count++;

        const invItem = new InventoryItem();
        invItem.instanceId = Random.alphanumeric(6);
        invItem.item = item.item;
        invItem.quantity = item.quantity;
        invItem.position = openSlot;

        this.items.set(invItem.instanceId, invItem);
        this.slots[invItem.position] = invItem;

        return invItem;
    }

    getItem(instanceId: string) {
        return this.items.get(instanceId);
    }

    removeItem(instanceId: string): boolean {
        if (!this.items.has(instanceId)) {
            return false;
        }

        this.slots[this.items.get(instanceId)!.position] = null;
        this.items.delete(instanceId);
        this.count--;

        return true;
    }

    moveItem(item: InventoryItem, newPos: number): boolean {
        if (newPos < 0 || newPos >= INVENTORY_SLOTS) {
            throw new Error("Invalid inventory slot");
        }

        if (this.slots[newPos]) {
            return false;
        }

        this.slots[newPos] = item;
        this.slots[item.position] = null;
        item.position = newPos;

        return true;
    }
}