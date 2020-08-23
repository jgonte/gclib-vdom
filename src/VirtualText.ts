export default class VirtualText {

    constructor(

        /**
         * The text of the element
         */
        public text: string | number | boolean

    ) { }

    render(): Text {

        return document.createTextNode(this.text.toString());
    }

}