import { RenderScene } from "hagamets/dist/common/scenes/renderScene.js";
import { State } from "../state";
import { CELL_SIZE, MapData, OtherPlayerJoined, Character, PlayerJoined, PlayerLeft, PlayerMessaged, PlayerMove, PlayerMoved, ServerMessages, TILES, WORLD_SIZE, Player, MovementUpdate, CharacterAttacked, CharacterChangeHealth, CharacterDied, NPCJoined, NPCs, ItemsSpawned, ItemOnGround, ITEMS, ItemsDespawned, Prefabs, PrefabTypes, CELLS, CHUNK_SIZE, PickedUpItem, DroppedItem, InventoryItem } from "@hascape/common";
import { IEntity } from "hagamets/dist/ecs/interfaces/entity.js";
import { Smooth } from "hagamets/dist/common/components/smooth.js";
import { MeshPrimitive, TextMesh } from "hagamets/dist/common/components/mesh.js";
import { Behavior } from "hagamets/dist/common/components/behavior.js";
import { ChatBox } from "../scripts/chatBox";
import { ScriptRegistry } from "hagamets/dist/core/script.js";
import { Transform } from "hagamets/dist/common/components/transform.js";
import { Tilemap } from "hagamets/dist/common/components/tilemap.js";

import Map from "@hascape/common/map";
import { Color, Vector2, Vector3 } from "three";
import { Debug } from "hagamets/dist/core/debug.js";
import { BoxCollider2D } from "hagamets/dist/common/components/collider.js";
import { NetEvents } from "hagamets/dist/net/interfaces/net.js";
import { InventoryEvents } from "../inventoryEvents";

export class Runtime extends RenderScene {

    private textTimeout: any;

    onActivate() {

        State.grid.cells = new Vector2(CELLS, CELLS) as any;
        State.grid.size = new Vector2(CHUNK_SIZE, CHUNK_SIZE) as any;

        if (!State.isEditing) {
            let index = 0;
            for (const tile of TILES) {
                const tileEntity = this.addEntity();
                tileEntity.name = tile.type;
                tileEntity.addComponent(Transform);
                tileEntity.transform.position.z = 0;
                index++;
                const tiles = tileEntity.addComponent(Tilemap);
                tiles.grid.size.set(WORLD_SIZE, WORLD_SIZE);
                tiles.grid.cells.set(WORLD_SIZE / CELL_SIZE, WORLD_SIZE / CELL_SIZE);
                tiles.color = tile.color as any;

                for (const cell of (Map as MapData).tiles[tile.type]) {
                    tiles.gridMap.set(new Vector2(cell[0], cell[1]) as any);
                }

                tiles.notifyUpdate();
            }
        }

    }

    getPlayer(sessionId: string): IEntity | null {
        let out: IEntity | null = null;
        this.components.forEach(Character, (player) => {
            if (player.sessionId === sessionId) {
                out = player.entity;
                return;
            }
        });
        return out
    }

