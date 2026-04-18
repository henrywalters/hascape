import "reflect-metadata"
import { Clock } from "three";
import { Game } from "hagamets/dist/core/game.js";
import { Manifest } from "./manifest";
import { AppDataSource } from "./data-source";
import { MapService } from "./services/map";
import { TileService } from "./services/tile";
import { State } from "./state";

AppDataSource.initialize().then(async () => {

console.log(AppDataSource.entityMetadatas.map(m => m.name));

    const maps = new MapService();
    const tiles = new TileService();
    State.updateMaps(await maps.getAll(), await tiles.getAll());

    const tickRate = 32;

    let manifest = Manifest;
    
    const game = new Game(manifest, true);

    const clock = new Clock();

    let lastTick: number = 0;

    const tick = () => {

        const start = clock.getElapsedTime();

        lastTick = start;

        game.tick(start * 1000, true);

        const end = clock.getElapsedTime();

        const duration = (end - start) * 1000;

        if (duration > tickRate) {
            console.warn("Server Duration exceeding tickRate");
        };

        const waitFor = duration > tickRate ? 0 : tickRate - duration;

        setTimeout(tick, waitFor);
    }

    // setInterval(() => {
    //     const usage = process.memoryUsage();
    //     console.log({
    //         heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
    //         heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
    //         rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
    //     });
    // }, 5000);

    tick();

})