/**
 * Tracks the changes to the patching for a given element patches
 */
export default class PatchingContext {

    /**
     * The elements that were originally in the DOM at a given index
     * before new elements were set or other elements moved
     */
    private _original: any = {};

    setOriginalElement(element: Element, index: number): void {

        this._original[index] = element;
    }

    getOriginalElement(index: number) : Element {

        const element = this._original[index];

        if (element) {

            delete this._original[index]; // Clear the replaced element
        }

        return element;
    }

}