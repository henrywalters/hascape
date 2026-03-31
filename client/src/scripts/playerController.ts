import { Script } from "hagamets/dist/core/script.js";
import { Actions, Character, CharacterAction, CharacterAttack, CharacterInteract, ItemOnGround, ITEMS } from "@hascape/common";
import { Axes, Buttons } from "hagamets/dist/core/interfaces/input.js";
import { PlayerMove } from "@hascape/common";
import { State } from "../state";
import { Color, Vector3 } from "three";
import { OrthographicCamera } from "hagamets/dist/common/components/camera.js";
import { IInteractOption, InteractEvents, ItemSelected, OpenMenu, PreviewItem } from "../interactionEvents";
import { Entity } from "hagamets/dist/core/reflection.js";
import { InteractOption } from "./interactMenu";

export class PlayerController extends Script {

    onInit() {
        console.log("Start");
        State.interactionEvents.listen((e) => {
            if (State.isEditing) return;
            if (e.type === InteractEvents.ItemSelected) {
                console.log(e);
                const event = e as ItemSelected;
                console.log(event);
                const msg = new CharacterAction();
                msg.sessionId = State.sessionId;
                msg.action = event.selected.action;
                if (event.selected.position) {
                    msg.position = State.grid.getCellIndex(event.selected.position as any) as any;
                }
                if (event.selected.subject) {
                    msg.subjectId = event.selected.subject.instanceId;
                }
                console.log(msg);
                this.game.client.send(msg);
            }
        })
    }

    onUpdate(dt: number) {
        const player = this.entity.getComponent(Character);
        if (player && player.sessionId === State.sessionId && !State.isTyping) {

            // // console.log(player.entity.position);

            // const dir = this.input.getAxis(Axes.KeyboardWASD);
            // player.direction.set(dir.x, dir.y, 0);
            // player.direction.normalize();

            // const move = new PlayerMove();
            // move.direction = player.direction;
            // move.sessionId = State.sessionId;
            // move.dt = dt;
            // move.tick = State.tick;

            // if (this.input.getButtonPressed(Buttons.KeySpace) && !player.isAttacking) {
            //     // player.isAttacking = true;
            //     // console.log("Attack");
            //     const msg = new CharacterAttack();
            //     msg.sessionId = player.sessionId;
            //     this.game.client.send(msg);
            // }

            // if (this.input.getButtonPressed(Buttons.KeyE)) {
            //     const interact = new CharacterInteract();
            //     interact.sessionId = State.sessionId;
            //     this.game.client.socket.send(this.game.client.clientMessages.write(interact));
            // }

            const viewport = this.game.getViewport();

            const mousePos = this.game.input.getAxis(Axes.MousePosition);

            if (viewport.contains(mousePos)) {
                const options = this.getInteractOptions();

                State.interactionEvents.emit(new PreviewItem(options));

                if (this.entity.scene.game.input.getButtonPressed(Buttons.MouseRight)) {
                    if (viewport.contains(mousePos)) {
                        State.interactionEvents.emit(new OpenMenu(new Vector3(mousePos.x, mousePos.y, 0), options));
                    }
                }
            }

            // if (!State.isEditing) {
            //     try {
            //         this.game.client.socket.send(this.game.client.clientMessages.write(move));
            //     } catch (e) {

            //     }
            // }
        }
    }

    private getInteractOptions() {
        let mousePos: Vector3 = new Vector3();

        const cam = this.entity.getComponentInChildren(OrthographicCamera);

        if (cam) {
            mousePos = cam.getMousePos() as any;
        }

        let options: IInteractOption[] = [];

        const cell = State.grid.getCellIndex(mousePos as any);

        if (State.itemMap.has(cell)) {
            for (const itemEntity of State.itemMap.get(cell as any)!) {
                const item = itemEntity.getComponent(ItemOnGround);
                if (!item) continue;
                options.push({
                    action: Actions.PickupItem,
                    subject: {
                        label: ITEMS[item.item].name,
                        instanceId: item.instanceId,
                    }
                })
            }
        }

        options.push({
            action: Actions.MoveHere,
            position: mousePos as any,
        })

        return options;
        
    }
}