import { NetMessage } from "hagamets/dist/net/messages.js";
import { APIMessages, ServerMessages } from "./types";
import { InventoryItem } from "@hascape/common";
import { Array, Param, Types } from "hagamets/dist/core/reflection.js";
import { Vector3 } from "three";

export class Login extends NetMessage {
    type = ServerMessages.Login;

    @Param({type: Types.Int})
    socketId: number;

    @Param({type: Types.String})
    token: string;
}

export class LoggedIn extends NetMessage {
    type = APIMessages.LoggedIn;

    @Param({type: Types.Int})
    socketId: number;

    @Param({type: Types.String})
    sessionId: string;

    @Param({type: Types.String})
    username: string;

    @Param({type: Types.Vector3})
    position: Vector3;

    @Array(Types.Class, InventoryItem)
    inventory: InventoryItem[];
}

export class Logout extends NetMessage {
    type = ServerMessages.Logout;

    @Param({type: Types.Int})
    socketId: number;

    @Param({type: Types.String})
    sessionId: string;
}

export class LoggedOut extends NetMessage {
    type = APIMessages.LoggedOut;

    @Param({type: Types.Int})
    socketId: number;

    @Param({type: Types.String})
    sessionId: string;
}