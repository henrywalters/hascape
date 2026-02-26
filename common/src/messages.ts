import { NetMessages } from "hagamets/dist/net/messages.js";
import { ClientConnect } from "./messages/connect";
import { MovementUpdate, PlayerMove, PlayerMoved } from "./messages/move";
import { CharacterChangeHealth, CharacterDied, CharacterInteract, NPCJoined, OtherPlayerJoined, PlayerJoined, PlayerLeft } from "./messages/player";
import { PlayerMessage, PlayerMessaged } from "./messages/chat";
import { CharacterAttack, CharacterAttacked } from "./messages/attack";
import { ItemsDespawned, ItemsSpawned, PickedUpItem, PickupItem } from "./messages/items";

export const CLIENT_MESSAGES = new NetMessages([
    ClientConnect,
    PlayerMove,
    PlayerMessage,
    CharacterAttack,
    PickupItem,
    CharacterInteract,
]);

export const SERVER_MESSAGES = new NetMessages([
    PlayerMoved,
    PlayerJoined,
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
]);