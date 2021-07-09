import { AnyVirtualNode } from "./Definitions";
import ElementNode from "./ElementNode";
import TextNode from "./TextNode";
import VirtualNode from "./VirtualNode";

export class Fragment {}

export default class FragmentNode extends VirtualNode {

    isFragment: boolean = true;

    constructor(

        /**
         * The props to be applied to the parent element
         */
        public props: any | null,

        /**
         * The children of the element
         */
        public children: AnyVirtualNode[]
    ) {
        super();
     }

    renderDom(): DocumentFragment {

        const { children } = this;

        const dom = document.createDocumentFragment();

        for (const child of children) {

            if (child !== null) { // It might be null

                dom.appendChild(child.renderDom() as Node);
            }
        }

        this.dom = dom;

        return dom;
    }

    prependChildNode(vNode: ElementNode | TextNode) {

        this.children.unshift(vNode);
    }

    appendChildNode(vNode: ElementNode | TextNode) {

        this.children.push(vNode);
    }
}