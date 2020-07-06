import "dotenv/config";
import "reflect-metadata";
import express from 'express';
import {ApolloServer} from 'apollo-server-express';
import { buildSchema } from "type-graphql";     // Takes resolvers and creates graphQL schema
import { UserResolver } from "./UserResolver";
import { createConnection } from "typeorm";


//import {User} from "./entity/User";

// Lambda expression, marked to allow asynchronous operations, calls itself
// Has logic to start stuff, getc allex when app starts
(async () => {
    const app = express();
    
    // _req is underscored bc it isn't necessary, could exclude and this would still work
    app.get("/", (_req, res) => res.send("Hello kiddo"));


    await createConnection();

    // Defines GraphQl schema (with a string)
    const apolloServer = new ApolloServer({
        // Use await because it's an async function
        schema: await buildSchema({
            // Pass in array of resolvers
            resolvers: [UserResolver]
        }),
        context: ({req, res}) => ({req, res})
    });

    // Adds GraphQl to express server
    apolloServer.applyMiddleware({ app });

    app.listen(4000, () => {
        console.log("express server started");
    });
})();

// createConnection().then(async connection => {

//     console.log("Inserting a new user into the database...");
//     const user = new User();
//     user.firstName = "Timber";
//     user.lastName = "Saw";
//     user.age = 25;
//     await connection.manager.save(user);
//     console.log("Saved a new user with id: " + user.id);

//     console.log("Loading users from the database...");
//     const users = await connection.manager.find(User);
//     console.log("Loaded users: ", users);

//     console.log("Here you can setup and run express/koa/any other framework.");

// }).catch(error => console.log(error));
