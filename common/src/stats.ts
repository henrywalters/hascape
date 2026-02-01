import { Int } from "hagamets/dist/core/reflection.js";
import { IStats } from "./interfaces/stats";

export class Stats implements IStats {
    @Int()
    strength: number = 1;

    @Int()
    dexterity: number = 1;

    @Int()
    constitution: number = 1;

    @Int()
    intelligence: number = 1;

    @Int()
    wisdom: number = 1;

    @Int()
    charisma: number = 1;
}