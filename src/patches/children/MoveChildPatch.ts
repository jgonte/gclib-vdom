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
            nodeWillDisconnect,
            nodeWillConnect,
            nodeDidConnect,
            nodeDidUpdate
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

            if (nodeWillDisconnect) {

                nodeWillDisconnect(originalElement);
            }

            if (nodeWillConnect) {

                nodeWillConnect(movingChild);
            }

            (node as HTMLElement).replaceChild(movingChild, originalElement);

            if (nodeDidConnect) {

                nodeDidConnect(movingChild);
            }

            movedChildrenElements.push(movingChild);
        }
        else {

            if (nodeWillConnect) {

                nodeWillConnect(movingChild);
            }

            (node as HTMLElement).appendChild(movingChild);

            if (nodeDidConnect) {

                nodeDidConnect(movingChild);
            }

            insertedChildrenElements.push(movingChild);
        }

        if (nodeDidUpdate) {

            nodeDidUpdate(node!, {
                inserted: insertedChildrenElements,
                moved: movedChildrenElements,
                removed: []
            });
        }
    }
}