import PatchingContext from "./helpers/PatchingContext";

export interface UpdatedChildren {

    inserted: Array<Node>;

    moved: Array<Node>;

    removed: Array<Node>;
}

export interface LifecycleHooks {

    /**
     * Called when the node is about to be added to the DOM
     */
    nodeWillConnect?: (node: Node) => void;

    /**
     * Called after the node was added to the DOM
     */
    nodeDidConnect?: (node: Node) => void;

    /**
     * Called when the node is about to be removed from the DOM
     */
    nodeWillDisconnect?: (node: Node) => void;

    /**
     * Called when the children of the parent have been added, removed or moved in the DOM
     */
<<<<<<< HEAD
    nodeDidUpdate?: (node: Node, updatedChildren: UpdatedChildren) => void;
=======
    nodeDidUpdateChildren?: (node: Node, updatedChildren: UpdatedChildren) => void;
>>>>>>> 9046a975f46a2b1742774d263e9715eea9ae1d10
}

export interface PatchOptions {

    parentNode: ShadowRoot | Node | Document;

    node?: Node | null;

    context?: PatchingContext;

    hooks?: LifecycleHooks;
}

export interface Patch {

    applyPatch(options: PatchOptions): void;
}