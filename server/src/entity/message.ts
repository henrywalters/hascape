import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";

@Entity()
export class Message {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @CreateDateColumn()
    createdOn: Date;

    @ManyToOne(() => User)
    user: User;

    @ManyToOne(() => User, {nullable: true})
    sentTo?: User;

    @Column({type: 'varchar'})
    message: string;
}