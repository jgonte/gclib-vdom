import { Patch } from "../Patch";
import VirtualNode from "../../nodes/VirtualNode";
import VirtualText from "../../nodes/VirtualText";
import PatchingContext from "../../helpers/PatchingContext";

/**
 * Patch to set a new child at a given index
 */
export default class SetElementPatch extends Patch {

    constructor(

        /**
         * The new node to replace the existing element
         */
        public newNode: VirtualNode | VirtualText
    ) {
        super();
    }

    apply(element: HTMLElement, context: PatchingContext): void {

        const newChild = this.newNode.render();

        // if (element) {

        //     element.appendChild(newChild);
        // }

        context.setNode(newChild);
    }

}