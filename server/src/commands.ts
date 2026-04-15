import { Ctr, Reflection, serialize, Types } from "hagamets/dist/core/reflection.js";
import { Runtime } from "./runtime";
import { Vector2 } from "three";
import { parseArgs } from "hagamets/dist/utils/cli.js";
import { Character, CommandResponse, IResponseMessage, Player, ResponseMessage, ResponseType } from "@hascape/common";
import { State } from "./state";

export interface ICommand {
    run(player: Character, scene: Runtime): boolean;
}

class _Commands {

    public commands: Map<string, Ctr<ICommand>> = new Map();

    register(name: string, cmd: Ctr<ICommand>) {
        if (this.commands.has(name)) {
            throw new Error(`Command: ${name} already registered`);
        }
        this.commands.set(name, cmd);
    }

    getHelp(name: string, cmd: ICommand) {
        let message = `Proper Usage: ${name}`;

        for (const [key, field] of Reflection.getParams(cmd)) {
            message += ` [${key} (${field.type})]`;
        }

        return message;
    }

    execute(player: Character, runtime: Runtime, cmd: string) {
        const parts = cmd.split(' ');
        const name = parts[0].substring(1, parts[0].length);
        if (!this.commands.has(name)) {
            runtime.sendResponse(player, [
                {
                    message: `Command: ${name} does not exist`,
                    responseType: ResponseType.Error,
                },
            ]);
            return false;
        }

        const commandCtr = this.commands.get(name)!;
        const command = new commandCtr();

        try {
            parseArgs(command, parts.slice(1, parts.length));
            command.run(player, runtime);
        } catch (e: any) {
            runtime.sendResponse(player, [
                {
                    message: e.message,
                    responseType: ResponseType.Error,
                },
                {
                    message: this.getHelp(name, command),
                    responseType: ResponseType.Info,
                }
            ]);
        }
    }
}

export const Commands = new _Commands();