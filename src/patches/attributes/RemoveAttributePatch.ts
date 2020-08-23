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

    apply(element: HTMLElement): void {

        element.removeAttribute(this.name);
    }

}