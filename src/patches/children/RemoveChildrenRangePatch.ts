import { Patch } from "../Patch";

/**
 * Patch to remove all the children from the element in the DOM
 */
export default class RemoveChildrenRangePatch extends Patch {

    constructor(

        /**
         * The index of the first element to remove
         */
        public from: number,

         /**
         * The number of children to remove
         */
        public count: number

    ) {
        super();
    }

    apply(element: HTMLElement): void {

        // When a previous element is removed the next element occupies the previous index therefore we use the first index only
        const index: number = this.from;

        const to: number = this.from + this.count - 1;

        for (let i: number = index; i <= to; ++i) {

            const child = element.children[index];

            if (child) { // It might be already removed

                element.removeChild(child);
            }
            
        }
        
    }
    
}