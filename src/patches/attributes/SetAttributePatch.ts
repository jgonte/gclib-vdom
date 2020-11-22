import { Patch, PatchOptions, NodeChanges } from "../Patch";
import { isUndefinedOrNull } from "../../utils/utils";
import removeAttribute from "../../nodes/helpers/removeAttribute";
import replaceAttribute from "../../nodes/helpers/replaceAttribute";

/**
 * Patch to replace an attribute from the DOM element
 */
export default class SetAttributePatch implements Patch {
    
    constructor(

        /**
         * The name of the attribute
         */
        public name: string,

        /**
         * The old value of the attribute
         */
        public oldValue: any,

        /**
         * The new value of the attribute
         */
        public newValue: any

    ) {}

    applyPatch(options: PatchOptions): void {
        
        const { 
            node, 
            context 
        } = options;

        const {
            name,
            oldValue,
            newValue
        } = this;

        if (isUndefinedOrNull(newValue)) {

            removeAttribute(node as HTMLElement, name)
        }
        else {

            replaceAttribute(node as HTMLElement, name, newValue);
        }

        context!.setNodeChanges(
            node!,
            new NodeChanges({
                attributes: [{
                    key: name,
                    oldValue,
                    newValue
                }]
            })
        );
    }
}