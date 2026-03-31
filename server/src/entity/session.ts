import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Player } from "./player";

@Entity()
export class Session {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Player)
    player: Player;

    @Column('varchar')
    sessionId: string;

    @CreateDateColumn()
    startedOn: Date;

    @Column({type: Date, nullable: true})
    endedOn?: Date;
}