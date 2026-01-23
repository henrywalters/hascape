import { RenderScene } from "hagamets/dist/common/scenes/renderScene.js";
import { State } from "../state";
import { OtherPlayerJoined, Player, PlayerJoined, PlayerLeft, PlayerMove, PlayerMoved, ServerMessages } from "@hascape/common";
import OtherPrefab from "./../assets/prefabs/otherPlayer.json";
import { IEntity } from "hagamets/dist/ecs/interfaces/entity.js";
import { Smooth } from "hagamets/dist/common/components/smooth.js";
import { TextMesh } from "hagamets/dist/common/components/mesh.js";

export class Runtime extends RenderScene {

    getPlayer(sessionId: string): IEntity | null {
        let out: IEntity | null = null;
        this.components.forEach(Player, (player) => {
            if (player.sessionId === sessionId) {
                out = player.entity;
                return;
            }
        });
        return out
    }

    onUpdate(dt: number) {
        State.tick += 1;

        this.game.client.flushMessages((msg) => {
            if (msg.message.type === ServerMessages.OtherPlayerJoined) {
                const joined = msg.message as OtherPlayerJoined;
                console.log(joined);
                    
                const entity = this.game.currentScene!.addEntityFromPrefab(OtherPrefab, joined.player.username);

                const player = entity.getComponent(Player)!;
                player.sessionId = joined.player.sessionId;
                player.username = joined.player.username;

                entity.transform.position = joined.player.position as any;

                entity.getComponent(Smooth)!.targetPosition = entity.position;

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
                    const smooth = entity.getComponent(Smooth);
                    smooth!.speed = entity.getComponent(Player)!.speed;
                    smooth!.targetPosition = moved.position as any;
                }
            }
        })
    }
}