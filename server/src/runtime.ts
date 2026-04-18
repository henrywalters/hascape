import { IGame } from "hagamets/dist/core/interfaces/game.js";
import { Scene } from "hagamets/dist/core/scene.js";
import { ClientConnect, ClientMessages, Character, PlayerJoined, OtherPlayerJoined, PlayerLeft, PlayerMove, PlayerMoved, PlayerInstance, PlayerMessage, PlayerMessaged, Player, NPC, NPCInstance, MovementUpdate, CharacterAttacked, SERVER_MESSAGES, CharacterChangeHealth, NPCJoined,  ItemInstance, ItemOnGround, ItemPickup, ItemsSpawned, ItemsDespawned, CharacterAction, Actions, ActionReceived, INVENTORY_SLOTS, PickedUpItem, DroppedItem, ClientConnectFailed, IMap, IResponseMessage, CommandResponse, ResponseMessage, PlayerTeleported, OtherPlayerTeleported } from "@hascape/common";
import { Pubsub, PubsubType } from "./services/pubsub";
import { WebSocket } from "ws";
import { LoggedIn, LoggedOut, Login, LoginFailed, Logout } from "./messages/login";
import { APIMessages, ServerMessages } from "./messages/types";
import { NetEvents } from "hagamets/dist/net/interfaces/net.js";
import { Transform } from "hagamets/dist/common/components/transform.js";
import { PlayerReceivedMessaged, PlayerSendMessage, PlayerSetPosition } from "./messages/player";
import { EntityEvents } from "hagamets/dist/core/events.js";
import { GridMap } from "hagamets/dist/utils/gridMap.js";
import { Vector2, Vector3 } from "three";
import { State } from "./state";

import PlayerPrefab from "@hascape/common/otherPlayer";

import { AddedItemToInventory } from "./messages/inventory";
import { MapService } from "./services/map";
import { AppDataSource } from "./data-source";
import { MapChange, MapChangeType } from "./messages/map";
import { TileService } from "./services/tile";

export class Runtime extends Scene {

    public pubsub: Pubsub;

    private characterMoves: GridMap<PlayerMoved[]> = new GridMap();

    private socketId = 0;

    constructor(game: IGame) {
        super(game);

        const updateMaps = async () => {
            const maps = new MapService();
            const tiles = new TileService();
            State.updateMaps(await maps.getAll(), await tiles.getAll());
        }

        this.pubsub = new Pubsub(PubsubType.Server);

        this.pubsub.onMessage = async (msg) => {
            switch (msg.type) {
                case APIMessages.LoggedIn:
                    this.loggedIn(msg as LoggedIn);  
                    break;
                case APIMessages.LoggedOut:
                    this.loggedOut(msg as LoggedOut);
                    break;
                case APIMessages.PlayerReceiveMessage:
                    this.receiveMessage(msg as PlayerReceivedMessaged);
                    break;
                case APIMessages.AddedItemToInventory: 
                    console.log(msg as AddedItemToInventory);
                case APIMessages.LoginFailed:
                    this.connectFailed(msg as LoginFailed);
                case APIMessages.MapChange:
                    const change = msg as MapChange;
                    await updateMaps();
            }
        }

        this.entityEvents.listen((e) => {
            if (e.type === EntityEvents.UpdateComponent && e.component instanceof Transform) {
                const player = e.entity.getComponent(Player);
                if (!player) return;
                const character = e.entity.getComponent(Character)!;
                const setPos = new PlayerSetPosition();
                setPos.map = character.map;
                setPos.sessionId = character.sessionId;
                setPos.position = e.entity.position as any;
                this.pubsub.send(setPos);
            }
        })
    }

