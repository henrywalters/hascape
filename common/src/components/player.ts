import { Param, Types } from "hagamets/dist/core/reflection.js";
import { Component } from "hagamets/dist/ecs/component.js";
import { Vector3 } from "three";
import { IStats } from "../interfaces/stats";

// Question: Should shared components not be editable to prevent inconsistencies between server and client? 

export class Player extends Component implements IStats {
    speed: number = 100;

    direction: Vector3 = new Vector3();

    username: string;

    sessionId: string;

    health: number = 1;

    strength: number = 1;

    dexterity: number = 1;

    constitution: number = 1;

    intelligence: number = 1;

    charisma: number = 1;

    wisdom: number = 1;
}