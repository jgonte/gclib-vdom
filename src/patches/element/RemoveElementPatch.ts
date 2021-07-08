import callHook from "../helpers/callHook";
import { Patch, PatchOptions, NodeChanges } from "../Patch";

/**
 * Patch to remove the element from the DOM
 */
export default class RemoveElementPatch implements Patch {

    applyPatch(options: PatchOptions): void {

        const {
            parentNode,
            node,
            context,
            hooks
        } = options;

        callHook(node!, 'nodeWillDisconnect', hooks!);

        parentNode.removeChild(node!);

        context!.setNodeChanges(
            parentNode,
            new NodeChanges({
                removed: [node!]
            })
        );
    }
}