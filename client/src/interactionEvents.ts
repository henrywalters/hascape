import { Color, Vector3 } from "three";
import { Actions, ISubject } from "@hascape/common";

export interface IInteractOption {
    action: Actions;
    subject?: ISubject;
    position?: Vector3;
    // level?: string;
}

export enum InteractEvents {
    PreviewItem,
    OpenMenu,
    ItemSelected,
}

export interface IInteractEvent {
    type: InteractEvents;
    menuPos?: Vector3;
    options?: IInteractOption[];
    selected?: IInteractOption;
}

export class OpenMenu implements IInteractEvent {
    type = InteractEvents.OpenMenu;
    menuPos: Vector3;
    options: IInteractOption[] = [];

    constructor(menuPos: Vector3, options: IInteractOption[]) {
        this.menuPos = menuPos;
        this.options = options;
    }
}

export class PreviewItem implements IInteractEvent {
    type = InteractEvents.PreviewItem;
    options: IInteractOption[] = [];

    constructor(options: IInteractOption[]) {
        this.options = options;
    }
}

export class ItemSelected implements IInteractEvent {
    type = InteractEvents.ItemSelected;
    selected: IInteractOption;

    constructor(option: IInteractOption) {
        this.selected = option;
    }
}

export type InteractEvent = OpenMenu | ItemSelected | PreviewItem;