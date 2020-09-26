import { Patch } from "../Patch";
import VirtualNode from "../../nodes/VirtualNode";
import { VirtualText } from "../../gclib-vdom";

/**
 * Patch to add an attribute to the DOM element
 */
export default class AddChildrenPatch extends Patch {

    constructor(

        /**
         * The new node to replace the element
         */
        public children: Array<VirtualNode | VirtualText>
    ) {
        super();
    }

    apply(node: ChildNode): void {

        this.children.forEach(child => {

            node.appendChild(child.render());
        });
    }

}