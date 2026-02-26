import { INPC } from "../interfaces/npc";
import { Prefabs, PrefabTypes } from "../prefabs";

export const Wizard: INPC = {
    name: "wizard",
    displayName: "Wizard",
    canAttack: false,
    prefab: Prefabs[PrefabTypes.Wizard],
    health: 10,
    stats: {
        strength: 0,
        dexterity: 0,
        constitution: 0,
        intelligence: 0,
        wisdom: 0,
        charisma: 0
    },
    speed: 100,
    maxWanderDistance: 500,
    dropTable: []
}