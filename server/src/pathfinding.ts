import PF from "pathfinding";
import { Vector2, Vector3 } from "three";
import { State } from "./state";
import { Random } from "hcore/dist/random";
import { CELL_SIZE } from "@hascape/common";
import { bresenham } from "hagamets/dist/utils/math.js";
import { GridMap } from "hagamets/dist/utils/gridMap.js";

export class Pathfinding {
    private grid: PF.Grid;
    private finder: PF.AStarFinder = new PF.AStarFinder({
        allowDiagonal: true,
        dontCrossCorners: true,
    });

    private minCell: Vector2;
    private maxCell: Vector2;
    private walls: GridMap<void>;

    constructor(walls: GridMap<void>) {

        this.walls = walls;

        this.minCell = new Vector2();
        this.maxCell = new Vector2();

        walls.forEach((pos, _, idx) => {
            if (pos.x < this.minCell.x) this.minCell.setX(pos.x);
            if (pos.y < this.minCell.y) this.minCell.setY(pos.y);
            if (pos.x > this.maxCell.x) this.maxCell.setX(pos.x);
            if (pos.y > this.maxCell.y) this.maxCell.setY(pos.y);
        });

        this.grid = new PF.Grid(this.maxCell.x - this.minCell.x + 1, this.maxCell.y - this.minCell.y + 1);

        walls.forEach((pos, _, idx) => {
            this.grid.setWalkableAt(pos.x - this.minCell.x, pos.y - this.minCell.y, false);
        })
    }

    public getRandomCell(spawnCell: Vector2, maxWander: number) {
        let canAccess = false;
        while (!canAccess) {
            const wander = Math.floor(maxWander / CELL_SIZE);
            const x = Random.int(-wander, wander) - this.minCell.x;
            const y = Random.int(-wander, wander) - this.minCell.y;
            const randomCell = new Vector2(x, y);
            if (!this.walls.has(new Vector2(randomCell.x + this.minCell.x, randomCell.y + this.minCell.y) as any)) {
                return randomCell;
            }
        }
        return new Vector2();
    }

    public getRandomPath(start: Vector3, spawnPoint: Vector3, maxWander: number, targetPosition?: Vector3) {

        if (this.minCell.equals(this.maxCell)) return [];

        let path: number[][] = [];

        while (path.length === 0) {
            const spawnCell = State.grid.getCellIndex(spawnPoint as any);
            const startCell = State.grid.getCellIndex(start as any);

            let cell: Vector2;

            if (targetPosition) {
                cell = State.grid.getCellIndex(targetPosition as any) as any;
                cell.x -= this.minCell.x;
                cell.y -= this.minCell.y;
            } else {
                cell = this.getRandomCell(spawnCell as any, maxWander);
            }

            path = PF.Util.compressPath(this.finder.findPath(startCell.x - this.minCell.x, startCell.y - this.minCell.y, cell.x, cell.y, this.grid.clone()));
        }

        const worldPath = [];

        for (const el of path) {
            worldPath.push(State.grid.getCellPos(new Vector2(el[0] + this.minCell.x, el[1] + this.minCell.y) as any) as any);
        }

        return worldPath;
    }

    public getPath(start: Vector2, end: Vector2): Vector3[] | null {
        try {
            const path = PF.Util.compressPath(
                this.finder.findPath(
                    start.x - this.minCell.x, 
                    start.y - this.minCell.y, 
                    end.x - this.minCell.x, 
                    end.y - this.minCell.y, 
                    this.grid.clone()
                )
            );

            if (path.length === 0) return null;

            return path.map((cell) => {
                return State.grid.getCellPos(new Vector2(cell[0] + this.minCell.x, cell[1] + this.minCell.y) as any) as any;
            });
        } catch (e) {
            return null;
        }
    }

    // In the case where the end destination is not reachable, try and find the furthest path towards it.
    public getBestLegalPath(start: Vector2, end: Vector2): Vector3[] | null {

        const points = bresenham(start as any, end as any);

        for (let i = points.length - 1; i >= 0; i--) {
            const path = this.getPath(start, points[i] as any);
            if (path) return path;
        }

        return null;

        // let path = this.getPath(start, end);

        // if (path) return path;

        // const points = bresenham(start as any, end as any);

        // if (points.length < 1) return null;

        // // Can't even make it this far, bail out.
        // path = this.getPath(start, points[1] as any);

        // if (!path) return null;

        // let left = 1;
        // let right = points.length - 1;

        // while (left <= right) {
        //     let mid = Math.floor((left + right) / 2);


        // }
    }
}