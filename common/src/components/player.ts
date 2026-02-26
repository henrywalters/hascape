import { Param, Types } from "hagamets/dist/core/reflection.js";
import { Component } from "hagamets/dist/ecs/component.js";
import { Vector3 } from "three";
import { IStats } from "../interfaces/stats";

// Question: Should shared components not be editable to prevent inconsistencies between server and client? 

export class Player extends Component {
    username: string;
}