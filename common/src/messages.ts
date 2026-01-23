import { NetMessages } from "hagamets/dist/net/messages.js";
import { ClientConnect } from "./messages/connect";
import { PlayerMove, PlayerMoved } from "./messages/move";
import { OtherPlayerJoined, PlayerJoined, PlayerLeft } from "./messages/player";

export const CLIENT_MESSAGES = new NetMessages([
    ClientConnect,
    PlayerMove,
]);

export const SERVER_MESSAGES = new NetMessages([
    PlayerMoved,
    PlayerJoined,
    OtherPlayerJoined,
    PlayerLeft,
]);