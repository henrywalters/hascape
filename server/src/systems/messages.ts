import { System } from "hagamets/dist/ecs/system.js";
import { Character, ClientMessages, Player, PlayerMessage } from "@hascape/common";
import { PlayerSendMessage } from "../messages/player";
import { Runtime } from "../runtime";
import { State } from "../state";
import { Commands } from "../commands";
import { TestCommand } from "../commands/test";
import { ListMaps, Teleport } from "../commands/teleport";
import { Help } from "../commands/help";
import { PlayerStats } from "../commands/stats";

export class MessageSystem extends System {

    onInit(): void {
        Commands.register('test', TestCommand)
        Commands.register('list_maps', ListMaps);
        Commands.register('teleport', Teleport);
        Commands.register('stats', PlayerStats);
        Commands.register('help', Help);

        const runtime = this.scene as Runtime;
        this.scene.game.server.installFilter([ClientMessages.PlayerMessage], (message) => {
            const msg = message.message as PlayerMessage;

            const entity = State.playerSessions.get(msg.sessionId);

            if (!entity) return;

            const player = entity.getComponent(Player)!;

            if (msg.message.length > 0 && msg.message[0] === ':' && player.isAdmin) {
                const character = entity.getComponent(Character)!;
                this.handleCommand(character, msg);
                return;
            }

            let send = new PlayerSendMessage();
            send.message = msg.message;
            send.sentTo = msg.sentTo;
            send.sessionId = msg.sessionId;
            runtime.pubsub.send(send);
        })
    }

    private handleCommand(player: Character, msg: PlayerMessage) {
        Commands.execute(player, this.scene as Runtime, msg.message);
    }
}