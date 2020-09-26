import VirtualText from "./VirtualText";

function isSvg(name: string): boolean {

    return [
        'svg',
        'use',
        'path'
    ].indexOf(name) > -1;
}

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
        public attributes: any | null,

        /**
         * The children of the element or the text
         */
        public children: (VirtualNode | VirtualText)[]

    ) { }

    isVirtualNode: boolean = true;

    get key(): string {

        return this.attributes ? this.attributes.key : undefined;
    }

    render(): HTMLElement | SVGElement {

        const element = isSvg(this.name) ?
            document.createElementNS('http://www.w3.org/2000/svg', this.name) :
            document.createElement(this.name);

        if (this.attributes) {

            for (const [k, v] of Object.entries(this.attributes)) {

                if (k === 'xlinkHref') {

                    element.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", v as string);
                }
                else if (k === 'class' && v) {

                    element.setAttribute(k, v as string);
                }
                else if (typeof v === 'string' ||
                    typeof v === 'number') {

                    element.setAttribute(k, v.toString());
                }
                else if (typeof v === 'function') {

                    const functionName: string = k;

                    if (/^on/.test(functionName)) {

                        const eventName: string = functionName.slice(2).toLowerCase();

                        element.addEventListener(eventName, v as () => void);
                    }
                    else {

                        throw Error(`Invalid event name: ${functionName}. It must start with on...`);
                    }
                }
                else { // object, Array

                    element.setAttribute(k, JSON.stringify(v));
                }
            }
        }

        for (const child of this.children) {

            if (child) { // It might be null

                element.appendChild(child.render());
            }
        }

        return element;
    }
}