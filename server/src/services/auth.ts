import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { AuthLevel, User } from "../entity/user";


export class AuthService {

    users: Repository<User>;

    constructor() {
        this.users = AppDataSource.getRepository(User);
    }

    public async getUser(userId: string) {
        const user = await this.users.findOneBy({userId});
        if (!user) {
            throw new Error("User does not exist");
        }
        return user;
    }

    public async getUsers() {
        return await this.users.find({
            order: {
                createdOn: 'DESC'
            }
        });
    }

    public async createUser(userId: string, email: string): Promise<User> {
        let user = await this.users.findOneBy({userId});
        if (user) return user;
        user = new User();
        user.userId = userId;
        user.email = email;
        user.authLevel = AuthLevel.Default;
        await this.users.save(user);
        return user;
    }

    public async setAuthLevel(user: User, authLevel: AuthLevel) {
        user.authLevel = authLevel;
        await this.users.save(user);
        return user;
    }
}