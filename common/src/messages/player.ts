import { Param, Types } from "hagamets/dist/core/reflection.js";
import { NetMessage } from "hagamets/dist/net/messages.js";
import { ServerMessages } from "./types";
import { Vector3 } from "three";

export class Test {
    @Param({type: Types.String})
    test = "Hello World";
}

export class PlayerInstance {
    @Param({type: Types.String})
    sessionId: string;

    @Param({type: Types.String})
    username: string;

    @Param({type: Types.Vector3})
    position: Vector3;
}

export class PlayerJoined extends NetMessage {
    type = ServerMessages.PlayerJoined;

    @Param({type: Types.Class, ctr: PlayerInstance})
    player: PlayerInstance;

    @Param({type: Types.Array, subType: Types.Class, ctr: PlayerInstance})
    otherPlayers: PlayerInstance[] = [];
}

export class OtherPlayerJoined extends NetMessage {
    type = ServerMessages.OtherPlayerJoined;

    @Param({type: Types.Class, ctr: PlayerInstance})
    player: PlayerInstance;
}

export class PlayerLeft extends NetMessage {

    type = ServerMessages.PlayerLeft;

    @Param({type: Types.String})
    sessionId: string;
}