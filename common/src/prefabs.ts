import { EntityData } from "hagamets/dist/ecs/interfaces/entity.js";

import ItemOnGround from "./../assets/prefabs/itemOnGround.json";
import LevelUpMenu from "./../assets/prefabs/levelUpMenu.json";
import Orc from "./../assets/prefabs/orc.json";
import OtherPlayer from "./../assets/prefabs/otherPlayer.json";
import Player from "./../assets/prefabs/player.json";
import StatDisplay from "./../assets/prefabs/StatDisplay.json";
import Wizard from "./../assets/prefabs/wizard.json";

export enum PrefabTypes {
    ItemOnGround,
    LevelUpMenu,
    Orc,
    OtherPlayer,
    Player,
    StatDisplay,
    Wizard,
}

export const Prefabs: {[key: number]: EntityData} = {
    [PrefabTypes.ItemOnGround]: ItemOnGround,
    [PrefabTypes.LevelUpMenu]: LevelUpMenu,
    [PrefabTypes.Orc]: Orc,
    [PrefabTypes.OtherPlayer]: OtherPlayer,
    [PrefabTypes.Player]: Player,
    [PrefabTypes.StatDisplay]: StatDisplay,
    [PrefabTypes.Wizard]: Wizard,
}