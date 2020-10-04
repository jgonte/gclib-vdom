import PatchingContext from "../helpers/PatchingContext";
import { CustomElementLike } from "../CustomElementLike";
import { Patch } from "../Patch";

/**
 * Patch to remove all the children from the element in the DOM
 */
export default class RemoveChildrenPatch extends Patch {

    applyPatch(parentNode: Node | Document | ShadowRoot, node: CustomElementLike): void {
        
        const removedChildrenElements: Array<Node> = [];

        while (node.firstChild) {

            const child = node.firstChild as CustomElementLike;

            if (child.onBeforeUnmount) {

                child.onBeforeUnmount();
            }

            node.removeChild(child);

            removedChildrenElements.push(child);
        }

        if (node.onAfterChildrenUpdated) {

            node.onAfterChildrenUpdated({
                inserted: [],
                moved: [],
                removed: removedChildrenElements
            });
        }
    }   
}