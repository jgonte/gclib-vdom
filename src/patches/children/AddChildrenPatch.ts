import { Patch } from "../Patch";
import VirtualNode from "../../VirtualNode";

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

    apply(element: HTMLElement): void {

        this.children.forEach(child => {

            const newElement = child.render();

            element.appendChild(newElement);

        });

    }

}