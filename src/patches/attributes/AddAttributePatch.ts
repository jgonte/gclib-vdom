import { Patch, PatchOptions } from "../Patch";

/**
 * Patch to add an attribute to the DOM element
 */
export default class AddAttributePatch implements Patch {

    constructor(

        /**
         * The name of the attribute
         */
        public name: string,

        /**
         * The value of the attribute
         */
        public value: any

    ) {}

    applyPatch(options: PatchOptions): void {

        const { node } = options;

        (node as HTMLElement).setAttribute(this.name, this.value.toString());
    }
}