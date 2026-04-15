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
import {CELL_SIZE, CELLS, Character, CharacterDied, INPC, ItemOnGround, ITEMS, NPC, NPCs, NPCSpawner, getDrops, ItemPickup } from "@hascape/common";
import { Random } from "hcore/dist/random";
import { BoxCollider2D } from "hagamets/dist/common/components/collider.js";
import { AABB } from "hagamets/dist/utils/math.js";

import { clamp } from "three/tsl";
import { ItemInstance } from "@hascape/common";
import { BaseSystem } from "./base";
import { Pathfinding } from "../pathfinding";

interface SpawnerInstance {
    lastSpawned: number | null;
    entities: IEntity[];
}

export class NPCHandler extends BaseSystem {

    private npcs: Map<number, SpawnerInstance> = new Map();

    onInit() {
        // for (const data of (WorldMap as MapData).npc_spawners) {
        //     const entity = this.scene.addEntity();
        //     entity.addComponent(Transform);
        //     entity.transform.position = State.grid.getCellPos(new Vector3(data.cell[0], data.cell[1], 0) as any);
        //     deserializeComponent(this.scene, entity, data.data);
        // }
    }

    onUpdate(dt: number): void {

        const runtime = this.scene as Runtime;

        this.scene.components.forEach(NPCSpawner, (spawner) => {

            const map = State.getMap(spawner.map);

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
                    pos.multiplyScalar(Random.float(spawner.minRadius, spawner.maxRadius));
                    pos.add(spawnerPos as any);

                    const collider = entity.getComponent(BoxCollider2D)!;
                    const aabb = new AABB(
                        new Vector2(pos.x + collider.min.x, pos.y + collider.min.y) as any, 
                        new Vector2(pos.x + collider.max.x, pos.y + collider.max.y) as any);

                    if (!map.walls.isColliding(aabb, State.grid)) {
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

                this.spawnItems(character.map, items.map(item => {
                    return {
                        item,
                        position: npc.entity.position as any,
                    }
                }));
                
                this.scene.removeEntity(npc.entity.id);

                return;
            }

            let needsPath = false;
            if (character.path.length === 0) {
                // Regenerate Path
                needsPath = true;
            } else if (npc.attacking) {
                needsPath = true;  
            } else if (character.pathIndex === character.path.length) {
                needsPath = true;
            }

            if (needsPath) {
                const map = State.getMap(character.map);
                //console.log("New Path");
                character.path = map.pathfinding.getRandomPath(npc.entity.position as any, npc.spawnPoint, npc.maxWanderDistance, npc.attacking ? npc.attacking.position as any: void 0);
                character.pathIndex = 0;
            }

            // if (character.path.length > 0) {
            //     const distance = npc.entity.position.sub(character.path[character.pathIndex]).length();
            //     if (distance <= 11) {
            //         character.pathIndex++;
            //         if (character.pathIndex >= character.path.length - 1) {
            //             return;
            //         }
            //     }

            //     character.direction = character.path[character.pathIndex].clone().sub(npc.entity.position);
            //     character.direction.z = 0;
            //     character.direction.normalize();

            // }


        })
    }
}