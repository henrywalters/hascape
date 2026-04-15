import { Repository } from "typeorm";
import { File, StorageService } from "./storage";
import { Tile } from "../entity/tile";
import { AppDataSource } from "../data-source";
import { AssetType, ITile } from "@hascape/common";
import { Random } from "hcore/dist/random";

export class TileService {
    storage: StorageService;
    tiles: Repository<Tile>;

    constructor() {
        this.storage = new StorageService();
        this.tiles = AppDataSource.getRepository(Tile);
    }

    async getAll(): Promise<ITile[]> {
        return await this.tiles.find({
            relations: ['texture'],
        })
    }

    async get(id: string) {
        return await this.tiles.findOne({
            where: {
                id,
            },
            relations: ['texture'],
        });
    }

    async getByName(name: string) {
        return await this.tiles.findOne({
            where: {
                name,
            },
            relations: ['texture'],
        })
    }

    async update(tile: Tile, name: string, isWall: boolean, file?: File, color?: string) {
        tile.name = name;
        tile.isWall = isWall;

        if (file) {
            const fileName = `${name}_${Random.alphanumeric(6)}`;
            tile.texture = await this.storage.upload(fileName, AssetType.Texture, file);
        } else {
            tile.texture = void 0;
        }

        if (color) {
            tile.color = color;
        } else {
            tile.color = void 0;
        }

        return await this.tiles.save(tile);
    }

    async create(name: string, isWall: boolean, file?: File, color?: string) {
        if (await this.getByName(name)) {
            throw new Error(`Tile: ${name} already exists`);
        }

        const tile = new Tile();

        return await this.update(tile, name, isWall, file, color);
    }

    async remove(id: string) {
        const tile = await this.get(id);
        if (!tile) {
            throw new Error(`Tile: #${id} does not exist`);
        }
        await this.tiles.remove(tile);
    }
}