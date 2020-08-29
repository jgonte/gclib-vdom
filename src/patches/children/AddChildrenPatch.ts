import { Patch } from "../Patch";
import VirtualNode from "../../nodes/VirtualNode";

/**
 * Patch to add an attribute to the DOM element
 */
export default class AddChildrenPatch extends Patch {

    constructor(

        /**
         * The new node to replace the element
         */
        public children: VirtualNode[]
    ) {
        super();
    }

    apply(node: ChildNode): void {

        this.children.forEach(child => {

            node.appendChild(child.render());
        });
    }

}