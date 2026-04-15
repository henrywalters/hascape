import { NetMessage } from "hagamets/dist/net/messages.js";
import { APIMessages } from "./types";
import { Enum, String } from "hagamets/dist/core/reflection.js";

export enum MapChangeType {
    NewMap,
    MapUpdate,
    MapRemoved,
}

export class MapChange extends NetMessage {
    type = APIMessages.MapChange;

    // @Enum(MapChangeType)
    // changeType: MapChangeType;

    // @String()
    // mapId: string = '';
}