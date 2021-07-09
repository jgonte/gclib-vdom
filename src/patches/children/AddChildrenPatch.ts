import { Patch, PatchOptions, NodeChanges } from '../Patch';
import callHook from '../helpers/callHook';
import { AnyVirtualNode } from '../../nodes/Definitions';

/**
 * Patch to add children to the DOM
 */
export default class AddChildrenPatch implements Patch {

    constructor(

        /**
         * The new children to add
         */
        public children: AnyVirtualNode[]
    ) { }

    applyPatch(options: PatchOptions): void {

        const { 
            node,
            context,
            hooks 
        } = options;

        const insertedChildrenElements: Node[] = [];

        const fragment = document.createDocumentFragment();

        this.children.forEach(child => {

            if (child === null) {

                return;
            }

            const childElement = child.renderDom();

            insertedChildrenElements.push(childElement as Node);

            callHook(childElement!, 'nodeWillConnect', hooks);

            fragment.appendChild(childElement as Node);

            // Do this after all the children have been appended so their siblings can be accessed if needed
            // if (nodeDidConnect) {

            //     nodeDidConnect(childElement);
            // }
        });

        // At this point all the children have been connected
        // Call the nodeDidConnect so the children have access to their siblings
        insertedChildrenElements.forEach(childElement => {

            callHook(childElement!, 'nodeDidConnect', hooks);
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