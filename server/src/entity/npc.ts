import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import {INPC} from "@hascape/common";
import { Prefab } from "./prefab";
import { GameMap } from "./map";

@Entity()
export class NPC {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({type: "varchar"})
    sessionId: string;

    @Column({type: "varchar"})
    type: string;

    @Column({type: "float"})
    x: number;

    @Column({type: "float"})
    y: number;

    @Column({type: "int"})
    health: number;
}

@Entity()
export class NPCDefinition {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column('varchar')
    name: string;

    @Column('varchar')
    displayName: string;

    @Column('boolean')
    canAttack: boolean;

    @ManyToOne(() => Prefab)
    prefab: Prefab;

    @Column('int')
    health: number;

    @Column('float')
    speed: number;

    @Column('float')
    maxWanderDistance: number;
}

@Entity()
export class NPCSpawner {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @OneToOne(() => NPCDefinition)
    @JoinColumn()
    npc: NPCDefinition;

    @Column('int')
    maxSpawn: number;

    @Column('float')
    minRadius: number;

    @Column('float')
    maxRadius: number;

    @Column('float')
    minDelay: number;

    @Column('float') 
    maxDelay: number;

    @Column('int')
    x: number;

    @Column('int')
    y: number;

    @ManyToOne(() => GameMap, map => map.npcSpawners)
    map: GameMap;
}