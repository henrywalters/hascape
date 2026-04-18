import { RenderScene } from "hagamets/dist/common/scenes/renderScene.js";
import type { IGame } from "hagamets/dist/core/interfaces/game.js";
import { Character, ItemOnGround, ITEMS, NPCs, Player, PlayerJoined, Prefabs, PrefabTypes, ServerMessages } from "@hascape/common";
import { State } from "../state";
import ItemOnGroundPrefab from "@hascape/common/itemOnGround";
import { Smooth } from "hagamets/dist/common/components/smooth.js";
import { MeshPrimitive, TextMesh } from "hagamets/dist/common/components/mesh.js";
import { CameraZoom } from "hagamets/dist/common/components/camera.js";
import { InventoryEvents } from "../inventoryEvents";
import { Runtime } from "./runtime";

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

                console.log(joined);
                
                // If we join, that means we're logged into the server and therefore not editing
                State.isEditing = false;

                State.sessionId = joined.player.sessionId;

                const scene = this.game.getScene('runtime') as Runtime;

                const entity = scene.addEntityFromPrefab(Prefabs[PrefabTypes.Player], joined.player.username);

                entity.transform.position = joined.player.position as any;

                const character = entity.getComponent(Character)!;
                const player = entity.getComponent(Player)!;

                character.totalHealth = joined.player.totalHealth;
                character.health = joined.player.health;
                character.sessionId = joined.player.sessionId;
                character.map = joined.player.map;

                State.player = character;

                player.username = joined.player.username;

                entity.getComponent(Smooth)!.targetPosition = entity.position;

                const text = entity.getComponentInChildren(TextMesh)!;
                text.text = player.username;
                text.notifyUpdate();
                
                entity.transform.position = joined.player.position as any;

                scene.spawnEntities(joined);

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