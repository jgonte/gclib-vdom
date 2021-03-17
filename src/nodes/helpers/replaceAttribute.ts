import getCSSClass from "./getCSSClass";
import getCSSStyle from "./getCSSStyle";
import isStandardEvent from "./isStandardEvent";

export default function replaceAttribute(element: HTMLElement, name: string, newValue: any) {

    const names = name.split('_'); // Just in case it has the capture parameter in the event

    const nameLower = names[0].toLowerCase();

    if (isStandardEvent(nameLower)) {

        // Track the listener so it can be removed if necessary
        const trackedListeners = (element as any)._trackedListeners;

        // if (typeof trackedListeners === 'undefined') {

        //     return;
        // }

        const trackedListener = trackedListeners[name];

        // if (typeof trackedListener === 'undefined') {

        //     return;
        // }

        const {
            eventName,
            value,
            useCapture
        } = trackedListener;

        element.removeEventListener(eventName, value, useCapture);

        element.addEventListener(eventName, newValue, useCapture);

        trackedListener.value = newValue;
    }
    else {

        if (name === 'class') {

            if (typeof newValue === 'object') {

                newValue = getCSSClass(newValue);
            }

            element.className = newValue.trim();
        }
        else if (name === 'style') {

            if (typeof newValue === 'object') {

                newValue = getCSSStyle(newValue);
            }

            if (newValue.trim() === '') {

                element.removeAttribute(name);
            }
            else {

                element.setAttribute(name, newValue);
            }
        }
        else {

            // Bypass the conversion if the newValue is an object (not a string)
            if ((element as any).setProperty !== undefined &&
                typeof newValue === 'object') {

                (element as any).setProperty(name, newValue);
            }
            else {

                if (name === 'value' && element instanceof HTMLInputElement) {

                    element.value = newValue; // Odd behavior with input
                }
                else {
                    
                    element.setAttribute(name, newValue);
                }
            }

        }
    }
}