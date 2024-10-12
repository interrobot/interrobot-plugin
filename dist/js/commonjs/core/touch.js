"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TouchProxy = void 0;
/**
 * A class that proxies touch events from the iframe to its container.
 */
class TouchProxy {
    /**
     * Creates a new TouchProxy instance and sets up event listeners.
     */
    constructor() {
        // pass touch events up to iframe container, proxies the navigation show/hide
        // listen for swipe
        const content = document.body;
        content.addEventListener("touchstart", (ev) => { this.proxyToContainer(ev); }, { passive: true });
        content.addEventListener("touchend", (ev) => { this.proxyToContainer(ev); }, { passive: true });
        content.addEventListener("touchmove", (ev) => { this.proxyToContainer(ev); }, { passive: true });
    }
    /**
     * Proxies touch events to the container iframe.
     * @param ev - The TouchEvent to be proxied.
     */
    async proxyToContainer(ev) {
        var _a;
        let primeTouch;
        let touches = (_a = ev.touches) !== null && _a !== void 0 ? _a : ev.changedTouches;
        if (ev.touches.length === 1) {
            primeTouch = ev.touches[0];
        }
        else if (ev.changedTouches.length === 1) {
            primeTouch = ev.changedTouches[0];
        }
        else {
            return;
        }
        // actual Touch objects are fickle, and clones unreliable
        // gotta go new-school, null the target, pass the primitives
        const touchData = {
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
    async touchEnd(ev) {
    }
    async touchMove(ev) {
    }
}
exports.TouchProxy = TouchProxy;
