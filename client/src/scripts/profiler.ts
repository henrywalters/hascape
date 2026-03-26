import { Entity } from "hagamets/dist/core/reflection.js";
import { Script } from "hagamets/dist/core/script.js";

import ProfileItem from "../prefabs/ProfileItem.json";
import { IEntity } from "hagamets/dist/ecs/interfaces/entity.js";
import { Buttons } from "hagamets/dist/core/interfaces/input.js";
import { Text } from "hagamets/dist/common/components/ui/text.js";
import { Container } from "hagamets/dist/common/components/ui/container.js";
import { State } from "../state";

interface IProfile {
    entity: IEntity;
    label: string;
    getValue: () => string;
}

export class Profiler extends Script {

    @Entity()
    profiles: number;

    private profileItems: IProfile[] = []

    initialized = false;

    private addItem(label: string, getValue: () => string): IProfile {
        const item = this.scene.addEntityFromPrefab(ProfileItem);
        this.scene.changeEntityOwner(item.id, this.profiles);

        return {
            entity: item,
            label,
            getValue,
        }
    }

    onUpdate(dt: number) {

        if (State.isEditing) return;

        if (this.game.input.getButtonPressed(Buttons.KeyEscape)) {
            this.entity.active = !this.entity.active;
            this.entity.notifyUpdate();
        }

        if (this.entity.active) {
            if (!this.initialized) {
                this.profileItems.push(this.addItem(
                    "DT",
                    () => {
                        return (this.game.clock.getDelta() * 1000).toFixed(2) + "ms";
                    }
                ));
                this.profileItems.push(this.addItem(
                    "Geometries",
                    () => {
                        return this.game.renderer.info.memory.geometries.toFixed(0);
                    }
                ));
                this.profileItems.push(this.addItem(
                    "Textures", () => this.game.renderer.info.memory.textures.toFixed(0),
                ))
                this.initialized = true;
            }

            const container = this.entity.getComponent(Container)!;
            container.height = this.profileItems.length * 30;
            container.notifyUpdate();

            for (const item of this.profileItems) {
                const text = item.entity.getComponent(Text)!;
                text.text = `${item.label}: ${item.getValue()}`;
                text.notifyUpdate();
            }
        }
        //console.log(this.game.renderer.info);
    }
}