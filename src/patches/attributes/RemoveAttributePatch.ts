import { Patch, PatchOptions, NodeChanges } from "../Patch";

/**
 * Patch to remove an attribute from the DOM element
 */
export default class RemoveAttributePatch implements Patch {
    
    constructor(

        /**
         * The name of the attribute
         */
        public name: string

    ) {}

    applyPatch(options: PatchOptions): void {
        
        const { 
            node, 
            context 
        } = options;

        const oldValue = (node as HTMLElement).getAttribute(this.name);

        (node as HTMLElement).removeAttribute(this.name);

        context!.setNodeChanges(
            node!,
            new NodeChanges({
                attributes: [{
                    key: this.name,
                    oldValue
                }]
            })
        );
    }
}