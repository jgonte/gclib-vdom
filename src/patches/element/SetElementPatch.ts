import { Patch, PatchOptions, NodeChanges } from "../Patch";
import VirtualNode from "../../nodes/VirtualNode";
import VirtualText from "../../nodes/VirtualText";

/**
 * Patch to set a new child when the parent node is empty
 */
export default class SetElementPatch implements Patch {

    constructor(

        /**
         * The new node to set in an empty one
         */
        public newNode: VirtualNode | VirtualText
    ) {}

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