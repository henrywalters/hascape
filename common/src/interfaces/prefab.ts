import { EntityData } from "hagamets/dist/ecs/interfaces/entity.js";

export interface IPrefab {
    id: string;
    name: string;
    data: EntityData;
}