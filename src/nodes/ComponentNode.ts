import { CustomElementLike } from './Definitions';
import ElementNode from './ElementNode';
import TextNode from './TextNode';

export default abstract class ComponentNode {

    isComponent: boolean = true;

    private _mountedVNode?: ElementNode | TextNode;

    constructor(

        public props: any,

        public children: any
    ) { }

    get mountedVNode(): ElementNode | TextNode | undefined {

        return this._mountedVNode;
    }

    renderDom(): CustomElementLike | Text {

        const vNode = this.render(); // Call the custom method of the component

        const dom = vNode.renderDom(); // Generate the DOM element

        this._mountedVNode = vNode; // Set the mounted node to diff agains if needed

        (dom as any).component = this; // Set the component in the DOM element so its hooks can be called from the DOM is needed

        return dom;
    }

    abstract render(): ElementNode | TextNode;
}