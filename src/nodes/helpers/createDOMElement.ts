import setAttribute from "./setAttribute";

function isSvg(name: string): boolean {

    return [
        'svg',
        'use',
        'path'

        // More as needed
    ].indexOf(name) > -1;
}

export function createDOMElement(
    name: string | FunctionConstructor,
    props: Record<string, any>): Element {

    if (typeof name === 'string') {

        let key;

        const element = isSvg(name) ?
            document.createElementNS('http://www.w3.org/2000/svg', name) :
            document.createElement(name);

        for (key in props) {

            const value = props[key];

            if (value !== false) {

                setAttribute(element as HTMLElement, key, props[key]);
            }
        }

        return element;
    }
    // else if (typeof name === 'function') { // Component

    //     const component = new (name as FunctionConstructor)() as any;

    //     return component.render().render();
    // }
    else {

        throw new Error(`createDOMElement is not implemented for name: ${JSON.stringify(name)}`);
    }
}