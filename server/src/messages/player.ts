import { NetMessage } from "hagamets/dist/net/messages.js";
import { ServerMessages } from "./types";
import { Param, Types } from "hagamets/dist/core/reflection.js";
import { Vector3 } from "three";

export class PlayerSetPosition extends NetMessage {
    type = ServerMessages.PlayerSetPosition;

    @Param({type: Types.String})
    sessionId: string;

    @Param({type: Types.Vector3})
    position: Vector3;
}