import { Request, Response, Express } from "express";
import { AuthService } from "../services/auth";

export type ErrorMap = {[key: string]: string};
export interface IError {
    status: number;
    error?: string;
    errors?: ErrorMap;
}

export interface IResult {
    success: boolean;
    error?: IError
    result?: any;
}

export interface ISuccessResult {
    success: true;
    result: any;
}

export interface IErrorResult {
    success: false;
    error: IError;
}

export class ErrorResult implements IErrorResult {
    success: false = false;
    error: IError;

    constructor(error: IError) {
        this.error = error;
    }
}

export class SuccessResult implements ISuccessResult {
    success: true = true;
    result: any;

    constructor(result: any) {
        this.result = result;
    }
}

export type Result = ErrorResult | SuccessResult;

export class Controller {

    auth: AuthService;

    constructor(app: Express, root: string) {

        this.auth = new AuthService();

        app.get(`/${root}`, async (req, res) => {
            this.handle(req, res, await this.get(req, res));
        });

        app.get(`/${root}:id`, async (req, res) => {
            this.handle(req, res, await this.getOne(req, res));
        });

        app.post(`/${root}`, async (req, res) => {
            this.handle(req, res, await this.post(req, res));
        })
    }

    protected handle(req: Request, res: Response, result: Result) {
        if (result.success) {
            res.json(result.result);
        } else {
            let errorMsg: any = {};
            if (result.error.error) {
                errorMsg['error'] = result.error.error;
            }
            if (result.error.errors) {
                errorMsg['errors'] = result.error.errors;
            }
            res.status(result.error.status).json(errorMsg);
        }
    }

    protected async getUser(req: Request) {
        return await this.auth.getUser(req.headers.user_id as string);
    }

    async get(req: Request, res: Response): Promise<Result> {
        return new ErrorResult({
            status: 404,
            error: 'Get not implemented',
        })
    }

    async getOne(req: Request, res: Response): Promise<Result> {
        return new ErrorResult({
            status: 404,
            error: 'Get one not implemented',
        })
    }

    async post(req: Request, res: Response): Promise<Result> {
        return new ErrorResult({
            status: 404,
            error: 'post not implemented',
        })
    }
}