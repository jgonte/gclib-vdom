import { Patch, PatchOptions, NodeChanges } from "../Patch";
import ElementNode from "../../nodes/ElementNode";
import TextNode from "../../nodes/TextNode";
import callHook from "../helpers/callHook";
import { renderNode } from "../helpers/renderNode";

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
        public newNode: ElementNode | TextNode
    ) { }

    applyPatch(options: PatchOptions): void {

        const {
            node,
            parentNode,
            context,
            hooks
        } = options;

        const insertedChildrenElements: Array<Node> = [];

        const removedChildrenElements: Array<Node> = [];

        const { 
            index,
            newNode
        } = this;

        const newChild = renderNode(newNode);

        const n = node instanceof DocumentFragment ?
            parentNode :
            node

        const oldChild = (n as HTMLElement).children[index];

        if (oldChild) {

            // Save the original element in the context
            context!.setOriginalElement(oldChild, index);

            callHook(oldChild!, 'nodeWillDisconnect', hooks);

            callHook(newChild!, 'nodeWillConnect', hooks);

            (n as HTMLElement).replaceChild(newChild, oldChild);

            callHook(newChild!, 'nodeDidConnect', hooks);

            removedChildrenElements.push(oldChild);

            insertedChildrenElements.push(newChild);
        }
        else {

            callHook(newChild!, 'nodeWillConnect', hooks);

            (n as HTMLElement).appendChild(newChild);

            callHook(newChild!, 'nodeDidConnect', hooks);

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