import PatchingContext from "../PatchingContext";

export abstract class Patch {

    /** 
     * Executes the patch on the element
     */
    abstract apply(element: HTMLElement, context: PatchingContext) : void;
}