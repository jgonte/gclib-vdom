import { Patch, PatchOptions } from "../Patch";
import { VirtualNode, VirtualText } from "../../gclib-vdom";

/**
 * Patch to add an attribute to the DOM element
 */
export default class AddChildrenPatch implements Patch {

    constructor(

        /**
         * The new children to add
         */
        public children: Array<VirtualNode | VirtualText>
    ) { }

    applyPatch(options: PatchOptions): void {

        const { node, hooks } = options;

        const {
            nodeWillConnect: onBeforeMount,
            nodeDidConnect: onAfterMount,
            nodeDidUpdateChildren: onAfterChildrenUpdated
        } = hooks || {};

        const insertedChildrenElements: Array<Node> = [];

        const fragment = document.createDocumentFragment();

        this.children.forEach(child => {

            const childElement = child.render();

            insertedChildrenElements.push(childElement);

            if (onBeforeMount) {

                onBeforeMount(childElement);
            }

            fragment.appendChild(childElement);

            if (onAfterMount) {

                onAfterMount(childElement);
            }

        });

        (node as HTMLElement).appendChild(fragment);

        if (onAfterChildrenUpdated) {

            onAfterChildrenUpdated(node!, {
                inserted: insertedChildrenElements,
                moved: [],
                removed: []
            });
        }
    }
}