import { Repository } from "typeorm";
import { GameMap, MapTile } from "../entity/map";
import { AppDataSource } from "../data-source";
import { MapDTO } from "@hascape/common";

export class MapService {
    private tiles: Repository<MapTile>;
    private maps: Repository<GameMap>;

    constructor() {
        this.tiles = AppDataSource.getRepository(MapTile);
        this.maps = AppDataSource.getRepository(GameMap);
    }

    async getDefaultMap() {
        return await this.maps.findOneOrFail({
            where: {
                defaultMap: true,
            },
            relations: ['tiles', 'npcSpawners']
        })
    }

    async getAll() {
        return await this.maps.find({
            relations: ['tiles', 'npcSpawners']
        })
    }

    async get(id: string) {
        return await this.maps.findOne({
            where: {
                id,
            },
            relations: ['tiles', 'npcSpawners'],
        })
    }

    async getByName(name: string) {
        return await this.maps.findOne({
            where: {
                name,
            },
            relations: ['tiles', 'npcSpawners'],
        })
    }

    async update(map: GameMap, name: string, defaultMap: boolean, data: MapDTO) {

        if (name.trim().length === 0) {
            throw new Error("Map name can't be empty");
        }

        await this.tiles.remove(map.tiles);

        if (defaultMap) {
            await this.maps.update({}, {
                defaultMap: false,
            })
        }

        map.tiles = [];

        map.name = name;
        map.playerSpawnX = data.playerSpawnX;
        map.playerSpawnY = data.playerSpawnY;
        map.defaultMap = defaultMap;

        for (const tile of data.tiles) {
            const newTile = new MapTile();
            newTile.map = map;
            newTile.x = tile.x;
            newTile.y = tile.y;
            newTile.tileType = tile.tileType;
            map.tiles.push(newTile);
        }

        map = await this.maps.save(map);

        return await this.get(map.id)!; 
    }

    async create(name: string, defaultMap: boolean, data: MapDTO) {
        if (await this.getByName(name)) {
            throw new Error("Map with this name already exists");
        }

        const map = new GameMap();
        map.tiles = [];
        map.name = name;
        map.playerSpawnX = data.playerSpawnX;
        map.playerSpawnY = data.playerSpawnY;
        const saved = await this.maps.save(map);

        const newMap = await this.update(saved, name, defaultMap, data);

        return newMap;
    }

    async remove(id: string) {
        const map = await this.get(id);
        if (!map) {
            throw new Error("Map does not exist");
        }
        await this.maps.remove(map);
    }
}