import { Clock } from "three";
import { Game } from "hagamets/dist/core/game.js";
import { Manifest } from "./manifest";

(() => {

    const tickRate = 16;

    let manifest = Manifest;
    
    const game = new Game(manifest, true);

    const clock = new Clock();

    const tick = () => {

        const start = clock.getElapsedTime();

        game.tick(true);

        const end = clock.getElapsedTime();

        const duration = (end - start) * 1000;

        if (duration > tickRate) {
            console.warn("Server Duration exceeding tickRate");
        };

        const waitFor = duration > tickRate ? 0 : tickRate - duration;

        setTimeout(tick, waitFor);
    }

    tick();

})();