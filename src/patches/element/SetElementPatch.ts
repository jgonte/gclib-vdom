import { Patch, PatchOptions, NodeChanges } from "../Patch";
import ElementNode from "../../nodes/ElementNode";
import TextNode from "../../nodes/TextNode";
import FragmentNode from "../../nodes/FragmentNode";
import setAttributes from "../../nodes/helpers/setAttributes";
import callHook from "../helpers/callHook";
import { renderNode } from "../helpers/renderNode";

/**
 * Patch to set a new child when the parent node is empty
 */
export default class SetElementPatch implements Patch {

    constructor(

        /**
         * The new node to set in an empty one
         */
        public newNode: ElementNode | TextNode | FragmentNode
    ) { }

    applyPatch(options: PatchOptions): void {

        const {
            parentNode,
            context,
            hooks
        } = options;

        const { props } = (this.newNode as FragmentNode);

        const newNode = renderNode(this.newNode);

        // If it is a fragment node, then call the will connect event for each of the child nodes of the fragment
        if (newNode instanceof DocumentFragment) {

            // If the newNode has props, then set them in the parent node
            if (props !== undefined && props !== null) {

                if (parentNode instanceof ShadowRoot) {

                    setAttributes(parentNode.host as any, props);
                }
                else if (parentNode instanceof Document || parentNode instanceof DocumentFragment) {

                    throw new Error('Cannot apply properties to Document or DocumentFragment')
                }
                else {

                    setAttributes(parentNode as any, props);
                }
            }

            // Set the children
            const childNodes = Array.from(newNode.childNodes);

            if (childNodes.length > 0) {

                for (let i = 0; i < childNodes.length; ++i) {

                    callHook(childNodes[i]!, 'nodeWillConnect', hooks);
                }

                parentNode.appendChild(newNode);

                for (let i = 0; i < childNodes.length; ++i) {

                    callHook(childNodes[i]!, 'nodeDidConnect', hooks);
                }

                context!.setNodeChanges(
                    parentNode,
                    new NodeChanges({
                        inserted: childNodes
                    })
                );
            }
        }
        else {

            callHook(newNode!, 'nodeWillConnect', hooks);

            parentNode.appendChild(newNode);

            callHook(newNode!, 'nodeDidConnect', hooks);

            context!.setNodeChanges(
                parentNode,
                new NodeChanges({
                    inserted: [newNode!]
                })
            );
        }
    }
}