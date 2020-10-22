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
    nodeDidUpdateChildren?: (node: Node, updatedChildren: UpdatedChildren) => void;
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