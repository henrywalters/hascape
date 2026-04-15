import { IStats } from "./stats";

export interface IPlayer extends IStats {
    username: string;
    id: string;
    x: number;
    y: number;
    map: string;
}