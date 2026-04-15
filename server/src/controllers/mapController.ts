import { AuthorizeForAdmin } from "../decorators/authGuards";
import { MapChange, MapChangeType } from "../messages/map";
import { MapService } from "../services/map";
import { State } from "../state";
import { Controller, ErrorResult, Result, SuccessResult } from "./controller";
import { Express, Request, Response } from "express"

export class MapController extends Controller {

    private maps: MapService;

    constructor(app: Express) {
        super(app, "map");
        this.maps = new MapService();
    }

    async getOne(req: Request, res: Response): Promise<Result> {
        return new SuccessResult(await this.maps.get(req.params.id as string));
    }

    async get(req: Request, res: Response): Promise<Result> {
        return new SuccessResult(await this.maps.getAll());
    }

    @AuthorizeForAdmin()
    async post(req: Request, res: Response): Promise<Result> {
        
        const newMap = await this.maps.create(req.body.name, req.body.default_map, req.body.data);

        if (State.pubsub) {
            const msg = new MapChange();
            // msg.changeType = MapChangeType.NewMap;
            // msg.mapId = newMap ? newMap.id : '';
            await State.pubsub.send(msg);
        }
        return new SuccessResult(newMap);
    }

    @AuthorizeForAdmin()
    async put(req: Request, res: Response): Promise<Result> {
        const map = await this.maps.get(req.params.id as string);
        if (!map) {
            return new ErrorResult({
                status: 404,
                error: "Map does not exist"
            })
        }
        const newMap = await this.maps.update(map, req.body.name, req.body.default_map, req.body.data);
        if (State.pubsub) {
            const msg = new MapChange();
            // msg.changeType = MapChangeType.MapUpdate;
            // msg.mapId = newMap ? newMap.id : '';
            await State.pubsub.send(msg);
        }
        return new SuccessResult(newMap);
    }

    @AuthorizeForAdmin()
    async delete(req: Request, res: Response): Promise<Result> {
        await this.maps.remove(req.params.id as string)
        if (State.pubsub) {
            const msg = new MapChange();
            // msg.changeType = MapChangeType.MapRemoved;
            // msg.mapId = req.params.id as string;
            await State.pubsub.send(msg);
        }
        return new SuccessResult(void 0);
    }
}