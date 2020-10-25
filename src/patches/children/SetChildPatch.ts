import { Patch, PatchOptions } from "../Patch";
import VirtualNode from "../../nodes/VirtualNode";
import VirtualText from "../../nodes/VirtualText";

/**
 * Patch to set a new child at a given index
 */
export default class SetChildPatch implements Patch {

    constructor(

        /**
         * The index to set the child
         */
        public index: number,

        /**
         * The new node to replace the existing element
         */
        public newNode: VirtualNode | VirtualText
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

        const removedChildrenElements: Array<Node> = [];

        const { index } = this;

        const newChild = this.newNode.render();

        const oldChild = (node as HTMLElement).children[index];

        if (oldChild) {

            // Save the original element in the context
            context!.setOriginalElement(oldChild, index);

            if (nodeWillDisconnect) {

                nodeWillDisconnect(oldChild);
            }

            if (nodeWillConnect) {

                nodeWillConnect(newChild);
            }

            (node as HTMLElement).replaceChild(newChild, oldChild);

            if (nodeDidConnect) {

                nodeDidConnect(newChild);
            }

            removedChildrenElements.push(oldChild);

            insertedChildrenElements.push(newChild);
        }
        else {

            if (nodeWillConnect) {

                nodeWillConnect(newChild);
            }

            (node as HTMLElement).appendChild(newChild);

            if (nodeDidConnect) {

                nodeDidConnect(newChild);
            }

            insertedChildrenElements.push(newChild);
        }

        if (nodeDidUpdate) {

            nodeDidUpdate(node!, {
                inserted: insertedChildrenElements,
                moved: [],
                removed: removedChildrenElements
            });
        }
    }

}