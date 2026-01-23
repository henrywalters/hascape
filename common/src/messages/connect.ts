import { Param, Types } from "hagamets/dist/core/reflection.js";
import { NetMessage } from "hagamets/dist/net/messages.js";
import { ClientMessages, ServerMessages } from "./types";

export class ClientConnect extends NetMessage {
    type = ClientMessages.Connect;

    @Param({type: Types.String})
    token: string = "";

    @Param({type: Types.Array, subType: Types.Float})
    test = [1, 2, 3, 4, 5];
}