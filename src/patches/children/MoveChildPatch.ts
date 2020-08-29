import { Patch } from "../Patch";
import PatchingContext from "../../helpers/PatchingContext";

/**
 * Patch to remove an attribute from the DOM element
 */
export default class MoveElementPatch extends Patch {

    constructor(

        /**
         * The index we are moving the element from
         */
        public from: number,

        /**
        * The index we are moving the element from
        */
        public to: number,

        /**
         * The offset of the from (how many elements were removed before)
         */
        public offset: number

    ) {
        super();
    }

    apply(element: HTMLElement, context: PatchingContext): void {

        const { from, to, offset } = this;

        // Check if it is in the context
        let movingChild = context.getOriginalElement(from); // Get the original element that was at that index before being removed

        if (!movingChild) { // Not found in the context

            movingChild = element.children[from - offset];
        }

        const originalElement = element.children[to];

        if (originalElement) {

            // Save the original element in the context
            context.setOriginalElement(originalElement, to);

            element.replaceChild(movingChild, originalElement);
        }
        else {

            element.appendChild(movingChild);
        }

    }

}