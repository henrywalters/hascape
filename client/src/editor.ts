import { CameraPan, CameraZoom, OrthographicCamera } from "hagamets/dist/common/components/camera.js";
import { GridDisplay } from "hagamets/dist/common/components/grid.js";
import { MeshPrimitive, MeshPrimitiveType } from "hagamets/dist/common/components/mesh.js";
import { Transform } from "hagamets/dist/common/components/transform.js";
import { RenderScene } from "hagamets/dist/common/scenes/renderScene.js";
import { CameraControllers } from "hagamets/dist/common/systems/cameraControllers.js";
import { Renderer } from "hagamets/dist/common/systems/renderer.js";
import { Game } from "hagamets/dist/core/game.js";
import { Axes, Buttons } from "hagamets/dist/core/interfaces/input.js";
import { IManifest } from "hagamets/dist/core/interfaces/manifest.js";
import { EntityData, IEntity } from "hagamets/dist/ecs/interfaces/entity.js";
import { Color, Plane, Raycaster, Vector3, Vector2} from "three";
import { CELL_SIZE, CHUNK_SIZE, WORLD_SIZE, CHUNKS, CELLS, NPCSpawner, ITile, MapDTO } from "@hascape/common";
import { Tilemap } from "hagamets/dist/common/components/tilemap.js";
import { deserialize, Param, Reflection, serialize, Types } from "hagamets/dist/core/reflection.js";
import { loadFromFile, saveToFile } from "hagamets/dist/utils/file.js";
import { ShoelaceHTMLGenerator } from "hagamets/dist/html/shoelace.js";
import { SelectOption } from "hagamets/dist/html/interfaces/html.js";
import { makeEnumInput, makeInput } from "hagamets/dist/editor/inputs.js";
import { GridMap } from "hagamets/dist/utils/gridMap.js";
import { ComponentData } from "hagamets/dist/ecs/interfaces/component.js";
import { deserializeComponent, serializeComponent } from "hagamets/dist/core/serialization.js";
import { Debug } from "hagamets/dist/core/debug.js";
import { AABB, bresenham } from "hagamets/dist/utils/math.js";
import { Grid } from "hagamets/dist/utils/grid.js";
import { UI } from "hagamets/dist/common/systems/ui.js";
import { Text } from "hagamets/dist/common/components/ui/text.js";
import { AnchorAlignment } from "hagamets/dist/common/components/ui/alignment.js";
import Font from './assets/fonts/RuneScape_Regular.json';
import { FontData } from "three/examples/jsm/Addons.js";
import { Assets } from "hagamets/dist/core/assets.js";

export enum ToolType {
    TilePlace,
    TileFill,
    SpawnPlace,
    NPCSpawner,
}

export interface ToolTypeOption {
    type: ToolType;
    label: string;
}

export const TOOL_TYPES: ToolTypeOption[] = [
    {
        type: ToolType.TilePlace,
        label: "Place Tile",
    },
    {
        type: ToolType.TileFill,
        label: "Fill Tile",
    },
    {
        type: ToolType.SpawnPlace,
        label: "Set Player Spawn",
    }
]

export class EditorRuntime extends RenderScene {

    private cursor: IEntity;
    private camera: OrthographicCamera;
    private cellGrid: GridDisplay;
    private chunkGrid: GridDisplay;
    private tool: ToolType = ToolType.TilePlace;
    private tile: string | null = null;

    private grid: Grid;

    private playerSpawn: IEntity;

    private radius: number = 1;

    private tiles: Map<string, ITile> = new Map();
    private gridTiles: Map<string, GridMap<void>> = new Map();
    private gridTileRenderers: Map<string, Tilemap> = new Map();

    private currentSpawner: IEntity | null = null;

    private npcSpawns: GridMap<IEntity> = new GridMap();

    private cellLabel: IEntity;

    private lastCell: Vector2 | null;

    public setTool(tool: ToolType) {
        this.tool = tool;
    }

    public setTile(tile: string | null) {
        this.tile = tile;
    }

    public setRadius(radius: number) {
        if (radius < 1 || radius > 16) {
            console.error("Radius must be greater than or equal to 1 and less than 16")
            return;
        }

        if (this.radius !== radius) {
            this.radius = radius;
            const mesh = this.cursor.getComponent(MeshPrimitive)!;
            mesh.width = CELL_SIZE * ((this.radius - 1) * 2 + 1);
            mesh.height = CELL_SIZE * ((this.radius - 1) * 2 + 1);
            mesh.notifyUpdate();
        }
    }

