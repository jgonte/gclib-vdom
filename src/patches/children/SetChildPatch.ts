import { Patch } from "../Patch";
import VirtualNode from "../../nodes/VirtualNode";
import VirtualText from "../../nodes/VirtualText";
import PatchingContext from "../helpers/PatchingContext";
import { CustomElementLike } from "../CustomElementLike";

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

    applyPatch(parentNode: Node | Document | ShadowRoot, node: CustomElementLike, context: PatchingContext): void {

        const insertedChildrenElements: Array<Node> = [];

        const removedChildrenElements: Array<Node> = [];

        const { index } = this;

        const newChild = this.newNode.render() as CustomElementLike;

        const originalElement = node.children[index] as CustomElementLike;

        if (originalElement) {

            // Save the original element in the context
            context.setOriginalElement(originalElement, index);

            if (originalElement.onBeforeUnmount) {

                originalElement.onBeforeUnmount();
            }

            if (newChild.onBeforeMount) {

                newChild.onBeforeMount();
            }

            node.replaceChild(newChild, originalElement);
 
            if (newChild.onAfterMount) {

                newChild.onAfterMount();
            }

            removedChildrenElements.push(originalElement);

            insertedChildrenElements.push(newChild);
        }
        else {

            if (newChild.onBeforeMount) {

                newChild.onBeforeMount();
            }

            node.appendChild(newChild);

            if (newChild.onAfterMount) {

                newChild.onAfterMount();
            }

            insertedChildrenElements.push(newChild);
        }

        if (node.onAfterChildrenUpdated) {

            node.onAfterChildrenUpdated({
                inserted: insertedChildrenElements,
                moved: [],
                removed: removedChildrenElements
            });
        }
    }

}