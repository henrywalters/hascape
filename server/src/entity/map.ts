import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { NPCSpawner } from "./npc";
import { IMap, IMapTile } from "@hascape/common";

@Entity()
export class MapTile implements IMapTile{
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column("int")
    x: number;

    @Column("int")
    y: number;

    @Column('varchar')
    tileType: string;

    @ManyToOne(() => Map, map => map.tiles)
    map: Map;
}

@Entity()
export class Map implements IMap {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column('varchar')
    name: string;

    @Column('boolean', {default: false})
    defaultMap: boolean;

    @OneToMany(() => MapTile, tile => tile.map, { cascade: true })
    tiles: MapTile[];

    @Column("int")
    playerSpawnX: number;

    @Column("int")
    playerSpawnY: number;

    @OneToMany(() => NPCSpawner, spawner => spawner.map)
    npcSpawners: NPCSpawner[];
}