import { Entity } from "hagamets/dist/core/reflection.js";
import { Script } from "hagamets/dist/core/script.js";
import { State } from "../state";

const TIMEOUT = 1;

export class Disconnected extends Script {

    private disconnectedAt: number | null = null;

    onUpdate(dt: number) {

        if (this.game.client.connected && this.disconnectedAt !== null) {
            // TODO: Add logic for reconnecting

            return;

            this.disconnectedAt = null;

            this.entity.children[0].active = false;
            this.entity.children[0].notifyUpdate();

        }

        if (!this.game.client.connected && !this.disconnectedAt) {
            this.disconnectedAt = this.game.clock.getElapsedTime();

            this.entity.children[0].active = true;
            this.entity.children[0].notifyUpdate();

            console.log(this.disconnectedAt);
        }

        if (this.disconnectedAt) {
            const lostConnectionFor = this.game.clock.getElapsedTime() - this.disconnectedAt;
            if (lostConnectionFor > TIMEOUT && !State.isEditing) {
                this.disconnectedAt = null;
                this.game.currentScene!.clear();
                this.game.activateScene('login_menu');
            }
        }
    }
}