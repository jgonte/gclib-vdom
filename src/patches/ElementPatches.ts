import { Patch } from "./Patch";
import ChildElementPatches from "./ChildElementPatches";
import PatchingContext from "../helpers/PatchingContext";

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
     * @param node Applies the patches to the given element
     */
    apply(node?: ChildNode): ChildNode {

        this.patches.forEach(patch => patch.apply(node, this._context));

        if (typeof node !== 'undefined') {

            this.childrenPatches.forEach(patch => {

                const childNode: ChildNode = node.childNodes[patch.index];
    
                patch.patches.apply(childNode);
            });
        }

        return this._context.getNode() || node;
    }

    hasPatches() {

        return this.patches.length || this.childrenPatches.length;
    }

}