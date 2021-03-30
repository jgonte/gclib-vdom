import { Patch, PatchOptions, NodeChanges } from "../Patch";
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
            context,
            parentNode
        } = options;

        const {
            name,
            oldValue,
            newValue
        } = this;

        const n = node instanceof DocumentFragment ?
            (parentNode as any).host :
            node

        if (newValue === undefined || 
            newValue === null ||
            newValue === "false") { // Remove attributes that equal false

            removeAttribute(n as HTMLElement, name)
        }
        else {

            replaceAttribute(n as HTMLElement, name, newValue);
        }

        context!.setNodeChanges(
            n!,
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