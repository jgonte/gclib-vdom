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

        element.setAttribute(name, newValue);
    }
}