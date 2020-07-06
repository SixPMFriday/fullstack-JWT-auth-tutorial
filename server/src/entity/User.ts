import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from "typeorm";
import { ObjectType, Field, Int } from "type-graphql";

@ObjectType()    // Allows creation as object
@Entity("users") // name of table in db
export class User extends BaseEntity {  // enstends because we are using active record pattern

    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column("text")
    email: string;

    // No field since we dont want to expose the hashed password
    @Column("text")
    password: string;

    @Column("int", {default: 0})
    tokenVersion: number;
}
