import { Component } from "hagamets/dist/ecs/component.js";
import { IStats } from "../interfaces/stats";
import { Vector3 } from "three";

export class Character extends Component implements IStats {
    speed: number = 200;

    direction: Vector3 = new Vector3();

    isAttacking = false;

    sessionId: string;

    health: number = 1;

    totalHealth: number = 1;

    strength: number = 1;

    dexterity: number = 1;

    constitution: number = 1;

    intelligence: number = 1;

    charisma: number = 1;

    wisdom: number = 1;
}