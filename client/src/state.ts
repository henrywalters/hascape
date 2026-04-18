import EventListenerPool from "hagamets/dist/core/events.js";
import { IEntity } from "hagamets/dist/ecs/interfaces/entity.js";
import { InteractEvent } from "./interactionEvents";
import { GridMap } from "hagamets/dist/utils/gridMap.js";
import { Grid } from "hagamets/dist/utils/grid.js";
import { InventoryEvent } from "./inventoryEvents";
import { Character, IMap, ITile } from "@hascape/common";
import { Vector2 } from "three";

class MapData {
    players: Map<string, IEntity> = new Map();
    itemMap: GridMap<IEntity[]> = new GridMap();
    characterMap: GridMap<IEntity[]> = new GridMap();
    map: IMap;

    constructor(map: IMap) {
        this.map = map;
        this.update(map);
    }

    update(map: IMap) {
        this.map = map;
        console.log(map);
    }

    addItem(pos: Vector2, item: IEntity) {
        if (!this.itemMap.has(pos as any)) {
            this.itemMap.set(pos as any, []);
        }
        this.itemMap.get(pos as any)!.push(item);
    }
}

class _State {
    sessionId: string;
    player: Character;
    tick: number = 0;
    grid: Grid = new Grid();
    isTyping: boolean = false;
    isEditing: boolean = true;
    tiles: ITile[] = [];
    maps: Map<string, MapData> = new Map();
    items: Map<string, IEntity> = new Map();

    interactionEvents: EventListenerPool<InteractEvent> = new EventListenerPool();
    inventoryEvents: EventListenerPool<InventoryEvent> = new EventListenerPool();

    updateMap(map: IMap) {
        if (!this.maps.has(map.name)) {
            this.maps.set(map.name, new MapData(map));
        } else {
            this.maps.get(map.name)!.update(map);
        }
    }

    updateMaps(maps: IMap[]) {
        for (const map of maps) {
            this.updateMap(map);
        }
    }

    getMap(name: string) {
        if (!this.maps.has(name)) {
            throw new Error(`Map ${name} does not exist`);
        }
        return this.maps.get(name)!;
    }

    addItem(map: string, instanceId: string, entity: IEntity) {
        const cell = this.grid.getCellIndex(entity.position);
        this.items.set(instanceId, entity);
        console.log(map, instanceId, entity);
        this.getMap(map).addItem(cell as any, entity);
    }
}

export const State = new _State();