import { Patch } from "../Patch";
import VirtualNode from "../../nodes/VirtualNode";
import VirtualText from "../../nodes/VirtualText";
import { CustomElementLike } from "../CustomElementLike";

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

    applyPatch(parentNode: Node | ShadowRoot | Document, node?: Node): void {

        const newNode = this.newNode.render() as CustomElementLike;

        if (newNode.onBeforeMount) {

            newNode.onBeforeMount();
        }

        parentNode.appendChild(newNode);

        if (newNode.onAfterMount) {

            newNode.onAfterMount();
        }
    }
}