import {
    Resolver, 
    Query, 
    Mutation, 
    Arg, 
    ObjectType, 
    Field, 
    Ctx, 
    UseMiddleware,
    Int
} from 'type-graphql';
import { hash, compare } from 'bcryptjs'; // , hashSync, compareSync
import { User } from './entity/User';
import { MyContext } from './MyContext';
import { createRefreshToken, createAccessToken } from './auth';
import { isAuth } from "./isAuth";
import { sendRefreshToken } from "./sendRefreshToken";
import { getConnection } from "typeorm";
import { verify } from "jsonwebtoken";

@ObjectType()
class LoginResponse {
    @Field()
    accessToken: string;

    @Field(() => User)
    user: User;
}

// Create GraphQL schema inside here
// Tell typeGraphQL both our GraphQL types and TypeScript Types, will check both for us
@Resolver()
export class UserResolver {
    // Queryies return data from the databse
    // Mark query with which type it returns
    @Query(() => String)
    hello() {
        return "hi!";
    }

    // Protected route
    @Query(() => String)
    @UseMiddleware(isAuth)
    bye (@Ctx() { payload }: MyContext) {
        console.log(payload);
        return `your user id is: ${payload!.userId}`;
    }

    // Query all users in database, returns array of users
    @Query(() => [User])
    users() {
        return User.find();
    }

    // Queries info about specific user, must be logged in
    @Query(() => User, { nullable: true })
    me(@Ctx() context: MyContext) {
        const authorization = context.req.headers["authorization"];

        if (!authorization) {
            return null;
        }

        try {
            const token = authorization.split(" ")[1];
            const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);
            return User.findOne(payload.userId);
        }
        catch (err) {
            console.log(err);
            return null;
        }
    }


    
    // Mutatuions are what you create when you want to update/change something
    // in the database

    @Mutation(() => Boolean)
    async logout(@Ctx() { res }: MyContext) {
        sendRefreshToken(res, "");
        return true;
    }

    @Mutation(() => Boolean)
    async revokeRefreshTokensForUser(@Arg("userId", ()=>Int) userId: number) {
        await getConnection()
            .getRepository(User)
            .increment({id: userId}, "tokenVersion", 1);
        
        return true;
    }

    @Mutation(() => LoginResponse)
    async login(
        @Arg('email') email: string,
        @Arg('password') password: string,
        @Ctx() { res }: MyContext // provides access to context
    ): Promise<LoginResponse> {
        // Confirm user exists where email =s email
        const user = await User.findOne({ where: { email } });

        if (!user) {
            throw new Error("Couldn't find user!");
        }

        // Confirm password is correct
        const valid = await compare(password, user.password);

        if (!valid) {
            throw new Error("Incorrect password!");
        }

        // Login successful, so give them the access tokens
        sendRefreshToken(res, createRefreshToken(user));

        return {
            // Stores user data, if we want other user info, can add that here too.
            accessToken: createAccessToken(user),
            user
        };
    }
    
    // Register user
    @Mutation(() => Boolean)
    async register(
        // GraphQL name of the argument, email is variable name, string is ts type
        @Arg('email', () => String) email: string,
        @Arg('password') password: string,
    ) {
        // Hash and salt password
        const hashedPassword = await hash(password, 14);
        
        try {
            await User.insert({
                email,
                password: hashedPassword
            });      
        }
        catch (err) {
            console.log(err);
            return false;
        }
        return true;
    }

}
