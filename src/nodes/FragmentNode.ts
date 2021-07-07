import VirtualNode from "./VirtualNode";
import VirtualText from "./VirtualText";

export class Fragment {}

export default class FragmentNode {

    isFragmentNode: boolean = true;

    element?: Node;

    constructor(

        /**
         * The props to be applied to the parent element
         */
        public props: any | null,

        /**
         * The children of the element
         */
        public children: (VirtualNode | VirtualText | FragmentNode | null)[]
    ) { }

    render(): DocumentFragment {

        const { children } = this;

        const documentFragment = document.createDocumentFragment();

        for (const child of children) {

            if (child) { // It might be null

                documentFragment.appendChild(child.render());
            }
        }

        this.element = documentFragment;

        return documentFragment;
    }

    prependChildNode(vNode: VirtualNode | VirtualText) {

        this.children.unshift(vNode);
    }

    appendChildNode(vNode: VirtualNode | VirtualText) {

        this.children.push(vNode);
    }
}