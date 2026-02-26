import { Button } from "hagamets/dist/common/components/ui/button.js";
import { Text } from "hagamets/dist/common/components/ui/text.js";
import { Entity } from "hagamets/dist/core/reflection.js";
import { Script } from "hagamets/dist/core/script.js";
import { IComponent } from "hagamets/dist/ecs/interfaces/component.js";
import { IStats } from "@hascape/common";

export interface StatDisplayData {
    stats: IStats;
    available: number;
    changes: {[key: string]: number};
}

export class StatDisplay extends Script {
    @Entity()
    level: number;

    @Entity()
    addButton: number;

    @Entity()
    removeButton: number;

    initialized = false;

    value: number = 1;

    change: number = 0;

    stats: StatDisplayData;

    stat: keyof IStats;

    constructor(component: IComponent) {
        super(component);

        this.setValue(1);
    }

    initialize(stats: StatDisplayData, stat: keyof IStats) {
        this.stats = stats;
        this.stat = stat;
        this.setValue(stats.stats[stat]);
        this.initialized = true;
    }

    increment() {
        if (this.stats.available > 0) {
            this.stats.available--;
            this.change++;
            this.setValue(this.value + 1);
        }
    }

    decrement() {
        if (this.change > 0) {
            this.stats.available++;
            this.change--;
            this.setValue(this.value - 1);
        }
    }

    setValue(value: number) {
        this.value = value;

        const level = this.scene.getEntity(this.level);
        if (level) {
            const text = level.getComponent(Text)!;
            text.text = `Lvl ${this.value}` + (this.change > 0 ? ` (+${this.change})` : '');
            text.notifyUpdate();
        }
    }

    onUpdate(dt: number) {

        if (!this.initialized) return;

        const add = this.scene.getEntity(this.addButton);
        const remove = this.scene.getEntity(this.removeButton);

        if (add && remove) {
            const addBtn = add.getComponent(Button)!;
            const removeBtn = remove.getComponent(Button)!;

            if (addBtn.isJustPressed) {
                this.increment();
            }

            if (removeBtn.isJustPressed) {
                this.decrement();
            }
        }
    }
}