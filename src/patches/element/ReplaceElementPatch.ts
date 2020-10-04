import { Patch } from "../Patch";
import { VirtualNode, VirtualText } from "../../gclib-vdom";
import { CustomElementLike } from "../CustomElementLike";

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

    applyPatch(parentNode: Node | ShadowRoot | Document, node: CustomElementLike): void {
        
        const newNode = this.newNode.render() as CustomElementLike;

        if (node.onBeforeUnmount) {

            node.onBeforeUnmount();
        }

        if (newNode.onBeforeMount) {

            newNode.onBeforeMount();
        }
     
        node.replaceWith(newNode);

        if (newNode.onAfterMount) {

            newNode.onAfterMount();
        }
    }

}