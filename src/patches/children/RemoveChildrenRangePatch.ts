import { Patch, PatchOptions, NodeChanges } from "../Patch";

/**
 * Patch to remove a range of children from the element in the DOM
 */
export default class RemoveChildrenRangePatch implements Patch {

    constructor(

        /**
         * The index of the first element to remove
         */
        public from: number,

        /**
        * The number of children to remove
        */
        public count: number

    ) { }

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

        // When a previous element is removed the next element occupies the previous index therefore we use the first index only
        const index: number = this.from;

        const to: number = this.from + this.count - 1;

        for (let i: number = index; i <= to; ++i) {

            const child = (node as HTMLElement).children[index];

            if (child) { // It might be already removed

                if (nodeWillDisconnect) {

                    nodeWillDisconnect(child);
                }

                (node as HTMLElement).removeChild(child);

                removedChildrenElements.push(child);
            }
        }

        context!.setNodeChanges(
            node!,
            new NodeChanges({
                removed: removedChildrenElements
            })
        );
    }

}