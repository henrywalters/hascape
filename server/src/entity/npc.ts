import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import {INPC} from "@hascape/common";

@Entity()
export class NPC {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({type: "varchar"})
    sessionId: string;

    @Column({type: "varchar"})
    type: string;

    @Column({type: "float"})
    x: number;

    @Column({type: "float"})
    y: number;

    @Column({type: "int"})
    health: number;
}