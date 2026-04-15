import { Param, Types, String, Class, Array, Int, Boolean } from "hagamets/dist/core/reflection.js";
import { NetMessage } from "hagamets/dist/net/messages.js";
import { ClientMessages, ServerMessages } from "./types";
import { Vector2, Vector3 } from "three";
import { InventoryItem, ItemInstance } from "../interfaces/item";
import { ItemPickup } from "./items";

export class Test {
    @String()
    test = "Hello World";
}

export class PlayerInstance {
    @String()
    sessionId: string;

    @String()
    username: string;

    @Int()
    health: number;

    @Int()
    totalHealth: number;

    @Param({type: Types.Vector3})
    position: Vector3;

    @Boolean()
    isAdmin: boolean;

    @String()
    map: string;
}

export class NPCInstance {
    @String()
    sessionId: string;

    @String()
    npcType: string;

    @Int()
    health: number;

    @Int()
    totalHealth: number;

    @Param({type: Types.Vector3})
    position: Vector3;

    @String()
    map: string;
}

export class PlayerJoined extends NetMessage {
    type = ServerMessages.PlayerJoined;

    @Class(PlayerInstance)
    player: PlayerInstance;

    @Array(Types.Class, PlayerInstance)
    otherPlayers: PlayerInstance[] = [];

    @Array(Types.Class, NPCInstance)
    npcs: NPCInstance[] = [];

    @Array(Types.Class, ItemPickup)
    items: ItemPickup[] = [];

    @Array(Types.Class, InventoryItem)
    inventory: InventoryItem[] = [];
}

export class OtherPlayerJoined extends NetMessage {
    type = ServerMessages.OtherPlayerJoined;

    @Class(PlayerInstance)
    player: PlayerInstance;
}

export class NPCJoined extends NetMessage {
    type = ServerMessages.NPCJoined;

    @Class(NPCInstance)
    npc: NPCInstance;
}

export class PlayerLeft extends NetMessage {

    type = ServerMessages.PlayerLeft;

    @String()
    sessionId: string;
}

export class CharacterChangeHealth extends NetMessage {
    type = ServerMessages.CharacterChangeHealth;

    @String()
    sessionId: string;

    @Int()
    health: number;
}

export class CharacterDied extends NetMessage {
    type = ServerMessages.CharacterDied;

    @String()
    sessionId: string;
}

export class CharacterInteract extends NetMessage {
    type = ClientMessages.CharacterInteract;

    @String()
    sessionId: string;
}

export class CharacterAction extends NetMessage {
    type = ClientMessages.CharacterAction;

    @Int()
    action: number;

    @String()
    sessionId: string;

    @String()
    subjectId: string = "";

    @Param({type: Types.Vector2})
    position: Vector2 = new Vector2();
}

export class ActionReceived extends NetMessage {
    type = ServerMessages.ActionReceived;

    @Boolean()
    success: boolean;
}