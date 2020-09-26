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

    apply(element: HTMLElement): HTMLElement {

        element.setAttribute(this.name, this.value.toString());

        return element;
    }

}