import { Patch, PatchOptions } from "../Patch";

/**
 * Patch to remove an attribute from the DOM element
 */
export default class RemoveAttributePatch implements Patch {
    
    constructor(

        /**
         * The name of the attribute
         */
        public name: string

    ) {}

    applyPatch(options: PatchOptions): void {
        
        const { node } = options;

        (node as HTMLElement).removeAttribute(this.name);
    }
}