    public async setTiles(tiles: ITile[]) {

        for (const [tile, tilemap] of this.gridTileRenderers) {
            this.removeEntity(tilemap.entity);
        }

        this.gridTileRenderers.clear();

        this.tiles.clear();
        for (const tile of tiles) {
            this.tiles.set(tile.name, tile);
        }

        let index = 1;

        const existing = new Set<string>();

        const addTileMap = (name: string, color?: string, texture?: string) => {
            const tileEntity = this.addEntity();
            tileEntity.addComponent(Transform);
            tileEntity.transform.position.z = index;
            index++;
            const tilemap = tileEntity.addComponent(Tilemap);
            tilemap.grid.size.set(WORLD_SIZE, WORLD_SIZE);
            tilemap.grid.cells.set(WORLD_SIZE / CELL_SIZE, WORLD_SIZE / CELL_SIZE);
            
            if (texture) {
                tilemap.texture = texture;
            } else if (color) {
                tilemap.color = new Color(color) as any;
            }
            
            tilemap.notifyUpdate();
            this.gridTileRenderers.set(name, tilemap);
        }

        for (const [tile, grid] of this.gridTiles) {
            console.log(tile);
            existing.add(tile);
            if (this.tiles.has(tile)) {
                addTileMap(tile, this.tiles.get(tile)!.color, this.tiles.get(tile)!.texture?.name);
            } else {
                addTileMap(tile, 'pink', 'missing');
            }
            grid.forEach((cell) => {
                this.gridTileRenderers.get(tile)!.gridMap.set(cell as any);
                this.gridTileRenderers.get(tile)!.notifyUpdate();
            });
        }

        for (const tile of tiles) {
            
            if (tile.texture) {
                console.log(`Loading Texture: ${tile.texture.name}`);
                await Assets.loadTexture({
                    name: tile.texture.name,
                    url: tile.texture.url,
                })
            }

            if (!existing.has(tile.name)) {
                this.gridTiles.set(tile.name, new GridMap<void>());
                addTileMap(tile.name, tile.color, tile.texture ? tile.texture.name : void 0);
            }
        }

        console.log(this.gridTileRenderers);
    }

    onActivate() {

        let index = 10;

        this.grid = new Grid();
        this.grid.cells.set(WORLD_SIZE / CELL_SIZE, WORLD_SIZE / CELL_SIZE);
        this.grid.size.set(WORLD_SIZE, WORLD_SIZE);

        // for (const tile of TILES) {
        //     const tileEntity = this.addEntity();
        //     tileEntity.addComponent(Transform);
        //     tileEntity.transform.position.z = index;
        //     index++;
        //     const tiles = tileEntity.addComponent(Tilemap);
        //     tiles.grid.size.set(WORLD_SIZE, WORLD_SIZE);
        //     tiles.grid.cells.set(WORLD_SIZE / CELL_SIZE, WORLD_SIZE / CELL_SIZE);
        //     tiles.color = tile.color as any;
        //     tiles.notifyUpdate();
        //     this.tiles.set(tile.type, tiles);
        // }

        const cameraEntity = this.addEntity("Camera");
        cameraEntity.addComponent(Transform);
        cameraEntity.transform.position.z = 1000;
        this.camera = cameraEntity.addComponent(OrthographicCamera);
        cameraEntity.addComponent(CameraPan);
        const zoom = cameraEntity.addComponent(CameraZoom);
        zoom.minZoom = 0.1;

        this.cursor = this.addEntity();
        this.cursor.addComponent(Transform);
        this.cursor.transform.position.z = index;
        index++;
        const mesh = this.cursor.addComponent(MeshPrimitive);
        mesh.color = new Color('blue') as any;
        mesh.type = MeshPrimitiveType.Plane;
        mesh.width = CELL_SIZE;
        mesh.height = CELL_SIZE;
        mesh.opacity = 0.50;
        mesh.notifyUpdate();

        this.playerSpawn = this.addEntity();
        this.playerSpawn.addComponent(Transform);
        const spawnPos = this.grid.getCellPos(new Vector2(0, 0) as any);
        this.playerSpawn.transform.position.z = index++;
        this.playerSpawn.transform.position.x = spawnPos.x;
        this.playerSpawn.transform.position.y = spawnPos.y;
        const playerMesh = this.playerSpawn.addComponent(MeshPrimitive);

        playerMesh.texture = "player_spawn";
        playerMesh.width = CELL_SIZE;
        playerMesh.height = CELL_SIZE;
        playerMesh.type = MeshPrimitiveType.Plane;
        playerMesh.notifyUpdate();


        const gridEntity = this.addEntity();
        gridEntity.addComponent(Transform);
        gridEntity.transform.position.z = index++;
        this.cellGrid = gridEntity.addComponent(GridDisplay);
        this.cellGrid.grid.size.set(CHUNK_SIZE, CHUNK_SIZE);
        this.cellGrid.grid.cells.set(CELLS, CELLS);
        this.cellGrid.opacity = 0.50;
        this.cellGrid.notifyUpdate();

        const chunkGridEntity = this.addEntity()
        chunkGridEntity.addComponent(Transform);
        this.chunkGrid = chunkGridEntity.addComponent(GridDisplay);
        this.chunkGrid.grid.size.set(WORLD_SIZE, WORLD_SIZE);
        this.chunkGrid.grid.cells.set(CHUNKS, CHUNKS);
        this.chunkGrid.lineThickness = new Vector2(5, 5) as any;
        this.chunkGrid.color = new Color('gray') as any;
        this.chunkGrid.notifyUpdate();
        chunkGridEntity.transform.position.set(CHUNK_SIZE * -0.5, CHUNK_SIZE * -0.5, index++);

        this.cellLabel = this.addEntity();
        this.cellLabel.addComponent(Transform);
        const text = this.cellLabel.addComponent(Text);
        text.font = 'runescape';
        text.text = '(0, 0)';
        text.anchorAlignment = AnchorAlignment.TopRight;
        text.margin = new Vector2(30, 30) as any;
        text.color = new Color('red') as any;
    }

