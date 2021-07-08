export default class TextNode {

    isText: boolean = true;

    element?: Node;

    constructor(

        /**
         * The text of the element
         */
        public text: string | number | boolean

    ) { }

    renderDom(): Text {

        const dom = document.createTextNode(this.text.toString());

        this.element = dom;

        return dom;
    }

}