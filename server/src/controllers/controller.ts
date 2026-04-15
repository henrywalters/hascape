import { Request, Response, Express } from "express";
import { AuthService } from "../services/auth";
import multer, { Multer } from "multer";

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
    private upload: Multer;

    constructor(app: Express, root: string, acceptFile?: string) {

        this.auth = new AuthService();

        if (acceptFile) {
            this.upload = multer({storage: multer.memoryStorage() });

            app.post(`/${root}`, this.upload.single(acceptFile), async (req, res) => {
                await this.handle(req, res, this.post);
            });

            app.put(`/${root}/:id`, this.upload.single(acceptFile), async (req, res) => {
                await this.handle(req, res, this.put);
            });
        } else {
            app.post(`/${root}`, async (req, res) => {
                console.log(req.body);
                await this.handle(req, res, this.post);
            });

            app.put(`/${root}/:id`, async (req, res) => {
                await this.handle(req, res, this.put);
            });
        }

        app.get(`/${root}`, async (req, res) => {
            await this.handle(req, res, this.get);
        });

        app.get(`/${root}/:id`, async (req, res) => {
            await this.handle(req, res, this.getOne);
        });

        app.delete(`/${root}/:id`, async (req, res) => {
            await this.handle(req, res, this.delete);
        });
    }

    protected async handle(req: Request, res: Response, fn: (req: Request, res: Response) => Promise<Result>) {
        try {
            const bound = fn.bind(this, req, res);
            const result = await bound();
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
        } catch (e: any) {
            console.trace(e);
            res.status(500).json({
                error: e.message,
            })
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

    async put(req: Request, res: Response): Promise<Result> {
        return new ErrorResult({
            status: 404,
            error: 'put not implemented',
        })
    }

    async delete(req: Request, res: Response): Promise<Result> {
        return new ErrorResult({
            status: 404,
            error: 'delete not implemented',
        })
    }
}