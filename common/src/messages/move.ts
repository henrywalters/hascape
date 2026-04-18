import { NetMessage } from "hagamets/dist/net/messages.js";
import { ClientMessages, ServerMessages } from "./types";
import { Array, Class, Float, Int, Param, String, Types } from "hagamets/dist/core/reflection.js";
import { Vector3 } from "three";
import { IOtherPlayerMessage, IPlayerMessage, NPCInstance, PlayerInstance } from "./player";
import { ItemPickup } from "./items";

export class PlayerMove extends NetMessage {
    type = ClientMessages.PlayerMove;

    @Param({type: Types.Vector3})
    direction: Vector3 = new Vector3();

    @Int()
    tick: number = 0;

    @Float()
    dt: number = 0;

    @String()
    sessionId: string = "";
}

export class PlayerMoved extends NetMessage {
    type = ServerMessages.PlayerMoved;

    @Param({type: Types.Vector3})
    position: Vector3;

    @Param({type: Types.Vector3})
    direction: Vector3;

    @String()
    sessionId: string = "";
}

export class PlayerTeleported extends NetMessage implements IPlayerMessage {
    type = ServerMessages.PlayerTeleported;

    @Class(PlayerInstance)
    player: PlayerInstance;

    @Array(Types.Class, PlayerInstance)
    otherPlayers: PlayerInstance[] = [];

    @Array(Types.Class, NPCInstance)
    npcs: NPCInstance[] = [];

    @Array(Types.Class, ItemPickup)
    items: ItemPickup[] = [];
}

export class OtherPlayerTeleported extends NetMessage implements IOtherPlayerMessage {
    type = ServerMessages.OtherPlayerTeleported;

    @Class(PlayerInstance)
    player: PlayerInstance;
}

export class MovementUpdate extends NetMessage {
    type = ServerMessages.MovementUpdate;

    @Array(Types.Class, PlayerMoved)
    movements: PlayerMoved[] = []
}