    onUpdate(dt: number) {

        this.game.server.flushEvents((event) => {
            if (event.type === NetEvents.Disconnected) {

                if (State.socketSessions.has(event.socket!)) {
                    const logout = new Logout();
                    logout.sessionId = State.socketSessions.get(event.socket!)!;
                    logout.socketId = State.socketIds.get(event.socket!)!;
                    this.pubsub.send(logout);
                }
            } else {
                const id = this.socketId;
                this.socketId++;

                State.sockets.set(id, event.socket!);
                State.socketIds.set(event.socket!, id);
            }
        })

        this.game.server.flushMessages((message) => {
            if (message.message.type === ClientMessages.Connect) {
                const login = new Login();
                const msg = message.message as ClientConnect;
                login.socketId = State.socketIds.get(message.socket!)!;
                login.token = msg.token;
                login.playerId = msg.playerId;
                this.pubsub.send(login);
            }

            if (message.message.type === ClientMessages.PlayerMove) {
                const move = message.message as PlayerMove;
                // console.log(message.message);
                if (State.playerSessions.has(move.sessionId)) {
                    const entity = State.playerSessions.get(move.sessionId)!;
                    const player = entity.getComponent(Character)!;
                    player.direction.copy(move.direction);
                }
            }
        })

        this.components.forEach(Player, (player) => {
            const chunk = State.chunks.getCellIndex(player.entity.position);
            const update = new MovementUpdate();
            for (const neighbor of State.chunks.getNeighborhood(chunk)) {
                const moves = this.characterMoves.get(neighbor);
                if (moves) {
                    for (const move of moves) {
                        update.movements.push(move);
                    }
                }
            }

            const character = player.entity.getComponent(Character)!;
            const socket = State.sessionSockets.get(character.sessionId)!;
            socket.send(this.game.server.serverMessages.write(update));
        });

        this.characterMoves.clear();
    }

    private getOtherPlayers(player: Character) {

        const instances: PlayerInstance[] = [];

        this.components.forEach(Character, (other) => {
            if (other.id === player.id) return;
            const otherPlayer = other.entity.getComponent(Player)!;

            if (player.map !== other.map) return;

            const existing = new PlayerInstance();
            existing.sessionId = other.sessionId;
            existing.health = other.health;
            existing.totalHealth = other.totalHealth;
            existing.username = otherPlayer.username;
            existing.position = other.entity.position as any;
            existing.map = other.map;
            
            instances.push(existing);
        });

        return instances;
    }

    private getOtherNPCs(character: Character) {
        const instances: NPCInstance[] = [];
        this.components.forEach(NPC, (npc) => {
            if (npc.map !== character.map) return;
            const instance = new NPCInstance();
            const otherCharacter = npc.entity.getComponent(Character)!;
            instance.sessionId = otherCharacter.sessionId;
            instance.npcType = npc.npcType;
            instance.totalHealth = otherCharacter.totalHealth;
            instance.health = otherCharacter.health;
            instance.position = npc.entity.position as any;
            instance.map = npc.map;

            instances.push(instance);
        });

        return instances;
    }

    private getOtherItems(character: Character) {
        const instances: ItemPickup[] = [];
        this.components.forEach(ItemOnGround, (item) => {
            if (item.map !== character.map) return;
            const instance = new ItemPickup();
            instance.item = item.item;
            instance.quantity = item.quantity; 
            instance.instanceId = item.instanceId; 
            instance.position = item.entity.position as any;
            instance.map = item.map;
            instances.push(instance);
        })
        return instances;
    }
    