    onUpdate(dt: number) {

        const size = this.game.getSize();

        this.game.renderer.setViewport(0, size.y * 0.25, size.x * 0.75, size.y * 0.75);

        State.tick += 1;

        if (State.isEditing) {
            this.components.forEach(BoxCollider2D, (collider) => {
                Debug.DrawAABB(collider.getAABB(), new Color('red') as any);
            })
        }

        State.characterMap.clear();
        State.itemMap.clear();

        this.components.forEach(Character, (character) => {
            const cell = State.grid.getCellIndex(character.entity.position);
            if (!State.characterMap.has(cell)) {
                State.characterMap.set(cell, []);
            }
            State.characterMap.get(cell)!.push(character.entity);
        });

        this.components.forEach(ItemOnGround, (item) => {
            const cell = State.grid.getCellIndex(item.entity.position);
            if (!State.itemMap.has(cell)) {
                State.itemMap.set(cell, []);
            }
            State.itemMap.get(cell)!.push(item.entity);
        });

        this.game.client.flushMessages((msg) => {
            if (msg.message.type === ServerMessages.OtherPlayerJoined) {
                const joined = msg.message as OtherPlayerJoined;
                console.log(joined);
                    
                const entity = this.game.currentScene!.addEntityFromPrefab(Prefabs[PrefabTypes.OtherPlayer], joined.player.username);

                const character = entity.getComponent(Character)!;
                const player = entity.getComponent(Player)!;
                character.sessionId = joined.player.sessionId;
                character.health = joined.player.health;
                character.totalHealth = joined.player.totalHealth;
                player.username = joined.player.username;

                entity.transform.position = joined.player.position as any;

                const smooth = entity.getComponent(Smooth)!;
                smooth.targetPosition = entity.position;

                const text = entity.getComponentInChildren(TextMesh)!;
                text.text = joined.player.username;
                text.notifyUpdate();

                console.log(this.entities);
            }

            if (msg.message.type === ServerMessages.PlayerLeft) {
                const left = msg.message as PlayerLeft;

                console.log(left);
                
                const entity = this.getPlayer(left.sessionId);
                if (entity) {
                    console.log(`Entity ${entity.name} has left`);
                    this.removeEntity(entity.id);
                }
            }

            if (msg.message.type === ServerMessages.PlayerMoved) {
                const moved = msg.message as PlayerMoved;

                const entity = this.getPlayer(moved.sessionId);
                if (entity) {
                    console.log(moved);
                    const smooth = entity.getComponent(Smooth);
                    const player = entity.getComponent(Character)!;
                    player.entity.transform.position.z = 10;
                    moved.position.z = 10;
                    smooth!.speed = player.speed;
                    smooth!.targetPosition = moved.position as any;
                    player.direction = moved.direction;
                }
            }

            if (msg.message.type === ServerMessages.MovementUpdate) {
                const update = msg.message as MovementUpdate;

                for (const moved of update.movements) {
                    const entity = this.getPlayer(moved.sessionId);
                    if (entity) {
                        const smooth = entity.getComponent(Smooth);
                        const player = entity.getComponent(Character)!;
                        player.entity.transform.position.z = 10;
                        moved.position.z = 10;
                        smooth!.speed = player.speed;
                        smooth!.targetPosition = moved.position as any;
                        player.direction = moved.direction;
                    }
                }
            }

            if (msg.message.type === ServerMessages.PlayerMessaged) {
                const playerMessage = msg.message as PlayerMessaged;
                const player = this.getPlayer(playerMessage.sessionId);

                if (player) {
                    const display = this.getEntityByName("ChatText", player);
            
                    if (display) {
                        const displayText = display.getComponent(TextMesh);
                        if (displayText) {
                            displayText.text = playerMessage.message;
                            displayText.notifyUpdate();
                            if (this.textTimeout) {
                                clearTimeout(this.textTimeout);
                            }
                            this.textTimeout = setTimeout(() => {
                                displayText.text = "";
                                displayText.notifyUpdate();
                            }, 2000);
                        }
                    }
                }

                this.components.forEach(Behavior, (behavior) => {
                    if (behavior.scriptName === 'ChatBox') {
                        const script = ScriptRegistry.get(behavior.scriptName, behavior) as ChatBox;
                        if (script) {
                            script.addMessage(`${playerMessage.username}: ${playerMessage.message}`);
                        }
                    }
                })
            }

            if (msg.message.type === ServerMessages.CharacterAttacked) {
                const message = msg.message as CharacterAttacked;
                const player = this.getPlayer(message.sessionId);
                console.log(message);

                if (player) {
                    player.getComponent(Character)!.isAttacking = true;
                }
            }

            if (msg.message.type === ServerMessages.CharacterChangeHealth) {
                const message = msg.message as CharacterChangeHealth;
                const character = this.getPlayer(message.sessionId);
                if (character) {
                    character.getComponent(Character)!.health = message.health;
                }
            }

            if (msg.message.type === ServerMessages.CharacterDied) {
                const message = msg.message as CharacterDied;
                const player = this.getPlayer(message.sessionId);
                if (player) {
                    this.removeEntity(player.id);
                }
            }

            if (msg.message.type === ServerMessages.NPCJoined) {
                const message = msg.message as NPCJoined;

                const npcEntity = this.game.currentScene!.addEntityFromPrefab(NPCs[message.npc.npcType].prefab);
                npcEntity.transform.position = message.npc.position as any;
                npcEntity.transform.position.z = 10;

                const character = npcEntity.getComponent(Character)!;
                character.sessionId = message.npc.sessionId;
                character.health = message.npc.health;
                character.totalHealth = message.npc.totalHealth;
            }

            if (msg.message.type === ServerMessages.ItemsSpawned) {
                console.log(msg.message);
                const message = msg.message as ItemsSpawned;

                for (const item of message.items) {
                    const itemEntity = this.game.currentScene!.addEntityFromPrefab(Prefabs[PrefabTypes.ItemOnGround]);
                    const itemOnGround = itemEntity.getComponent(ItemOnGround)!;
                    itemOnGround.quantity = item.quantity;
                    itemOnGround.instanceId = item.instanceId;
                    itemOnGround.item = item.item;
                    itemEntity.transform.position = item.position as any;
                    itemEntity.transform.position.z = 9;
                    const mesh = itemEntity.getComponent(MeshPrimitive)!;
                    mesh.texture = ITEMS[item.item].texture;
                    mesh.notifyUpdate();

                    State.items.set(item.instanceId, itemEntity);
                }
            }

            if (msg.message.type === ServerMessages.ItemsDespawned) {
                const message = msg.message as ItemsDespawned;

                console.log(message);

                for (const item of message.instanceIds) {
                    const entity = State.items.get(item);
                    if (entity) {
                        this.removeEntity(entity.id);
                    }
                }
            }

            if (msg.message.type === ServerMessages.PickedUpItem) {
                const message = msg.message as PickedUpItem;
                State.inventoryEvents.emit({
                    type: InventoryEvents.AddItemToInventory,
                    item: message.item,
                });
            }

            if (msg.message.type === ServerMessages.DroppedItem) {
                const message = msg.message as DroppedItem;
                const item = new InventoryItem();
                item.instanceId = message.instanceId;
                State.inventoryEvents.emit({
                    type: InventoryEvents.RemoveItemFromInventory,
                    item,
                })
            }
        });
    }
}