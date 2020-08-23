import VirtualText from "./VirtualText";

/**
 * Defines a virtual node
 */
export default class VirtualNode {

    constructor(

        /**
         * The name of the element
         */
        public name: string,

        /**
         * The attributes of the element
         */
        public attributes?: any | null,

        /**
         * The children of the element or the text
         */
        public children?: VirtualNode[] | VirtualText | null

    ) { }

    get key() : string {

        return this.attributes ? this.attributes.key : undefined;
    }

    render(): HTMLElement {

        const element = document.createElement(this.name);

        if (this.attributes) {

            for (const [k, v] of Object.entries(this.attributes)) {

                if (typeof v === 'string' ||
                    typeof v === 'number') {

                    element.setAttribute(k, v.toString());
                }
                else { // object, Array

                    element.setAttribute(k, JSON.stringify(v));
                }
            }
        }

        if (this.children) {

            if (Array.isArray(this.children)) {

                for (const child of this.children) {

                    element.appendChild(child.render());
                }
            }
            else { // VirtualText

                element.appendChild(this.children.render());
            }
        }

        return element;
    }

}