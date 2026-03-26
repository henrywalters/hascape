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
import { CELL_SIZE, CHUNK_SIZE, WORLD_SIZE, CHUNKS, CELLS, TileTypes, TILES, MapData, NPCSpawner, NPCSpawnerData, INPCSpawner } from "@hascape/common";
import { Tilemap } from "hagamets/dist/common/components/tilemap.js";
import { deserialize, Param, Reflection, serialize, Types } from "hagamets/dist/core/reflection.js";
import { loadFromFile, saveToFile } from "hagamets/dist/utils/file.js";
import { ShoelaceHTMLGenerator } from "hagamets/dist/html/shoelace.js";
import { SelectOption } from "hagamets/dist/html/interfaces/html.js";
import { makeEnumInput, makeInput } from "hagamets/dist/editor/inputs.js";
import { GridMap } from "hagamets/dist/utils/gridMap.js";
import { ComponentData } from "hagamets/dist/ecs/interfaces/component.js";
import { deserializeComponent, serializeComponent, serializeEntity } from "hagamets/dist/core/serialization.js";
import { Debug } from "hagamets/dist/core/debug.js";
import { AABB } from "hagamets/dist/utils/math.js";
import { Grid } from "hagamets/dist/utils/grid.js";
import { UI } from "hagamets/dist/common/systems/ui.js";
import { Text } from "hagamets/dist/common/components/ui/text.js";
import { AnchorAlignment } from "hagamets/dist/common/components/ui/alignment.js";
import Font from './assets/fonts/RuneScape_Regular.json';
import { IFontData } from "hagamets/dist/core/interfaces/assets.js";
import { FontData } from "three/examples/jsm/Addons.js";

export enum ToolTypes {
    TilePlace = 'Place_Tile',
    TileFill = 'Fill_Tile',
    SpawnPlace = 'Player_Spawn_Point',
    NPCSpawner = 'Place_NPC_Spawner',
}

export class EditorUI {

    @Param({type: Types.Enum, enum: ToolTypes})
    tool: ToolTypes = ToolTypes.TilePlace;

    @Param({type: Types.Enum, enum: TileTypes})
    type: TileTypes = TileTypes.Wall;
}

export class EditorRuntime extends RenderScene {

    private cursor: IEntity;
    private camera: OrthographicCamera;
    private cellGrid: GridDisplay;
    private chunkGrid: GridDisplay;
    public ui: EditorUI = new EditorUI();

    private grid: Grid;

    private playerSpawn: IEntity;

    private tiles: Map<TileTypes, Tilemap> = new Map();

    private generator = new ShoelaceHTMLGenerator();

    private menu: HTMLDivElement;
    private sidebar: HTMLDivElement;


    private currentSpawner: IEntity | null = null;
    private npcSpawnUI: HTMLDivElement;

    private npcSpawns: GridMap<IEntity> = new GridMap();

    private cellLabel: IEntity;

    onActivate() {

        console.log("Activated");

        let index = 1;

        this.grid = new Grid();
        this.grid.cells.set(WORLD_SIZE / CELL_SIZE, WORLD_SIZE / CELL_SIZE);
        this.grid.size.set(WORLD_SIZE, WORLD_SIZE);

        for (const tile of TILES) {
            const tileEntity = this.addEntity();
            tileEntity.addComponent(Transform);
            tileEntity.transform.position.z = index;
            index++;
            const tiles = tileEntity.addComponent(Tilemap);
            tiles.grid.size.set(WORLD_SIZE, WORLD_SIZE);
            tiles.grid.cells.set(WORLD_SIZE / CELL_SIZE, WORLD_SIZE / CELL_SIZE);
            tiles.color = tile.color as any;
            tiles.notifyUpdate();
            this.tiles.set(tile.type, tiles);
        }

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
        this.playerSpawn.transform.position.z = index++;
        const playerMesh = this.playerSpawn.addComponent(MeshPrimitive);

        playerMesh.texture = "player_spawn";
        playerMesh.width = CELL_SIZE;
        playerMesh.height = CELL_SIZE;
        playerMesh.type = MeshPrimitiveType.Plane;
        playerMesh.notifyUpdate();


        const gridEntity = this.addEntity();
        gridEntity.addComponent(Transform);
        gridEntity.transform.position.z = index++;
        console.log(gridEntity.position);
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
        chunkGridEntity.transform.position.set(CHUNK_SIZE * -0.5, CHUNK_SIZE * -0.5, 0);

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
            console.log(data);
            deserializeComponent(this, spawnerEntity, data);
        } else {
            spawnerEntity.addComponent(NPCSpawner);
        }

