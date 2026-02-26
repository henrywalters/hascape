import { Entity } from "hagamets/dist/core/reflection.js";
import { Script, ScriptRegistry } from "hagamets/dist/core/script.js";
import { IComponent } from "hagamets/dist/ecs/interfaces/component.js";
import { Character, Prefabs, PrefabTypes, StatList } from "@hascape/common";
import { EntityEvents } from "hagamets/dist/core/events.js";
import { Behavior } from "hagamets/dist/common/components/behavior.js";
import { StatDisplay, StatDisplayData } from "./statDisplay";
import { Text } from "hagamets/dist/common/components/ui/text.js";
import { Image } from "hagamets/dist/common/components/ui/image.js";

export class LevelUpMenu extends Script {

    @Entity()
    pointsLeft: number;

    @Entity()
    statsContainer: number;

    @Entity()
    levelUpButton: number;

    initialized = false;

    stats: StatDisplayData;

    onUpdate(dt: number) {
        if (!this.initialized) {

            this.stats = {
                stats: new Character(this.scene.addEntity()),
                available: 6,
                changes: {},
            }

            const statsContainer = this.scene.getEntity(this.statsContainer);
            if (!statsContainer) return;
            
            for (const stat of StatList) {
                const entity = this.scene.addEntityFromPrefab(Prefabs[PrefabTypes.StatDisplay], stat.name);

                const label = entity.getChild("Label")!.getComponent(Text)!.text = stat.name;

                const icon = entity.getComponentInChildren(Image)!;
                icon.texture = stat.icon;

                this.scene.changeEntityOwner(entity.id, statsContainer.id);
                
                const behavior = entity.getComponent(Behavior)!;
                const script = ScriptRegistry.get(behavior.scriptName, behavior) as StatDisplay;

                script.initialize(this.stats, stat.key);

                this.scene.entityEvents.emit({
                    type: EntityEvents.Create,
                    entity,
                })
            }

            this.initialized = true;
        } else {
            const pointsLeft = this.scene.getEntity(this.pointsLeft)!;
            const text = pointsLeft.getComponent(Text)!;
            const label = `${this.stats.available} Points Left`;
            if (text.text !== label) {
                text.text = label;
                text.notifyUpdate();
            }
        }
    }
}