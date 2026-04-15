import { NetMessage } from "hagamets/dist/net/messages.js";
import { ClientMessages, ServerMessages } from "./types";
import { Array, Class, Int, Param, String, Types } from "hagamets/dist/core/reflection.js";
import { InventoryItem, ItemInstance } from "../interfaces/item";
import { Vector3 } from "three";

export class ItemPickup {

    @String()
    item: string;

    @String()
    instanceId: string;

    @Int()
    quantity: number = 1;

    @Param({type: Types.Vector3})
    position: Vector3;

    @String()
    map: string = '';
}

export class ItemsSpawned extends NetMessage {
    type = ServerMessages.ItemsSpawned;

    @Array(Types.Class, ItemPickup)
    items: ItemPickup[] = [];
}

export class ItemsDespawned extends NetMessage {
    type = ServerMessages.ItemsDespawned;

    @Array(Types.String)
    instanceIds: string[] = [];
}

export class PickupItem extends NetMessage {
    type = ClientMessages.PickupItem;

    @String()
    instanceId: string;
}

export class PickedUpItem extends NetMessage {
    type = ServerMessages.PickedUpItem;

    @Class(InventoryItem)
    item: InventoryItem;
}

export class DroppedItem extends NetMessage {
    type = ServerMessages.DroppedItem;

    @String()
    instanceId: string;
}