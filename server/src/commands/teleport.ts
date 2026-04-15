import { Param, String, Types } from "hagamets/dist/core/reflection.js";
import { Vector2 } from "three";
import { ICommand } from "../commands";
import { Character, ResponseType } from "@hascape/common";
import { Runtime } from "../runtime";
import { State } from "../state";

export class ListMaps implements ICommand {
    run(player: Character, scene: Runtime): boolean {
        const maps = [];
        for (const [key, map] of State.maps) {
            maps.push(key);
        }
        scene.sendResponse(player, [{
            message: maps.join(', '),
            responseType: ResponseType.Info,
        }])
        return true;
    }
}

export class Teleport implements ICommand {
    @String()
    map: string;

    @Param({type: Types.Vector2})
    cell: Vector2;

    run(player: Character, scene: Runtime): boolean {
        if (!State.maps.has(this.map)) {
            scene.sendResponse(player, [{
                message: `Map '${this.map}' does not exist`,
                responseType: ResponseType.Error,
            }])
            return false;
        }
        return true;
    }
}