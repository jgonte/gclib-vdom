import { Patch, PatchOptions, NodeChanges } from "../Patch";
import VirtualText from "../../nodes/VirtualText";

/**
 * Patch to replace a text in the DOM element
 */
export default class SetTextPatch implements Patch {

    constructor(

        /**
        * The new value of the text
        */
        public value: VirtualText

    ) { }

    applyPatch(options: PatchOptions): void {

        const {
            node,
            context
        } = options;

        const oldValue = (node as Text).textContent || undefined;

        const newValue = this.value.text.toString();

        (node as Text).textContent = newValue;

        context!.setNodeChanges(
            node!,
            new NodeChanges({
                text: {
                    oldValue,
                    newValue
                }
            })
        );
    }
}