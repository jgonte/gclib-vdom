import { ComponentBaseConstructor } from "../component/ComponentBase";
import { CustomElementLike } from "../patches/CustomElementLike";
import { createElement } from "./helpers/createElement";
import VirtualText from "./VirtualText";

/**
 * Defines a virtual node
 */
export default class VirtualNode {

    constructor(

        /**
         * The name of the element
         */
        public name: string | ComponentBaseConstructor,

        /**
         * The props of the element
         */
        public props: any | null,

        /**
         * The children of the element or the text
         */
        public children: (VirtualNode | VirtualText)[]

    ) { }

    isVirtualNode: boolean = true;

    get key(): string {

        return this.props ? this.props.key : undefined;
    }

    render(): CustomElementLike {

        const { name, props, children} = this;

        const element = createElement(name, props) as CustomElementLike;
        
        for (const child of children) {

            if (child) { // It might be null

                element.appendChild(child.render());
            }
        }

        return element;
    }
}