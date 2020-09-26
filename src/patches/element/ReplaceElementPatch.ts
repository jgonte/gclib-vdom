import { Patch } from "../Patch";
import PatchingContext from "../../helpers/PatchingContext";
import { VirtualNode, VirtualText } from "../../gclib-vdom";

/**
 * Patch to replace the element in the DOM
 */
export default class ReplaceElementPatch extends Patch {

    constructor(

        /**
         * The new node to replace the element
         */
        public newNode: VirtualNode | VirtualText
    ) {
        super();
    }

    apply(element: HTMLElement, context: PatchingContext): void {

        const newElement = this.newNode.render();

        element.replaceWith(newElement);

        context.setNode(newElement);
    }

}