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

    @ManyToOne(() => GameMap, map => map.tiles)
    map: GameMap;
}

@Entity()
export class GameMap implements IMap {
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