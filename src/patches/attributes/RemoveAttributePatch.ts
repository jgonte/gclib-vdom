import { Patch, PatchOptions, NodeChanges } from "../Patch";
import removeAttribute from "../../nodes/helpers/removeAttribute";

/**
 * Patch to remove an attribute from the DOM element
 */
export default class RemoveAttributePatch implements Patch {

    constructor(

        /**
         * The name of the attribute
         */
        public name: string,

        /**
         * The old value of the attribute
         */
        public oldValue: any

    ) { }

    applyPatch(options: PatchOptions): void {

        const {
            node,
            context
        } = options;

        removeAttribute(node as HTMLElement, this.name);

        context!.setNodeChanges(
            node!,
            new NodeChanges({
                attributes: [{
                    key: this.name,
                    oldValue: this.oldValue
                }]
            })
        );
    }
}