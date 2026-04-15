import { NetMessage } from "hagamets/dist/net/messages.js";
import { ServerMessages } from "./types";
import { Array, String, Types } from "hagamets/dist/core/reflection.js";

export enum ResponseType {
    Info = 'info',
    Success = 'success',
    Error = 'error',
    Warning = 'warning',
}

export interface IResponseMessage {
    message: string;
    responseType: ResponseType;
}

export class ResponseMessage {
    @String()
    message: string;
    
    @String()
    responseType: string;
}

export class CommandResponse extends NetMessage {
    type = ServerMessages.CommandResponse;

    @Array(Types.Class, ResponseMessage)
    responses: ResponseMessage[] = [];
}