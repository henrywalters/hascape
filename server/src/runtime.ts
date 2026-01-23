import { IGame } from "hagamets/dist/core/interfaces/game.js";
import { Scene } from "hagamets/dist/core/scene.js";
import { ClientConnect, ClientMessages, Player, PlayerJoined, OtherPlayerJoined, PlayerLeft, PlayerMove, PlayerMoved, PlayerInstance } from "@hascape/common";
import { Pubsub, PubsubType } from "./services/pubsub";
import { WebSocket } from "ws";
import { LoggedIn, LoggedOut, Login, Logout } from "./messages/login";
import { APIMessages } from "./messages/types";
import { IEntity } from "hagamets/dist/ecs/interfaces/entity.js";
import { NetEvents } from "hagamets/dist/net/interfaces/net.js";
import { Transform } from "hagamets/dist/common/components/transform.js";
import { PlayerSetPosition } from "./messages/player";
import { EntityEvents } from "hagamets/dist/core/events.js";
import { Vector3 } from "three";

export class Runtime extends Scene {

    private pubsub: Pubsub;

    private sockets: Map<number, WebSocket> = new Map();
    private socketIds: Map<WebSocket, number> = new Map();

    private socketSessions: Map<WebSocket, string> = new Map();
    private players: Map<string, IEntity> = new Map();

    private socketId = 0;

    constructor(game: IGame) {
        super(game);
        this.pubsub = new Pubsub(PubsubType.Server);

        this.pubsub.onMessage = (msg) => {
            switch (msg.type) {
                case APIMessages.LoggedIn:
                    this.loggedIn(msg as LoggedIn);
                    break;
                case APIMessages.LoggedOut:
                    this.loggedOut(msg as LoggedOut);
                    break;
            }
        }

        this.entityEvents.listen((e) => {
            if (e.type === EntityEvents.UpdateComponent && e.component instanceof Transform) {
                const player = e.entity.getComponent(Player);
                if (!player) return;
                const setPos = new PlayerSetPosition();
                setPos.sessionId = player.sessionId;
                setPos.position = e.entity.position as any;
                this.pubsub.send(setPos);
                console.log(setPos);
            }
        })
    }

    onUpdate(dt: number) {

        this.game.server.flushEvents((event) => {
            if (event.type === NetEvents.Disconnected) {

                if (this.socketSessions.has(event.socket!)) {
                    const logout = new Logout();
                    logout.sessionId = this.socketSessions.get(event.socket!)!;
                    logout.socketId = this.socketIds.get(event.socket!)!;
                    this.pubsub.send(logout);
                }
            } else {
                const id = this.socketId;
                this.socketId++;

                this.sockets.set(id, event.socket!);
                this.socketIds.set(event.socket!, id);
            }
        })

        this.game.server.flushMessages((message) => {
            if (message.message.type === ClientMessages.Connect) {
                const login = new Login();
                login.socketId = this.socketIds.get(message.socket!)!;
                login.token = (message.message as ClientConnect).token;
                this.pubsub.send(login);
            }

            if (message.message.type === ClientMessages.PlayerMove) {
                const move = message.message as PlayerMove;
                // console.log(message.message);
                if (this.players.has(move.sessionId)) {
                    const entity = this.players.get(move.sessionId)!;
                    const player = entity.getComponent(Player)!;
                    player.direction.copy(move.direction);
                }
            }
        })

        this.components.forEach(Player, (player) => {
            const moved = new PlayerMoved();
            moved.position = player.entity.position as any;
            moved.sessionId = player.sessionId;
            this.game.server.emit(moved);
        });
    }

    private loggedIn(loggedIn: LoggedIn) {
        if (this.players.has(loggedIn.sessionId)) return;

        const entity = this.addEntity();
        entity.addComponent(Transform);
        const player = entity.addComponent(Player);
        player.sessionId = loggedIn.sessionId;
        player.username = loggedIn.username;
        player.entity.transform.position.copy(loggedIn.position);

        console.log(this.entities.length);

        this.players.set(loggedIn.sessionId, entity);

        const newPlayer = new PlayerInstance();
        newPlayer.sessionId = loggedIn.sessionId;
        newPlayer.username = loggedIn.username;
        newPlayer.position = loggedIn.position;

        const message = new PlayerJoined();
        message.player = newPlayer;

        const socket = this.sockets.get(loggedIn.socketId)!;

        this.socketSessions.set(socket, message.player.sessionId);

        this.components.forEach(Player, (other) => {
            if (other.id === player.id) return;
            console.log(`Sending existence of ${other.username} to player ${player.username}`)
            const existing = new PlayerInstance();
            existing.sessionId = other.sessionId;
            existing.username = other.username;
            existing.position = other.entity.position as any;
            
            message.otherPlayers.push(existing);
        })

        socket.send(this.game.server.serverMessages.write(message));

        const otherJoined = new OtherPlayerJoined();
        otherJoined.player = newPlayer;

        this.game.server.emit(otherJoined, [socket]);
    }

    private loggedOut(msg: LoggedOut) {
        const socket = this.sockets.get(msg.socketId);
        if (socket) {

            const session = this.socketSessions.get(socket)!;

            console.log("Removing Socket");

            if (this.socketSessions.has(socket)) {
                const entity = this.players.get(session)!;

                const playerLeft = new PlayerLeft();
                playerLeft.sessionId = entity.getComponent(Player)!.sessionId;

                this.game.server.emit(playerLeft, [socket]);

                this.removeEntity(entity.id);
                this.players.delete(session);
                this.socketSessions.delete(socket);
            }

            this.sockets.delete(this.socketIds.get(socket)!);
            this.socketIds.delete(socket);
        }
    }
}