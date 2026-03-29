import { INPC } from "../interfaces/npc";
import OrcData from "../../assets/prefabs/orc.json";
import { alwaysDrop, DEFAULT_DROP } from "../interfaces/dropTable";


export const Orc: INPC = {
    name: "orc",
    displayName: "Orc",
    canAttack: true,
    prefab: OrcData,
    health: 10,
    speed: 100,
    maxWanderDistance: 500,
    stats: {
        strength: 3,
        dexterity: 1,
        constitution: 5,
        intelligence: 1,
        wisdom: 1,
        charisma: 1,
    },
    dropTable: [
        alwaysDrop('bones'),
    ]
}