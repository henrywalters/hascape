import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";

@Entity()
export class Session {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => User)
    user: User;

    @Column('varchar')
    sessionId: string;

    @CreateDateColumn()
    startedOn: Date;

    @Column({type: Date, nullable: true})
    endedOn?: Date;
}