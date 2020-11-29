import VirtualNode from "./VirtualNode";
import VirtualText from "./VirtualText";

export class Fragment {}

export default class FragmentNode {

    isFragmentNode: boolean = true;

    constructor(

        /**
         * The props to be applied to the parent element
         */
        public props: any | null,

        /**
         * The children of the element
         */
        public children: (VirtualNode | VirtualText)[]
    ) { }

    render(): DocumentFragment {

        const { children } = this;

        const documentFragment = document.createDocumentFragment();

        for (const child of children) {

            if (child) { // It might be null

                documentFragment.appendChild(child.render());
            }
        }

        return documentFragment;
    }
}