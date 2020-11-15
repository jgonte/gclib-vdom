import { Patch, PatchOptions, NodeChanges } from "../Patch";

/**
 * Patch to move a child from one position to another
 */
export default class MoveChildPatch implements Patch {

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

        const { 
            node, 
            parentNode,
            context, 
            hooks 
        } = options;

        const {
            nodeWillDisconnect,
            nodeWillConnect,
            nodeDidConnect
        } = hooks || {};

        const movedChildrenElements: Array<Node> = [];

        const { from, to, offset } = this;

        const n = node instanceof DocumentFragment?
            parentNode:
            node;

        // Check if it is in the context
        let movingChild = context!.getOriginalElement(from); // Get the original element that was at that index before being removed

        if (!movingChild) { // Not found in the context

            movingChild = (n as HTMLElement).children[from - offset];
        }

        const originalElement = (n as HTMLElement).children[to]; 

        if (originalElement) {

            // Save the original element in the context
            context!.setOriginalElement(originalElement, to);

            if (nodeWillDisconnect) {

                nodeWillDisconnect(originalElement);
            }

            if (nodeWillConnect) {

                nodeWillConnect(movingChild);
            }

            (n as HTMLElement).replaceChild(movingChild, originalElement);

            if (nodeDidConnect) {

                nodeDidConnect(movingChild);
            }

            movedChildrenElements.push(movingChild);
        }
        else {

            if (nodeWillConnect) {

                nodeWillConnect(movingChild);
            }

            (n as HTMLElement).appendChild(movingChild);

            if (nodeDidConnect) {

                nodeDidConnect(movingChild);
            }

            movedChildrenElements.push(movingChild);
        }

        context!.setNodeChanges(
            n!,
            new NodeChanges({
                moved: movedChildrenElements,
            })
        );
    }
}