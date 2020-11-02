import { Patch, PatchOptions, NodeChanges } from "../Patch";

/**
 * Patch to remove all the children from the element in the DOM
 */
export default class RemoveChildrenPatch implements Patch {

    applyPatch(options: PatchOptions): void {

        const { 
            node, 
            context,
            hooks
        } = options;

        const {
            nodeWillDisconnect
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

        context!.setNodeChanges(
            node!,
            new NodeChanges({
                removed: removedChildrenElements
            })
        );
    }
}