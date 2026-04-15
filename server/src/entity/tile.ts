import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Asset } from "./asset";
import { ITile } from "@hascape/common";

@Entity()
export class Tile implements ITile {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column('varchar')
    name: string;

    @Column("boolean")
    isWall: boolean;

    @OneToOne(() => Asset, {nullable: true})
    @JoinColumn()
    texture?: Asset;

    @Column('varchar', {nullable: true})
    color?: string;
}