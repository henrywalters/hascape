import { RenderScene } from "hagamets/dist/common/scenes/renderScene.js";
import type { IGame } from "hagamets/dist/core/interfaces/game.js";
import { Character, ItemOnGround, ITEMS, NPCs, Player, PlayerJoined, Prefabs, PrefabTypes, ServerMessages } from "@hascape/common";
import { State } from "../state";
import ItemOnGroundPrefab from "@hascape/common/itemOnGround";
import { Smooth } from "hagamets/dist/common/components/smooth.js";
import { MeshPrimitive, TextMesh } from "hagamets/dist/common/components/mesh.js";
import { CameraZoom } from "hagamets/dist/common/components/camera.js";
import { InventoryEvents } from "../inventoryEvents";

export class LoginMenu extends RenderScene {
    constructor(game: IGame) {
        super(game);
    }

    onInitialize(): void {

    }

    onUpdate(dt: number) {

        this.game.client.flushMessages((msg) => {

            if (msg.message.type === ServerMessages.PlayerJoined) {
                const joined = msg.message as PlayerJoined;
                
                // If we join, that means we're logged into the server and therefore not editing
                State.isEditing = false;

                State.sessionId = joined.player.sessionId;

                const scene = this.game.getScene('runtime');

                this.game.activateScene('runtime');
                const entity = scene.addEntityFromPrefab(Prefabs[PrefabTypes.Player], joined.player.username);

                entity.transform.position = joined.player.position as any;

                entity.addComponent(CameraZoom);

                const character = entity.getComponent(Character)!;
                const player = entity.getComponent(Player)!;

                character.totalHealth = joined.player.totalHealth;
                character.health = joined.player.health;
                character.sessionId = joined.player.sessionId;
                player.username = joined.player.username;

                entity.getComponent(Smooth)!.targetPosition = entity.position;

                const text = entity.getComponentInChildren(TextMesh)!;
                text.text = player.username;
                text.notifyUpdate();
                
                entity.transform.position = joined.player.position as any;

                for (const other of joined.otherPlayers) {
                    const otherEntity = scene.addEntityFromPrefab(Prefabs[PrefabTypes.OtherPlayer], other.username)
                    const otherCharacter = otherEntity.getComponent(Character)!;
                    const otherPlayer = otherEntity.getComponent(Player)!;
                    otherCharacter.sessionId = other.sessionId;
                    otherPlayer.username = other.username;
                    otherCharacter.totalHealth = other.totalHealth;
                    otherCharacter.health = other.health;

                    otherEntity.transform.position = other.position as any;
                    otherEntity.getComponent(Smooth)!.targetPosition = otherEntity.position;

                    const otherText = otherEntity.getComponentInChildren(TextMesh)!;
                    otherText.text = otherPlayer.username;
                    otherText.notifyUpdate();
                }

                for (const npc of joined.npcs) {
                    const npcEntity = scene.addEntityFromPrefab(NPCs[npc.npcType].prefab);
                    npcEntity.transform.position = npc.position as any;
                    npcEntity.transform.position.z = 10;

                    const character = npcEntity.getComponent(Character)!;
                    character.sessionId = npc.sessionId;
                    character.health = npc.health;
                    character.totalHealth = npc.totalHealth;
                }

                for (const item of joined.items) {
                    console.log(item);
                    const itemEntity = scene.addEntityFromPrefab(ItemOnGroundPrefab);
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

                for (const item of joined.inventory) {
                    State.inventoryEvents.emit({
                        type: InventoryEvents.AddItemToInventory,
                        item,
                    })
                }

                this.game.activateScene('runtime');

                const size = this.game.getSize();
                this.game.resize(size.x, size.y);
            }
        })
    }
}