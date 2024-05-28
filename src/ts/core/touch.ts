import { Project } from "./api.js";
import { HtmlUtils } from "./html.js";

class TouchProxy {
    // pass touch events up to iframe container, proxies the navigation show/hide
    constructor() {
        // listen for swipe
        const content = document.body;
        content.addEventListener("touchstart", (ev: TouchEvent) => { this.proxyToContainer(ev); }, { passive: true });
        content.addEventListener("touchend", (ev: TouchEvent) => { this.proxyToContainer(ev); }, { passive: true });
        content.addEventListener("touchmove", (ev: TouchEvent) => { this.proxyToContainer(ev); }, { passive: true });
    }

    private async proxyToContainer(ev: TouchEvent) {

        let primeTouch: Touch;
        let touches: TouchList = ev.touches ?? ev.changedTouches;

        if (ev.touches.length === 1) {
            primeTouch = ev.touches[0];
        } else if (ev.changedTouches.length === 1) {
            primeTouch = ev.changedTouches[0];
        } else {
            return;
        }

        // actual Touch objects are fickle, and clones unreliable
        // gotta go new-school, null the target, pass the primitives
        const touchData: {} = {
            identifier: null,
            target: null,
            clientX: primeTouch.clientX,
            clientY: primeTouch.clientY,
            pageX: primeTouch.pageX,
            pageY: primeTouch.pageY,
            screenX: primeTouch.screenX,
            screenY: primeTouch.screenY,
            radiusX: primeTouch.radiusX,
            radiusY: primeTouch.radiusY,
            rotationAngle: primeTouch.rotationAngle,
            force: primeTouch.force,
            eventType: ev.type,
        };

        const msg = {
            target: "interrobot",
            data: {
                reportTouch: touchData,
            },
        };
        window.parent.postMessage(msg, "*");
    }

    private async touchEnd(ev: TouchEvent) {

    }

    private async touchMove(ev: TouchEvent) {

    }
}

export { TouchProxy };
