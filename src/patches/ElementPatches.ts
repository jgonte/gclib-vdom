import { Patch } from "./Patch";
import ChildElementPatches from "./ChildElementPatches";
import PatchingContext from "./helpers/PatchingContext";

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

    // patch(rootNode: ShadowRoot | Document) : void {

    //     this.applyPatches(rootNode, undefined);
    // }

    applyPatches(rootNode: ShadowRoot | Document | Node, node?: Node | null) : void {

        this.patches.forEach(patch => patch.applyPatch(rootNode, node, this._context));

        if (typeof node !== 'undefined' && node !== null) {

            if (this.childrenPatches.length > 0) {

                this.childrenPatches.forEach(patch => {

                    const childNode: ChildNode = node.childNodes[patch.index];
        
                    patch.patches.applyPatches(node, childNode);
                });
            }
  
        }
    }

    hasPatches() {

        return this.patches.length || this.childrenPatches.length;
    }

}