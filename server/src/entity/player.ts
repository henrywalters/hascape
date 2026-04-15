import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne } from "typeorm";
import { User } from "./user";
import {IPlayer, IStats } from "@hascape/common";
import { BankItem, InventoryItem } from "./inventory";

@Entity()
export class Player implements IPlayer {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => User, user => user.players)
    user: User;

    @Column('varchar')
    username: string;

    @OneToMany(() => InventoryItem, item => item.player)
    inventoryItems: InventoryItem[];

    @OneToMany(() => BankItem, item => item.player)
    bankItems: BankItem[];

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

    @Column('varchar', {default: ''})
    map: string;
}