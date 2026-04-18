import { Entity } from "hagamets/dist/core/reflection.js";
import { Script } from "hagamets/dist/core/script.js";
import { State } from "../state";
import { IEntity } from "hagamets/dist/ecs/interfaces/entity.js";
import { Container } from "hagamets/dist/common/components/ui/container.js";
import { Transform } from "hagamets/dist/common/components/transform.js";
import { Vector2, Vector3 } from "three";
import { InventoryEvents } from "../inventoryEvents";
import { Actions, INVENTORY_SLOTS, InventoryItem, ItemInstance, ITEMS, Prefabs, PrefabTypes, SubjectAction } from "@hascape/common";
import { Image } from "hagamets/dist/common/components/ui/image.js";
import { Axes, Buttons } from "hagamets/dist/core/interfaces/input.js";
import { AABB } from "hagamets/dist/utils/math.js";
import { IInteractOption, OpenMenu, PreviewItem } from "../interactionEvents";
import { Debug } from "hagamets/dist/core/debug.js";

interface InventorySlot {
    item?: InventoryItem;
    entity: IEntity;
}

export class Inventory extends Script {
    @Entity()
    items: number;

    slots: InventorySlot[] = [];

    onInit() {

        State.inventoryEvents.listen((e) => {
            this.initializeSlots();

            if (e.type === InventoryEvents.AddItemToInventory) {
                const item = ITEMS[e.item.item];
                if (item.stackable) {

                } else {
                    const entity = this.scene.addEntityFromPrefab(Prefabs[PrefabTypes.InventoryItem]);
                    this.scene.changeEntityOwner(entity.id, this.slots[e.item.position].entity.id);
                    entity.getComponent(Image)!.texture = item.texture;
                }

                this.slots[e.item.position].item = e.item;
            } else if (e.type === InventoryEvents.RemoveItemFromInventory) {
                for (let slot of this.slots) {
                    if (slot.item && slot.item.instanceId === e.item.instanceId) {
                        slot.entity.removeChildren();
                        slot.item = void 0;
                    }
                }
            }
        })
    }

    onUpdate(dt: number) {
        let mousePos = this.game.input.getAxis(Axes.MousePosition);
        let origMousePos = mousePos.clone();
        const size = this.game.getSize();
        mousePos.setY(size.y - mousePos.y);
        const pos = mousePos.clone().sub(size.clone().multiplyScalar(0.5));

        const options: IInteractOption[] = [];
        
        for (const slot of this.slots) {

            if (!slot.item) continue;

            const container = slot.entity.getComponent(Container)!;
            const entityPos = slot.entity.position;
            const aabb = new AABB(
                new Vector2(entityPos.x - container.innerSize.x / 2, entityPos.y - container.innerSize.y / 2) as any, 
                new Vector2(entityPos.x + container.innerSize.x / 2, entityPos.y + container.innerSize.y / 2) as any
            );

            if (aabb.contains(pos)) {

                const subject = {
                        label: ITEMS[slot.item.item].name,
                        instanceId: slot.item.instanceId,
                    };
                options.push(
                    {
                        action: Actions.UseItem,
                        subject,
                    },
                    {
                        action: Actions.DropItem,
                        subject,
                    }
                )
            }
        }

        if (options.length > 0) {
            State.interactionEvents.emit(new PreviewItem(options));

            if (this.game.input.getButtonPressed(Buttons.MouseRight)) {
                State.interactionEvents.emit(new OpenMenu(new Vector3(origMousePos.x, origMousePos.y, 0), options));
            }
        }
    }

    initializeSlots() {

        if (this.slots.length > 0) return;

        const items = this.scene.getEntity(this.items);

        if (!items) {
            throw new Error("Inventory Items not set");
        }

        for (let i = 0; i < INVENTORY_SLOTS; i++) {
            const item = this.scene.addEntity();
            item.addComponent(Transform);
            const container = item.addComponent(Container);
            container.opacity = 0.0;
            container.margin = new Vector2(5, 5) as any;
            container.notifyUpdate();
            this.scene.changeEntityOwner(item.id, items.id);
            this.slots.push({
                entity: item,
            });
        }
    }
}