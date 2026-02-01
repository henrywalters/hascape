import { NetMessage } from "hagamets/dist/net/messages.js";
import { ClientMessages, ServerMessages } from "./types";
import { Float, Int, Param, String, Types } from "hagamets/dist/core/reflection.js";
import { Vector3 } from "three";

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