    private loggedIn(loggedIn: LoggedIn) {
        if (State.playerSessions.has(loggedIn.sessionId)) {
            const connectFailed = new ClientConnectFailed();
            connectFailed.error = "Player already logged in";
            State.sockets.get(loggedIn.socketId)!.send(this.game.server.serverMessages.write(connectFailed));
            return;
        }

        const entity = this.addEntityFromPrefab(PlayerPrefab, loggedIn.username);
        const character = entity.getComponent(Character)!;

        character.map = loggedIn.map;
        character.sessionId = loggedIn.sessionId;

        const player = entity.getComponent(Player)!;

        player.username = loggedIn.username;
        player.isAdmin = loggedIn.isAdmin;
        
        player.entity.transform.position.copy(loggedIn.position);

        State.playerSessions.set(loggedIn.sessionId, entity);

        const newPlayer = new PlayerInstance();
        newPlayer.sessionId = loggedIn.sessionId;
        newPlayer.username = loggedIn.username;
        newPlayer.position = loggedIn.position;
        newPlayer.health = character.health;
        newPlayer.totalHealth = character.totalHealth;
        newPlayer.isAdmin = loggedIn.isAdmin;
        newPlayer.map = loggedIn.map;

        const message = new PlayerJoined();
        message.player = newPlayer;
        message.inventory = loggedIn.inventory;

        State.initializeInventory(message.player.sessionId, message.inventory);

        const socket = State.sockets.get(loggedIn.socketId)!;

        State.socketSessions.set(socket, message.player.sessionId);
        State.sessionSockets.set(message.player.sessionId, socket);

        message.otherPlayers = this.getOtherPlayers(character);
        message.npcs = this.getOtherNPCs(character);
        message.items = this.getOtherItems(character);

        socket.send(this.game.server.serverMessages.write(message));

        const otherJoined = new OtherPlayerJoined();
        otherJoined.player = newPlayer;

        this.game.server.emit(otherJoined, [socket]);
    }

    private loggedOut(msg: LoggedOut) {
        const socket = State.sockets.get(msg.socketId);
        if (socket) {

            const session = State.socketSessions.get(socket)!;

            if (State.socketSessions.has(socket)) {
                const entity = State.playerSessions.get(session)!;

                const playerLeft = new PlayerLeft();
                playerLeft.sessionId = entity.getComponent(Character)!.sessionId;

                this.game.server.emit(playerLeft, [socket]);

                this.removeEntity(entity.id);
                State.playerSessions.delete(session);
                State.socketSessions.delete(socket);
                State.sessionSockets.delete(playerLeft.sessionId);
            }

            State.sockets.delete(State.socketIds.get(socket)!);
            State.socketIds.delete(socket);
        }
    }

    private receiveMessage(msg: PlayerReceivedMessaged) {
        if (State.playerSessions.has(msg.sentTo)) {
            // It's a private message then
            // TODO
        } else {
            const newMsg = new PlayerMessaged();
            newMsg.message = msg.message;
            newMsg.username = msg.username;
            newMsg.position = new Vector3();
            newMsg.sessionId = msg.sessionId;
            this.game.server.emit(newMsg);
        }
    }

    public characterMoved(player: Character) {
        const chunk = State.chunks.getCellIndex(player.entity.position);

        const moved = new PlayerMoved();
        moved.position = player.entity.position as any;
        moved.sessionId = player.sessionId;
        moved.direction = player.direction;

        if (!this.characterMoves.has(chunk)) {
            this.characterMoves.set(chunk, []);
        }

        this.characterMoves.get(chunk)!.push(moved);
    }

    public characterTeleport(player: Character, position: Vector3, map: string) {

        let notify: Set<WebSocket> = new Set();

        const thisPlayer = player.entity.getComponent(Player)!;

        const appendNotify = () => {
            const startChunk = State.chunks.getCellIndex(player.entity.position as any);
            const startMap = State.getMap(player.map);
            for (const neighbor of State.chunks.getNeighborhood(startChunk)) {
                const neighbors = startMap.players.get(neighbor);
                if (neighbors) {
                    for (const other of neighbors) {
                        const character = other.getComponent(Character);
                        if (!character || character.id === player.id) continue;
                        if (State.sessionSockets.has(character.sessionId)) {
                            notify.add(State.sessionSockets.get(character.sessionId)!);
                        }
                    }
                }
            }
        }

        appendNotify();

        player.map = map;
        player.entity.transform.position.copy(position);
        player.entity.getComponent(Transform)!.notifyUpdate();

        const instance = new PlayerInstance();
        instance.health = player.health;
        instance.isAdmin = thisPlayer.isAdmin;
        instance.username = thisPlayer.username;
        instance.map = player.map;
        instance.position = player.entity.position as any;
        instance.sessionId = player.sessionId;
        instance.totalHealth = player.totalHealth;

        appendNotify();

        const teleported = new PlayerTeleported();
        teleported.player = instance;
        teleported.otherPlayers = this.getOtherPlayers(player);
        teleported.items = this.getOtherItems(player);
        teleported.npcs = this.getOtherNPCs(player);

        const otherTeleported = new OtherPlayerTeleported();
        otherTeleported.player = instance;

        State.sessionSockets.get(player.sessionId)!.send(this.game.server.serverMessages.write(teleported));

        player.path = [];

        const buffer = this.game.server.serverMessages.write(otherTeleported);

        for (const socket of notify) {
            socket.send(buffer);
        }
    }

