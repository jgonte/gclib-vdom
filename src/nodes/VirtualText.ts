export default class VirtualText {

    isVirtualText: boolean = true;

    element?: Node;

    constructor(

        /**
         * The text of the element
         */
        public text: string | number | boolean

    ) { }

    render(): Text {

        const element = document.createTextNode(this.text.toString());

        this.element = element;

        return element;
    }

}