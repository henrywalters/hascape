import { PlayerService } from "../services/player";
import { Controller, ErrorResult, Result, SuccessResult } from "./controller";
import { Express, Request, Response } from "express";

export class PlayerController extends Controller {

    players: PlayerService;

    constructor(app: Express) {
        super(app, "player");
        this.players = new PlayerService();
    }

    async get(req: Request, res: Response): Promise<Result> {
        return new SuccessResult(await this.players.getPlayers(await this.getUser(req)));
    }

    async post(req: Request, res: Response): Promise<Result> {
        try {
            return new SuccessResult(await this.players.createPlayer(await this.getUser(req), req.body.username));
        } catch (e: any) {
            return new ErrorResult({
                status: 400,
                error: e.message,
            })
        }
    }
}