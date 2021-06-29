import isStandardEvent from "./isStandardEvent";

export default function removeAttribute(element: HTMLElement, name: string): void {

    const names = name.split('_'); // Just in case it has the capture parameter in the event

    const nameLower = names[0].toLowerCase();

    if (isStandardEvent(nameLower)) {

        // Track the listener so it can be removed if necessary
        const trackedListeners = (element as any)._trackedListeners;

        // The handler could be null at the previous rendering, so no listeners would be defined
        if (typeof trackedListeners === 'undefined') {

            return;
        }

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

        delete trackedListeners[name];
    }
    else {

        element.removeAttribute(name);
    }
}