    private sendMessage(mapName: string, msg: ArrayBuffer, chunk: Vector2) {
        const map = State.getMap(mapName);
        for (const neighbor of State.chunks.getNeighborhood(chunk as any)) {
            const others = map.players.get(neighbor);
            if (!others) continue;
            for (const entity of others) {
                const player = entity.getComponent(Player);
                if (player) {
                    const character = entity.getComponent(Character)!;
                    const socket = State.sessionSockets.get(character.sessionId)!;
                    socket.send(msg);
                }
            }
        }
    }

    public characterAttacked(character: Character) {
        const chunk = State.chunks.getCellIndex(character.entity.position);

        const msg = new CharacterAttacked();
        msg.sessionId = character.sessionId;
        const buffer = this.game.server.serverMessages.write(msg);

        this.sendMessage(character.map, buffer, chunk as any);
    }

    public characterChangeHealth(character: Character) {
        const chunk = State.chunks.getCellIndex(character.entity.position);

        const msg = new CharacterChangeHealth();
        msg.sessionId = character.sessionId;
        msg.health = character.health;
        const buffer = this.game.server.serverMessages.write(msg);

        this.sendMessage(character.map, buffer, chunk as any);
    }

    public npcJoined(npc: NPC) {
        const msg = new NPCJoined();
        const character = npc.entity.getComponent(Character)!;
        msg.npc = new NPCInstance();
        msg.npc.npcType = npc.npcType;
        msg.npc.health = character.health;
        msg.npc.totalHealth = character.totalHealth;
        msg.npc.position = npc.entity.position as any;
        msg.npc.sessionId = character.sessionId;

        this.game.server.emit(msg);
    }

    public spawnItems(items: ItemPickup[], visibleTo?: string[]) {
        const msg = new ItemsSpawned();
        msg.items = items;

        if (visibleTo) {
            const buffer = this.game.server.serverMessages.write(msg);
            for (const id of visibleTo) {
                const socket = State.sessionSockets.get(id);
                if (socket) {
                    socket.send(buffer);
                }
            }
        } else {
            this.game.server.emit(msg);
        }
    }

    public despawnItems(items: string[], visibleTo?: string[]) {
        const msg = new ItemsDespawned();
        msg.instanceIds = items;

        if (visibleTo) {
            const buffer = this.game.server.serverMessages.write(msg);
            for (const id of visibleTo) {
                const socket = State.sessionSockets.get(id);
                if (socket) {
                    socket.send(buffer);
                }
            }
        } else {
            this.game.server.emit(msg);
        }
    }

    public connectFailed(msg: LoginFailed) {
        const output = new ClientConnectFailed();
        output.error = msg.error;
        const socket = State.sockets.get(msg.socketId);
        if (socket) {
            socket.send(this.game.server.serverMessages.write(output));
        }
    }

    public sendResponse(player: Character, messages: IResponseMessage[]) {
        const msg = new CommandResponse();
        msg.responses = messages.map((msg) => {
            const res = new ResponseMessage();
            res.message = msg.message;
            res.responseType = msg.responseType;
            return res;
        })
        const buffer = this.game.server.serverMessages.write(msg);
        State.sessionSockets.get(player.sessionId)!.send(buffer);
    }
}