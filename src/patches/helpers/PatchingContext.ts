import { NodeChanges } from "../Patch";

export type NodeDidUpdateFunction = (node: Node, nodeChanges: NodeChanges) => void;
/**
 * Tracks the changes to the patching for a given element patches
 */
export default class PatchingContext {

    /**
     * The elements that were originally in the DOM at a given index
     * before new elements were set or other elements moved
     */
    private _original: Map<number, Element> = new Map<number, Element>();

    /**
     * The nodes that had of their children updated
     */
    private _changedNodes: Map<Node, NodeChanges> = new Map<Node, NodeChanges>();

    setOriginalElement(element: Element, index: number): void {

        this._original.set(index, element);
    }

    getOriginalElement(index: number): Element | undefined {

        const element = this._original.get(index);

        if (element) {

            this._original.delete(index); // Clear the replaced element

            this.unsetRemovedElement(element);
        }

        return element;
    }

    unsetRemovedElement(element: Element) {

        this._changedNodes.forEach((nodeChanges, node) => {

            const index = nodeChanges.removed.indexOf(element);

            if (index > -1) {

                nodeChanges.removed.splice(index, 1);
            }
        });
    }

    /**
     * Sets the information about the changes that happened in the node
     * So after all the updates are done, the node calls nodeDidUpdate passing those node updates
     * @param node The node to set the changes for
     * @param nodeChanges
     */
    setNodeChanges(node: Node, nodeChanges: NodeChanges) {

        if (this._changedNodes.has(node)) {

            const changes = this._changedNodes.get(node);

            changes!.merge(nodeChanges);
        }
        else {

            this._changedNodes.set(node, nodeChanges);
        }
    }

    /**
     * Add any left original elements that is not already in the removed nodes into the removed node changes
     */
    mergeOriginalElements(node: Node) {

        const removed: Array<Node> = Array.from(this._original.values());

        if (removed.length > 0) {

            this.setNodeChanges(
                node,
                new NodeChanges({
                    removed
                })
            );
        }
    }

    callDidUpdateForNodes(nodeDidUpdate: NodeDidUpdateFunction) {

        // Get the nodes with added or moved children
        this._changedNodes.forEach((nodeChanges, node) => {

            const nodes: Array<Node> = [...nodeChanges.inserted, ...nodeChanges.moved];

            for (let i = 0; i < nodes.length; ++i) {

                // Traverse the children down until there are no children
                this.callDidUpdateForNode(nodes[i], nodeDidUpdate);
            }

            nodeDidUpdate(node, nodeChanges);

            this._changedNodes.delete(node);
        });
    }

    callDidUpdateForNode(node: Node, nodeDidUpdate: NodeDidUpdateFunction) {

        if (this._changedNodes.has(node)) { // This node has changes

            const nodeChanges = this._changedNodes.get(node);

            const nodes: Array<Node> = [...nodeChanges!.inserted, ...nodeChanges!.moved];

            for (let i = 0; i < nodes.length; ++i) {

                // Traverse the children down until there is no children
                this.callDidUpdateForNode(nodes[i], nodeDidUpdate);
            }

            this._changedNodes.delete(node);
        }
        // else - The node hasn't changed, no need to call nodeDidUpdate
    }

}