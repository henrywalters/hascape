import { Container } from "hagamets/dist/common/components/ui/container.js";
import { Focusable } from "hagamets/dist/common/components/ui/focusable.js";
import { Param, Types } from "hagamets/dist/core/reflection.js";
import { Script } from "hagamets/dist/core/script.js";
import { Color } from "three";
import { State } from "../state";
import { TextInput, TextInputEvents } from "hagamets/dist/common/components/ui/textInput.js";
import { Text } from "hagamets/dist/common/components/ui/text.js";
import { PlayerMessage } from "@hascape/common";
import { TextMesh } from "hagamets/dist/common/components/mesh.js";
import { Runtime } from "../scenes/runtime";

export class ChatBox extends Script {
    @Param({type: Types.Entity})
    border: number;

    @Param({type: Types.Entity})
    chatInput: number;

    @Param({type: Types.Entity})
    output: number;

    @Param({type: Types.Int})
    maxMessages: number = 5;

    private messages: string[] = [];

    listening = false;

    public addMessage(msg: string) {
        const output = this.scene.getEntity(this.output);
        if (!output) return;

        const textOutput = output.getComponent(Text);
        if (!textOutput) return;
        this.messages.push(msg);
        while (this.messages.length > this.maxMessages) {
            this.messages.splice(0, 1);
        }
        textOutput.text = this.messages.join('\n');
        textOutput.notifyUpdate();
    }

    onUpdate(dt: number) {
        const chatInput = this.scene.getEntity(this.chatInput);
        const border = this.scene.getEntity(this.border);
        const output = this.scene.getEntity(this.output);

        if (chatInput && border && output) {

            const focusable = chatInput.getComponent(Focusable)!;
            const container = border.getComponent(Container)!;
            const textInput = chatInput.getComponent(TextInput)!;
            const textOutput = output.getComponent(Text)!;

            if (!this.listening) {
                textInput.events.listen((e) => {
                    if (e === TextInputEvents.Enter) {

                        const message = new PlayerMessage();
                        console.log(State);
                        message.message = textInput.text;
                        message.sessionId = State.sessionId;

                        focusable.focused = false;
                        this.game.client.send(message);
                        if (State.isEditing) {
                            this.messages.push(textInput.text);
                            while (this.messages.length > this.maxMessages) {
                                this.messages.splice(0, 1);
                            }
                            textOutput.text = this.messages.join('\n');
                            textOutput.notifyUpdate();
                        }

                        textInput.text = "";
                        textInput.notifyUpdate();
                    }
                });
                this.listening = true;
            }

            State.isTyping = focusable.focused;
            container.color = new Color(focusable.focused ? 'yellow' : 'black') as any;
            container.notifyUpdate();
        }
    }
}