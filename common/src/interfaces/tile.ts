import { IAsset } from "./asset";

export interface ITile {
    id: string;
    name: string;
    isWall: boolean;
    color?: string;
    texture?: IAsset;
}