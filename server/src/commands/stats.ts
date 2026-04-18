import { Character } from "../../../common/dist/components/character";
import { ResponseType } from "@hascape/common";
import { ICommand } from "../commands";
import { Runtime } from "../runtime";
import { serialize, Types } from "hagamets/dist/core/reflection.js";
import { State } from "../state";

export class PlayerStats implements ICommand {
    run(player: Character, scene: Runtime): boolean {
        const cell = State.grid.getCellIndex(player.entity.position);
        scene.sendResponse(player, [{
            message: `Session ID: ${player.sessionId} ` + 
                `Map: ${player.map} ` +
                `Position: ${player.entity.position.x.toFixed(2)}, ${player.entity.position.x.toFixed(2)}, ${player.entity.position.z.toFixed(2)} ` +
                `Cell: ${serialize({type: Types.Vector2}, cell)}`,
            responseType: ResponseType.Info,
        }])
        return true;
    }
}