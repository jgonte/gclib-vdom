import ElementNode from "./ElementNode";
import TextNode from "./TextNode";

export class Fragment {}

export default class FragmentNode {

    isFragment: boolean = true;

    element?: Node;

    constructor(

        /**
         * The props to be applied to the parent element
         */
        public props: any | null,

        /**
         * The children of the element
         */
        public children: (ElementNode | TextNode | FragmentNode | null)[]
    ) { }

    renderDom(): DocumentFragment {

        const { children } = this;

        const dom = document.createDocumentFragment();

        for (const child of children) {

            if (child) { // It might be null

                dom.appendChild(child.renderDom());
            }
        }

        this.element = dom;

        return dom;
    }

    prependChildNode(vNode: ElementNode | TextNode) {

        this.children.unshift(vNode);
    }

    appendChildNode(vNode: ElementNode | TextNode) {

        this.children.push(vNode);
    }
}