import { Patch } from "../Patch";

/**
 * Patch to remove an attribute from the DOM element
 */
export default class SetAttributePatch extends Patch {

    constructor(

        /**
         * The name of the attribute
         */
        public name: string,

         /**
         * The new value of the attribute
         */
        public value: any

    ) {
        super();
    }

    apply(element: HTMLElement): void {

        element.setAttribute(this.name, this.value.toString());
    }

}