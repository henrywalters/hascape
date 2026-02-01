import { System } from "hagamets/dist/ecs/system.js";
import { Player } from "@hascape/common";
import { PlayerAnimation, PlayerAnimations } from "../components/playerAnimation";
import { SpriteSheet } from "hagamets/dist/common/components/spriteSheet.js";

export class Animation extends System {
    onUpdate(dt: number): void {
        this.scene.components.forEach(Player, (player) => {
            const animations = player.entity.getComponent(PlayerAnimations);
            const spriteSheet = player.entity.getComponent(SpriteSheet);

            if (animations && spriteSheet) {

            if (player.direction.x < 0 && player.entity.transform.rotation.y === 0) {
                player.entity.transform.rotation.y = 180;
            } else if (player.direction.x > 0 && player.entity.transform.rotation.y === 180) {
                player.entity.transform.rotation.y = 0;
            }

                let animation: PlayerAnimation;
                if (player.direction.x !== 0 || player.direction.y !== 0) {
                    animation = animations.walk;
                } else {
                    animation = animations.idle;
                }

                spriteSheet.spriteSheet = animation.animation;
                spriteSheet.animationSpeed = animation.animationRate;

                spriteSheet.notifyUpdate();
            }
        })
    }
}