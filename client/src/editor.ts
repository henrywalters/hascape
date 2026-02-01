import { CameraPan, CameraZoom, OrthographicCamera } from "hagamets/dist/common/components/camera.js";
import { GridDisplay } from "hagamets/dist/common/components/grid.js";
import { MeshPrimitive, MeshPrimitiveType } from "hagamets/dist/common/components/mesh.js";
import { Transform } from "hagamets/dist/common/components/transform.js";
import { RenderScene } from "hagamets/dist/common/scenes/renderScene.js";
import { CameraControllers } from "hagamets/dist/common/systems/cameraControllers.js";
import { Renderer } from "hagamets/dist/common/systems/renderer.js";
import { Game } from "hagamets/dist/core/game.js";
import { IGame } from "hagamets/dist/core/interfaces/game.js";
import { Axes, Buttons } from "hagamets/dist/core/interfaces/input.js";
import { IManifest } from "hagamets/dist/core/interfaces/manifest.js";
import { IEntity } from "hagamets/dist/ecs/interfaces/entity.js";
import { Color, Plane, Raycaster, Vector3, Vector2} from "three";
import { RAD2DEG } from "three/src/math/MathUtils.js";
import { CELL_SIZE, CHUNK_SIZE, WORLD_SIZE, CHUNKS, CELLS, TileTypes, ITile, TILES } from "@hascape/common";
import { Tilemap } from "hagamets/dist/common/components/tilemap.js";
import { Component } from "hagamets/dist/ecs/component.js";
import { Param, Reflection, Types } from "hagamets/dist/core/reflection.js";
import { makeInput } from "hagamets/dist/editor/inputs.js";

export class EditorUI {
    @Param({type: Types.Enum, enum: TileTypes})
    type: TileTypes = TileTypes.Wall;
}

export class EditorRuntime extends RenderScene {

    private cursor: IEntity;
    private camera: OrthographicCamera;
    private grid: GridDisplay;
    private chunkGrid: GridDisplay;
    public ui: EditorUI = new EditorUI();

    private tiles: Map<TileTypes, Tilemap> = new Map();

    onActivate() {

        for (const tile of TILES) {
            const tileEntity = this.addEntity();
            tileEntity.addComponent(Transform);
            const tiles = tileEntity.addComponent(Tilemap);
            tiles.grid.size.set(WORLD_SIZE, WORLD_SIZE);
            tiles.grid.cells.set(WORLD_SIZE / CELL_SIZE, WORLD_SIZE / CELL_SIZE);
            tiles.color = tile.color as any;
            tiles.notifyUpdate();
            this.tiles.set(tile.type, tiles);
        }

        console.log(this.tiles);

        const cameraEntity = this.addEntity("Camera");
        cameraEntity.addComponent(Transform);
        cameraEntity.transform.position.z = 100;
        this.camera = cameraEntity.addComponent(OrthographicCamera);
        cameraEntity.addComponent(CameraPan);
        const zoom = cameraEntity.addComponent(CameraZoom);
        zoom.minZoom = 0.1;

        this.cursor = this.addEntity();
        this.cursor.addComponent(Transform);
        const mesh = this.cursor.addComponent(MeshPrimitive);
        mesh.color = new Color('blue') as any;
        mesh.type = MeshPrimitiveType.Plane;
        mesh.width = CELL_SIZE;
        mesh.height = CELL_SIZE;
        mesh.transparent = true;
        mesh.opacity = 0.50;
        mesh.notifyUpdate();


        const gridEntity = this.addEntity();
        gridEntity.addComponent(Transform);
        gridEntity.transform.position.z = 5;
        this.grid = gridEntity.addComponent(GridDisplay);
        this.grid.grid.size.set(CHUNK_SIZE, CHUNK_SIZE);
        this.grid.grid.cells.set(CELLS, CELLS);
        this.grid.notifyUpdate();

        const chunkGridEntity = this.addEntity()
        chunkGridEntity.addComponent(Transform);
        this.chunkGrid = chunkGridEntity.addComponent(GridDisplay);
        this.chunkGrid.grid.size.set(WORLD_SIZE, WORLD_SIZE);
        this.chunkGrid.grid.cells.set(CHUNKS, CHUNKS);
        this.chunkGrid.lineThickness = new Vector2(5, 5) as any;
        this.chunkGrid.color = new Color('gray') as any;
        this.chunkGrid.notifyUpdate();
        chunkGridEntity.transform.position.set(CHUNK_SIZE * -0.5, CHUNK_SIZE * -0.5, 0);



        console.log(CHUNKS);
    }

    onUpdate(dt: number) {
        const size = this.game.getSize();
        const mousePos = this.game.input.getAxis(Axes.MousePosition);
        mousePos.setY(size.y - mousePos.y);
        mousePos.divide(size).multiplyScalar(2).subScalar(1);

        const raycaster = new Raycaster();
        raycaster.setFromCamera(mousePos as any, this.camera.camera as any);

        const worldPos = new Vector3();
        raycaster.ray.intersectPlane(new Plane(new Vector3(0, 0, 1), 0), worldPos);

        const cell = this.grid.grid.getCellIndex(worldPos as any, this.grid.entity.position);
        const cellPos = this.grid.grid.getCellPos(cell, this.grid.entity.position);

        this.cursor.transform.position.setX(cellPos.x);
        this.cursor.transform.position.setY(cellPos.y);

        const chunk = this.chunkGrid.grid.getCellIndex(worldPos as any, this.chunkGrid.entity.position);
        const chunkPos = this.chunkGrid.grid.getCellPos(chunk, this.chunkGrid.entity.position);

        this.grid.entity.transform.position = chunkPos;

        this.camera.entity.getComponent(CameraPan)!.speed = CHUNK_SIZE / 2 / this.camera.zoom;

        this.grid.lineThickness.set(1 / this.camera.zoom, 1 / this.camera.zoom);
        this.grid.notifyUpdate();

        this.chunkGrid.lineThickness.set(4 / this.camera.zoom, 4 / this.camera.zoom);
        this.chunkGrid.notifyUpdate();

        const tiles = this.tiles.get(this.ui.type)!

        const tileCell = tiles.grid.getCellIndex(worldPos as any, tiles.entity.position);

        if (this.game.input.getButton(Buttons.MouseLeft)) {
            tiles.gridMap.set(tileCell);
            tiles.notifyUpdate();
        }

        if (this.game.input.getButton(Buttons.MouseRight)) {
            tiles.gridMap.remove(tileCell);
            tiles.notifyUpdate();
        }
    }
}

export const EditorManifest: IManifest = {
    systems: [
        Renderer,
        CameraControllers,
    ],
    components: [

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

    },
    startScene: "runtime"
}

export function makeMapEditor(container: HTMLDivElement, ui: HTMLDivElement) {
    const editor = new Game(EditorManifest);
    const canvas = editor.renderer.domElement;

    container.appendChild(canvas);
    canvas.width = 1080;
    canvas.height = 720;
    canvas.style.margin = 'auto';

    editor.resize(1080, 720);

    const editorUI = (editor.currentScene! as EditorRuntime).ui;

    for (const [key, param] of Reflection.getParams(editorUI)) {
        ui.appendChild(makeInput(editor.currentScene!, editorUI, key, param, (val) => {
            console.log(val);
        }))
    }

    editor.run();
}