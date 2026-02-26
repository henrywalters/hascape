import { Script } from "hagamets/dist/core/script.js";
import { Character, CharacterAttack, CharacterInteract } from "@hascape/common";
import { Axes, Buttons } from "hagamets/dist/core/interfaces/input.js";
import { PlayerMove } from "@hascape/common";
import { State } from "../state";

export class PlayerController extends Script {
    onUpdate(dt: number) {
        const player = this.entity.getComponent(Character);
        if (player && player.sessionId === State.sessionId && !State.isTyping) {

            // console.log(player.entity.position);

            const dir = this.input.getAxis(Axes.KeyboardWASD);
            player.direction.set(dir.x, dir.y, 0);
            player.direction.normalize();

            const move = new PlayerMove();
            move.direction = player.direction;
            move.sessionId = State.sessionId;
            move.dt = dt;
            move.tick = State.tick;

            if (this.input.getButtonPressed(Buttons.KeySpace) && !player.isAttacking) {
                // player.isAttacking = true;
                // console.log("Attack");
                const msg = new CharacterAttack();
                msg.sessionId = player.sessionId;
                this.game.client.send(msg);
            }

            if (this.input.getButtonPressed(Buttons.KeyE)) {
                const interact = new CharacterInteract();
                interact.sessionId = State.sessionId;
                this.game.client.socket.send(this.game.client.clientMessages.write(interact));
            }

            if (!State.isEditing) {
                try {
                    this.game.client.socket.send(this.game.client.clientMessages.write(move));
                } catch (e) {

                }
            }
        }
    }
}