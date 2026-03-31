import { Array, Param, String, Types } from "hagamets/dist/core/reflection.js";
import { NetMessage } from "hagamets/dist/net/messages.js";
import { ClientMessages, ServerMessages } from "./types";

export class ClientConnect extends NetMessage {
    type = ClientMessages.Connect;

    @String()
    token: string = "";

    @String()
    playerId: string = "";
}

export class ClientConnectFailed extends NetMessage {
    type = ServerMessages.ConnectFailed;

    @String()
    error: string = "";
}

export class Ping extends NetMessage {
    type = ClientMessages.Ping;
}

export class Pong extends NetMessage {
    type = ServerMessages.Pong;
}