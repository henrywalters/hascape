import { RenderScene } from "hagamets/dist/common/scenes/renderScene.js";
import { State } from "../state";
import { CELL_SIZE, OtherPlayerJoined, Character, PlayerJoined, CommandResponse, PlayerLeft, PlayerMessaged, PlayerMove, PlayerMoved, ServerMessages, WORLD_SIZE, Player, MovementUpdate, CharacterAttacked, CharacterChangeHealth, CharacterDied, NPCJoined, NPCs, ItemsSpawned, ItemOnGround, ITEMS, ItemsDespawned, Prefabs, PrefabTypes, CELLS, CHUNK_SIZE, PickedUpItem, DroppedItem, InventoryItem, IMap, PlayerTeleported, PlayerInstance, IPlayerMessage, OtherPlayerTeleported } from "@hascape/common";
import { IEntity } from "hagamets/dist/ecs/interfaces/entity.js";
import { Smooth } from "hagamets/dist/common/components/smooth.js";
import { MeshPrimitive, TextMesh } from "hagamets/dist/common/components/mesh.js";
import { Behavior } from "hagamets/dist/common/components/behavior.js";
import { ChatBox } from "../scripts/chatBox";
import { ScriptRegistry } from "hagamets/dist/core/script.js";

import { Color, Vector2, Vector3 } from "three";
import { Debug } from "hagamets/dist/core/debug.js";
import { BoxCollider2D } from "hagamets/dist/common/components/collider.js";
import { NetEvents } from "hagamets/dist/net/interfaces/net.js";
import { InventoryEvents } from "../inventoryEvents";
import { Transform } from "hagamets/dist/common/components/transform.js";
import { Tilemap } from "hagamets/dist/common/components/tilemap.js";

export class Runtime extends RenderScene {

    private textTimeout: any;

    private tilemaps: Map<string, Tilemap> = new Map();

    onActivate() {

        State.grid.cells = new Vector2(CELLS, CELLS) as any;
        State.grid.size = new Vector2(CHUNK_SIZE, CHUNK_SIZE) as any;

        if (!State.isEditing) {
            this.loadTiles();
            const player = this.getPlayer(State.sessionId)!;
            const character = player.getComponent(Character)!;
            this.setMap(State.getMap(character.map).map);
        }
    }

    loadTiles() {
        let index = 0;
        for (const tile of State.tiles) {
            const tileEntity = this.addEntity();
            tileEntity.name = tile.name;
            tileEntity.addComponent(Transform);
            tileEntity.transform.position.z = 0;
            index++;
            const tiles = tileEntity.addComponent(Tilemap);
            tiles.grid.size.set(WORLD_SIZE, WORLD_SIZE);
            tiles.grid.cells.set(WORLD_SIZE / CELL_SIZE, WORLD_SIZE / CELL_SIZE);
            if (tile.texture) {
                tiles.texture = tile.texture.name;
            } else if (tile.color) {
                tiles.color = new Color(tile.color) as any;
            }
            this.tilemaps.set(tile.name, tiles);
        }
    }

