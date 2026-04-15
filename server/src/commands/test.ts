import { Int, Param, String, Types } from "hagamets/dist/core/reflection.js";
import { Runtime } from "../runtime";
import { Vector2, Vector3 } from "three";
import { Character, Player, PlayerMessaged } from "@hascape/common";
import { ICommand } from "../commands";

export class TestCommand implements ICommand {

    @String()
    message: string;

    @Int()
    count: number;

    run(player: Character, runtime: Runtime): boolean {
        for (let i = 0; i < this.count; i++) {
            const newMsg = new PlayerMessaged();
            newMsg.message = this.message;
            newMsg.username = "Global";
            newMsg.position = new Vector3();
            newMsg.sessionId = player.sessionId;
            runtime.game.server.emit(newMsg);
        }
        return true;
    }
}