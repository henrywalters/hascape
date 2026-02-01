import { RenderScene } from "hagamets/dist/common/scenes/renderScene.js";
import { State } from "../state";
import { OtherPlayerJoined, Player, PlayerJoined, PlayerLeft, PlayerMessaged, PlayerMove, PlayerMoved, ServerMessages } from "@hascape/common";
import OtherPrefab from "./../assets/prefabs/otherPlayer.json";
import { IEntity } from "hagamets/dist/ecs/interfaces/entity.js";
import { Smooth } from "hagamets/dist/common/components/smooth.js";
import { TextMesh } from "hagamets/dist/common/components/mesh.js";
import { Behavior } from "hagamets/dist/common/components/behavior.js";
import { ChatBox } from "../scripts/chatBox";
import { ScriptRegistry } from "hagamets/dist/core/script.js";

export class Runtime extends RenderScene {

    private textTimeout: any;

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

                    const player = entity.getComponent(Player)!;
                    player.direction = moved.direction;
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
        })
    }
}