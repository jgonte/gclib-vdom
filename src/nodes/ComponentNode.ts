import { AnyVirtualNode, CustomElementLike } from './Definitions';
import VirtualNode from './VirtualNode';

export default abstract class ComponentNode extends VirtualNode {

    isComponent: boolean = true;

    mountedVNode?: AnyVirtualNode;

    constructor(

        public props: any,

        public children: any
    ) { 
        super();
    }

    renderDom(): CustomElementLike | Text | null {

        const vNode = this.render(); // Call the custom method of the component

        if (vNode === null) {

            return null;
        }

        const dom = vNode.renderDom(); // Generate the DOM element

        vNode.dom = dom; // Set the (root) DOM element of the virtual node

        this.mountedVNode = vNode; // Set the mounted node to diff against if needed

        (dom as any).component = this; // Set the component in the DOM element so its hooks can be called from the DOM is needed

        return dom as any;
    }

    abstract render(): AnyVirtualNode;
}