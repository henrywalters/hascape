import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";

@Entity()
export class InventoryItem {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({type: 'varchar'})
    item: string;

    @Column({type: "varchar"})
    instanceId: string;

    @ManyToOne(() => User, user => user.inventoryItems)
    user: User;

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

    @ManyToOne(() => User, user => user.bankItems)
    user: User;

    @Column({type: "int"})
    quantity: number;

    @Column({type: "int"})
    position: number;
}