import { Patch, LifecycleHooks } from "./Patch";
import ChildElementPatches from "./ChildElementPatches";
import PatchingContext from "./helpers/PatchingContext";

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

        const n = node instanceof DocumentFragment ?
            parentNode :
            node;

        if (n !== undefined && n !== null) {

            for (let i = 0; i < this.childrenPatches.length; ++i) {

                const patch = this.childrenPatches[i];

                let childNode: ChildNode = n!.childNodes[patch.index];

                // Try to save the day if the childNode is undefined
                if (childNode === undefined) {

                    console.warn(`Child is undefined. Parent: ${JSON.stringify(n)}. Patch: ${JSON.stringify(patch)}`);

                    childNode = n as any;
                }

                patch.patches.applyPatches(
                    n!,
                    childNode,
                    hooks,
                    context);
            }
        }

        context.mergeOriginalElements(n!);

        if (hooks?.nodeDidUpdate) {

            context.callDidUpdateForNodes(hooks?.nodeDidUpdate);
        }
    }

    hasPatches() {

        return this.patches.length > 0 || this.childrenPatches.length > 0;
    }
}