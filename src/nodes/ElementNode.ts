import { createDOMElement } from "./helpers/createDOMElement";
import TextNode from "./TextNode";
import FragmentNode from "./FragmentNode";
import { CustomElementLike } from "./Definitions";

/**
 * Defines an element node
 */
export default class ElementNode {

    isElement: boolean = true;

    element?: Node;

    /**
     * The reference to the functional or web component so we can call its hooks when rendering it
     */
    component?: object;

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
        public children: (ElementNode | TextNode | FragmentNode)[]

    ) { }

    get key(): string {

        return this.props ? this.props.key : undefined;
    }

    renderDom(): CustomElementLike {

        const { name, props, children} = this;

        const dom = createDOMElement(name, props) as CustomElementLike;

        // If this virtual node has a component attached, transfer it to the element so it can notify its children when will disconnect
        (dom as any).component = this.component;
        
        for (const child of children) {

            if (child) { // It might be null

                const c = (child as ElementNode).component;

                const node = child.renderDom();

                if (c !== undefined && (c as any).nodeWillConnect !== undefined) {

                    (c as any).nodeWillConnect(node);
                }

                dom.appendChild(node);

                if (c !== undefined && (c as any).nodeDidConnect !== undefined) {

                    (c as any).nodeDidConnect(node);
                }
            }
        }

        this.element = dom;

        return dom;
    }
}