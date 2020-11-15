import { Patch, PatchOptions, NodeChanges } from "../Patch";
import VirtualNode from "../../nodes/VirtualNode";
import VirtualText from "../../nodes/VirtualText";
import { FragmentNode } from "../../gclib-vdom";

/**
 * Patch to set a new child when the parent node is empty
 */
export default class SetElementPatch implements Patch {

    constructor(

        /**
         * The new node to set in an empty one
         */
        public newNode: VirtualNode | VirtualText | FragmentNode
    ) { }

    applyPatch(options: PatchOptions): void {

        const {
            parentNode,
            context,
            hooks
        } = options;

        const {
            nodeWillConnect,
            nodeDidConnect
        } = hooks || {};

        const newNode = this.newNode.render();

        // If it is a fragment node, then call the will connect event for each of the child nodes of the fragment
        if (newNode instanceof DocumentFragment) {

            const childNodes = Array.from(newNode.childNodes);

            if (childNodes.length > 0) {

                if (nodeWillConnect) {

                    for (let i = 0; i < childNodes.length; ++i) {
    
                        nodeWillConnect(childNodes[i]);                 
                    }   
                }
    
                parentNode.appendChild(newNode);
    
                if (nodeDidConnect) {
    
                    for (let i = 0; i < childNodes.length; ++i) {
    
                        nodeDidConnect(childNodes[i]);                 
                    }   
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

            if (nodeWillConnect) {

                nodeWillConnect(newNode);
            }

            parentNode.appendChild(newNode);

            if (nodeDidConnect) {

                nodeDidConnect(newNode);
            }

            context!.setNodeChanges(
                parentNode,
                new NodeChanges({
                    inserted: [newNode!]
                })
            );
        }
    }
}