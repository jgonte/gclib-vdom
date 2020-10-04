import { Patch } from "../Patch";
import VirtualText from "../../nodes/VirtualText";

/**
 * Patch to replace a text in the DOM element
 */
export default class SetTextPatch extends Patch {
    
    constructor(

         /**
         * The new value of the text
         */
        public value: VirtualText

    ) {
        super();
    }

    applyPatch(parentNode: Node | Document | ShadowRoot, node: Text): void {

        node.textContent = this.value.text.toString();
    }
}