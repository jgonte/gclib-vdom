import { Patch } from "../Patch";
import VirtualText from "../../nodes/VirtualText";

/**
 * Patch to replace a text in the DOM element
 */
export default class ReplaceTextPatch extends Patch {

    constructor(

         /**
         * The new value of the text
         */
        public value: VirtualText

    ) {
        super();
    }

    apply(node: ChildNode): void {

        const textNode = document.createTextNode(this.value.text.toString());

        if (node.nodeType === Node.ELEMENT_NODE) {

            node.replaceChild(textNode, node.childNodes[0]); 
            
        }
        else if (node.nodeType === Node.TEXT_NODE) {

            node.replaceWith(textNode); 
        }
        else {
            // Ignore
        }          
    }

}