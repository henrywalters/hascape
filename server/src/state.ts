import { IEntity } from "hagamets/dist/ecs/interfaces/entity.js";
import { Grid } from "hagamets/dist/utils/grid.js";
import { GridMap } from "hagamets/dist/utils/gridMap.js";
import { Vector2 } from "three";
import { WebSocket } from "ws";
import { CELL_SIZE, CELLS, CHUNKS, WORLD_SIZE, CHUNK_SIZE, INPCSpawner, InventoryItem, Inventory, ItemInstance, IMap, ITile } from "@hascape/common";

import { Pubsub } from "./services/pubsub";
import { Pathfinding } from "./pathfinding";

class MapState {
    public tiles: Map<string, ITile> = new Map();
    public walls: GridMap<void> = new GridMap();
    public players: GridMap<IEntity[]> = new GridMap();
    public items: GridMap<IEntity[]> = new GridMap();
    public pathfinding: Pathfinding;

    constructor(map: IMap, tiles: ITile[]) {
        for (const tile of tiles) {
            this.tiles.set(tile.name, tile);
        }
        this.update(map);
    }

    update(map: IMap) {
        this.walls.clear();
        for (const tile of map.tiles) {
            if (this.tiles.get(tile.tileType)?.isWall) {
                this.walls.set(new Vector2(tile.x, tile.y) as any);
            }
        }
        this.pathfinding = new Pathfinding(this.walls);
    }
}

class _State {

    public pubsub: Pubsub | null = null;

    public grid: Grid = new Grid();
    public chunks: Grid = new Grid();

    public playerSessions: Map<string, IEntity> = new Map();
    public itemInstances: Map<string, IEntity> = new Map();
    public playerInventories: Map<string, Inventory> = new Map();
    public sockets: Map<number, WebSocket> = new Map();
    public socketIds: Map<WebSocket, number> = new Map();

    public sessionSockets: Map<string, WebSocket> = new Map();
    public socketSessions: Map<WebSocket, string> = new Map();

    public maps: Map<string, MapState> = new Map();

    constructor() {
        this.grid.size = new Vector2(CHUNK_SIZE, CHUNK_SIZE) as any;
        this.grid.cells = new Vector2(CELLS, CELLS) as any;

        this.chunks.size = new Vector2(WORLD_SIZE, WORLD_SIZE) as any;
        this.chunks.cells = new Vector2(CHUNKS, CHUNKS) as any;
    }

    updateMap(map: IMap, tiles: ITile[]) {
        if (!this.maps.has(map.name)) {
            this.maps.set(map.name, new MapState(map, tiles));
        } else {
            this.maps.get(map.name)!.update(map);
        }
    }

    updateMaps(maps: IMap[], tiles: ITile[]) {
        for (const map of maps) {
            this.updateMap(map, tiles);
        }
    }

    getMap(name: string): MapState {
        if (!this.maps.has(name)) {
            throw new Error("Map not loaded");
        }

        return this.maps.get(name)!;
    }

    initializeInventory(playerId: string, items: InventoryItem[]) {
        this.getInventory(playerId).initialize(items);
    }

    getInventory(playerId: string) {
        if (!this.playerInventories.has(playerId)) {
            this.playerInventories.set(playerId, new Inventory());
        }

        return this.playerInventories.get(playerId)!;
    }

    addInventoryItem(playerId: string, item: ItemInstance) {
        return this.getInventory(playerId).addItem(item);
    }

    removeInventoryItem(playerId: string, itemId: string) {
        return this.getInventory(playerId).removeItem(itemId);
    }
}

export const State = new _State();