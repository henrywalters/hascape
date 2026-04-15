import { ActionReceived, Actions, Character, CharacterAction, ClientMessages, DroppedItem, ITEM_DROP_DESPAWN_RATE, ItemInstance, ItemOnGround, ItemPickup, PickedUpItem, ServerMessages } from "@hascape/common";
import { BaseSystem } from "./base";
import { Vector2 } from "three";
import { State } from "../state";
import { AddItemToInventory, RemoveItemFromInventory } from "../messages/inventory";
import { Runtime } from "../runtime";

export class ActionSystem extends BaseSystem {

    onInit(): void {
        this.scene.game.server.installFilter([ClientMessages.CharacterAction], (msg) => {
            this.handleAction(msg.message as CharacterAction);
        })
    }

    private handleAction(msg: CharacterAction) {

        const runtime = this.scene as Runtime;

        let success = false;

        const player = State.playerSessions.get(msg.sessionId);
        if (!player) return;
        const socket = State.sessionSockets.get(msg.sessionId)!;
        const character = player.getComponent(Character);
        if (!character) return;

        if (msg.action === Actions.MoveHere) {
            character.onReachDestination = () => {};
            success = this.setPath(character, msg.position as any);
        } else if (msg.action === Actions.PickupItem) {
            const item = State.itemInstances.get(msg.subjectId);
            if (item) {
                if (this.setPath(character, State.grid.getCellIndex(item.position) as any)) {
                    success = true;
                    character.onReachDestination = () => {
                        if (State.itemInstances.has(msg.subjectId)) {
                            const entity = State.itemInstances.get(msg.subjectId);
                            if (!entity) return;

                            // The inventory is already full so reject it
                            const inventory = State.getInventory(msg.sessionId);

                            if (!inventory.canAdd()) {
                                return;
                            }

                            const onGround = entity.getComponent(ItemOnGround)!

                            const instance = new ItemInstance(onGround.item, onGround.quantity);

                            const pickedUpItem = inventory.addItem(instance);

                            const addToInventory = new AddItemToInventory();
                            addToInventory.item = pickedUpItem;
                            addToInventory.sessionId = msg.sessionId;

                            runtime.pubsub.send(addToInventory);

                            const map = State.getMap(character.map);

                            const itemList = map.items.get(State.grid.getCellIndex(entity.position))!;
                            const index = itemList.findIndex((item) => {
                                const pickup = item.getComponent(ItemOnGround);
                                return pickup && pickup.instanceId === msg.subjectId;
                            });
                            itemList.splice(index, 1);
                            this.scene.removeEntity(entity.id);
                            State.itemInstances.delete(msg.subjectId);
                            this.despawnItems(character.map, [msg.subjectId]);

                            const pickedup = new PickedUpItem();
                            pickedup.item = pickedUpItem;

                            State.sessionSockets.get(msg.sessionId)!.send(this.scene.game.server.serverMessages.write(pickedup));
                        }
                    }
                }
            }
        } else if (msg.action === Actions.DropItem) {
            const item = State.getInventory(msg.sessionId).getItem(msg.subjectId);
            if (item && State.removeInventoryItem(msg.sessionId, msg.subjectId)) {
                const removeItem = new RemoveItemFromInventory();
                removeItem.instanceId = msg.subjectId;
                removeItem.sessionId = msg.sessionId;
                runtime.pubsub.send(removeItem);

                const droppedItem = new DroppedItem();
                droppedItem.instanceId = msg.subjectId;
                
                State.sessionSockets.get(msg.sessionId)!.send(this.scene.game.server.serverMessages.write(droppedItem));

                const pickup = new ItemInstance(item.item, item.quantity);

                this.spawnItem(character.map, pickup, character.entity.position as any, ITEM_DROP_DESPAWN_RATE);
                success = true;
            }
        }

        const received = new ActionReceived();
        received.success = success;
        socket.send(this.scene.game.server.serverMessages.write(received));
    }

    private setPath(character: Character, dest: Vector2): boolean {
        const pos = State.grid.getCellIndex(character.entity.position);
        const map = State.getMap(character.map);
        const path = map.pathfinding.getBestLegalPath(pos as any, dest as any);
        if (path) {
            path[0] = character.entity.position.clone() as any;
            character.path = path;
            character.pathIndex = 0;
            return true;
        } else {
            character.path = [];
            return false;
        }
    }
}