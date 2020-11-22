import { createDOMElement } from "./helpers/createDOMElement";
import VirtualText from "./VirtualText";
import { LifecycleHooks } from "../patches/Patch";
import { FragmentNode } from "../gclib-vdom";

export type CustomElementLike = Element & LifecycleHooks; 

/**
 * Defines a virtual node
 */
export default class VirtualNode {

    isVirtualNode: boolean = true;

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
        public children: (VirtualNode | VirtualText | FragmentNode)[]

    ) { }

    get key(): string {

        return this.props ? this.props.key : undefined;
    }

    render(): CustomElementLike {

        const { name, props, children} = this;

        const element = createDOMElement(name, props) as CustomElementLike;
        
        for (const child of children) {

            if (child) { // It might be null

                element.appendChild(child.render());
            }
        }

        return element;
    }
}