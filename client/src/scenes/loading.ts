import { Text } from "hagamets/dist/common/components/ui/text.js";
import { RenderScene } from "hagamets/dist/common/scenes/renderScene.js";
import { Assets } from "hagamets/dist/core/assets.js";
import { Client } from "../client";
import { API } from "hagamets/dist/utils/api.js";
import { IMap, ITile } from "@hascape/common";
import { Image } from "hagamets/dist/common/components/ui/image.js";
import { Color } from "three";
import { State } from "../state";

const MIN_LOADING = 1000;

export class Loading extends RenderScene {

    onActivate() {
        const start = (new Date()).getTime();
        this.initialize().then(() => {

            this.loadAssets().then(() => {
                const end = (new Date()).getTime();
                if ((end - start) < MIN_LOADING) {
                    setTimeout(() => {
                        this.gotoLogin();
                    }, MIN_LOADING - end + start);
                } else {
                    this.gotoLogin();
                }
            }).catch((e) => {
                const text = this.getEntityByName("Loading")!.getComponent(Text)!
                text.text = "Asset load failure: " + e.message;
                text.color = new Color('red') as any;
                text.notifyUpdate();
            })
        })
    }

    gotoLogin() {
        this.game.activateScene("login_menu");
    }

    async initialize() {
        for (const texture of this.game.manifest.assets.textures!) {
            if (texture.name === 'hg_studio') {
                await Assets.loadTexture(texture);
            }
        }

        for (const font of this.game.manifest.assets.fonts!) {
            await Assets.loadFont(font);
        }

        this.getEntityByName("Loading")!.getComponent(Text)!.notifyUpdate();
        this.getEntityByName("Logo")!.getComponent(Image)!.notifyUpdate();
    }

    async loadAssets() {
        const game = this.game as Client;
        const mapApi = new API<IMap>(`${game.apiUrl}/map`, game.token);
        const tileApi = new API<ITile>(`${game.apiUrl}/tile`, game.token)
        const entity = this.getEntityByName("Loading");
        if (!entity) {
            console.warn("Loading entity missing");
            return;
        }
        const text = entity.getComponent(Text);
        if (!text) {
            console.warn("Loading entity missing text");
            return;
        }

        const setText = (msg: string) => {
            text.text = msg;
            text.notifyUpdate();
        }

        await this.game.loadAssets((msg) => {
            setText(msg);
        })

        setText("Loading tiles...");
        const tileRes = await tileApi.getAll();
        if (tileRes.success) {
            State.tiles = tileRes.data;
        } else {
            throw new Error(tileRes.error ? tileRes.error : "Failed to load tiles");
        }

        setText("Loading maps...");
        const mapRes = await mapApi.getAll();
        if (mapRes.success) {
            State.updateMaps(mapRes.data);
        } else {
            throw new Error(mapRes.error ? mapRes.error : "Failed to load maps");
        }

        text.text = "Loading...";
        text.notifyUpdate();
    }

    onUpdate(dt: number) {

    }
}