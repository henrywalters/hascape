import { NetMessage } from "hagamets/dist/net/messages.js";
import { ClientMessages, ServerMessages } from "./types";
import { Param, Types } from "hagamets/dist/core/reflection.js";
import { Vector3 } from "three";

export class PlayerMove extends NetMessage {
    type = ClientMessages.PlayerMove;

    @Param({type: Types.Vector3})
    direction: Vector3 = new Vector3();

    @Param({type: Types.Int})
    tick: number = 0;

    @Param({type: Types.Float})
    dt: number = 0;

    @Param({type: Types.String})
    sessionId: string = "";
}

export class PlayerMoved extends NetMessage {
    type = ServerMessages.PlayerMoved;

    @Param({type: Types.Vector3})
    position: Vector3;

    @Param({type: Types.String})
    sessionId: string = "";
}