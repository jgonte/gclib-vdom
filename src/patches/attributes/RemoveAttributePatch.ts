import { Patch } from "../Patch";

/**
 * Patch to remove an attribute from the DOM element
 */
export default class RemoveAttributePatch extends Patch {
    
    constructor(

        /**
         * The name of the attribute
         */
        public name: string

    ) {
        super();
    }

    applyPatch(parentNode: Node | Document | ShadowRoot, node: HTMLElement): void {
        
        node.removeAttribute(this.name);
    }
}