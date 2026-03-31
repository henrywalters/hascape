import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { BankItem, InventoryItem } from "./inventory";
import { Player } from "./player";

export enum AuthLevel {
    Default = 'default',
    Admin = 'admin',
    SuperAdmin = 'super_admin',
}

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column('varchar')
    userId: string;

    @Column('varchar')
    email: string; 

    @CreateDateColumn()
    createdOn: Date;

    @OneToMany(() => Player, player => player.user)
    players: Player[];

    @Column({type: 'enum', enum: AuthLevel, default: AuthLevel.Default})
    authLevel: AuthLevel;
}