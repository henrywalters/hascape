import { EntityData } from "hagamets/dist/ecs/interfaces/entity.js";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Prefab {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column('varchar')
    name: string;

    @Column('json')
    data: EntityData;
}