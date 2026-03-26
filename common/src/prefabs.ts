import { EntityData } from "hagamets/dist/ecs/interfaces/entity.js";

import ItemOnGround from "./../assets/prefabs/itemOnGround.json";
import LevelUpMenu from "./../assets/prefabs/levelUpMenu.json";
import Orc from "./../assets/prefabs/orc.json";
import OtherPlayer from "./../assets/prefabs/otherPlayer.json";
import Player from "./../assets/prefabs/player.json";
import StatDisplay from "./../assets/prefabs/StatDisplay.json";
import Wizard from "./../assets/prefabs/wizard.json";
import InteractOption from "./../assets/prefabs/InteractOption.json";
import InventoryItem from "./../assets/prefabs/InventoryItem.json";
import StackableInventoryItem from "./../assets/prefabs/StackableInventoryItem.json";

export enum PrefabTypes {
    ItemOnGround,
    LevelUpMenu,
    Orc,
    OtherPlayer,
    Player,
    StatDisplay,
    Wizard,
    InteractOption,
    InventoryItem,
    StackableInventoryItem,
}

export const Prefabs: {[key: number]: EntityData} = {
    [PrefabTypes.ItemOnGround]: ItemOnGround,
    [PrefabTypes.LevelUpMenu]: LevelUpMenu,
    [PrefabTypes.Orc]: Orc,
    [PrefabTypes.OtherPlayer]: OtherPlayer,
    [PrefabTypes.Player]: Player,
    [PrefabTypes.StatDisplay]: StatDisplay,
    [PrefabTypes.Wizard]: Wizard,
    [PrefabTypes.InteractOption]: InteractOption,
    [PrefabTypes.InventoryItem]: InventoryItem,
    [PrefabTypes.StackableInventoryItem]: StackableInventoryItem,
}