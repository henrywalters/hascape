import { Param, Types } from "hagamets/dist/core/reflection.js";
import { Script } from "hagamets/dist/core/script.js";
import { Button } from "hagamets/dist/common/components/ui/button.js";
import { ClientConnect } from "@hascape/common";
import { Client } from "../client";
import { Text } from "hagamets/dist/common/components/ui/text.js";

export class Login extends Script {

    @Param({type: Types.Entity})
    message: number = -1;

    @Param({type: Types.Entity})
    button: number = -1;

    onStart() {
        console.log("Script Start!");
    }

    onUpdate(dt: number) {
        const game = this.entity.scene.game as Client;
        const message = this.entity.scene.getEntity(this.message)?.getComponent(Text);
        const button = this.entity.scene.getEntity(this.button)?.getComponent(Button);

        const text = `Hello ${game.user.username}`;

        if (message && message.text !== text) {
            message.text = text;
            message.notifyUpdate();
        }

        if (button && button.isJustPressed) {
            console.log("Login");
            const connect = new ClientConnect();
            connect.token = game.token;
            game.client.socket.send(game.client.clientMessages.write(connect));
        }
    }
}