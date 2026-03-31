import { IsNull, Repository } from "typeorm";
import { Player } from "../entity/player";
import { AppDataSource } from "../data-source";
import { User } from "../entity/user";
import { Vector3 } from "three";
import { Message } from "../entity/message";
import { Session } from "../entity/session";
import { Random } from "hcore/dist/random";

const SESSION_ID_LENGTH = 6;
const MAX_PLAYER_COUNT = 3;
const MIN_USERNAME_LENGTH = 5;

export class PlayerService {

    sessions: Repository<Session>;
    private players: Repository<Player>;
    private messages: Repository<Message>;

    constructor() {
        this.players = AppDataSource.getRepository(Player);
        this.messages = AppDataSource.getRepository(Message);
        this.sessions = AppDataSource.getRepository(Session);
    }

    async getPlayer(user: User, playerId: string) {
        return await this.players.findOne({
            where: {
                user: {
                    id: user.id,
                },
                id: playerId,
            },
            relations: ['user'],
        });
    }

    async getPlayers(user: User) {
        return await this.players.find({
            where: {
                user: {
                    id: user.id,
                }
            },
            relations: ['user'],
        });
    }

    async getPlayerByUsername(username: string) {
        return await this.players.findOneBy({
            username,
        });
    }

    async createPlayer(user: User, username: string) {

        username = username.trim();

        if (await this.getPlayerByUsername(username)) {
            throw new Error("Player with this username already exists");
        }

        if ((await this.getPlayers(user)).length >= MAX_PLAYER_COUNT) {
            throw new Error(`User can only have up to ${MAX_PLAYER_COUNT} players`);
        }

        if (username.trim().length < MIN_USERNAME_LENGTH) {
            throw new Error(`Username must be greater than ${MIN_USERNAME_LENGTH} characters`);
        }

        const player = new Player();
        player.username = username;
        player.user = user;
        player.x = 0;
        player.y = 0;
        await this.players.save(player);
        return player;
    }

    async setPlayerPosition(player: Player, position: Vector3) {
        player.x = position.x;
        player.y = position.y;
        await this.players.save(player);
        return player;
    }

    async sendMessage(player: Player, msg: string, to?: Player) {
        const message = new Message();
        message.message = msg;
        message.player = player;
        message.sentTo = to;
        await this.messages.save(message);
        return message;
    }
    
    public async getPlayerSession(player: Player) {
        return await this.sessions.findOneBy({
            player: {
                id: player.id,
            },
            endedOn: IsNull(),
        });
    }

    public async createSession(player: Player) {
        const session = new Session();
        session.player = player;
        session.sessionId = Random.alphanumeric(SESSION_ID_LENGTH);

        while (await this.sessions.existsBy({sessionId: session.sessionId})) {
            session.sessionId = Random.alphanumeric(SESSION_ID_LENGTH);
        }

        await this.sessions.save(session);

        return session;
    }

    public async getSession(sessionId: string) {
        return await this.sessions.findOne({
            where: {
                sessionId,
                endedOn: IsNull(),
            },
            relations: ['player'],
        });
    }

    public async endSession(session: Session) {
        session.endedOn = new Date();
        await this.sessions.save(session);
        return session;
    }

    public async clearSessions() {
        await this.sessions.update({
            endedOn: IsNull(),
        },{
            endedOn: new Date(),
        });
    }
}