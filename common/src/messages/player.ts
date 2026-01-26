import { Param, Types, String, Class, Array } from "hagamets/dist/core/reflection.js";
import { NetMessage } from "hagamets/dist/net/messages.js";
import { ServerMessages } from "./types";
import { Vector3 } from "three";

export class Test {
    @String()
    test = "Hello World";
}

export class PlayerInstance {
    @String()
    sessionId: string;

    @String()
    username: string;

    @Param({type: Types.Vector3})
    position: Vector3;
}

export class PlayerJoined extends NetMessage {
    type = ServerMessages.PlayerJoined;

    @Class(PlayerInstance)
    player: PlayerInstance;

    @Array(Types.Class, PlayerInstance)
    otherPlayers: PlayerInstance[] = [];
}

export class OtherPlayerJoined extends NetMessage {
    type = ServerMessages.OtherPlayerJoined;

    @Class(PlayerInstance)
    player: PlayerInstance;
}

export class PlayerLeft extends NetMessage {

    type = ServerMessages.PlayerLeft;

    @String()
    sessionId: string;
}