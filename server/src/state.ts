import { IEntity } from "hagamets/dist/ecs/interfaces/entity.js";
import { Grid } from "hagamets/dist/utils/grid.js";
import { GridMap } from "hagamets/dist/utils/gridMap.js";
import { Vector2 } from "three";
import { CELL_SIZE, CELLS, CHUNKS, MapData, TILES, WORLD_SIZE, CHUNK_SIZE, INPCSpawner } from "@hascape/common";

import WorldMap from "@hascape/common/map";

class _State {
    public grid: Grid = new Grid();
    public chunks: Grid = new Grid();
    public walls: GridMap<void> = new GridMap();
    public players: GridMap<IEntity[]> = new GridMap();
    public items: GridMap<IEntity[]> = new GridMap();
    public playerSessions: Map<string, IEntity> = new Map();
    public itemInstances: Map<string, IEntity> = new Map();

    constructor() {

        this.grid.size = new Vector2(CHUNK_SIZE, CHUNK_SIZE) as any;
        this.grid.cells = new Vector2(CELLS, CELLS) as any;

        this.chunks.size = new Vector2(WORLD_SIZE, WORLD_SIZE) as any;
        this.chunks.cells = new Vector2(CHUNKS, CHUNKS) as any;

        for (const tile of TILES) {
            if (tile.isWall) {
                for (const cell of (WorldMap as MapData).tiles[tile.type]) {
                    this.walls.set(new Vector2(cell[0], cell[1]) as any);
                }
            }
        }
    }
}

export const State = new _State();