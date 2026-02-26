import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { BankItem, InventoryItem } from "./inventory";

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column('varchar')
    userId: string;

    @CreateDateColumn()
    createdOn: Date;

    @Column('varchar')
    username: string;

    @OneToMany(() => InventoryItem, item => item.user)
    inventoryItems: InventoryItem[];

    @OneToMany(() => BankItem, item => item.user)
    bankItems: BankItem[];
}