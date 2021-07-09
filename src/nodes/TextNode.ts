import VirtualNode from "./VirtualNode";

export default class TextNode extends VirtualNode{

    isText: boolean = true;

    constructor(

        /**
         * The text of the element
         */
        public text: string | number | boolean

    ) { 
        super();
    }

    renderDom(): Text {

        const dom = document.createTextNode(this.text.toString());

        this.dom = dom;

        return dom;
    }

}