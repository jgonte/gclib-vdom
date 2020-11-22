import isStandardEvent from "./isStandardEvent";
import { isUndefinedOrNull } from "../../utils/utils";

export default function setAttribute(element: HTMLElement, name: string, value: any) {

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
        else { // Other function to call, bind it to the element

            (element as any)[name] = (value as Function).bind(element);
        }
    }
    else { // Not a function

        if (name === 'class') {

            // Do not set the attribute is there is no value
            if (!isUndefinedOrNull(value) &&
                value.toString() !== '') {

                element.setAttribute(name, value);
            }
        }
        else { // ECMAScript calls the toString() method of the value to set the attribute

            element.setAttribute(name, value);
        }
    }
}