    addSpawner(pos: Vector3, data?: ComponentData) {
        const spawnerEntity = this.addEntity();
        spawnerEntity.addComponent(Transform);
        spawnerEntity.transform.position = pos as any;
        spawnerEntity.transform.position.z = 100;
        const mesh = spawnerEntity.addComponent(MeshPrimitive);
        mesh.width = CELL_SIZE;
        mesh.height = CELL_SIZE;
        mesh.type = MeshPrimitiveType.Plane;
        mesh.texture = "npc_spawn";
        mesh.notifyUpdate();

        if (data) {
            deserializeComponent(this, spawnerEntity, data);
        } else {
            spawnerEntity.addComponent(NPCSpawner);
        }

        return spawnerEntity;
    }

    onUpdate(dt: number) {

        this.updateCursor();

        const worldPos = this.camera.getMousePos();

        const currentCell = this.grid.getCellIndex(worldPos as any);
        const cellPos = this.grid.getCellPos(currentCell);

        this.cursor.transform.position.setX(cellPos.x);
        this.cursor.transform.position.setY(cellPos.y);

        const chunk = this.chunkGrid.grid.getCellIndex(worldPos as any, this.chunkGrid.entity.position);
        const chunkPos = this.chunkGrid.grid.getCellPos(chunk, this.chunkGrid.entity.position);

        this.cellGrid.entity.transform.position = chunkPos;

        this.camera.entity.getComponent(CameraPan)!.speed = CHUNK_SIZE / 2 / this.camera.zoom;

        this.cellGrid.lineThickness.set(1 / this.camera.zoom, 1 / this.camera.zoom);
        this.cellGrid.notifyUpdate();

        this.chunkGrid.lineThickness.set(4 / this.camera.zoom, 4 / this.camera.zoom);
        this.chunkGrid.notifyUpdate();

        // const tiles = this.tiles.get(this.ui.type)!

        const cellLabel = `(${currentCell.x}, ${currentCell.y})`;

        const text = this.cellLabel.getComponent(Text)!;

        if (text.text !== cellLabel) {
            text.text = cellLabel;
            text.notifyUpdate();
        }

        if (this.currentSpawner) {
            const pos = this.currentSpawner.position;
            Debug.DrawAABB(new AABB(new Vector2(pos.x - CELL_SIZE / 2, pos.y - CELL_SIZE / 2) as any, new Vector2(pos.x + CELL_SIZE / 2, pos.y + CELL_SIZE / 2) as any), new Color('yellow') as any, 3);
        }

        let cells: Vector2[];
        let cellSet = new Set<Vector2>();

        if (!this.lastCell || this.lastCell.equals(currentCell)) {
            cells = [currentCell as any];
        } else {
            cells = bresenham(this.lastCell as any, currentCell) as any;
        }

        this.lastCell = currentCell as any;

        if (this.game.input.getButton(Buttons.MouseLeft)) {

            if (this.tool === ToolType.SpawnPlace) {
                this.playerSpawn.transform.position = cellPos;
                this.playerSpawn.transform.position.z = 10;
            }

            if (this.tool === ToolType.TilePlace) {
                for (const cell of cells) {
                    this.drawTile(cell as any);
                }
            }

            if (this.tool === ToolType.TileFill) {
                // this.floodFill(cell as any, this.tile);
            }

            if (this.tool === ToolType.NPCSpawner) {
                if (!this.npcSpawns.has(currentCell)) {
                    this.npcSpawns.set(currentCell, this.addSpawner(cellPos as any));
                }

                const spawnerEntity = this.npcSpawns.get(currentCell)!;

                if (!this.currentSpawner || spawnerEntity.id !== this.currentSpawner.id) {
                    this.currentSpawner = spawnerEntity;
                    const spawner = spawnerEntity.getComponent(NPCSpawner)!;

                    // this.npcSpawnUI.innerHTML = "";

                    // for (const [key, param] of Reflection.getParams(spawner)) {
                    //     this.npcSpawnUI.appendChild(makeInput(this, spawner, key, param, (value) => {
                    //         spawner.notifyUpdate();
                    //     }));
                    // }
                    // this.sidebar.style.display = "block";
                    // this.npcSpawnUI.style.display = "block";
                }


            }
        }

        if (this.game.input.getButton(Buttons.MouseRight)) {
            if (this.tool === ToolType.TilePlace) {
                for (const cell of cells) {
                    this.removeTile(cell);
                }
            }

            if (this.tool === ToolType.NPCSpawner && this.npcSpawns.has(currentCell)) {
                this.removeEntity(this.npcSpawns.get(currentCell)!);
                this.npcSpawns.remove(currentCell);
                this.currentSpawner = null;
            }
        }

        this.playerSpawn.getComponent(MeshPrimitive)!.notifyUpdate();
    }

