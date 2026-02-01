import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";
import { IStats } from "@hascape/common";

@Entity()
export class Player implements IStats {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @OneToOne(() => User)
    @JoinColumn()
    user: User;

    @Column({type: "float"})
    x: number;

    @Column({type: "float"})
    y: number;

    @Column({type: "int"})
    health: number = 10;

    @Column({type: "int"})
    strength: number = 1;

    @Column({type: "int"})
    dexterity: number = 1;

    @Column({type: "int"})
    constitution: number = 1;

    @Column({type: "int"})
    charisma: number = 1;

    @Column({type: "int"})
    wisdom: number = 1;

    @Column({type: "int"})
    intelligence: number = 1;
}