/**
 * A class that proxies touch events from the iframe to its container.
 */
declare class TouchProxy {
    /**
     * Creates a new TouchProxy instance and sets up event listeners.
     */
    constructor();
    /**
     * Proxies touch events to the container iframe.
     * @param ev - The TouchEvent to be proxied.
     */
    private proxyToContainer;
    private touchEnd;
    private touchMove;
}
export { TouchProxy };
