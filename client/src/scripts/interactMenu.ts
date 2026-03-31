import { OrthographicCamera } from "hagamets/dist/common/components/camera.js";
import { Axes, Buttons } from "hagamets/dist/core/interfaces/input.js";
import { Entity, Float } from "hagamets/dist/core/reflection.js";
import { Script, ScriptRegistry } from "hagamets/dist/core/script.js";
import { Color, Vector2, Vector3 } from "three";
import { State } from "../state";
import { IInteractOption, InteractEvents, ItemSelected, OpenMenu, PreviewItem } from "../interactionEvents";
import { Container } from "hagamets/dist/common/components/ui/container.js";
import { clamp } from "three/src/math/MathUtils.js";
import { AABB } from "hagamets/dist/utils/math.js";
import { Debug } from "hagamets/dist/core/debug.js";
import { ACTIONS, Actions, Prefabs, PrefabTypes } from "@hascape/common";
import { Behavior } from "hagamets/dist/common/components/behavior.js";
import { Text } from "hagamets/dist/common/components/ui/text.js";
import { IEntity } from "hagamets/dist/ecs/interfaces/entity.js";
import { Button } from "hagamets/dist/common/components/ui/button.js";

interface OptionPart {
    label: string;
    color: Color;
    hoverColor: Color;
}

export class InteractOption extends Script {

    @Entity()
    action: number;

    @Entity()
    subject: number;

    @Entity()
    level: number;

    onClick: () => void;

    onHover: () => void;

    option?: IInteractOption;

    initialize(option: IInteractOption, onClick: () => void, onHover: () => void) {
        this.onClick = onClick;
        this.onHover = onHover;
        this.option = option;

        let offset = 0;

        const setPart = (entity: IEntity, part?: OptionPart) => {
            if (!part) {
                entity.active = false;
                entity.notifyUpdate();
                return;
            }
            entity.active = true;
            const text = entity.getComponent(Text)!;
            text.text = part.label;
            text.color = part.color as any;
            text.offset.setX(offset);

            const button = entity.getComponent(Button);

            if (button) {
                button.hoverColor = part.hoverColor as any;
                button.defaultColor = part.color as any;
                button.notifyUpdate();
            }

            text.notifyUpdate();
            

            offset += text.getTextSize() + 5;

            entity.notifyUpdate();
        }

        const action = ACTIONS[option.action];

        setPart(this.scene.getEntity(this.action)!, {
            label: action.label,
            color: new Color('white'),
            hoverColor: new Color('yellow'),
        });
        setPart(this.scene.getEntity(this.subject)!, option.subject ? {
            label: option.subject.label,
            color: action.color,
            hoverColor: action.color,
        } : void 0);
        // setPart(this.scene.getEntity(this.level)!, option.level);
    }

    onUpdate(dt: number) {

        if (State.isEditing || !this.option) return;

        const action = this.scene.getEntity(this.action)!;

        const detectClick = (entity: IEntity) => {
            const button = entity.getComponent(Button);
            if (!button) return;
            if (button.isHovering) {
                this.onHover();
            }
            if (button.isJustPressed) {
                this.onClick();
            }
        }

        detectClick(action);

        if (this.option.subject) {
            detectClick(this.scene.getEntity(this.subject)!);
        }

        // if (this.option.level) {
        //     detectClick(this.scene.getEntity(this.level)!);
        // }
    }
}

export class InteractMenu extends Script {

    @Entity()
    preview: number;

    @Entity()
    options: number;

    @Entity()
    interact: number;

    @Float()
    padding: number = 20;

    private aabb: AABB = new AABB(new Vector2() as any, new Vector2() as any);

    private option?: IInteractOption;

    private needsClose: boolean = false;

    private selected?: IInteractOption;