    updateCursor() {
        const mesh = this.cursor.getComponent(MeshPrimitive)!;

        if (this.tool === ToolType.TilePlace || this.tool === ToolType.TileFill) {
            // mesh.color = this.tiles.get(this.ui.type)!.color;
            mesh.texture = "";
        } else if (this.tool === ToolType.SpawnPlace) {
            mesh.texture = "player_spawn";
        } else if (this.tool === ToolType.NPCSpawner) {
            mesh.texture = "npc_spawn";
        }

        mesh.notifyUpdate();
    }

    private iterateRadius(cell: Vector2, fn: (newCell: Vector2) => void) {
        for (let i = -this.radius + 1; i < this.radius; i++) {
            for (let j = -this.radius + 1; j < this.radius; j++) {
                fn(new Vector2(cell.x + i, cell.y + j));
            }
        }
    }

    private addTile(cell: Vector2, tile: string) {
        let canPlace = true;
        for (const [key, gridTiles] of this.gridTiles) {
            if (gridTiles.has(cell as any)) {
                canPlace = false;
                break;
            }
        }

        if (canPlace) {
            this.gridTiles.get(tile)!.set(cell as any);
            this.gridTileRenderers.get(tile)!.gridMap.set(cell as any);
            this.gridTileRenderers.get(tile)!.notifyUpdate();
        }
    }

    private drawTile(placeTo: Vector2, tile?: string) {
        if (!tile) {
            if (!this.tile) {
                console.warn("Tile not set");
                return;
            }
            tile = this.tile;
        }

        this.iterateRadius(placeTo, (cell) => {
            this.addTile(cell, tile);
        })
    }

    private removeTile(removeAt: Vector2) {
        this.iterateRadius(removeAt, (cell) => {
            for (const [tile, gridTiles] of this.gridTiles) {
                if (gridTiles.has(cell as any)) {
                    gridTiles.remove(cell as any);
                    this.gridTileRenderers.get(tile)!.gridMap.remove(cell as any);
                    this.gridTileRenderers.get(tile)!.notifyUpdate();
                }
            }
        })

    }

