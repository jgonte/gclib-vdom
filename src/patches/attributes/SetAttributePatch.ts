import { Patch } from "../Patch";

/**
 * Patch to remove an attribute from the DOM element
 */
export default class SetAttributePatch extends Patch {
    
    constructor(

        /**
         * The name of the attribute
         */
        public name: string,

         /**
         * The new value of the attribute
         */
        public value: any

    ) {
        super();
    }

    applyPatch(parentNode: Node | Document | ShadowRoot, node: HTMLElement): void {
        
        node.setAttribute(this.name, this.value.toString());
    }
}