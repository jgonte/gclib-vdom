import { Patch, LifecycleHooks } from "./Patch";
import ChildElementPatches from "./ChildElementPatches";
import PatchingContext from "./helpers/PatchingContext";
import { isUndefinedOrNull } from "../utils/utils";

/**
 * Contains the patches that are applied to an element and its children
 */
export default class ElementPatches {

    constructor(

        /**
         * The patches to apply to this element
         */
        public patches: Patch[],

        /**
         * The patches to apply to the children of this element
         */
        public childrenPatches: ChildElementPatches[]
    ) { }

    applyPatches(
        parentNode: ShadowRoot | Document | Node,
        node?: Node | null,
        hooks?: LifecycleHooks,
        parentContext?: PatchingContext
    ): void {

        const context: PatchingContext = new PatchingContext();

        for (let i = 0; i < this.patches.length; ++i) {

            this.patches[i].applyPatch({
                parentNode,
                node,
                context,
                parentContext,
                hooks
            });
        }

        if (!isUndefinedOrNull(node)) {

            for (let i = 0; i < this.childrenPatches.length; ++i) {

                const patch = this.childrenPatches[i];

                const childNode: ChildNode = node!.childNodes[patch.index];

                patch.patches.applyPatches(
                    node!, 
                    childNode, 
                    hooks,
                    context);
            }
        }

        context.mergeOriginalElements(node!);

        if (hooks?.nodeDidUpdate) {

            context.callDidUpdateForNodes(hooks?.nodeDidUpdate);
        }
    }

    hasPatches() {

        return this.patches.length || this.childrenPatches.length;
    }

}