    // private floodFill(startCell: Vector2, targetTiles: Tilemap) {
    //     // Don't fill if the start cell is already occupied by any tile type
    //     for (const [, gridTiles] of this.tiles) {
    //         if (gridTiles.gridMap.has(startCell as any)) return;
    //     }

    //     const visited = new GridMap<void>();
    //     const queue: Vector2[] = [startCell];

    //     // Bounds derived from your grid dimensions
    //     const maxCells = WORLD_SIZE / CELL_SIZE;

    //     while (queue.length > 0) {
    //         const current = queue.shift()!;

    //         if (visited.has(current as any)) continue;
    //         visited.set(current as any);

    //         // Skip if any tile already occupies this cell
    //         let occupied = false;
    //         for (const [, gridTiles] of this.tiles) {
    //             if (gridTiles.gridMap.has(current as any)) {
    //                 occupied = true;
    //                 break;
    //             }
    //         }
    //         if (occupied) continue;

    //         // Place the tile
    //         targetTiles.gridMap.set(current as any);

    //         // Enqueue 4-directional neighbors
    //         queue.push(new Vector2(current.x + 1, current.y));
    //         queue.push(new Vector2(current.x - 1, current.y));
    //         queue.push(new Vector2(current.x, current.y + 1));
    //         queue.push(new Vector2(current.x, current.y - 1));
    //     }

    //     targetTiles.notifyUpdate();
    // }

    public clearMap() {
        for (const [key, tilemap] of this.gridTileRenderers) {
            tilemap.gridMap.clear();
            tilemap.notifyUpdate();
        }
        const spawnPos = this.grid.getCellPos(new Vector2(0, 0) as any);
        this.playerSpawn.transform.position.x = spawnPos.x;
        this.playerSpawn.transform.position.y = spawnPos.y;
        for (const [type, tileMap] of this.gridTiles) {
            tileMap.clear();
        }

    }

    public loadMap(data: MapDTO) {

        this.clearMap();

        const spawnPos = this.grid.getCellPos(new Vector2(data.playerSpawnX, data.playerSpawnY) as any);

        this.playerSpawn.transform.position.x = spawnPos.x;
        this.playerSpawn.transform.position.y = spawnPos.y;

        for (const tile of data.tiles) {
            this.addTile(new Vector2(tile.x, tile.y) as any, tile.tileType);
        }

        this.npcSpawns.forEach((cell, entity, idx) => {
            this.removeEntity(entity);
        });
        this.npcSpawns.clear();

        // for (const spawner of data.npc_spawners) {
        //     const cell = new Vector2(spawner.cell[0], spawner.cell[1]);
        //     const pos = this.grid.getCellPos(cell as any);
        //     this.npcSpawns.set(cell as any, this.addSpawner(pos as any, spawner.data));
        // }
    }

    public saveMap() {

        const spawnPos = this.grid.getCellIndex(this.playerSpawn.position);

        const data: MapDTO = {
            tiles: [],
            playerSpawnX: spawnPos.x,
            playerSpawnY: spawnPos.y,
            
        };

        for (const [type, tileMap] of this.gridTiles) {
            tileMap.forEach((pos) => {
                data.tiles.push({
                    tileType: type,
                    x: pos.x,
                    y: pos.y,
                })
            })
        }

        // this.npcSpawns.forEach((cell, entity, idx) => {
        //     const spawner = entity.getComponent(NPCSpawner)!;
        //     data.npc_spawners.push({
        //         cell: [cell.x, cell.y],
        //         data: serializeComponent(spawner),
        //     });
        // })

        return data;
    }


}

export const EditorManifest: IManifest = {
    systems: [
        Renderer,
        CameraControllers,
        UI,
    ],
    components: [
        NPCSpawner,
    ],
    scripts: [],
    scenes: {
        runtime: {
            data: {
                entities: []
            },
            ctr: EditorRuntime
        }
    },
    assets: {
        autoload: true,
        textures: [
            {
                name: "player_spawn",
                url: "https://hascape.sfo3.cdn.digitaloceanspaces.com/textures/player_spawn.png",
            },
            {
                name: "npc_spawn",
                url: "https://hascape.sfo3.cdn.digitaloceanspaces.com/textures/npc_spawn.png"
            },
            {
                name: "missing",
                url: "https://hascape.sfo3.cdn.digitaloceanspaces.com/textures/missing.png"
            }
        ],
        fonts: [
            {
                name: 'runescape',
                data: Font as unknown as FontData,
            }
        ]
    },
    startScene: "runtime"
}