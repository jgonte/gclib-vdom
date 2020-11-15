import { Patch, PatchOptions, NodeChanges } from "../Patch";
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

        const insertedChildrenElements: Array<Node> = [];

        const removedChildrenElements: Array<Node> = [];

        const { index } = this;

        const newChild = this.newNode.render();

        const n = node instanceof DocumentFragment ?
            parentNode :
            node

        const oldChild = (n as HTMLElement).children[index];

        if (oldChild) {

            // Save the original element in the context
            context!.setOriginalElement(oldChild, index);

            if (nodeWillDisconnect) {

                nodeWillDisconnect(oldChild);
            }

            if (nodeWillConnect) {

                nodeWillConnect(newChild);
            }

            (n as HTMLElement).replaceChild(newChild, oldChild);

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

            (n as HTMLElement).appendChild(newChild);

            if (nodeDidConnect) {

                nodeDidConnect(newChild);
            }

            insertedChildrenElements.push(newChild);
        }

        context!.setNodeChanges(
            n!,
            new NodeChanges({
                inserted: insertedChildrenElements,
                removed: removedChildrenElements
            })
        );
    }

}