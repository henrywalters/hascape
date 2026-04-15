import { Repository } from "typeorm";
import { Prefab } from "../entity/prefab";
import { AppDataSource } from "../data-source";
import { EntityData } from "hagamets/dist/ecs/interfaces/entity.js";

export class PrefabService {
    private prefabs: Repository<Prefab>;

    constructor() {
        this.prefabs = AppDataSource.getRepository(Prefab);
    }

    async getAll() {
        return await this.prefabs.find();
    }

    async get(id: string) {
        return await this.prefabs.findOne({
            where: {
                id,
            }
        })
    }

    async getByName(name: string) {
        return await this.prefabs.findOne({
            where: {
                name,
            }
        });
    }

    async update(prefab: Prefab, name: string, data: EntityData) {
        prefab.name = name;
        prefab.data = data;
        return await this.prefabs.save(prefab);
    }

    async create(name: string, data: EntityData) {
        if (await this.getByName(name)) {
            throw new Error("Prefab with this name already exists");
        }

        const prefab = new Prefab();
        return await this.update(prefab, name, data);
    }

    async remove(id: string) {
        const prefab = await this.get(id);
        if (!prefab) {
            throw new Error("Prefab does not exist");
        }
        await this.prefabs.remove(prefab);
    }
}