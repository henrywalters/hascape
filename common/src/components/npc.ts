import { String } from "hagamets/dist/core/reflection.js";
import { Component } from "hagamets/dist/ecs/component.js";
import { IEntity } from "hagamets/dist/ecs/interfaces/entity.js";
import { Vector3 } from "three";

export class NPC extends Component {
    @String()
    npcType: string;

    spawner: number;

    spawnPoint: Vector3;

    maxWanderDistance: number;

    // path: Vector3[] = [];

    // pathIndex: number = 0;

    attackedBy: IEntity[] = [];

    attacking: IEntity | null = null;
}