import PF from "pathfinding";
import { Vector2, Vector3 } from "three";
import { State } from "./state";
import { Random } from "hcore/dist/random";
import { CELL_SIZE } from "@hascape/common";

export class Pathfinding {
    private grid: PF.Grid;
    private finder: PF.AStarFinder = new PF.AStarFinder({
        allowDiagonal: true,
        dontCrossCorners: true,
    });

    private minCell: Vector2;
    private maxCell: Vector2;

    constructor() {

        this.minCell = new Vector2();
        this.maxCell = new Vector2();

        State.walls.forEach((pos, _, idx) => {
            if (pos.x < this.minCell.x) this.minCell.setX(pos.x);
            if (pos.y < this.minCell.y) this.minCell.setY(pos.y);
            if (pos.x > this.maxCell.x) this.maxCell.setX(pos.x);
            if (pos.y > this.maxCell.y) this.maxCell.setY(pos.y);
        });

        this.grid = new PF.Grid(this.maxCell.x - this.minCell.x + 1, this.maxCell.y - this.minCell.y + 1);

        State.walls.forEach((pos, _, idx) => {
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
            if (!State.walls.has(new Vector2(randomCell.x + this.minCell.x, randomCell.y + this.minCell.y) as any)) {
                return randomCell;
            }
        }
        return new Vector2();
    }

    public getRandomPath(start: Vector3, spawnPoint: Vector3, maxWander: number, targetPosition?: Vector3) {
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

            //console.log(startCell.x - this.minCell.x, startCell.y - this.minCell.y, randomCell.x, randomCell.y);

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
}