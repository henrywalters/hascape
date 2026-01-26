import { INetMessage, QueuedMessage } from "hagamets/dist/net/interfaces/messages.js";
import { NetMessages } from "hagamets/dist/net/messages.js";
import { Server } from "hagamets/dist/net/server.js";
import { Client } from "hagamets/dist/net/client.js";
import { LoggedIn, LoggedOut, Login, Logout } from "../messages/login";
import { PlayerReceivedMessaged, PlayerSendMessage, PlayerSetPosition } from "../messages/player";

const SERVER_MESSAGES: NetMessages = new NetMessages([
    Login,
    Logout,
    PlayerSetPosition,
    PlayerSendMessage,
]);

const API_MESSAGES: NetMessages = new NetMessages([
    LoggedIn,
    LoggedOut,
    PlayerReceivedMessaged,
]);

const API_PORT = 4301;
const SERVER_PORT = 4302;

export enum PubsubType {
    API,
    Server,
}

export class Pubsub {

    private server: Server;
    private client: Client;

    private type: PubsubType;

    public onMessage: (message: INetMessage) => void = (_) => {};

    constructor(type: PubsubType) {
        this.type = type;

        if (type === PubsubType.API) {
            this.client = new Client({
                host: "localhost",
                port: SERVER_PORT,
            }, API_MESSAGES, SERVER_MESSAGES, true);
            this.client.onMessage = (msg) => {
                this.onMessage(msg);
            }
        } else {
            this.server = new Server({
                host: "localhost",
                port: SERVER_PORT
            }, API_MESSAGES, SERVER_MESSAGES);
            this.server.onMessage = (msg) => {
                this.onMessage(msg);
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