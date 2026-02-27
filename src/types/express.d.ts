import { IUser } from "model/user.model.ts";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
    interface Response {
      cookie(name: string, value: string, options?: any): this;
    }
  }
}
