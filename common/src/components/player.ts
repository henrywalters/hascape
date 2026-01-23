import { Param, Types } from "hagamets/dist/core/reflection.js";
import { Component } from "hagamets/dist/ecs/component.js";
import { Vector3 } from "three";

// Question: Should shared components not be editable to prevent inconsistencies between server and client? 

export class Player extends Component {
    speed: number = 100;

    direction: Vector3 = new Vector3();

    username: string;

    sessionId: string;
}