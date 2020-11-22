import { Patch, PatchOptions, NodeChanges } from "../Patch";
import setAttribute from "../../nodes/helpers/setAttribute";

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

        const { 
            node, 
            context 
        } = options;

        const {
            name,
            value
        } = this;

        setAttribute(node as HTMLElement, name, value);
        
        context!.setNodeChanges(
            node!,
            new NodeChanges({
                attributes: [{
                    key: name,
                    newValue: value
                }]
            })
        );
    }
}