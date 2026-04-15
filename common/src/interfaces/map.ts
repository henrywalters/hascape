import { ComponentData } from "hagamets/dist/ecs/interfaces/component.js";

// export interface NPCSpawnerData {
//     cell: number[];
//     data: ComponentData;
// }

// export interface MapData {
//     tiles: {[key: string]: number[][]};
//     player_spawn: number[];
//     npc_spawners: NPCSpawnerData[];
// }

export interface MapTileDTO {
    x: number;
    y: number;
    tileType: string;
}

export interface MapDTO {
    tiles: MapTileDTO[];
    playerSpawnX: number;
    playerSpawnY: number;
}

export interface IMapTile {
    id: number;
    x: number;
    y: number;
    tileType: string;
}

export interface IMap {
    id: string;
    name: string;
    defaultMap: boolean;
    tiles: IMapTile[];
    playerSpawnX: number;
    playerSpawnY: number;
}