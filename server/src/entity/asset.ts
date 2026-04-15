import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { AssetType, IAsset } from "@hascape/common";

@Entity()
export class Asset implements IAsset {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({type: "varchar"})
    name: string;

    @Column({type: "enum", enum: AssetType})
    type: AssetType;

    @Column({type: "varchar"})
    url: string; 
}