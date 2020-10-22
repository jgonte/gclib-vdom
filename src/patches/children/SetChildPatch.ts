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
            nodeWillDisconnect: onBeforeUnmount,
            nodeWillConnect: onBeforeMount,
            nodeDidConnect: onAfterMount,
            nodeDidUpdateChildren: onAfterChildrenUpdated
        } = hooks || {};

        const insertedChildrenElements: Array<Node> = [];

        const removedChildrenElements: Array<Node> = [];

        const { index } = this;

        const newChild = this.newNode.render();

        const originalElement = (node as HTMLElement).children[index];

        if (originalElement) {

            // Save the original element in the context
            context!.setOriginalElement(originalElement, index);

            if (onBeforeUnmount) {

                onBeforeUnmount(originalElement);
            }

            if (onBeforeMount) {

                onBeforeMount(newChild);
            }

            (node as HTMLElement).replaceChild(newChild, originalElement);

            if (onAfterMount) {

                onAfterMount(newChild);
            }

            removedChildrenElements.push(originalElement);

            insertedChildrenElements.push(newChild);
        }
        else {

            if (onBeforeMount) {

                onBeforeMount(newChild);
            }

            (node as HTMLElement).appendChild(newChild);

            if (onAfterMount) {

                onAfterMount(newChild);
            }

            insertedChildrenElements.push(newChild);
        }

        if (onAfterChildrenUpdated) {

            onAfterChildrenUpdated(node!, {
                inserted: insertedChildrenElements,
                moved: [],
                removed: removedChildrenElements
            });
        }
    }

}