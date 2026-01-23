import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

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
}