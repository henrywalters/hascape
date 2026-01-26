import { Array, Param, String, Types } from "hagamets/dist/core/reflection.js";
import { NetMessage } from "hagamets/dist/net/messages.js";
import { ClientMessages, ServerMessages } from "./types";

export class ClientConnect extends NetMessage {
    type = ClientMessages.Connect;

    @String()
    token: string = "";

    @Array(Types.Float)
    test = [1, 2, 3, 4, 5];
}