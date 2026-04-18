import { OrthographicCamera } from "hagamets/dist/common/components/camera.js";
import { Transform } from "hagamets/dist/common/components/transform.js";
import { Axes } from "hagamets/dist/core/interfaces/input.js";
import { Param, Types } from "hagamets/dist/core/reflection.js";
import { Script } from "hagamets/dist/core/script.js";
import { Quaternion, Vector3 } from "three";
import { clamp } from "three/src/math/MathUtils.js";

export class CameraController extends Script {

    @Param({type: Types.Float})
    zoomSpeed: number = 10.0;

    @Param({type: Types.Float})
    minZoom = 1.0;

    @Param({type: Types.Float})
    maxZoom = 100.0;

    onUpdate(dt: number) {
        const camera = this.entity.getComponent(OrthographicCamera);
        if (camera) {
            // camera.zoom = clamp(camera.zoom + this.input.getAxis(Axes.MouseWheel).y * dt * this.zoomSpeed, this.minZoom, this.maxZoom);
            console.log(camera.zoom);
        }
    }
}