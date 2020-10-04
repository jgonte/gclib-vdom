import { CustomElementLike } from "../CustomElementLike";
import { Patch } from "../Patch";

/**
 * Patch to remove the element from the DOM
 */
export default class RemoveElementPatch extends Patch {

    applyPatch(parentNode: Node | Document | ShadowRoot, node: CustomElementLike): void {
        
        if (node.onBeforeUnmount) {

            node.onBeforeUnmount();
        }

        parentNode.removeChild(node);
    }
}