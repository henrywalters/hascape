import { Entity, Param, Types } from "hagamets/dist/core/reflection.js";
import { Script } from "hagamets/dist/core/script.js";
import { Button } from "hagamets/dist/common/components/ui/button.js";
import { ClientConnect, ClientConnectFailed, ServerMessages } from "@hascape/common";
import { Client } from "../client";
import { Text } from "hagamets/dist/common/components/ui/text.js";
import { Color } from "three";

export class Login extends Script {

    @Param({type: Types.Entity})
    message: number = -1;

    @Param({type: Types.Entity})
    button: number = -1;

    @Param({type: Types.Entity})
    exitButton: number = -1;

    @Entity()
    error: number = -1;

    @Entity()
    serverStatus: number = -1;

    private connected = true;

    onInit() {
        this.game.client.installFilter([ServerMessages.ConnectFailed], (failed) => {
            const error = this.entity.scene.getEntity(this.error)?.getComponent(Text);
            if (error) {
                error.text = (failed.message as ClientConnectFailed).error;
                error.notifyUpdate();
            }
        })
    }

    onUpdate(dt: number) {
        const game = this.entity.scene.game as Client;
        const message = this.entity.scene.getEntity(this.message)?.getComponent(Text);
        const button = this.entity.scene.getEntity(this.button)?.getComponent(Button);
        const exitButton = this.entity.scene.getEntity(this.exitButton)?.getComponent(Button);
        const error = this.entity.scene.getEntity(this.error)?.getComponent(Text);
        const status = this.entity.scene.getEntity(this.serverStatus)?.getComponent(Text);

        const text = `Hello ${game.player.username}`;

        if (message && message.text !== text) {
            message.text = text;
            message.notifyUpdate();
        }

        if (button && button.isJustPressed) {
            if (error) {
                error.text = "";
                error.notifyUpdate();
            }

            if (!game.client.connected) {
                if (error) {
                    error.text = "Disconnected from Server";
                    error.color = new Color('red') as any;
                    error.notifyUpdate();
                }
            } else {
                const connect = new ClientConnect();
                connect.token = game.token;
                connect.playerId = game.player.id;
                game.client.socket.send(game.client.clientMessages.write(connect));
            }
        }

        if (status) {
            if (!game.client.connected && this.connected) {
                this.connected = false;
                status.text = "Disconnected from Server";
                status.color = new Color('red') as any;
                status.notifyUpdate();
            }  else if (game.client.connected && !this.connected) {
                this.connected = true;
                status.text = "Connected to Server";
                status.color = new Color('green') as any;
                status.notifyUpdate();
            }
        }

        if (exitButton && exitButton.isJustPressed) {
            game.onExit();
        }
    }
}