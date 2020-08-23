import { Patch } from "../Patch";
import VirtualNode from "../../VirtualNode";
import VirtualText from "../../VirtualText";
import PatchingContext from "../../PatchingContext";

/**
 * Patch to set a new child at a given index
 */
export default class SetChildPatch extends Patch {

    constructor(

        /**
         * The index to set the child
         */
        public index: number,

        /**
         * The new node to replace the existing element
         */
        public newNode: VirtualNode | VirtualText
    ) {
        super();
    }

    apply(element: HTMLElement, context: PatchingContext): void {

        const { index } = this;

        const newChild = this.newNode.render();

        const originalElement = element.children[index];

        if (originalElement) {

            // Save the original element in the context
            context.setOriginalElement(originalElement, index);

            element.replaceChild(newChild, originalElement);
        }
        else {

            element.appendChild(newChild);
        }
    }

}