import PatchingContext from "./helpers/PatchingContext";

/**
 * The information about the changed text
 */
export interface TextChangeConfig {

    oldValue?: string;

    newValue?: string;
}

/**
 * The information about the changed attributes
 */
export interface AttributeChangeConfig {

    key: string;

    oldValue?: any; // It might be undefined setting a new value

    newValue?: any; // It might be undefined deleting an old value
}

/**
 * The information about the changed properties of the node
 */
export interface NodeChangesConfig {

    text?: TextChangeConfig;

    attributes?: Array<AttributeChangeConfig>;

    inserted?: Array<Node>;

    moved?: Array<Node>;

    removed?: Array<Node>;
}

export class NodeChanges {

    /**
     * The text changed in the node
     */
    text?: TextChangeConfig;

    /**
     * The attributes changed in the node
     */
    attributes: Array<AttributeChangeConfig>;

    /**
     * The children inserted to the node
     */
    inserted: Array<Node>;

    /**
     * The children moved to a different index
     */
    moved: Array<Node>;

    /**
     * The children removed from the node
     */
    removed: Array<Node>;

    constructor(config: NodeChangesConfig = {}) {

        config = config || {};

        this.text = config.text;

        this.attributes = config.attributes || [];

        this.inserted = config.inserted || [];

        this.moved = config.moved || [];

        this.removed = config.removed || [];
    }

    merge(from: NodeChanges) {

        this.text = from.text;

        this.attributes = this.attributes.concat(from.attributes);

        this.inserted = this.inserted.concat(from.inserted);

        this.moved = this.moved.concat(from.moved);

        this.removed = Array.from(new Set(this.removed.concat(from.removed))); // There might be duplicates
    }
}

export interface LifecycleHooks {

    // Hooks that deal with all the nodes of the mounted component
    /**
     * Called when the node is about to be added to the DOM
     */
    nodeWillConnect?: (node: Node) => void;

    /**
     * Called after the node and its siblings has been added to the DOM
     */
    nodeDidConnect?: (node: Node) => void;

    /**
     * Called when the text content has changed, 
     * attributes have been added, replaced or removed 
     * and/or children of the parent have been added, removed or moved in the DOM
     */
    nodeDidUpdate?: (node: Node, nodeChanges: NodeChanges) => void;

    /**
     * Called when the node is about to be removed from the DOM
     */
    nodeWillDisconnect?: (node: Node) => void;
}

export interface PatchOptions {

    parentNode: ShadowRoot | Node | Document;

    node?: Node | null;

    /**
     * The patching context of the parent node
     */
    parentContext?: PatchingContext;

    /**
     * The patching context of the child node
     */
    context?: PatchingContext;

    hooks?: LifecycleHooks;
}

export interface Patch {

    applyPatch(options: PatchOptions): void;
}