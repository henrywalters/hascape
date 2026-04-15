import { Character } from "../../../common/dist/components/character";
import { IResponseMessage, ResponseType } from "@hascape/common";
import { Commands, ICommand } from "../commands";
import { Runtime } from "../runtime";

export class Help implements ICommand {
    run(player: Character, scene: Runtime): boolean {

        const responses: IResponseMessage[] = [];

        for (const [name, ctr] of Commands.commands) {
            responses.push({
                message: Commands.getHelp(name, new ctr()),
                responseType: ResponseType.Info,
            })
        }

        scene.sendResponse(player, responses);

        return true;
    }
}