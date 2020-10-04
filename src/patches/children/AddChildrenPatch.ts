import { Patch } from "../Patch";
import { VirtualNode, VirtualText } from "../../gclib-vdom";
import { CustomElementLike } from "../CustomElementLike";

/**
 * Patch to add an attribute to the DOM element
 */
export default class AddChildrenPatch extends Patch {

    constructor(

        /**
         * The new node to replace the element
         */
        public children: Array<VirtualNode | VirtualText>
    ) {
        super();
    }

    applyPatch(parentNode: Node | Document | ShadowRoot, node: CustomElementLike): void {

        const insertedChildrenElements: Array<Node> = [];

        const fragment = document.createDocumentFragment();

        this.children.forEach(child => {

            const childElement = child.render() as CustomElementLike;

            insertedChildrenElements.push(childElement);

            if (childElement.onBeforeMount) {

                childElement.onBeforeMount();
            }

            fragment.appendChild(childElement);

            if (childElement.onAfterMount) {

                childElement.onAfterMount();
            }
        });

        node.appendChild(fragment);

        if (node.onAfterChildrenUpdated) {

            node.onAfterChildrenUpdated({
                inserted: insertedChildrenElements,
                moved: [],
                removed: []
            });
        }
    }
}