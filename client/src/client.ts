import { IPlayer } from "@hascape/common";
import { Game } from "hagamets/dist/core/game.js";
import { IManifest } from "hagamets/dist/core/interfaces/manifest.js";

export class Client extends Game {
    
    private _player: IPlayer;
    public onExit: () => void;
    private _token: string;
    
    public get player() { return this._player; }
    public get token() { return this._token; }

    constructor(manifest: IManifest, player: IPlayer, token: string, onExit: () => void) {
        super(manifest, false);
        this._player = player;
        this._token = token;
        this.onExit = onExit;
    }
}