import "reflect-metadata"
import { AppDataSource } from "./data-source"
import express, { Request, Response, NextFunction } from 'express';
import { AuthService } from "./services/auth";
import dotenv from 'dotenv'
import admin from 'firebase-admin';
import cors from 'cors';
import { Pubsub, PubsubType } from "./services/pubsub";
import { ClientConnect } from "@hascape/common";
import { LoggedIn, LoggedOut, Login, Logout } from "./messages/login";
import { ServerMessages } from "./messages/types";
import { PlayerService } from "./services/player";
import { Vector3 } from "three";
import { PlayerSetPosition } from "./messages/player";

dotenv.config({ path: '.env' })

AppDataSource.initialize().then(async () => {

    const serviceAccount = await import(process.env.FIREBASE_SERVICE_ACCOUNT_PATH as string);

    const firebase = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    })
    
    const app = express();

    const auth = new AuthService();
    const players = new PlayerService();
    const pubsub = new Pubsub(PubsubType.API);

    pubsub.onMessage = async (message) => {
        if (message.type === ServerMessages.Login) {
            try {
                let connect = message as Login;
                const verified = await firebase.auth().verifyIdToken(connect.token);
                if (!verified) return;
                const user = await auth.getUser(verified.user_id);
                if (!user) return;
                let session = await auth.getUserSession(user);
                if (!session) {
                    session = await auth.createSession(user);
                }
                let player = await players.getPlayer(user);
                if (!player) {
                    player = await players.createPlayer(user);
                }
                
                const loggedIn = new LoggedIn();
                loggedIn.socketId = connect.socketId;
                loggedIn.sessionId = session.sessionId;
                loggedIn.username = user.username;
                loggedIn.position = new Vector3(player.x, player.y, 0);

                pubsub.send(loggedIn);
            } catch (e) {
                console.warn(e);
            }
        }

        if (message.type === ServerMessages.Logout) {
            let logout = message as Logout;
            const session = await auth.getSession(logout.sessionId);
            if (session) {
                await auth.endSession(session);
                const loggedOut = new LoggedOut();
                loggedOut.sessionId = session.sessionId;
                loggedOut.socketId = logout.socketId;
                pubsub.send(loggedOut);
            }
        }

        if (message.type === ServerMessages.PlayerSetPosition) {
            const setPos = message as PlayerSetPosition;
            const session = await auth.getSession(setPos.sessionId);
            if (!session) return;
            const player = await players.getPlayer(session.user);
            if (!player) return;
            await players.setPlayerPosition(player, setPos.position);
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
        next();
    });

    app.use(async (error: any, req: Request, resolve: Response, next: NextFunction) => {
        console.log(error);
    });

    app.get('/', (req, res) => {
        res.json({message: "HaScape"})
    });

    app.get('/user', async (req, res) => {
        const user = await auth.getUser(req.headers.user_id as string);
        if (!user) {
            res.status(404).json({message: "User Does Not Exist"});
        } else {
            res.json(user);
        }
    })

    app.post('/user', async (req, res) => {
        console.log(req.body);
        console.log("Create User");
        if (!req.body.username) {
            res.status(400).json({errors: {
                username: 'Username is required',
            }});
            return;
        }

        return await auth.createUser(req.headers.user_id as string, req.body.username);
    })

    app.listen(4201, () => {
        console.log("Listening on port 4201");
    })

}).catch(error => console.log(error))
