import { Patch, PatchOptions } from "../Patch";
import VirtualText from "../../nodes/VirtualText";

/**
 * Patch to replace a text in the DOM element
 */
export default class SetTextPatch implements Patch {
    
    constructor(

         /**
         * The new value of the text
         */
        public value: VirtualText

    ) {}

    applyPatch(options: PatchOptions): void {

        const { node } = options;

        (node as Text).textContent = this.value.text.toString();
    }
}