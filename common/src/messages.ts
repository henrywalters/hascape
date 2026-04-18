import { NetMessages } from "hagamets/dist/net/messages.js";
import { ClientConnect, ClientConnectFailed, Ping, Pong } from "./messages/connect";
import { MovementUpdate, OtherPlayerTeleported, PlayerMove, PlayerMoved, PlayerTeleported } from "./messages/move";
import { ActionReceived, CharacterAction, CharacterChangeHealth, CharacterDied, CharacterInteract, NPCJoined, OtherPlayerJoined, PlayerJoined, PlayerLeft } from "./messages/player";
import { PlayerMessage, PlayerMessaged } from "./messages/chat";
import { CharacterAttack, CharacterAttacked } from "./messages/attack";
import { DroppedItem, ItemsDespawned, ItemsSpawned, PickedUpItem, PickupItem } from "./messages/items";
import { CommandResponse } from "./messages/command";

export const CLIENT_MESSAGES = new NetMessages([
    Ping,
    ClientConnect,
    PlayerMove,
    PlayerMessage,
    CharacterAttack,
    PickupItem,
    CharacterInteract,
    CharacterAction,
]);

export const SERVER_MESSAGES = new NetMessages([
    Pong,
    PlayerMoved,
    PlayerTeleported,
    OtherPlayerTeleported,
    PlayerJoined,
    ClientConnectFailed,
    OtherPlayerJoined,
    PlayerLeft,
    PlayerMessaged,
    MovementUpdate,
    CharacterAttacked,
    CharacterChangeHealth,
    CharacterDied,
    NPCJoined,
    ItemsSpawned,
    ItemsDespawned,
    PickedUpItem,
    DroppedItem,
    ActionReceived,
    CommandResponse,
]);