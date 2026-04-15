import { AuthorizeFor } from "../decorators/authGuards";
import { AuthLevel } from "../entity/user";
import { Controller, ErrorResult, Result, SuccessResult } from "./controller";
import { Express, Request, Response } from "express";

export class UserController extends Controller {
    constructor(app: Express) {
        super(app, "user");

        app.get('/self', async (req, res) => {
            return this.handle(req, res, async (req, res) => new SuccessResult(await this.getUser(req)));
        })

        app.post('/user/auth-level', async (req, res) => {
            return this.handle(req, res, async (req, res) => this.setAuthLevel(req, res));
        })
    }

    @AuthorizeFor([AuthLevel.Admin, AuthLevel.SuperAdmin])
    async get(req: Request, res: Response): Promise<Result> {
        return new SuccessResult(await this.auth.getUsers());
    }

    @AuthorizeFor([AuthLevel.SuperAdmin])
    async setAuthLevel(req: Request, res: Response): Promise<Result> {
        const user = await this.auth.getUser(req.body.user_id);
        if (!user) {
            return new ErrorResult({
                status: 404,
                error: "User does not exist",
            }); 
        }

        await this.auth.setAuthLevel(user, req.body.auth_level);

        return new SuccessResult(user);
    }
}