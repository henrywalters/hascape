import { Repository } from "typeorm";
import { NPC } from "../entity/npc";
import { AppDataSource } from "../data-source";
import { Vector3 } from "three";
import { NPCs } from "@hascape/common";
import { Random } from "hcore/dist/random";

const SESSION_ID_LENGTH = 6;

export class NPCService {
    npcs: Repository<NPC>;

    constructor() {
        this.npcs = AppDataSource.getRepository(NPC);
    }

    async clear() {
        await this.npcs.clear();
    }

    async createNPC(type: string, position: Vector3) {
        if (!(type in NPCs)) {
            throw new Error(`NPC '${type} does not exist`);
        }

        const data = NPCs[type];

        const npc = new NPC();
        npc.sessionId = Random.alphanumeric(SESSION_ID_LENGTH);

        while (!(await this.npcs.existsBy({sessionId: npc.sessionId}))) {
            npc.sessionId = Random.alphanumeric(SESSION_ID_LENGTH);
        }

        npc.health = data.health;
        npc.x = position.x;
        npc.y = position.y;

        await this.npcs.save(npc);

        return npc;
    }
}