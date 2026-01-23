import { RenderScene } from "hagamets/dist/common/scenes/renderScene.js";
import type { IGame } from "hagamets/dist/core/interfaces/game.js";
import { Player, PlayerJoined, ServerMessages } from "@hascape/common";
import { State } from "../state";
import PlayerPrefab from "../assets/prefabs/player.json";
import OtherPrefab from "../assets/prefabs/otherPlayer.json";
import { Smooth } from "hagamets/dist/common/components/smooth.js";
import { TextMesh } from "hagamets/dist/common/components/mesh.js";

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

                State.sessionId = joined.player.sessionId;

                this.game.activateScene('runtime');
                const entity = this.game.currentScene!.addEntityFromPrefab(PlayerPrefab, joined.player.username);

                entity.transform.position = joined.player.position as any;

                const player = entity.getComponent(Player)!;
                player.sessionId = joined.player.sessionId;
                player.username = joined.player.username;

                entity.getComponent(Smooth)!.targetPosition = entity.position;

                const text = entity.getComponentInChildren(TextMesh)!;
                text.text = player.username;
                text.notifyUpdate();
                
                entity.transform.position = joined.player.position as any;

                for (const other of joined.otherPlayers) {
                    const otherEntity = this.game.currentScene!.addEntityFromPrefab(OtherPrefab, other.username)
                    const otherPlayer = otherEntity.getComponent(Player)!;
                    otherPlayer.sessionId = other.sessionId;
                    otherPlayer.username = other.username;

                    otherEntity.transform.position = other.position as any;
                    otherEntity.getComponent(Smooth)!.targetPosition = otherEntity.position;

                    const otherText = otherEntity.getComponentInChildren(TextMesh)!;
                    otherText.text = otherPlayer.username;
                    otherText.notifyUpdate();
                }

                const size = this.game.getSize();
                this.game.resize(size.x, size.y);
            }
        })
    }
}