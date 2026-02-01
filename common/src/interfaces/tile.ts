import { Boolean, Param } from "hagamets/dist/core/reflection.js";
import { Color } from "three";

export enum TileTypes {
    Grass = 'Grass',
    Water = 'Water',
    Tile = 'Tile',
    Wall = 'Wall',
}

export interface ITile {
    type: TileTypes;
    isWall: boolean;
    color?: Color;
    texture?: string;
}