// Middlewae to check if user is authorized

import { MiddlewareFn } from "type-graphql";
import { verify } from "jsonwebtoken";
import { MyContext } from "./MyContext";

// Middleware to set up protected routes

export const isAuth: MiddlewareFn<MyContext> = ( {context}, next) => {
    const authorization = context.req.headers['authorization'];
    const authErrorMessage = "User not authenticated!";

    // Throw error if authorization header not included in request
    if (!authorization) {
        throw new Error(authErrorMessage)
    }

    // Split token to get user authentication key
    try {
        const token = authorization.split(" ")[1];
        const payload = verify(token, process.env.ACCESS_TOKEN_SECRET!);
        context.payload = payload as any; // can be of any type
    }
    catch(err) {
        console.log(err);
        throw new Error(authErrorMessage);
    }

    return next();
}