import { System } from "hagamets/dist/ecs/system.js";
import { Runtime } from "../runtime";
import { Vector2, Vector3 } from "three";
import { Transform } from "hagamets/dist/common/components/transform.js";
import { ItemInstance, ItemOnGround, ItemPickup, ITEMS } from "@hascape/common";
import { Random } from "hcore/dist/random";
import { State } from "../state";
import { IScene } from "hagamets/dist/core/interfaces/scene.js";

export interface BulkItemSpawn {
    item: ItemInstance;
    position: Vector3;
    despawnRate?: number;
}

export class BaseSystem extends System {
    private _runtime: Runtime;

    protected get runtime() { return this._runtime; }

    constructor(runtime: IScene) {
        super(runtime);
        this._runtime = runtime as Runtime;
        this.onInit();
    }

    protected cellPos(cell: Vector2): Vector3 {
        return State.grid.getCellPos(cell as any) as any;
    }

    protected cellIndex(pos: Vector3): Vector2 {
        return State.grid.getCellIndex(pos as any) as any;
    }

    private createItemEntity(mapName: string, item: ItemInstance, pos: Vector3, despawnRate?: number) {
        const entity = this.runtime.addEntity();
        entity.addComponent(Transform);
        const itemOnGround = entity.addComponent(ItemOnGround)
        itemOnGround.quantity = item.quantity;
        itemOnGround.instanceId = item.instanceId;
        itemOnGround.item = item.item;
        itemOnGround.map = mapName;
        itemOnGround.despawnRate = despawnRate !== void 0 ? despawnRate : ITEMS[item.item].despawnRate;
        entity.transform.position = pos as any;

        const pickup = new ItemPickup();
        pickup.instanceId = itemOnGround.instanceId;
        pickup.item = itemOnGround.item;
        pickup.position = entity.position as any;
        pickup.map = itemOnGround.map;

        State.itemInstances.set(itemOnGround.instanceId, entity);

        const cell = State.grid.getCellIndex(pos as any);

        const map = State.getMap(mapName);
        
        if (!map.items.has(cell)) {
            map.items.set(cell, []);
        }

        map.items.get(cell)!.push(entity);

        return pickup;
    }

    protected spawnItem(mapName: string, item: ItemInstance, pos: Vector3, despawnRate?: number) {
        this.runtime.spawnItems([this.createItemEntity(mapName, item, pos, despawnRate)]);
    }

    protected spawnItems(mapName: string, items: BulkItemSpawn[]) {
        const pickups = [];

        for (const item of items) {
            pickups.push(this.createItemEntity(mapName, item.item, item.position, item.despawnRate));
        }

        this.runtime.spawnItems(pickups);
    }

    protected despawnItems(mapName: string, itemIds: string[]) {
        const map = State.getMap(mapName);
        for (const id of itemIds) {
            const entity = State.itemInstances.get(id);
            if (!entity) continue;
            State.itemInstances.delete(id);
            const itemList = map.items.get(State.grid.getCellIndex(entity.position))!;
            const index = itemList.findIndex((item) => item.getComponent(ItemOnGround)!.instanceId === id);
            itemList.splice(index, 1);
            this.scene.removeEntity(entity.id);
        }

        this.runtime.despawnItems(itemIds);
    }
}