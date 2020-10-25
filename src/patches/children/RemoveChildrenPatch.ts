import { Patch, PatchOptions } from "../Patch";

/**
 * Patch to remove all the children from the element in the DOM
 */
export default class RemoveChildrenPatch implements Patch {

    applyPatch(options: PatchOptions): void {

        const { node, hooks } = options;

        const {
            nodeWillDisconnect,
            nodeDidUpdate
        } = hooks || {};

        const removedChildrenElements: Array<Node> = [];

        while (node!.firstChild) {

            const child = node!.firstChild;

            if (nodeWillDisconnect) {

                nodeWillDisconnect(child);
            }

            node!.removeChild(child);

            removedChildrenElements.push(child);
        }

        if (nodeDidUpdate) {

            nodeDidUpdate(node!, {
                inserted: [],
                moved: [],
                removed: removedChildrenElements
            });
        }
    }
}