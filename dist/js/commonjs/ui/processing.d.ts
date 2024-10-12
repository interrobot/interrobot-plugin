/**
 * Represents a widget for displaying HTML processing status.
 * @class
 */
declare class HtmlProcessingWidget {
    /** The base HTML element of the widget */
    private baseElement;
    /** The total number of items to process */
    private total;
    /** The number of items currently processed */
    private loaded;
    /** The prefix text to display before the progress information */
    private prefix;
    /**
     * Creates a new HtmlProcessingWidget and appends it to the specified parent element.
     * @param {HTMLElement} parentElement - The parent element to which the widget will be appended.
     * @param {string} prefix - The prefix text to display before the progress information.
     * @returns {HtmlProcessingWidget} A new instance of HtmlProcessingWidget.
     */
    static createElement(parentElement: HTMLElement, prefix: string): HtmlProcessingWidget;
    /**
     * Initializes a new instance of HtmlProcessingWidget.
     * @param {string} prefix - The prefix text to display before the progress information.
     */
    constructor(prefix: string);
    /**
     * Removes the throbbing effect from the widget.
     * @public
     */
    clearMessage(): void;
    /**
     * Returns the base HTML element of the widget.
     * @public
     * @returns {HTMLElement} The base HTML element of the widget.
     */
    getBaseElement(): HTMLElement;
    /**
     * Sets a new prefix for the widget.
     * @public
     * @param {string} prefix - The new prefix to set.
     */
    setPrefix(prefix: string): void;
    /**
     * Sets a new message for the widget and adds the throbbing effect.
     * @public
     * @param {string} msg - The message to display in the widget.
     */
    setMessage(msg: string): void;
}
export { HtmlProcessingWidget };
