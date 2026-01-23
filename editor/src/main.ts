import { Editor } from "hagamets/dist/editor/editor.js"
import { Client } from "@hascape/client/client";
import { Manifest } from "@hascape/client/manifest";

window.onload = async () => {

    const game = new Client(Manifest, {
        username: "Henry",
        userId: "",
        id: "",
        createdOn: new Date(),
    }, "asdfasdfasdf");

    const container = document.getElementById('main')! as HTMLDivElement;
    
    const scene = new Editor(container, game);
    scene.initialize();

    // @ts-ignore
    // window.scene = scene;

    // container.appendChild(scene.renderer.domElement);

    // const gl = scene.renderer.getContext();

    // // try to get the debug extension
    // const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');

    // window.onresize = () => {
    //     scene.resize(container.clientWidth, container.clientHeight);
    // }

    // if (debugInfo) {
    //     const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    //     const rendererName = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

    //     console.log('GPU Vendor:', vendor);
    //     console.log('GPU Renderer:', rendererName);
    // } else {
    //     console.log('WEBGL_debug_renderer_info not supported');
    // }

    // let lastTime = 0;

    // scene.start();

    // scene.resize(container.clientWidth, container.clientHeight);

    // const clock = new Clock();

    // function animate(time: number) {
        
    //     scene.update(clock.getDelta());

    //     requestAnimationFrame(animate);
    // }

    // requestAnimationFrame(animate);
}