import { EntityData } from "hagamets/dist/ecs/interfaces/entity.js";
import { IStats } from "./stats";
import { IDropTable } from "./dropTable";

export interface INPC {
    name: string;
    displayName: string;
    canAttack: boolean;
    prefab: EntityData;
    health: number;
    stats: IStats;
    speed: number;
    maxWanderDistance: number;
    dropTable: IDropTable
}

export interface INPCSpawner {
    npcName: string;
    maxSpawn: number;
    minRadius: number;
    maxRadius: number;
    minDelay: number;
    maxDelay: number; 
}