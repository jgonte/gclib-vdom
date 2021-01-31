import isStandardEvent from "./isStandardEvent";
import getCSSClass from "./getCSSClass";
import getCSSStyle from "./getCSSStyle";

export default function setAttribute(element: Element, name: string, value: any) {

    if (value === undefined || value === null) { // Do not set undefined or null attributes

        return;
    }

    if (typeof value === 'function') {

        const names = name.split('_'); // Just in case it has the capture parameter in the event

        const nameLower = names[0].toLowerCase();

        if (isStandardEvent(nameLower)) {

            const eventName: string = nameLower.slice(2);

            const useCapture: boolean = names[1]?.toLowerCase() === 'capture'; // The convention is: eventName_capture for capture. Example onClick_capture

            element.addEventListener(eventName, value as () => void, useCapture);

            // Track the listener so it can be removed if necessary
            (element as any)._trackedListeners = (element as any)._trackedListeners || {};

            ((element as any)._trackedListeners)[name] = {
                eventName,
                value,
                useCapture
            };
        }
        else { // Other function to call

            if ((element as any).setProperty !== undefined) {

                (element as any).setProperty(name, value); // Pass the value through
            }
            else { // Bind it to the element

                (element as any)[name] = (value as Function).bind(element);
            }
        }
    }
    else { // Not a function

        if (name === 'class') {

            if (typeof value === 'object') {

                value = getCSSClass(value);
            }

            if (value.trim() !== '') {

                element.className = value;
            }
        }
        else if (name === 'style') {

            if (typeof value === 'object') {

                value = getCSSStyle(value);
            }

            if (value.trim() !== '') {

                element.setAttribute(name, value);           
            }
        }
        else { // Not class and not style

            if (typeof value === 'object') { // setAttribute expects a string

                if ((element as any).setProperty !== undefined) {

                    (element as any).setProperty(name, value); // Pass the value through
                }
                else { // Serialize to JSON (function calls are lost in the process)

                    value = JSON.stringify(value);

                    element.setAttribute(name, value);
                }        
            }
            else {

                element.setAttribute(name, value);
            }         
        }      
    }
}