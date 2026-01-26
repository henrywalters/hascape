import { Script } from "hagamets/dist/core/script.js";
import { Player } from "@hascape/common";
import { Axes } from "hagamets/dist/core/interfaces/input.js";
import { PlayerMove } from "@hascape/common";
import { State } from "../state";

export class PlayerController extends Script {
    onUpdate(dt: number) {
        const player = this.entity.getComponent(Player);
        if (player && player.sessionId === State.sessionId && !State.isTyping) {
            const dir = this.input.getAxis(Axes.KeyboardWASD);
            player.direction.set(dir.x, dir.y, 0);
            player.direction.normalize();

            const move = new PlayerMove();
            move.direction = player.direction;
            move.sessionId = State.sessionId;
            move.dt = dt;
            move.tick = State.tick;

            try {
                this.game.client.socket.send(this.game.client.clientMessages.write(move));
            } catch (e) {
                console.warn(e);
            }

        }
    }
}