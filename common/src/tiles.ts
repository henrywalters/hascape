import { Color } from "three";
import { ITile, TileTypes } from "./interfaces/tile";

export const TILES: ITile[] = [
    {
        type: TileTypes.Grass,
        isWall: false,
        color: new Color('green'),
    },
    {
        type: TileTypes.Wall,
        isWall: true,
        color: new Color('gray'),
    },
    {
        type: TileTypes.Water,
        isWall: true,
        color: new Color('blue'),
    },
    {
        type: TileTypes.Tile,
        isWall: false,
        color: new Color('silver'),
    }
]