import { Patch, PatchOptions, NodeChanges } from "../Patch";
import TextNode from "../../nodes/TextNode";

/**
 * Patch to replace a text in the DOM element
 */
export default class SetTextPatch implements Patch {

    constructor(

        /**
        * The new value of the text
        */
        public value: TextNode

    ) { }

    applyPatch(options: PatchOptions): void {

        const {
            parentNode,
            node,
            context
        } = options;

        const oldValue = (node as Text).textContent || undefined;

        const newValue = this.value.text.toString();

        if (parentNode instanceof HTMLTextAreaElement) {

            parentNode.value = newValue;
        }
        else {

            (node as Text).textContent = newValue;           
        }

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