import { Class, Int, String } from "hagamets/dist/core/reflection.js";
import { Component } from "hagamets/dist/ecs/component.js";
import { ItemInstance } from "../interfaces/item";

export class ItemOnGround extends Component {
    @String()
    item: string;

    @String()
    instanceId: string;

    @Int()
    quantity: number = 1;

    spawnedFor: number = 0;

    despawnRate: number = 0;
}