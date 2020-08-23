import { Patch } from "../Patch";
import VirtualText from "../../VirtualText";

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

    apply(element: HTMLElement): void {

        element.textContent = this.value.text.toString();      
    }

}