import { Patch, PatchOptions } from "../Patch";

/**
 * Patch to remove an attribute from the DOM element
 */
export default class SetAttributePatch implements Patch {
    
    constructor(

        /**
         * The name of the attribute
         */
        public name: string,

         /**
         * The new value of the attribute
         */
        public value: any

    ) {}

    applyPatch(options: PatchOptions): void {
        
        const { node } = options;

        (node as HTMLElement).setAttribute(this.name, this.value.toString());
    }
}