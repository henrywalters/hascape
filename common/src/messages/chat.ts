import { NetMessage } from "hagamets/dist/net/messages.js";
import { ClientMessages, ServerMessages } from "./types";
import { Param, String, Types } from "hagamets/dist/core/reflection.js";
import { Vector3 } from "three";

export class PlayerMessage extends NetMessage {
    type = ClientMessages.PlayerMessage;

    @String()
    sessionId: string;

    @String()
    message: string;

    @String()
    sentTo: string = "";
}

export class PlayerMessaged extends NetMessage {
    type = ServerMessages.PlayerMessaged;

    @String()
    username: string;

    @String()
    message: string = "";

    @Param({type: Types.Vector3})
    position: Vector3 = new Vector3();
}