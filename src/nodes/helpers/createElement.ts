function isSvg(name: string): boolean {

    return [
        'svg',
        'use',
        'path'
    ].indexOf(name) > -1;
}

export function createElement(
    name: string | FunctionConstructor, 
    props: Record<string, string>) {

    if (typeof name === 'string') {

        const element = isSvg(name) ?
            document.createElementNS('http://www.w3.org/2000/svg', name) :
            document.createElement(name);

        if (props) {

            for (const [k, v] of Object.entries(props)) {

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

        return element;
    }
    else if (typeof name === 'function') {

        const component = new name() as any;

        const element = component.render().render();

        return element;
    }
    else {

        throw new Error(`createElement not implemented for name: ${JSON.stringify(name)}`);
    }
}