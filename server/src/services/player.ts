import { Repository } from "typeorm";
import { Player } from "../entity/player";
import { AppDataSource } from "../data-source";
import { User } from "../entity/user";
import { Vector3 } from "three";

export class PlayerService {
    private players: Repository<Player>;

    constructor() {
        this.players = AppDataSource.getRepository(Player);
    }

    async getPlayer(user: User) {
        return await this.players.findOneBy({
            user: {
                id: user.id,
            }
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
}