    setMap(map: IMap) {
        let index = 0;
        for (const tile of map.tiles) {
            this.tilemaps.get(tile.tileType)!.gridMap.clear();
        }
        for (const tile of map.tiles) {
            this.tilemaps.get(tile.tileType)!.gridMap.set(new Vector2(tile.x, tile.y) as any);
        }
        for (const [name, tilemap] of this.tilemaps) {
            tilemap.notifyUpdate();
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

    spawnPlayer(instance: PlayerInstance) {
        const entity = this.game.currentScene!.addEntityFromPrefab(Prefabs[PrefabTypes.OtherPlayer], instance.username);

        const character = entity.getComponent(Character)!;
        const player = entity.getComponent(Player)!;
        character.sessionId = instance.sessionId;
        character.health = instance.health;
        character.totalHealth = instance.totalHealth;
        character.map = instance.map;
        player.username = instance.username;

        entity.transform.position = instance.position as any;

        const smooth = entity.getComponent(Smooth)!;
        smooth.targetPosition = entity.position;

        const text = entity.getComponentInChildren(TextMesh)!;
        text.text = instance.username;
        text.notifyUpdate();

        return entity;
    }

    clearEntities() {
        this.components.forEach(Character, (character) => {
            if (State.player.sessionId === character.sessionId) return;
            this.removeEntity(character.entity);
        });

        this.components.forEach(ItemOnGround, (item) => {
            this.removeEntity(item.entity);
        })
    }

    spawnEntities(message: IPlayerMessage) {
        for (const other of message.otherPlayers) {
            if (other.map !== message.player.map) continue;
            const otherEntity = this.addEntityFromPrefab(Prefabs[PrefabTypes.OtherPlayer], other.username)
            const otherCharacter = otherEntity.getComponent(Character)!;
            const otherPlayer = otherEntity.getComponent(Player)!;
            otherCharacter.sessionId = other.sessionId;
            otherPlayer.username = other.username;
            otherCharacter.totalHealth = other.totalHealth;
            otherCharacter.health = other.health;
            otherCharacter.map = other.map;

            otherEntity.transform.position = other.position as any;
            otherEntity.getComponent(Smooth)!.targetPosition = otherEntity.position;

            const otherText = otherEntity.getComponentInChildren(TextMesh)!;
            otherText.text = otherPlayer.username;
            otherText.notifyUpdate();
        }

        for (const npc of message.npcs) {
            if (npc.map !== message.player.map) continue;
            const npcEntity = this.addEntityFromPrefab(NPCs[npc.npcType].prefab);
            npcEntity.transform.position = npc.position as any;
            npcEntity.transform.position.z = 10;

            const character = npcEntity.getComponent(Character)!;
            character.sessionId = npc.sessionId;
            character.health = npc.health;
            character.totalHealth = npc.totalHealth;
            character.map = npc.map;
        }

        for (const item of message.items) {
            if (item.map !== message.player.map) continue;
            const itemEntity = this.addEntityFromPrefab(Prefabs[PrefabTypes.ItemOnGround]);
            const itemOnGround = itemEntity.getComponent(ItemOnGround)!;
            itemOnGround.quantity = item.quantity;
            itemOnGround.instanceId = item.instanceId;
            itemOnGround.item = item.item;
            itemOnGround.map = item.map;
            itemEntity.transform.position = item.position as any;
            itemEntity.transform.position.z = 9;
            const mesh = itemEntity.getComponent(MeshPrimitive)!;
            mesh.texture = ITEMS[item.item].texture;
            mesh.notifyUpdate();

            State.addItem(item.map, item.instanceId, itemEntity);

            //State.items.set(item.instanceId, itemEntity);
        }
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

        const thisPlayer = this.getPlayer(State.sessionId)!;
        const thisCharacter = thisPlayer.getComponent(Character)!;

        const map = State.getMap(thisCharacter.map);

        map.characterMap.clear();
        map.itemMap.clear();

        this.components.forEach(Character, (character) => {
            const map = State.getMap(character.map);
            const cell = State.grid.getCellIndex(character.entity.position);
            if (!map.characterMap.has(cell)) {
                map.characterMap.set(cell, []);
            }
            map.characterMap.get(cell)!.push(character.entity);
        });

        this.components.forEach(ItemOnGround, (item) => {
            const map = State.getMap(item.map);
            const cell = State.grid.getCellIndex(item.entity.position);
            if (!map.itemMap.has(cell)) {
                map.itemMap.set(cell, []);
            }
            map.itemMap.get(cell)!.push(item.entity);
        });

        this.game.client.flushMessages((msg) => {

            if (msg.message.type === ServerMessages.ActionReceived) {
                
            }

            if (msg.message.type === ServerMessages.OtherPlayerJoined) {
                const joined = msg.message as OtherPlayerJoined;

                if (joined.player.map !== thisCharacter.map) return;
                    
                this.spawnPlayer(joined.player);
            }

            if (msg.message.type === ServerMessages.PlayerLeft) {
                const left = msg.message as PlayerLeft;

                const entity = this.getPlayer(left.sessionId);
                if (entity) {
                    this.removeEntity(entity.id);
                }
            }

            if (msg.message.type === ServerMessages.PlayerMoved) {
                const moved = msg.message as PlayerMoved;

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

                if (message.npc.map !== thisCharacter.map) return;

                const npcEntity = this.game.currentScene!.addEntityFromPrefab(NPCs[message.npc.npcType].prefab);
                npcEntity.transform.position = message.npc.position as any;
                npcEntity.transform.position.z = 10;

                const character = npcEntity.getComponent(Character)!;
                character.sessionId = message.npc.sessionId;
                character.health = message.npc.health;
                character.totalHealth = message.npc.totalHealth;
                character.map = message.npc.map;
            }

            if (msg.message.type === ServerMessages.ItemsSpawned) {

                const message = msg.message as ItemsSpawned;

                for (const item of message.items) {

                    if (item.map !== thisCharacter.map) continue;

                    const itemEntity = this.game.currentScene!.addEntityFromPrefab(Prefabs[PrefabTypes.ItemOnGround]);
                    const itemOnGround = itemEntity.getComponent(ItemOnGround)!;
                    itemOnGround.quantity = item.quantity;
                    itemOnGround.instanceId = item.instanceId;
                    itemOnGround.item = item.item;
                    itemOnGround.map = item.map;
                    itemEntity.transform.position = item.position as any;
                    itemEntity.transform.position.z = 9;
                    const mesh = itemEntity.getComponent(MeshPrimitive)!;
                    mesh.texture = ITEMS[item.item].texture;
                    mesh.notifyUpdate();

                    State.addItem(item.map, item.instanceId, itemEntity);

                    //State.items.set(item.instanceId, itemEntity);
                }
            }

            if (msg.message.type === ServerMessages.ItemsDespawned) {
                const message = msg.message as ItemsDespawned;

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

            if (msg.message.type === ServerMessages.PlayerTeleported) {
                const moved = msg.message as PlayerTeleported;

                const entity = this.getPlayer(moved.player.sessionId);
                if (entity) {
                    const smooth = entity.getComponent(Smooth);
                    const player = entity.getComponent(Character)!;
                    player.entity.transform.position.x = moved.player.position.x;
                    player.entity.transform.position.y = moved.player.position.y;
                    player.entity.transform.position.z = 10;
                    player.map = moved.player.map;
                    moved.player.position.z = 10;
                    smooth!.speed = player.speed;
                    smooth!.targetPosition = moved.player.position as any;
                    player.direction = new Vector3(0, 0, 0);

                    this.clearEntities();
                    this.setMap(State.getMap(player.map).map);
                    this.spawnEntities(moved);
                }
            }

            if (msg.message.type === ServerMessages.OtherPlayerTeleported) {
                const moved = msg.message as OtherPlayerTeleported;

                let entity = this.getPlayer(moved.player.sessionId);

                if (moved.player.map !== thisCharacter.map) {
                    if (!entity) return;
                    this.removeEntity(entity);
                } else {
                    if (!entity) {
                        entity = this.spawnPlayer(moved.player);
                    }
                    const smooth = entity.getComponent(Smooth);
                    const player = entity.getComponent(Character)!;
                    player.entity.transform.position.x = moved.player.position.x;
                    player.entity.transform.position.y = moved.player.position.y;
                    player.entity.transform.position.z = 10;
                    player.map = moved.player.map;
                    moved.player.position.z = 10;
                    smooth!.speed = player.speed;
                    smooth!.targetPosition = moved.player.position as any;
                    player.direction = new Vector3(0, 0, 0);
                }
            }
        });
    }
}