import { Patch, PatchOptions, NodeChanges } from "../Patch";
import ElementNode from "../../nodes/ElementNode";
import TextNode from "../../nodes/TextNode";
import callHook from "../helpers/callHook";

/**
 * Patch to replace the element in the DOM
 */
export default class ReplaceElementPatch implements Patch {

    constructor(

        /**
         * The new node to replace the element
         */
        public newNode: ElementNode | TextNode
    ) { }

    applyPatch(options: PatchOptions): void {

        const {
            parentNode,
            node,
            parentContext,
            context,
            hooks
        } = options;

        const newNode = this.newNode.renderDom();

        callHook(node!, 'nodeWillDisconnect', hooks);

        callHook(newNode!, 'nodeWillConnect', hooks);

        (node as HTMLElement).replaceWith(newNode);

        callHook(newNode!, 'nodeDidConnect', hooks);

        (parentContext || context)!.setNodeChanges(
            parentNode,
            new NodeChanges({
                inserted: [newNode!],
                removed: [node!]
            })
        );
    }

}