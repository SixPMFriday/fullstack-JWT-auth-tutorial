import { Request, Response } from "express";

export interface MyContext {
    req: Request;
    res: Response;
    payload?: { userId: string };   // optional payload will be there if user is logged-in
}