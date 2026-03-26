import EventListenerPool from "hagamets/dist/core/events.js";
import { IEntity } from "hagamets/dist/ecs/interfaces/entity.js";
import { InteractEvent } from "./interactionEvents";
import { GridMap } from "hagamets/dist/utils/gridMap.js";
import { Grid } from "hagamets/dist/utils/grid.js";
import { InventoryEvent } from "./inventoryEvents";

class _State {
    sessionId: string;
    tick: number = 0;
    grid: Grid = new Grid();
    players: Map<string, IEntity> = new Map();
    items: Map<string, IEntity> = new Map();
    itemMap: GridMap<IEntity[]> = new GridMap();
    characterMap: GridMap<IEntity[]> = new GridMap();
    isTyping: boolean = false;
    isEditing: boolean = true;

    interactionEvents: EventListenerPool<InteractEvent> = new EventListenerPool();
    inventoryEvents: EventListenerPool<InventoryEvent> = new EventListenerPool();
}

export const State = new _State();