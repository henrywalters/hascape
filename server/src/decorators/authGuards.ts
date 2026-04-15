import { NextFunction, Request, Response } from "express";
import { AuthLevel } from "../entity/user";
import { AuthService } from "../services/auth";
import { ErrorResult } from "../controllers/controller";

export function AuthorizeFor(levels: AuthLevel[]) {

    const users = new AuthService();

    return function(target: any, key: string, descriptor: PropertyDescriptor) {
        
        const method = descriptor.value;
        
        descriptor.value = async function(req: Request, res: Response) {
            const user = await users.getUser(req.headers.user_id as string);
            console.log(user.authLevel, levels);
            if (levels.indexOf(user.authLevel) === -1) {
                return new ErrorResult({
                    status: 403,
                    error: "Unauthorized for endpoint"
                })
            }
            return await method.apply(this, [req, res]);
        }

        return descriptor;
    }
}

export function AuthorizeForAdmin() {
    return AuthorizeFor([AuthLevel.Admin, AuthLevel.SuperAdmin]);
}