import { Patch } from "../Patch";

/**
 * Patch to remove a text in the DOM element
 */
export default class RemoveTextPatch extends Patch {

    apply(element: HTMLElement): void {

        element.textContent = null;    
    }

}