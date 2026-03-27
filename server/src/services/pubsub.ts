import { INetMessage, QueuedMessage } from "hagamets/dist/net/interfaces/messages.js";
import { NetMessages } from "hagamets/dist/net/messages.js";
import { Server } from "hagamets/dist/net/server.js";
import { Client } from "hagamets/dist/net/client.js";
import { LoggedIn, LoggedOut, Login, Logout } from "../messages/login";
import { PlayerReceivedMessaged, PlayerSendMessage, PlayerSetPosition } from "../messages/player";
import { NetEvent } from "hagamets/dist/net/interfaces/net.js";
import { NPCChangeHealth, NPCsClear, NPCsCleared, NPCSpawn, NPCSpawned } from "../messages/npc";
import { AddedItemToInventory, AddItemToInventory, MovedItemInInventory, MoveItemInInventory, RemovedItemFromInventory, RemoveItemFromInventory } from "../messages/inventory";

const SERVER_MESSAGES: NetMessages = new NetMessages([
    Login,
    Logout,
    PlayerSetPosition,
    PlayerSendMessage,
    NPCsClear,
    NPCSpawn,
    NPCChangeHealth,
    AddItemToInventory,
    RemoveItemFromInventory,
    MoveItemInInventory,
]); 

const API_MESSAGES: NetMessages = new NetMessages([
    LoggedIn,
    LoggedOut,
    PlayerReceivedMessaged,
    NPCsCleared,
    NPCSpawned,
    AddedItemToInventory,
    RemovedItemFromInventory,
    MovedItemInInventory,
]);

const API_PORT = 4301;
const SERVER_PORT = 4302;

export enum PubsubType {
    API,
    Server,
}

export class Pubsub {

    private _server: Server;
    private _client: Client;

    private type: PubsubType;

    public onMessage: (message: INetMessage) => void = (_) => {};
    public onEvent: (event: NetEvent) => void = (_) => {};

    public get server() {
        if (!this._server) throw new Error('Server does not exist in this pubsub instance');
        return this._server;
    }

    public get client() {
        if (!this._client) throw new Error('Client does not exist in this pubsub instance');
        return this._client;
    }

    constructor(type: PubsubType) {
        this.type = type;

        if (type === PubsubType.API) {
            this._client = new Client({
                socketAddress: {
                    host: "localhost",
                    port: SERVER_PORT,
                },
                secure: false,
            }, API_MESSAGES, SERVER_MESSAGES, true);
            this._client.onMessage = (msg) => {
                this.onMessage(msg);
            }
            this.client.onEvent = (event) => {
                this.onEvent(event);
            }
        } else {
            this._server = new Server({
                socketAddress: {
                    host: "localhost",
                    port: SERVER_PORT
                },
                secure: false,
            }, API_MESSAGES, SERVER_MESSAGES);
            this._server.onMessage = (msg) => {
                this.onMessage(msg); 
            }
            this.server.onEvent = (e) => {
                this.onEvent(e);
            }
        }
    }

    public async send(message: INetMessage) {
        if (this.type === PubsubType.API) {
            this.client.socket.send(this.client.clientMessages.write(message));
        } else {
            this.server.emit(message);
        }
    }
}