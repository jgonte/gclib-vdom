import { Patch } from "../Patch";

/**
 * Patch to add an attribute to the DOM element
 */
export default class AddAttributePatch extends Patch {
    
    constructor(

        /**
         * The name of the attribute
         */
        public name: string,

        /**
         * The value of the attribute
         */
        public value: any

    ) {
        super();
    }

    applyPatch(parentNode: Node | Document | ShadowRoot, node: HTMLElement): void {
        
        node.setAttribute(this.name, this.value.toString());
    }
}