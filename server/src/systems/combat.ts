import { System } from "hagamets/dist/ecs/system.js";
import { Character, CharacterAttack, ClientMessages, NPC } from "@hascape/common";
import { Runtime } from "../runtime";
import { State } from "../state";
import { Random } from "hcore/dist/random";

export class CombatSystem extends System {

    private time: number = 0;
    private lastAttacks: Map<string, number> = new Map();

    calculateDamage(attacker: Character, attacked: Character) {
        const roll = Random.int(0, 6);
        const damage = Math.floor(attacker.strength * 0.5 + roll);
        return damage;
    }

    onInit(): void {
        const runtime = this.scene as Runtime;
        this.scene.game.server.installFilter([ClientMessages.CharacterAttack], (msg) => {
            const attack = msg.message as CharacterAttack;

            const character = State.playerSessions.get(attack.sessionId);

            if (!character) return;

            let canAttack = false;

            if (!this.lastAttacks.has(attack.sessionId)) {
                canAttack = true;
            } else if ((this.time - this.lastAttacks.get(attack.sessionId)! >= 0.5)) {
                canAttack = true;
            }

            if (canAttack) {
                this.lastAttacks.set(attack.sessionId, this.time);
                const thisCharacter = character.getComponent(Character)!;
                const map = State.getMap(thisCharacter.map);
                runtime.characterAttacked(thisCharacter);

                const chunk = State.chunks.getCellIndex(character.position);

                for (const neighbor of State.chunks.getNeighborhood(chunk)) {
                    const others = map.players.get(neighbor);

                    if (others) {
                        for (const other of others) {
                            const npc = other.getComponent(NPC);
                            if (npc) {
                                if (npc.entity.position.sub(character.position).length() < 70) {
                                    const otherCharacter = npc.entity.getComponent(Character)!;
                                    otherCharacter.health -= this.calculateDamage(thisCharacter, otherCharacter);
                                    if (otherCharacter.health < 0) {
                                        otherCharacter.health = 0;
                                    }
                                    runtime.characterChangeHealth(otherCharacter);

                                    npc.attackedBy.push(character);
                                    npc.attacking = character;
                                }
                            }
                        }
                    }
                }
            }
        })
    }

    onUpdate(dt: number): void {
        this.time += dt;
    }
}