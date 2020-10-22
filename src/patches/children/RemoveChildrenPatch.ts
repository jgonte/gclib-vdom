import { Patch, PatchOptions } from "../Patch";

/**
 * Patch to remove all the children from the element in the DOM
 */
export default class RemoveChildrenPatch implements Patch {

    applyPatch(options: PatchOptions): void {

        const { node, hooks } = options;

        const {
            nodeWillDisconnect: onBeforeUnmount,
            nodeDidUpdateChildren: onAfterChildrenUpdated
        } = hooks || {};

        const removedChildrenElements: Array<Node> = [];

        while (node!.firstChild) {

            const child = node!.firstChild;

            if (onBeforeUnmount) {

                onBeforeUnmount(child);
            }

            node!.removeChild(child);

            removedChildrenElements.push(child);
        }

        if (onAfterChildrenUpdated) {

            onAfterChildrenUpdated(node!, {
                inserted: [],
                moved: [],
                removed: removedChildrenElements
            });
        }
    }
}