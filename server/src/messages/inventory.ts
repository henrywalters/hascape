import { NetMessage } from "hagamets/dist/net/messages.js";
import { APIMessages, ServerMessages } from "./types";
import { Class, Int, String } from "hagamets/dist/core/reflection.js";
import { InventoryItem } from "@hascape/common";

export class AddItemToInventory extends NetMessage {
    type = ServerMessages.AddItemToInventory;

    @String()
    sessionId: string;

    @Class(InventoryItem)
    item: InventoryItem;
}

export class RemoveItemFromInventory extends NetMessage {
    type = ServerMessages.RemoveItemFromInventory;

    @String()
    sessionId: string;

    @String()
    instanceId: string;
}

export class MoveItemInInventory extends NetMessage {
    type = ServerMessages.MoveItemInInventory;

    @String()
    instanceId: string;

    @Int()
    toPosition: number;
}

export class AddedItemToInventory extends NetMessage {
    type = APIMessages.AddedItemToInventory;

    @Class(InventoryItem)
    item: InventoryItem;
}

export class MovedItemInInventory extends NetMessage {
    type = APIMessages.MovedItemInInventory

    @String()
    instanceId: string;

    @Int()
    toPosition: number;
}

export class RemovedItemFromInventory extends NetMessage {
    type = APIMessages.RemovedItemFromInventory;

    @String()
    sessionId: string;

    @String()
    instanceId: string;
}