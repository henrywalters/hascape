import { NetMessage } from "hagamets/dist/net/messages.js";
import { APIMessages, ServerMessages } from "./types";
import { Int, Param, String, Types } from "hagamets/dist/core/reflection.js";
import { Vector3 } from "three";

export class NPCSpawn extends NetMessage {
    type = ServerMessages.NPCSpawn;

    @String()
    npcType: string;

    @Int()
    health: number;

    @Param({type: Types.Vector3})
    position: Vector3;
}

export class NPCChangeHealth extends NetMessage {
    type = ServerMessages.NPCChangeHealth;

    @String()
    sessionId: string;

    @Int()
    health: number;
}

export class NPCMove extends NetMessage {
    type = ServerMessages.NPCMove;

    @String()
    sessionId: string;

    @Param({type: Types.Vector3})
    position: Vector3;
}

export class NPCSpawned extends NetMessage {
    type = APIMessages.NPCSpawned;

    @String()
    npcType: string;

    @String()
    sessionId: string;

    @Param({type: Types.Vector3})
    position: Vector3;

    @Int()
    health: number;
}