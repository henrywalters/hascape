import { Repository } from "typeorm";
import { Player } from "../entity/player";
import { AppDataSource } from "../data-source";
import { User } from "../entity/user";
import { Vector3 } from "three";
import { Message } from "../entity/message";

export class PlayerService {
    private players: Repository<Player>;
    private messages: Repository<Message>;

    constructor() {
        this.players = AppDataSource.getRepository(Player);
        this.messages = AppDataSource.getRepository(Message);
    }

    async getPlayer(user: User) {
        return await this.players.findOne({
            where: {
                user: {
                    id: user.id,
                }
            },
            relations: ['user'],
        });
    }

    async createPlayer(user: User) {
        const player = new Player();
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

    async sendMessage(player: User, msg: string, to?: User) {
        const message = new Message();
        message.message = msg;
        message.user = player;
        message.sentTo = to;
        await this.messages.save(message);
        return message;
    }
}