import setAttribute from "./setAttribute";

export default function setAttributes(element: Element, props: any) {

    for (const key in props) {

        if (Object.prototype.hasOwnProperty.call(props, key)) {

            setAttribute(element, key, props[key]);
        }
    }
}