import { IsNull, Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { User } from "../entity/user";
import { Session } from "../entity/session";
import { Random } from "hcore/dist/random";

const SESSION_ID_LENGTH = 6;

export class AuthService {

    users: Repository<User>;
    sessions: Repository<Session>;

    constructor() {
        this.users = AppDataSource.getRepository(User);
        this.sessions = AppDataSource.getRepository(Session);
    }

    public async getUser(userId: string) {
        return await this.users.findOneBy({userId});
    }

    public async getUserByUsername(username: string) {
        return await this.users.findOneBy({
            username,
        });
    }

    public async createUser(userId: string, username: string) {
        let existingUser = await this.getUser(userId);
        if (existingUser) {
            return existingUser;
        }

        existingUser = await this.getUserByUsername(username);

        if (existingUser) {
            throw new Error("Username already exists");
        }

        const user = new User();
        user.userId = userId;
        user.username = username;
        await this.users.save(user);
        return user;
    }

    public async getUserSession(user: User) {
        return await this.sessions.findOneBy({
            user: {
                id: user.id,
            },
            endedOn: IsNull(),
        });
    }

    public async createSession(user: User) {
        const session = new Session();
        session.user = user;
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
            relations: ['user'],
        });
    }

    public async endSession(session: Session) {
        session.endedOn = new Date();
        await this.sessions.save(session);
        return session;
    }
}