export const PLACEHOLDER_TAGNAME = '_p_';

/**
 * Creates placeholders so the elements can be set at the correct index
 * @param element The HTML element to create the children placeholders got
 * @param to The index up to which the placeholders should be filled in
 */
export default function createPlaceholders(element: HTMLElement, to: number) : void {

    const lastChildIndex = element.children.length;

    for (let i = lastChildIndex; i < to; ++i) {

        console.warn("Creating placeholre element!!!");

        element.appendChild(document.createElement(PLACEHOLDER_TAGNAME)); // Placeholder element
    }

}