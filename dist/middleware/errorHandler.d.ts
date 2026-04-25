import { NextFunction, Request, Response } from "express";
import { CustomError } from "../utils/types";
declare const errorHandler: (err: CustomError, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export default errorHandler;
//# sourceMappingURL=errorHandler.d.ts.map