    onInit() {

        const interact = this.scene.getEntity(this.interact);

        State.interactionEvents.listen((e) => {
            if (e.type === InteractEvents.OpenMenu) {

                if (this.entity.active) return;

                const size = this.game.getSize();

                const event = e as OpenMenu;
                const pos = this.getUIPos(event.menuPos as any);

                const options = this.scene.getEntity(this.options);

                if (!options) return;

                for (const option of event.options) {
                    const item = this.scene.addEntityFromPrefab(Prefabs[PrefabTypes.InteractOption]);
                    const script = item.getComponent(Behavior)!.script;
                    if (script) {
                        (script as InteractOption).initialize(option, () => {
                            this.selected = option;
                            this.needsClose = true;
                        }, () => {
                            this.setPreview(option);
                        })
                    }
                    this.scene.changeEntityOwner(item.id, options.id);
                }

                const cancel = this.scene.addEntityFromPrefab(Prefabs[PrefabTypes.InteractOption]);
                const cancelConfig: IInteractOption = {
                    action: Actions.Cancel,
                };

                const script = cancel.getComponent(Behavior)!.script;

                if (script) {
                    (script as InteractOption).initialize(cancelConfig, () => {
                        this.closeMenu();
                    }, () => {
                        this.setPreview(cancelConfig);
                    })
                }

                this.scene.changeEntityOwner(cancel.id, options.id);

                const optionsContainer = options.parent!.getComponent(Container)!;
                optionsContainer.height = (event.options.length + 1) * 20;
                optionsContainer.notifyUpdate();

                const container = this.entity.getComponent(Container)!;
                container.width = 200;
                container.height = optionsContainer.height + 30;

                this.entity.transform.position = new Vector3(pos.x, pos.y - container.height / 2, 20) as any;

                this.entity.transform.position.x = clamp(this.entity.transform.position.x, -(size.x + container.width) / 2, (size.x - container.width) / 2);
                this.entity.transform.position.y = clamp(this.entity.transform.position.y, -(size.y + container.height / 2), (size.y - container.height) / 2);

                if (this.entity.transform.position.x - container.width / 2 < -size.x / 2) {
                    this.entity.transform.position.x = -size.x / 2 + container.width / 2;
                }

                this.aabb.min = new Vector2(
                    this.entity.transform.position.x - container.width / 2 - this.padding, 
                    this.entity.transform.position.y - container.height / 2 - this.padding
                ) as any;
                this.aabb.max = new Vector2(
                    this.entity.transform.position.x + container.width / 2 + this.padding, 
                    this.entity.transform.position.y + container.height / 2 + this.padding
                ) as any;

                container.notifyUpdate();

                this.entity.active = true;
                this.entity.notifyUpdate();
            } else if (e.type === InteractEvents.PreviewItem) {

                if (this.entity.active) return;

                const event = e as PreviewItem;

                if (event.options.length > 0) {
                    this.setPreview(event.options[0]);
                    this.option = event.options[0];
                } else {
                    this.option = void 0;
                    this.closePreview();
                }
            }

        })
    }

    closePreview() {
        const preview = this.scene.getEntity(this.preview);

        if (!preview) return;
        preview.active = false;
        preview.notifyUpdate();
        return;
    }

    setPreview(option: IInteractOption) {
        const preview = this.scene.getEntity(this.preview);

        if (!preview) return;

        const script = preview.getComponent(Behavior)!.script;

        preview.active = true;
        preview.notifyUpdate();

        if (script) {
            (script as InteractOption).initialize(option, () => {}, () => {})
        }


    }

    closeMenu() {

        console.log("Close Menu");

        const options = this.scene.getEntity(this.options);

        if (!options) return;

        options.removeChildren();
        options.notifyUpdate();
        //this.entity.notifyUpdate();
        const container = this.entity.getComponent(Container)!;
        container.width = 200;
        container.height = 30;
        container.notifyUpdate();
        this.entity.active = false;
        this.entity.notifyUpdate();
    }

    onUpdate(dt: number) {

        if (State.isEditing) return;

        if (this.entity.active) {
            const mousePos = this.getUIPos();
            if (!this.aabb.contains(mousePos as any)) {
                this.closeMenu();
            }
        } else if (this.game.input.getButtonPressed(Buttons.MouseLeft) && this.option) {
            console.log(this.option);
            State.interactionEvents.emit(new ItemSelected(this.option));
        }

        if (this.needsClose) {
            this.closeMenu();
            this.needsClose = false;
        }

        if (this.selected) {
            State.interactionEvents.emit(new ItemSelected(this.selected));
            this.selected = void 0;
        }
    }

    getUIPos(pos?: Vector2) {
        const size = this.game.getSize();
        if (pos) {
            return new Vector2(pos.x - size.x / 2, size.y - pos.y - size.y / 2);
        }

        const mousePos = this.game.input.getAxis(Axes.MousePosition);
        return new Vector2(mousePos.x - size.x / 2, size.y - mousePos.y - size.y / 2);
    }
}