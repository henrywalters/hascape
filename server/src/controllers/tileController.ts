import { Request, Response, Express } from "express";
import { Controller, ErrorMap, ErrorResult, Result, SuccessResult } from "./controller";
import { TileService } from "../services/tile";
import { ASSET_MIMETYPES, AssetType } from "@hascape/common";
import { AuthorizeForAdmin } from "../decorators/authGuards";


export class TileController extends Controller {

    private tiles: TileService;

    constructor(app: Express) {
        super(app, "tile", 'texture');
        this.tiles = new TileService();
    }


    async get(req: Request, res: Response): Promise<Result> {
        return new SuccessResult(await this.tiles.getAll());
    }

    async getOne(req: Request, res: Response): Promise<Result> {
        return new SuccessResult(await this.tiles.get(req.params.id as string));
    }

    @AuthorizeForAdmin()
    async post(req: Request, res: Response): Promise<Result> {

        let buffer: Buffer | undefined = void 0;
        let errors: ErrorMap = {};

        if (req.file) {
            buffer = req.file.buffer;

            if (req.file.mimetype !== ASSET_MIMETYPES[AssetType.Texture]) {
                errors['texture'] =`File must have mimetype: ${ASSET_MIMETYPES[AssetType.Texture]}`;
            }
        }

        if (req.body.name.length < 4) {
            errors['name'] = 'Tile name must be at least 4 characters long';
        }

        if (await this.tiles.getByName(req.body.name)) {
            errors['name'] = 'Tile with this name already exists';
        }

        if (Object.keys(errors).length > 0) {
            return new ErrorResult({
                status: 400,
                errors,
                error: 'Failed to create Tile',
            })
        }

        if (!buffer && !req.body.color) {
            return new ErrorResult({
                status: 400,
                error: 'Failed to create tile - Texture or Color must be set'
            })
        }

        return new SuccessResult(await this.tiles.create(req.body.name, req.body.is_wall, buffer, req.body.color));
    }

    @AuthorizeForAdmin()
    async delete(req: Request, res: Response): Promise<Result> {
        return new SuccessResult(await this.tiles.remove(req.params.id as string));
    }
}