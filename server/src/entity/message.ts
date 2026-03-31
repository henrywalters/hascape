import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Player } from "./player";

@Entity()
export class Message {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @CreateDateColumn()
    createdOn: Date;

    @ManyToOne(() => Player)
    player: Player;

    @ManyToOne(() => Player, {nullable: true})
    sentTo?: Player;

    @Column({type: 'varchar'})
    message: string;
}