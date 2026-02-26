import { IScene } from "hagamets/dist/core/interfaces/scene.js";
import { System } from "hagamets/dist/ecs/system.js";
import { deserializeComponent } from "hagamets/dist/core/serialization.js";

import WorldMap from "@hascape/common/map";
import { GridMap } from "hagamets/dist/utils/gridMap.js";
import { IEntity } from "hagamets/dist/ecs/interfaces/entity.js";
import { State } from "../state";
import { Vector2, Vector3 } from "three";
import { Transform } from "hagamets/dist/common/components/transform.js";
import { Runtime } from "../runtime";
import { APIMessages, ServerMessages } from "../messages/types";
import {CELL_SIZE, CELLS, Character, CharacterDied, INPC, ItemOnGround, ITEMS, NPC, NPCs, NPCSpawner, getDrops, ItemPickup} from "@hascape/common";
import { Random } from "hcore/dist/random";
import { BoxCollider2D } from "hagamets/dist/common/components/collider.js";
import { AABB } from "hagamets/dist/utils/math.js";
import PF from "pathfinding";
import { clamp } from "three/tsl";
import { ItemInstance } from "@hascape/common";
import { BaseSystem } from "./base";

interface SpawnerInstance {
    lastSpawned: number | null;
    entities: IEntity[];
}

export class NPCHandler extends BaseSystem {

    private npcs: Map<number, SpawnerInstance> = new Map();

    private grid: PF.Grid;
    private finder: PF.AStarFinder = new PF.AStarFinder({
        allowDiagonal: true,
        dontCrossCorners: true,
    });

    private minCell: Vector2;
    private maxCell: Vector2;

    onInit() {

        for (const data of WorldMap.npc_spawners) {
            const entity = this.scene.addEntity();
            entity.addComponent(Transform);
            entity.transform.position = State.grid.getCellPos(new Vector3(data.cell[0], data.cell[1], 0) as any);
            deserializeComponent(this.scene, entity, data.data);
        }

        this.minCell = new Vector2();
        this.maxCell = new Vector2();

        State.walls.forEach((pos, _, idx) => {
            if (pos.x < this.minCell.x) this.minCell.setX(pos.x);
            if (pos.y < this.minCell.y) this.minCell.setY(pos.y);
            if (pos.x > this.maxCell.x) this.maxCell.setX(pos.x);
            if (pos.y > this.maxCell.y) this.maxCell.setY(pos.y);
        });

        this.grid = new PF.Grid(this.maxCell.x - this.minCell.x + 1, this.maxCell.y - this.minCell.y + 1);

        State.walls.forEach((pos, _, idx) => {
            this.grid.setWalkableAt(pos.x - this.minCell.x, pos.y - this.minCell.y, false);
        })
    }

    private getRandomCell(spawnCell: Vector2, maxWander: number) {
        let canAccess = false;
        while (!canAccess) {
            const wander = Math.floor(maxWander / CELL_SIZE);
            const x = Random.int(-wander, wander) - this.minCell.x;
            const y = Random.int(-wander, wander) - this.minCell.y;
            const randomCell = new Vector2(x, y);
            if (!State.walls.has(new Vector2(randomCell.x + this.minCell.x, randomCell.y + this.minCell.y) as any)) {
                return randomCell;
            }
        }
        return new Vector2();
    }

    private getPath(start: Vector3, spawnPoint: Vector3, maxWander: number, targetPosition?: Vector3) {
        let path: number[][] = [];

        while (path.length === 0) {
            const spawnCell = State.grid.getCellIndex(spawnPoint as any);
            const startCell = State.grid.getCellIndex(start as any);

            let cell: Vector2;

            if (targetPosition) {
                cell = State.grid.getCellIndex(targetPosition as any) as any;
                cell.x -= this.minCell.x;
                cell.y -= this.minCell.y;
            } else {
                cell = this.getRandomCell(spawnCell as any, maxWander);
            }

            //console.log(startCell.x - this.minCell.x, startCell.y - this.minCell.y, randomCell.x, randomCell.y);

            path = PF.Util.compressPath(this.finder.findPath(startCell.x - this.minCell.x, startCell.y - this.minCell.y, cell.x, cell.y, this.grid.clone()));
        }

        const worldPath = [];

        for (const el of path) {
            worldPath.push(State.grid.getCellPos(new Vector2(el[0] + this.minCell.x, el[1] + this.minCell.y) as any) as any);
        }

        return worldPath;
    }