        return spawnerEntity;
    }

    onUpdate(dt: number) {

        this.updateCursor();

        console.log(this.game.input.getAxis(Axes.MousePosition));

        const worldPos = this.camera.getMousePos();

        const cell = this.grid.getCellIndex(worldPos as any);
        const cellPos = this.grid.getCellPos(cell);

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

        const tiles = this.tiles.get(this.ui.type)!

        const cellLabel = `(${cell.x}, ${cell.y})`;

        const text = this.cellLabel.getComponent(Text)!;

        if (text.text !== cellLabel) {
            text.text = cellLabel;
            text.notifyUpdate();
        }

        if (this.currentSpawner) {
            const pos = this.currentSpawner.position;
            Debug.DrawAABB(new AABB(new Vector2(pos.x - CELL_SIZE / 2, pos.y - CELL_SIZE / 2) as any, new Vector2(pos.x + CELL_SIZE / 2, pos.y + CELL_SIZE / 2) as any), new Color('yellow') as any, 3);
        }

        if (this.game.input.getButton(Buttons.MouseLeft)) {

            if (this.ui.tool === ToolTypes.SpawnPlace) {
                this.playerSpawn.transform.position = cellPos;
                this.playerSpawn.transform.position.z = 10;
            }

            if (this.ui.tool === ToolTypes.TilePlace) {
                let canPlace = true;
                for (const [key, gridTiles] of this.tiles) {
                    if (gridTiles.gridMap.has(cell)) {
                        canPlace = false;
                        break;
                    }
                }
                if (canPlace) {
                    tiles.gridMap.set(cell);
                    tiles.notifyUpdate();
                }
            }

            if (this.ui.tool === ToolTypes.TileFill) {
                this.floodFill(cell as any, this.tiles.get(this.ui.type)!);
            }

            if (this.ui.tool === ToolTypes.NPCSpawner) {
                if (!this.npcSpawns.has(cell)) {
                    this.npcSpawns.set(cell, this.addSpawner(cellPos as any));
                }

                const spawnerEntity = this.npcSpawns.get(cell)!;

                if (!this.currentSpawner || spawnerEntity.id !== this.currentSpawner.id) {
                    this.currentSpawner = spawnerEntity;
                    const spawner = spawnerEntity.getComponent(NPCSpawner)!;

                    this.npcSpawnUI.innerHTML = "";

                    for (const [key, param] of Reflection.getParams(spawner)) {
                        this.npcSpawnUI.appendChild(makeInput(this, spawner, key, param, (value) => {
                            spawner.notifyUpdate();
                            console.log(value);
                        }));
                    }
                    this.sidebar.style.display = "block";
                    this.npcSpawnUI.style.display = "block";
                }


            }
        }

        if (this.game.input.getButton(Buttons.MouseRight)) {
            if (this.ui.tool === ToolTypes.TilePlace) {
                for (const [key, gridTiles] of this.tiles) {
                    if (gridTiles.gridMap.has(cell)) {
                        gridTiles.gridMap.remove(cell);
                        gridTiles.notifyUpdate();
                    }
                }
            }

            if (this.ui.tool === ToolTypes.NPCSpawner && this.npcSpawns.has(cell)) {
                this.removeEntity(this.npcSpawns.get(cell)!);
                this.npcSpawns.remove(cell);
                this.currentSpawner = null;
            }
        }

        this.playerSpawn.getComponent(MeshPrimitive)!.notifyUpdate();
    }

    updateCursor() {
        const mesh = this.cursor.getComponent(MeshPrimitive)!;

        if (this.ui.tool === ToolTypes.TilePlace || this.ui.tool === ToolTypes.TileFill) {
            mesh.color = this.tiles.get(this.ui.type)!.color;
            mesh.texture = "";
        } else if (this.ui.tool === ToolTypes.SpawnPlace) {
            mesh.texture = "player_spawn";
        } else if (this.ui.tool === ToolTypes.NPCSpawner) {
            mesh.texture = "npc_spawn";
        }

        mesh.notifyUpdate();
    }

    public async loadMap() {
        const data: MapData = await loadFromFile();
        
        this.playerSpawn.transform.position = deserialize({type: Types.Vector3}, data.player_spawn);

        for (const [type, tileMap] of this.tiles) {

            tileMap.gridMap.clear();

            for (const cell of data.tiles[type]) {
                tileMap.gridMap.set(deserialize({type: Types.Vector2}, cell));
            }

            tileMap.notifyUpdate();
        }

        this.npcSpawns.forEach((cell, entity, idx) => {
            this.removeEntity(entity);
        });
        this.npcSpawns.clear();

        for (const spawner of data.npc_spawners) {
            const cell = new Vector2(spawner.cell[0], spawner.cell[1]);
            const pos = this.grid.getCellPos(cell as any);
            console.log(pos);
            this.npcSpawns.set(cell as any, this.addSpawner(pos as any, spawner.data));
        }
    }

    public async saveMap() {
        const data: MapData = {
            tiles: {},
            player_spawn: serialize({type: Types.Vector3}, this.playerSpawn.position),
            npc_spawners: [],
        };

        for (const [type, tileMap] of this.tiles) {

            data.tiles[type] = [];

            tileMap.gridMap.forEach((pos, val, idx) => {
                data.tiles[type].push([pos.x, pos.y]);
            });
        }

        this.npcSpawns.forEach((cell, entity, idx) => {
            const spawner = entity.getComponent(NPCSpawner)!;
            data.npc_spawners.push({
                cell: [cell.x, cell.y],
                data: serializeComponent(spawner),
            });
        })

        await saveToFile(data, "map.json", ".json");
    }

    public createUI(menu: HTMLDivElement, sidebar: HTMLDivElement) {

        // for (const [key, param] of Reflection.getParams(this.ui)) {
        //     this.ui.appendChild(makeInput(editor.currentScene!, editorUI, key, param, (val) => {
        //         console.log(val);
        //     }))
        // }

        this.menu = menu;
        this.sidebar = sidebar;

        const tileType = makeEnumInput("Tile Type", this.ui.type, TileTypes, (value: TileTypes) => {
            this.ui.type = value;
        }, this.generator);

        menu.appendChild(makeEnumInput("Tool Type", this.ui.tool, ToolTypes, (value: ToolTypes) => {
            this.ui.tool = value;
            if (this.ui.tool === ToolTypes.TilePlace || this.ui.tool === ToolTypes.TileFill) {
                tileType.style.display = "block";
            } else {
                tileType.style.display = "none";
            }
        }, this.generator));

        menu.appendChild(tileType);

        menu.appendChild(this.generator.createButton('Save Map', () => {this.saveMap()}));
        menu.appendChild(this.generator.createButton('Load Map', () => {this.loadMap()}));

        this.npcSpawnUI = document.createElement('div');
        sidebar.appendChild(this.npcSpawnUI);
    
        sidebar.style.display = 'none';

        // menu.appendChild(this.generator.createSelect())

        // ui.appendChild(makeButton("Save Map", () => {
        //     editorScene.saveMap();
        // }));

        // ui.appendChild(makeButton("Load Map", () => {
        //     editorScene.loadMap();
        // }))
    }

    private floodFill(startCell: Vector2, targetTiles: Tilemap) {
        // Don't fill if the start cell is already occupied by any tile type
        for (const [, gridTiles] of this.tiles) {
            if (gridTiles.gridMap.has(startCell as any)) return;
        }

        console.log(startCell);

        const visited = new GridMap<void>();
        const queue: Vector2[] = [startCell];

        // Bounds derived from your grid dimensions
        const maxCells = WORLD_SIZE / CELL_SIZE;

        while (queue.length > 0) {
            const current = queue.shift()!;

            if (visited.has(current as any)) continue;
            visited.set(current as any);

            // Skip if any tile already occupies this cell
            let occupied = false;
            for (const [, gridTiles] of this.tiles) {
                if (gridTiles.gridMap.has(current as any)) {
                    occupied = true;
                    break;
                }
            }
            if (occupied) continue;

            // Place the tile
            targetTiles.gridMap.set(current as any);

            // Enqueue 4-directional neighbors
            queue.push(new Vector2(current.x + 1, current.y));
            queue.push(new Vector2(current.x - 1, current.y));
            queue.push(new Vector2(current.x, current.y + 1));
            queue.push(new Vector2(current.x, current.y - 1));
        }

        targetTiles.notifyUpdate();
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
        textures: [
            {
                name: "player_spawn",
                url: "https://hascape.sfo3.cdn.digitaloceanspaces.com/textures/player_spawn.png",
            },
            {
                name: "npc_spawn",
                url: "https://hascape.sfo3.cdn.digitaloceanspaces.com/textures/npc_spawn.png"
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

export function makeMapEditor(container: HTMLDivElement, menu: HTMLDivElement, sidebar: HTMLDivElement) {
    const editor = new Game(EditorManifest);
    const canvas = editor.renderer.domElement;

    container.appendChild(canvas);
    canvas.width = 1080;
    canvas.height = 720;
    canvas.style.margin = 'auto';

    editor.resize(1080, 720);

    const editorScene = (editor.currentScene! as EditorRuntime);

    editorScene.createUI(menu, sidebar);

    editor.run();
}