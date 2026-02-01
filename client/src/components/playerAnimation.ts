import { HGObject } from "hagamets/dist/core/object.js";
import { Param, Types } from "hagamets/dist/core/reflection.js";
import { Component } from "hagamets/dist/ecs/component.js";

export class PlayerAnimation {
    @Param({type: Types.String})
    animation: string = "";

    @Param({type: Types.Float})
    animationRate = 1.0;
}

export class PlayerAnimations extends Component {

    @Param({type: Types.Class, ctr: PlayerAnimation})
    idle = new PlayerAnimation();

    @Param({type: Types.Class, ctr: PlayerAnimation})
    walk = new PlayerAnimation();
}