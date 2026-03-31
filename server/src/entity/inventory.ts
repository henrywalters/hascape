import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";
import { Player } from "./player";

@Entity()
export class InventoryItem {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({type: 'varchar'})
    item: string;

    @Column({type: "varchar"})
    instanceId: string;

    @ManyToOne(() => Player, player => player.inventoryItems)
    player: Player;

    @Column({type: "int"})
    quantity: number;

    @Column({type: "int"})
    position: number;
}

@Entity()
export class BankItem {

    @PrimaryGeneratedColumn("uuid")
    id: string; 

    @Column({type: 'varchar'})
    item: string;

    @ManyToOne(() => Player, player => player.bankItems)
    player: Player;

    @Column({type: "int"})
    quantity: number;

    @Column({type: "int"})
    position: number;
}