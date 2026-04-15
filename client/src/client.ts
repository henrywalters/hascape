import { IMap, IPlayer } from "@hascape/common";
import { Game } from "hagamets/dist/core/game.js";
import { IManifest } from "hagamets/dist/core/interfaces/manifest.js";
import { State } from "./state";

export class Client extends Game {
    
    private _player: IPlayer;
    public onExit: () => void;
    private _token: string;
    private _apiUrl: string;

    public get player() { return this._player; }
    public get token() { return this._token; }
    public get apiUrl() { return this._apiUrl };

    constructor(manifest: IManifest, player: IPlayer, apiUrl: string, token: string, onExit: () => void) {
        super(manifest, false);
        this._player = player;
        this._apiUrl = apiUrl;
        this._token = token;
        this.onExit = onExit;
    }
}