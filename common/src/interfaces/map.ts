import { ComponentData } from "hagamets/dist/ecs/interfaces/component.js";

export interface NPCSpawnerData {
    cell: number[];
    data: ComponentData;
}

export interface MapData {
    tiles: {[key: string]: number[][]};
    player_spawn: number[];
    npc_spawners: NPCSpawnerData[];
}