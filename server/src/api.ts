import "reflect-metadata"
import { AppDataSource } from "./data-source"
import express, { Request, Response, NextFunction } from 'express';
import { AuthService } from "./services/auth";
import dotenv from 'dotenv'
import admin from 'firebase-admin';
import cors from 'cors';
import { Pubsub, PubsubType } from "./services/pubsub";
import { ClientConnect, InventoryItem } from "@hascape/common";
import { LoggedIn, LoggedOut, Login, LoginFailed, Logout } from "./messages/login";
import { APIMessages, ServerMessages } from "./messages/types";
import { PlayerService } from "./services/player";
import { Vector3 } from "three";
import { PlayerReceivedMessaged, PlayerSendMessage, PlayerSetPosition } from "./messages/player";
import { NPCService } from "./services/npc";
import { NetEvents } from "hagamets/dist/net/interfaces/net.js";
import { NPCsCleared } from "./messages/npc";
import { AddedItemToInventory, AddItemToInventory, RemovedItemFromInventory, RemoveItemFromInventory } from "./messages/inventory";
import { InventoryService } from "./services/inventory";
import { AuthLevel } from "./entity/user";
import { UserController } from "./controllers/userController";
import { PlayerController } from "./controllers/playerController";
import { StorageService } from "./services/storage";

dotenv.config({ path: '.env' })

AppDataSource.initialize().then(async () => {

    const serviceAccount = await import(process.env.FIREBASE_SERVICE_ACCOUNT_PATH as string);

    const firebase = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    })
    
    const app = express(); 

    const auth = new AuthService();
    const players = new PlayerService();
    const npcs = new NPCService();
    const inventory = new InventoryService();
    const pubsub = new Pubsub(PubsubType.API);
    const storage = new StorageService();

    pubsub.onMessage = async (message) => {
        if (message.type === ServerMessages.Login) {

            let connect = message as Login;

            const sendError = (error: string) => {
                console.log(error);
                const failed = new LoginFailed();
                failed.error = error;
                failed.socketId = connect.socketId;
                pubsub.send(failed);
            }

            try {

                const verified = await firebase.auth().verifyIdToken(connect.token);
                if (!verified) {
                    sendError("Unauthorized");
                    return;
                }
                const user = await auth.getUser(verified.user_id);
                if (!user) {
                    sendError("User does not exist");
                    return;
                }
                const player = await players.getPlayer(user, connect.playerId);
                if (!player) {
                    sendError("Player does not exist");
                    return;
                }
                let session = await players.getPlayerSession(player);

                // if (!session) {
                //     sendError("Player already logged in");
                //     return;
                // }

                if (!session) {
                    session = await players.createSession(player);
                }
                
                const loggedIn = new LoggedIn(); 
                loggedIn.socketId = connect.socketId;
                loggedIn.sessionId = session.sessionId;
                loggedIn.username = player.username;
                loggedIn.position = new Vector3(player.x, player.y, 0);
                loggedIn.inventory = (await inventory.getItems(player)).map((item) => {
                    console.log(item);
                    const inventoryItem = new InventoryItem();
                    inventoryItem.instanceId = item.instanceId;
                    inventoryItem.position = item.position;
                    inventoryItem.quantity = item.quantity;
                    inventoryItem.item = item.item;
                    return inventoryItem;
                });
                pubsub.send(loggedIn);
            } catch (e: any) {
                console.warn(e);
                sendError(e.toString());
            }
        }

        if (message.type === ServerMessages.Logout) {
            let logout = message as Logout;
            const session = await players.getSession(logout.sessionId);
            if (session) {
                await players.endSession(session);
                const loggedOut = new LoggedOut();
                loggedOut.sessionId = session.sessionId;
                loggedOut.socketId = logout.socketId;
                pubsub.send(loggedOut);
            }
        }

        if (message.type === ServerMessages.PlayerSetPosition) {
            const setPos = message as PlayerSetPosition;
            const session = await players.getSession(setPos.sessionId);
            if (!session) return;
            await players.setPlayerPosition(session.player, setPos.position);
        }

        if (message.type === ServerMessages.PlayerSendMessage) {
            const msg = message as PlayerSendMessage;
            const session = await players.getSession(msg.sessionId);
            if (!session) return;
            const to = await players.getSession(msg.sentTo);
            players.sendMessage(session.player, msg.message, to?.player);

            const received = new PlayerReceivedMessaged;
            received.message = msg.message;
            received.username = session.player.username;
            received.sentTo = msg.sentTo;
            received.sessionId = msg.sessionId;

            pubsub.send(received);
        }

        if (message.type === ServerMessages.NPCsClear) {
            await npcs.clear();
            console.log("Cleared NPCs");
            pubsub.send(new NPCsCleared());
        }

        if (message.type === ServerMessages.AddItemToInventory) {
            const msg = message as AddItemToInventory;
            const session = await players.getSession(msg.sessionId);
            if (!session) return;
            const item = await inventory.addItem(session.player, msg.item.instanceId, msg.item.item, msg.item.quantity, msg.item.position);
            const addedItem = new AddedItemToInventory();
            addedItem.item = msg.item;
            pubsub.send(addedItem);
        }

        if (message.type === ServerMessages.RemoveItemFromInventory) {
            const msg = message as RemoveItemFromInventory;
            const session = await players.getSession(msg.sessionId);
            if (!session) return;

            await inventory.removeItem(session.player, msg.instanceId);
            const removedItem = new RemovedItemFromInventory();
            removedItem.instanceId = msg.instanceId;
            removedItem.sessionId = msg.sessionId;
            pubsub.send(removedItem);
        }
    }

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use(async (req, res, next) => {
        const token = req.headers.authorization;
        if (!token) {
            res.status(401).json({message: "Unauthorized"});
            return;
        }
        const verified = await firebase.auth().verifyIdToken(token);
        if (!verified) {
            return;
        }
        req.headers.user_id = verified.user_id;

        let user = await auth.createUser(verified.user_id, verified.email!);

        if (verified.email && verified.email === 'henrywalters20@gmail.com' && user.authLevel !== AuthLevel.SuperAdmin) {
            await auth.setAuthLevel(user, AuthLevel.SuperAdmin);
        }

        next();
    });

    const userController = new UserController(app);
    const playerController = new PlayerController(app);

    app.use(async (error: any, req: Request, resolve: Response, next: NextFunction) => {
        console.log(error);
    });

    app.get('/', (req, res) => {
        res.json({message: "HaScape"})
    });

    // app.get('/user', async (req, res) => {
    //     const user = await auth.getUser(req.headers.user_id as string);
    //     if (!user) {
    //         res.status(404).json({message: "User Does Not Exist"});
    //     } else {
    //         res.json(user);
    //     }
    // })

    // // app.get('/players', async (req, res) => {
    // //     const user = await auth.getUser(req.headers.user_id as string);
    // //     if (user.authLevel ===)
    // // })

    // app.post('/user', async (req, res) => {
    //     console.log(req.body); 
    //     console.log("Create User");
    //     if (!req.body.username) {
    //         res.status(400).json({errors: {
    //             username: 'Username is required',
    //         }});
    //         return;
    //     }

    //     // const user = await auth.createUser(req.headers.user_id as string, req.body.username);
    //     // res.json(user);
    // })

    app.listen(4201, () => {
        console.log("Listening on port 4201");
    })

    setInterval(() => {
        const usage = process.memoryUsage();
        console.log({
            heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
            rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
        });
    }, 5000);

}).catch(error => console.log(error))
