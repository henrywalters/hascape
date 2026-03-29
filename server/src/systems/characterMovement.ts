import { System } from "hagamets/dist/ecs/system.js";
import { EntityEvents } from "hagamets/dist/core/events.js";
import { Transform } from "hagamets/dist/common/components/transform.js";
import { Vector2, Vector3 } from "three";
import { AABB } from "hagamets/dist/utils/math.js";
import { State } from "../state";
import { CELL_SIZE, Character } from "@hascape/common";
import { Runtime } from "../runtime";
import { BoxCollider2D } from "hagamets/dist/common/components/collider.js";

export class CharacterMovement extends System {

    private dirCache: Map<string, Vector2> = new Map();
    private posCache: Map<string, Vector3> = new Map();

    onBeforeUpdate(): void {
        State.players.clear();

        this.scene.components.forEach(Character, (character) => {
            const chunk = State.chunks.getCellIndex(character.entity.position);
            if (!State.players.has(chunk)) {
                State.players.set(chunk, []);
            }
            State.players.get(chunk)!.push(character.entity);
        });
    }

    onUpdate(dt: number): void {

        const runtime = this.scene as Runtime;

        this.scene.components.forEach(Character, (character) => {

            if (character.path.length === 0) {
                character.direction.set(0, 0, 0);
            } else {
                const target = character.path[character.pathIndex].clone().sub(character.entity.position);
                target.z = 0;
                if (target.length() < 5) {
                    character.pathIndex++;
                    if (character.pathIndex === character.path.length) {
                        character.onReachDestination(); 
                        character.path = [];
                        character.pathIndex = 0;
                    }
                } else {
                    character.direction = target.normalize();
                }
            }

            if (character.direction.x !== 0 || character.direction.y !== 0 || character.direction.z !== 0) {
                const delta = character.direction.clone().multiplyScalar(dt * character.speed);

                const move = (delta: Vector3) => {
                    const newPos = character.entity.transform.position.clone().add(delta);
                    //const playerAABB = new AABB(new Vector2(min.x, min.y) as any, new Vector2(max.x, max.y) as any);

                    const collider = character.entity.getComponent(BoxCollider2D)!;
                    const aabb = new AABB(
                        new Vector2(newPos.x + collider.min.x, newPos.y + collider.min.y) as any, 
                        new Vector2(newPos.x + collider.max.x, newPos.y + collider.max.y) as any);

                    if (!State.walls.isColliding(aabb, State.grid)) {
                        character.entity.transform.position.add(delta);
                    }
                }

                move(new Vector3(delta.x, 0, 0));
                move(new Vector3(0, delta.y, 0));

                this.scene.entityEvents.emit({
                    type: EntityEvents.UpdateComponent,
                    entity: character.entity,
                    component: character.entity.transform as  Transform,
                });
            } 

            const dirCache = this.dirCache.get(character.sessionId); 
            const posCache = this.posCache.get(character.sessionId);

            if (!dirCache || !dirCache.equals(character.direction) || !posCache || !posCache.equals(character.entity.position)) {
                runtime.characterMoved(character);
            }

            this.dirCache.set(character.sessionId, character.direction.clone() as any);
            this.posCache.set(character.sessionId, character.entity.position.clone() as any);

        });
    }
}