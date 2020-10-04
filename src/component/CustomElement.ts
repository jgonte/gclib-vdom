import { diff, VirtualNode, VirtualText } from "../gclib-vdom";
import { CustomElementBase } from "../patches/CustomElementLike";

export abstract class CustomElement extends HTMLElement implements CustomElementBase{

    /** Previous node to diff with the current one */
    private previousNode?: VirtualNode | VirtualText;

    constructor() {

        super();

        this.attachShadow({ mode: "open" });
    }

    abstract render() : VirtualNode | VirtualText;

    update() : void {

        let currentNode: VirtualNode | VirtualText = this.render();

        const patches = diff(this.previousNode, currentNode);

        this.previousNode = currentNode;

        patches.applyPatches(this.shadowRoot!, this.rootElement);
    }

    get rootElement()  {

        return this.shadowRoot!.lastChild;
    }

    onBeforeMount() {

        console.log('onBeforeMount');
    }

    onAfterMount() {

        console.log('onAfterMount');
    }

    onBeforeUnmount() {

        console.log('onBeforeUnmount');
    }

    onAfterChildrenUpdated(updatedChildren: any) {

        console.log('onAfterChildrenUpdated');
    }
   
}