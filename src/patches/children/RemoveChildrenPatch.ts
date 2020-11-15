import { Patch, PatchOptions, NodeChanges } from "../Patch";

/**
 * Patch to remove all the children from the element in the DOM
 */
export default class RemoveChildrenPatch implements Patch {

    applyPatch(options: PatchOptions): void {

        const { 
            node, 
            parentNode,
            context,
            hooks
        } = options;

        const {
            nodeWillDisconnect
        } = hooks || {};

        const removedChildrenElements: Array<Node> = [];

        const n = node instanceof DocumentFragment ?
            parentNode :
            node;

        while (n!.firstChild) {

            const child = n!.firstChild;

            if (nodeWillDisconnect) {

                nodeWillDisconnect(child);
            }

            n!.removeChild(child);

            removedChildrenElements.push(child);
        }

        context!.setNodeChanges(
            n!,
            new NodeChanges({
                removed: removedChildrenElements
            })
        );
    }
}