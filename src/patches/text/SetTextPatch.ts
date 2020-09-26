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

    apply(element: Text): void {

        // const textNode = document.createTextNode(this.value.text.toString());

        // element.appendChild(textNode);  
        
        element.textContent = this.value.text.toString();
    }

}