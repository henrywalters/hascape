import { Component } from "hagamets/dist/ecs/component.js";

export class NPC extends Component {
    sessionId: string;

    health: number;

    type: string;
}