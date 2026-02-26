import { System } from "hagamets/dist/ecs/system.js";
import { Character } from "@hascape/common";
import { SpriteSheet } from "hagamets/dist/common/components/spriteSheet.js";
import { Animations } from "hagamets/dist/common/components/animation.js";
import { Assets } from "hagamets/dist/core/assets.js";

export class Animation extends System {
    onUpdate(dt: number): void {
        this.scene.components.forEach(Character, (character) => {

            const animations = character.entity.getComponent(Animations);
            const spriteSheet = character.entity.getComponent(SpriteSheet);

            if (animations && spriteSheet) {

                if (character.direction.x < 0 && character.entity.transform.rotation.y === 0) {
                    character.entity.transform.rotation.y = 180;
                } else if (character.direction.x > 0 && character.entity.transform.rotation.y === 180) {
                    character.entity.transform.rotation.y = 0;
                }

                const setAnimation = (key: string) => {
                    if (animations.animation !== key) {
                        animations.animation = key;
                        spriteSheet.index = 0;
                    }
                }

                if (character.isAttacking) {
                    setAnimation("attack");
                } else if (character.direction.x !== 0 || character.direction.y !== 0) {
                    setAnimation("walk");
                } else {
                    setAnimation("idle");
                }

                const animation = animations.currentAnimation;

                if (animation) {
                    spriteSheet.spriteSheet = animation.animation;
                    spriteSheet.animationSpeed = animation.animationRate;

                    if (character.isAttacking && spriteSheet.index >= Assets.spriteSheets.get(spriteSheet.spriteSheet).cells.x - 1) {
                        character.isAttacking = false;
                        console.log("Finished Attack");
                    }

                    spriteSheet.notifyUpdate();
                }

            }
        })
    }
}