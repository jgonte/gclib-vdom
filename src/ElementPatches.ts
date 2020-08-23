import { Patch } from "./patches/Patch";
import ChildElementPatches from "./ChildElementPatches";
import PatchingContext from "./PatchingContext";

/**
 * Contains the patches that are applied to an element and its children
 */
export default class ElementPatches {

    private _context: PatchingContext = new PatchingContext();
    
    constructor(

        /**
         * The patches to apply to this element
         */
        public patches: Patch[],

        /**
         * The patches to apply to the children of this element
         */
        public childrenPatches: ChildElementPatches[]
    ) {}

    /**
     * 
     * @param element Applies the patches to the given element
     */
    apply(element: HTMLElement): void {

        this.patches.forEach(patch => patch.apply(element, this._context));

        this.childrenPatches.forEach(patch => {

            const child = element.children[patch.index];

            patch.patches.apply((child as HTMLElement));
        });
    }

    hasPatches() {

        return this.patches.length || this.childrenPatches.length;
    }

}