import { Patch } from "../Patch";
import PatchingContext from "../helpers/PatchingContext";
import { CustomElementLike } from "../CustomElementLike";

/**
 * Patch to remove an attribute from the DOM element
 */
export default class MoveElementPatch extends Patch {

    constructor(

        /**
         * The index we are moving the element from
         */
        public from: number,

        /**
        * The index we are moving the element from
        */
        public to: number,

        /**
         * The offset of the from (how many elements were removed before)
         */
        public offset: number

    ) {
        super();
    }

    applyPatch(parentNode: Node | Document | ShadowRoot, node: CustomElementLike, context: PatchingContext): void {

        const insertedChildrenElements: Array<Node> = [];

        const movedChildrenElements: Array<Node> = [];

        const { from, to, offset } = this;

        // Check if it is in the context
        let movingChild = context.getOriginalElement(from) as CustomElementLike; // Get the original element that was at that index before being removed

        if (!movingChild) { // Not found in the context

            movingChild = node.children[from - offset] as CustomElementLike;
        }

        const originalElement = node.children[to] as CustomElementLike;

        if (originalElement) {

            // Save the original element in the context
            context.setOriginalElement(originalElement, to);

            if (originalElement.onBeforeUnmount) {

                originalElement.onBeforeUnmount();
            }

            if (movingChild.onBeforeMount) {

                movingChild.onBeforeMount();
            }

            node.replaceChild(movingChild, originalElement);

            if (movingChild.onAfterMount) {

                movingChild.onAfterMount();
            }

            movedChildrenElements.push(movingChild);
        }
        else {

            if (movingChild.onBeforeMount) {

                movingChild.onBeforeMount();
            }

            node.appendChild(movingChild);

            if (movingChild.onAfterMount) {

                movingChild.onAfterMount();
            }

            insertedChildrenElements.push(movingChild);
        }

        if (node.onAfterChildrenUpdated) {

            node.onAfterChildrenUpdated({
                inserted: insertedChildrenElements,
                moved: movedChildrenElements,
                removed: []
            });
        }
    }
}