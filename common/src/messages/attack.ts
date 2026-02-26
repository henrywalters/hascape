import { NetMessage } from "hagamets/dist/net/messages.js";
import { ClientMessages, ServerMessages } from "./types";
import { String } from "hagamets/dist/core/reflection.js";

export class CharacterAttack extends NetMessage {
    type = ClientMessages.CharacterAttack;

    @String()
    sessionId: string;
}

export class CharacterAttacked extends NetMessage {
    type = ServerMessages.CharacterAttacked;

    @String()
    sessionId: string;
}