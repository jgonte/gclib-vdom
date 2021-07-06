import { createDOMElement } from "./helpers/createDOMElement";
import VirtualText from "./VirtualText";
import { LifecycleHooks } from "../patches/Patch";
import FragmentNode from "./FragmentNode";

export type CustomElementLike = Element & LifecycleHooks; 

/**
 * Defines a virtual node
 */
export default class VirtualNode {

    isVirtualNode: boolean = true;

    element?: Node;

    /**
     * The reference to the functional component so we can call its hooks when rendering it
     */
    functionalComponent?: object;

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

        // If this virtual node has a functionalComponet attached, transfer it to the element so it can notify its children when will disconnect
        (element as any).functionalComponent = this.functionalComponent;
        
        for (const child of children) {

            if (child) { // It might be null

                const fc = (child as VirtualNode).functionalComponent;

                const node = child.render();

                if (fc !== undefined && (fc as any).nodeWillConnect !== undefined) {

                    (fc as any).nodeWillConnect(node);
                }

                element.appendChild(node);

                if (fc !== undefined && (fc as any).nodeDidConnect !== undefined) {

                    (fc as any).nodeDidConnect(node);
                }
            }
        }

        this.element = element;

        return element;
    }
}