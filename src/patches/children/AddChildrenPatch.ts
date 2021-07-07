import { Patch, PatchOptions, NodeChanges } from '../Patch';
import VirtualNode from '../../nodes/VirtualNode';
import VirtualText from '../../nodes/VirtualText';
import { FragmentNode } from '../../gclib-vdom';

/**
 * Patch to add children to the DOM
 */
export default class AddChildrenPatch implements Patch {

    constructor(

        /**
         * The new children to add
         */
        public children: Array<VirtualNode | VirtualText | FragmentNode | null>
    ) { }

    applyPatch(options: PatchOptions): void {

        const { 
            node,
            context,
            hooks 
        } = options;

        const {
            nodeWillConnect,
            nodeDidConnect
        } = hooks || {};

        const insertedChildrenElements: Array<Node> = [];

        const fragment = document.createDocumentFragment();

        this.children.forEach(child => {

            if (child === null) {

                return;
            }

            const childElement = child.render();

            insertedChildrenElements.push(childElement);

            if (nodeWillConnect) {

                nodeWillConnect(childElement);
            }

            fragment.appendChild(childElement);

            // Do this after all the children have been appended so their siblings can be accessed if needed
            // if (nodeDidConnect) {

            //     nodeDidConnect(childElement);
            // }
        });

        // At this point all the children have been connected
        // Call the nodeDidConnect so the children have access to their siblings
        insertedChildrenElements.forEach(childElement => {

            if (nodeDidConnect) {

                nodeDidConnect(childElement);
            }
        });

        (node as HTMLElement).appendChild(fragment);

        context!.setNodeChanges(
            node!,
            new NodeChanges({
                inserted: insertedChildrenElements
            })
        );
    }
}