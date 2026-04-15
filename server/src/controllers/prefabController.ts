import { AuthorizeFor, AuthorizeForAdmin } from "../decorators/authGuards";
import { AuthLevel } from "../entity/user";
import { PrefabService } from "../services/prefab";
import { Controller, ErrorResult, Result, SuccessResult } from "./controller";
import { Express, Request, Response } from "express";

export class PrefabController extends Controller {
    private prefabs: PrefabService;

    constructor(app: Express) {
        super(app, 'prefab');
        this.prefabs = new PrefabService();
    }

    async get(req: Request, res: Response): Promise<Result> {
        return new SuccessResult(await this.prefabs.getAll());
    }

    async getOne(req: Request, res: Response): Promise<Result> {
        return new SuccessResult(await this.prefabs.get(req.params.id as string));
    }

    @AuthorizeForAdmin()
    async post(req: Request, res: Response): Promise<Result> {
        if (req.body.name.length < 4) {
            return new ErrorResult({
                status: 400,
                error: 'Failed to create Prefab',
                errors: {
                    name: 'Name must be 4 characters or more',
                }
            })
        }
        return new SuccessResult(await this.prefabs.create(req.body.name, req.body.data));
    }

    @AuthorizeForAdmin()
    async delete(req: Request, res: Response): Promise<Result> {
        return new SuccessResult(await this.prefabs.remove(req.params.id as string));
    }

    @AuthorizeForAdmin()
    async put(req: Request, res: Response): Promise<Result> {
        const prefab = await this.prefabs.get(req.params.id as string);
        if (!prefab) {
            return new ErrorResult({
                status: 400,
                error: 'Prefab does not exist',
            })
        }
        return new SuccessResult(await this.prefabs.update(prefab, req.body.name, req.body.data));
    }
}