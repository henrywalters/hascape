import { Color, Vector2 } from "three";

export enum Actions {
    MoveHere,
    PickupItem,
    Cancel,
    DropItem,
    UseItem,
}

export interface IActionDefinition {
    label: string;
    color: Color;
    hasPosition: boolean;
    hasSubject: boolean;
}

export const ACTIONS: {[key: number]: IActionDefinition} = {
    [Actions.Cancel]: {
        label: "Cancel",
        color: new Color('white'),
        hasPosition: false,
        hasSubject: false,
    },
    [Actions.MoveHere]: {
        label: "Move here",
        color: new Color('white'),
        hasPosition: true,
        hasSubject: false,
    },
    [Actions.PickupItem]: {
        label: "Pickup",
        color: new Color('brown'),
        hasPosition: false,
        hasSubject: true,
    },
    [Actions.DropItem]: {
        label: "Drop",
        color: new Color("brown"),
        hasPosition: false,
        hasSubject: true,
    },
    [Actions.UseItem]: {
        label: "Use",
        color: new Color("brown"),
        hasPosition: false,
        hasSubject: true,
    }
}

export interface ISubject {
    label: string;
    instanceId: string;
}

export interface IAction {
    action: Actions;
    position?: Vector2;
    subject?: ISubject;
}

export class Action implements IAction {

    private _action: Actions;
    protected _position: Vector2;
    protected _subject: ISubject;

    public get action() {
        return this._action;
    }

    public get position() {
        if (!ACTIONS[this.action].hasPosition) {
            throw new Error(`Position does not exist on action: ${this.action}`)
        }
        return this._position;
    }

    public get subject() {
        if (!ACTIONS[this.action].hasSubject) {
            throw new Error(`Subject does not exist on action: ${this.action}`)
        }
        return this._subject;
    }

    constructor(action: Actions) {
        this._action = action;
    }
}

export class PositionalAction extends Action {
    constructor(action: Actions, position: Vector2) {
        super(action);
        this._position = position;
    }
}

export class SubjectAction extends Action {
    constructor(action: Actions, subject: ISubject) {
        super(action);
        this._subject = subject;
    }
}