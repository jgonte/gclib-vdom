import { Patch } from "../Patch";

/**
 * Patch to remove all the children from the element in the DOM
 */
export default class RemoveChildrenPatch extends Patch {

    apply(element: HTMLElement): void {

        while (element.lastChild) {

            element.removeChild(element.lastChild);
        }
    }
    
}