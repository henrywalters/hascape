import { Random } from "hcore/dist/random";
import { ItemInstance } from "./item";

export interface IDropCount {
    quantity: number;
    frequency: number;
}

export const DEFAULT_DROP: IDropCount = {
    quantity: 1,
    frequency: 1,
}

export interface IDrop {
    item: string;
    counts: IDropCount[];
    frequency: number;
}

export interface IDropRoll {
    frequency: number;
    drops: IDrop[];
}

export type IDropTable = IDropRoll[];

export function alwaysDrop(item: string): IDropRoll {
    return {
        drops: [
            {
                item: item,
                frequency: 1.0,
                counts: [DEFAULT_DROP],
            }
        ],
        frequency: 1,
    }
}

export function dropCount(drop: IDrop): number {
    let countMin = 0;
    const roll = Random.float(0, 1);
    for (const count of drop.counts) {
        const countMax = countMin + count.frequency;
        if (countMax > 1.0) {
            console.warn('Drop table sum frequency exceeds 1.0, they will never be hit');
        } else if (roll >= countMin && roll < countMax) {
            return count.quantity;
        }
        countMin = countMax;
    }

    return 0;
}

export function rollDrop(drops: IDropRoll): ItemInstance | null {
    let dropMin = 0;
    const roll = Random.float(0, 1);
    for (const drop of drops.drops) {
        const dropMax = dropMin + drop.frequency;
        if (dropMax > 1.0) {
            console.warn('Drop table sum frequency exceeds 1.0, they will never be hit');
        } else if (roll >= dropMin && roll < dropMax) {
            const count = dropCount(drop);
            if (count > 0) {
                return new ItemInstance(drop.item, dropCount(drop));
            }
        }
        dropMin = dropMax;
    }

    return null;
}

export function getDrops(table: IDropTable): ItemInstance[] {
    const items: ItemInstance[] = [];

    for (const row of table) {
        if (Random.float(0, 1) <= row.frequency) {
            const drop = rollDrop(row);
            if (drop) {
                items.push(drop);
            }
        }
    }

    return items;
}