    onUpdate(dt: number): void {

        const runtime = this.scene as Runtime;

        this.scene.components.forEach(NPCSpawner, (spawner) => {
            if (!this.npcs.has(spawner.id)) {
                this.npcs.set(spawner.id, {
                    lastSpawned: null,
                    entities: [],
                });
            }

            let spawned = this.npcs.get(spawner.id)!.entities.length;

            const spawnerPos = new Vector2(spawner.entity.position.x, spawner.entity.position.y);

            while (spawned < spawner.maxSpawn) {


                const entity = this.scene.addEntityFromPrefab(NPCs[spawner.npcName].prefab);

                let validPos = false;

                while (!validPos) {
                    const pos = new Vector2(Random.float(-1, 1), Random.float(-1, 1));
                    pos.normalize();
                    pos.multiplyScalar(spawner.maxRadius);
                    pos.add(spawnerPos as any);

                    const collider = entity.getComponent(BoxCollider2D)!;
                    const aabb = new AABB(
                        new Vector2(pos.x + collider.min.x, pos.y + collider.min.y) as any, 
                        new Vector2(pos.x + collider.max.x, pos.y + collider.max.y) as any);

                    if (!State.walls.isColliding(aabb, State.grid)) {
                        validPos = true;
                        entity.transform.position.x = pos.x;
                        entity.transform.position.y = pos.y;
                    }
                }

                const character = entity.getComponent(Character)!;
                const npc = entity.getComponent(NPC)!;
                npc.spawnPoint = entity.transform.position as any;
                npc.spawner = spawner.id;
                character.speed = NPCs[spawner.npcName].speed;
                character.health = NPCs[spawner.npcName].health;
                character.totalHealth = NPCs[spawner.npcName].health;
                npc.maxWanderDistance = NPCs[spawner.npcName].maxWanderDistance;
                npc.npcType = spawner.npcName;
                character.sessionId = Random.alphanumeric(6);
                this.npcs.get(spawner.id)!.entities.push(entity);

                spawned = this.npcs.get(spawner.id)!.entities.length;

                runtime.npcJoined(npc);
            }
        });

        this.scene.components.forEach(NPC, (npc) => {

            const character = npc.entity.getComponent(Character)!;

            if (character.health === 0) {
                const msg = new CharacterDied();
                msg.sessionId = character.sessionId;
                this.scene.game.server.emit(msg);

                const npcs = this.npcs.get(npc.spawner)!;

                const index = npcs.entities.findIndex((other) => other.id === npc.entity.id);
                npcs.entities.splice(index, 1);

                const items = getDrops(NPCs[npc.npcType].dropTable);

                this.spawnItems(items.map(item => {
                    return {
                        item,
                        position: npc.entity.position as any,
                    }
                }));
                
                this.scene.removeEntity(npc.entity.id);

                return;
            }

            let needsPath = false;
            if (npc.path.length === 0) {
                // Regenerate Path
                needsPath = true;
            } else if (npc.attacking) {
                needsPath = true;  
            } else if (npc.pathIndex === npc.path.length) {
                needsPath = true;
            }

            if (needsPath) {
                //console.log("New Path");
                npc.path = this.getPath(npc.entity.position as any, npc.spawnPoint, npc.maxWanderDistance, npc.attacking ? npc.attacking.position as any: void 0);
                npc.pathIndex = 0;
            }

            if (npc.path.length > 0) {
                const distance = npc.entity.position.sub(npc.path[npc.pathIndex]).length();
                if (distance <= 11) {
                    npc.pathIndex++;
                    if (npc.pathIndex >= npc.path.length - 1) {
                        return;
                    }
                }

                character.direction = npc.path[npc.pathIndex].clone().sub(npc.entity.position);
                character.direction.z = 0;
                character.direction.normalize();

            }


        })
    }
}