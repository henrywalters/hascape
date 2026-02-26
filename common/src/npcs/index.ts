import { Float, Int, String } from "hagamets/dist/core/reflection.js";
import { INPC, INPCSpawner } from "../interfaces/npc";
import { Orc } from "./orc";
import { Component } from "hagamets/dist/ecs/component.js";
import { Wizard } from "./wizard";

export class NPCSpawner extends Component implements INPCSpawner {
    @String()
    npcName: string = "";

    @Int()
    maxSpawn: number = 1;

    @Float()
    minRadius: number = 0;

    @Float()
    maxRadius: number = 0;

    @Float()
    minDelay: number = 0;

    @Float()
    maxDelay: number = 0;
}

export const NPCs: {[key: string]: INPC} = {
    orc: Orc,
    wizard: Wizard,
}