import { IEntity } from "hagamets/dist/ecs/interfaces/entity.js";

class _State {
    sessionId: string;
    tick: number = 0;
    players: Map<string, IEntity> = new Map();
}

export const State = new _State();