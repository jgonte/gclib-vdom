import { createDOMElement } from "./helpers/createDOMElement";
import { AnyVirtualNode, CustomElementLike } from "./Definitions";
import VirtualNode from "./VirtualNode";

/**
 * Defines an element node
 */
export default class ElementNode extends VirtualNode {

    isElement: boolean = true;

    constructor(

        /**
         * The name of the element
         */
        public name: string,

        /**
         * The props of the element
         */
        public props: any | null,

        /**
         * The children of the element or the text
         */
        public children: AnyVirtualNode[]

    ) {
        super();
    }

    get key(): string {

        return this.props ? this.props.key : undefined;
    }

    renderDom(): CustomElementLike {

        const { name, props, children } = this;

        const dom = createDOMElement(name, props) as CustomElementLike;

        // If this virtual node has a component attached, transfer it to the element so it can notify its children when will disconnect
        (dom as any).component = this.component;

        for (const child of children) {

            if (child !== null) { // It might be null

                const c = child.component;

                const node = child.renderDom();

                if (c !== undefined && (c as any).nodeWillConnect !== undefined) {

                    (c as any).nodeWillConnect(node);
                }

                dom.appendChild(node as Node);

                if (c !== undefined && (c as any).nodeDidConnect !== undefined) {

                    (c as any).nodeDidConnect(node);
                }
            }
        }

        this.dom = dom;

        return dom;
    }
}