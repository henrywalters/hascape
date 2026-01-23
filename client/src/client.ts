import { IUser } from "@hascape/common";
import { Game } from "hagamets/dist/core/game.js";
import { IManifest } from "hagamets/dist/core/interfaces/manifest.js";

export class Client extends Game {
    
    private _user: IUser;

    private _token: string;
    
    public get user() { return this._user; }
    public get token() { return this._token; }

    constructor(manifest: IManifest, user: IUser, token: string) {
        super(manifest, false);
        this._user = user;
        this._token = token;
    }
}