import { Patch, PatchOptions, NodeChanges } from "../Patch";

/**
 * Patch to remove an attribute from the DOM element
 */
export default class SetAttributePatch implements Patch {
    
    constructor(

        /**
         * The name of the attribute
         */
        public name: string,

         /**
         * The new value of the attribute
         */
        public value: any

    ) {}

    applyPatch(options: PatchOptions): void {
        
        const { 
            node, 
            context 
        } = options;

        const oldValue = (node as HTMLElement).getAttribute(this.name);

        const newValue = this.value.toString();

        (node as HTMLElement).setAttribute(this.name, newValue);

        context!.setNodeChanges(
            node!,
            new NodeChanges({
                attributes: [{
                    key: this.name,
                    oldValue,
                    newValue
                }]
            })
        );
    }
}