import { Patch, PatchOptions } from "../Patch";

/**
 * Patch to move a child from one position to another
 */
export default class MoveElementPatch implements Patch {

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

    ) { }

    applyPatch(options: PatchOptions): void {

        const { node, context, hooks } = options;

        const {
            nodeWillDisconnect: onBeforeUnmount,
            nodeWillConnect: onBeforeMount,
            nodeDidConnect: onAfterMount,
            nodeDidUpdateChildren: onAfterChildrenUpdated
        } = hooks || {};

        const insertedChildrenElements: Array<Node> = [];

        const movedChildrenElements: Array<Node> = [];

        const { from, to, offset } = this;

        // Check if it is in the context
        let movingChild = context!.getOriginalElement(from); // Get the original element that was at that index before being removed

        if (!movingChild) { // Not found in the context

            movingChild = (node as HTMLElement).children[from - offset];
        }

        const originalElement = (node as HTMLElement).children[to];

        if (originalElement) {

            // Save the original element in the context
            context!.setOriginalElement(originalElement, to);

            if (onBeforeUnmount) {

                onBeforeUnmount(originalElement);
            }

            if (onBeforeMount) {

                onBeforeMount(movingChild);
            }

            (node as HTMLElement).replaceChild(movingChild, originalElement);

            if (onAfterMount) {

                onAfterMount(movingChild);
            }

            movedChildrenElements.push(movingChild);
        }
        else {

            if (onBeforeMount) {

                onBeforeMount(movingChild);
            }

            (node as HTMLElement).appendChild(movingChild);

            if (onAfterMount) {

                onAfterMount(movingChild);
            }

            insertedChildrenElements.push(movingChild);
        }

        if (onAfterChildrenUpdated) {

            onAfterChildrenUpdated(node!, {
                inserted: insertedChildrenElements,
                moved: movedChildrenElements,
                removed: []
            });
        }
    }
}