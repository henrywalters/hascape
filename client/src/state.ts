import { IEntity } from "hagamets/dist/ecs/interfaces/entity.js";

class _State {
    sessionId: string;
    tick: number = 0;
    players: Map<string, IEntity> = new Map();
    items: Map<string, IEntity> = new Map();
    isTyping: boolean = false;
    isEditing: boolean = true;
}

export const State = new _State();