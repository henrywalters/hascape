import { NetMessage } from "hagamets/dist/net/messages.js";
import { APIMessages, ServerMessages } from "./types";
import { Param, Types, String } from "hagamets/dist/core/reflection.js";
import { Vector3 } from "three";

export class PlayerSetPosition extends NetMessage {
    type = ServerMessages.PlayerSetPosition;

    @Param({type: Types.String})
    sessionId: string;

    @Param({type: Types.Vector3})
    position: Vector3;

    @String()
    map: string;
}


export class PlayerSendMessage extends NetMessage {
    type = ServerMessages.PlayerSendMessage;

    @String()
    sessionId: string;

    @String()
    message: string;

    @String()
    sentTo: string = "";
}

export class PlayerReceivedMessaged extends NetMessage {
    type = APIMessages.PlayerReceiveMessage;

    @String()
    username: string;

    @String()
    sessionId: string;

    @String()
    sentTo: string = "";

    @String()
    message: string = "";
}