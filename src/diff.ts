import VirtualNode from "./nodes/VirtualNode";
import VirtualText from "./nodes/VirtualText";
import ElementPatches from "./patches/ElementPatches";
import ChildElementPatches from "./patches/ChildElementPatches";
import { Patch } from "./patches/Patch";
import AddAttributePatch from "./patches/attributes/AddAttributePatch";
import RemoveAttributePatch from "./patches/attributes/RemoveAttributePatch";
import SetAttributePatch from "./patches/attributes/SetAttributePatch";
import SetTextPatch from "./patches/text/SetTextPatch";
import RemoveElementPatch from "./patches/element/RemoveElementPatch";
import RemoveChildrenPatch from "./patches/children/RemoveChildrenPatch";
import SetChildPatch from "./patches/children/SetChildPatch";
import AddChildrenPatch from "./patches/children/AddChildrenPatch";
import MoveChildPatch from "./patches/children/MoveChildPatch";
import RemoveChildrenRangePatch from "./patches/children/RemoveChildrenRangePatch";
import OffsetManager from "./patches/helpers/OffsetManager";
import ReplaceElementPatch from "./patches/element/ReplaceElementPatch";
import SetElementPatch from "./patches/element/SetElementPatch";
import { FragmentNode, Fragment } from "./gclib-vdom";

function diffAttributes(oldAttributes?: any | null, newAttributes?: any | null): Patch[] {

    const patches: Patch[] = [];

    const oldAttributeNames: string[] = oldAttributes ?
        Object.keys(oldAttributes) :
        [];

    if (newAttributes) {

        // Set new attributes
        for (const [k, v] of Object.entries(newAttributes)) {

            const i = oldAttributeNames.indexOf(k);

            if (i > -1) { // There is an old attribute with the same name

                const oldValue = oldAttributes[k];

                if (v !== oldValue) {

                    patches.push(new SetAttributePatch(k, oldValue, v));
                }

                oldAttributeNames.splice(i, 1); // Remove the name of the attribute to not to create a RemoveAttributePatch for it
            }
            else {

                patches.push(new AddAttributePatch(k, v));
            }
        }
    }

    if (oldAttributeNames.length > 0) {

        // Remove old attributes
        for (const k of oldAttributeNames) {

            const oldValue = oldAttributes[k];

            patches.push(new RemoveAttributePatch(k, oldValue));
        }
    }

    return patches;
}

function isUndefinedOrNull(o?: object | null): boolean {

    return typeof o === 'undefined' || o === null;
}

function isVirtualNode(node: VirtualNode | VirtualText | FragmentNode): boolean {

    return (node as VirtualNode).isVirtualNode;
}

function isFragmentNode(node: VirtualNode | VirtualText | FragmentNode): boolean {

    return (node as FragmentNode).isFragmentNode;
}

function hasKeys(children: Array<VirtualNode | VirtualText | FragmentNode> = []): boolean {

    const keys: Set<string> = new Set<string>();

    let missingFirstKey: boolean = false;

    for (let i = 0; i < children.length; ++i) {

        const child = children[i];

        if (isVirtualNode(child)) {

            const key = (child as VirtualNode).key;

            if (key) {

                if (missingFirstKey) {

                    throw new Error('Missing key at index: [0] in children collection.');
                }

                if (keys.has(key)) {

                    throw new Error(`Duplicate key: ${key} at index: [${i}] in children collection.`);
                }

                keys.add(key);
            }
            else { // No key

                if (i == 0) {

                    missingFirstKey = true;
                }
                else if (keys.size > 0) {

                    throw new Error(`Missing key at index: [${i}] in children collection.`);
                }
            }
        }
        else { // It is a virtual text

            if (i == 0) {

                missingFirstKey = true;
            }
            else if (keys.size > 0) {

                throw new Error(`Not a virtual node at index: [${i}] in children collection.`);
            }
        }
    }

    return keys.size > 0;
}

interface IndexedVirtualNode {

    node: VirtualNode,

    index: number
}

function diffKeyedChildren(
    oldChildren: Array<VirtualNode>,
    newChildren: Array<VirtualNode>
): [Array<Patch>, Array<ChildElementPatches>] {

    const setOrMovedChildrenPatches: Array<Patch> = [];

    const childrenPatches: Array<ChildElementPatches> = [];

    const offsetManager = new OffsetManager();

    // Map the old children
    const oldChildrenMap: Map<string, IndexedVirtualNode> = new Map<string, IndexedVirtualNode>();

    for (let i = 0; i < oldChildren.length; ++i) {

        const oldChild = oldChildren[i];

        oldChildrenMap.set(oldChild.key, {
            node: oldChild,
            index: i
        });
    }

    for (let i = 0; i < newChildren.length; ++i) {

        const oldChildBySide = oldChildren[i];

        const newChild = newChildren[i];

        if (!isUndefinedOrNull(oldChildBySide)) { // There is an old child on its side

            if (oldChildBySide.key !== newChild.key) { // Either the old child does not exist or it is at a different index 

                const indexedOldNode: IndexedVirtualNode | undefined = oldChildrenMap.get(newChild.key);

                if (!isUndefinedOrNull(indexedOldNode)) { // There is an old child with the key

                    const { node, index } = indexedOldNode!;

                    // Offset the empty slots caused by moving children out
                    const fromOffset: number = offsetManager.getOffset(index);

                    setOrMovedChildrenPatches.push(
                        new MoveChildPatch(index, i, fromOffset) // Move it to the new index
                    );

                    // Add the index where the child was removed
                    offsetManager.addRemoved(index);

                    const elemPatches = diff(node, newChild);

                    if (elemPatches.hasPatches()) {

                        childrenPatches.push(
                            new ChildElementPatches(
                                /*index*/
                                i,
                                /*patches*/
                                elemPatches
                            )
                        );
                    }
                }
                else { // There is no old child with the same key as the new one

                    setOrMovedChildrenPatches.push(
                        new SetChildPatch(i, newChild) // Set it at the new index
                    );
                }
            }
            else { // The keys are the same, just diff the children

                const elemPatches = diff(oldChildBySide, newChild);

                if (elemPatches.hasPatches()) {

                    childrenPatches.push(
                        new ChildElementPatches(
                            /*index*/
                            i,
                            /*patches*/
                            elemPatches
                        )
                    );
                }
            }

        }
        else { // No child by side

            const indexedOldNode: IndexedVirtualNode | undefined = oldChildrenMap.get(newChild.key);

            if (!isUndefinedOrNull(indexedOldNode)) { // There is an old child with the key

                const { node, index } = indexedOldNode!;

                setOrMovedChildrenPatches.push(
                    new MoveChildPatch(index, i, 0) // Move it to the new index
                );

                const elemPatches = diff(node, newChild);

                if (elemPatches.hasPatches()) {

                    childrenPatches.push(
                        new ChildElementPatches(
                            /*index*/
                            i,
                            /*patches*/
                            elemPatches
                        )
                    );
                }
            }
            else { // There is no old child with the same key as the new one

                setOrMovedChildrenPatches.push(
                    new SetChildPatch(i, newChild) // Set it at the new index
                );
            }
        }

        // Sort the array ordering by "to" ascending to minimize creating DOM element placeholders
        setOrMovedChildrenPatches.sort((p1, p2) => {

            const to1 = typeof (p1 as SetChildPatch).index === 'undefined' ?
                (p1 as MoveChildPatch).to :
                (p1 as SetChildPatch).index;

            const to2 = typeof (p2 as SetChildPatch).index === 'undefined' ?
                (p2 as MoveChildPatch).to :
                (p2 as SetChildPatch).index;

            return to1 - to2;
        });
    }

    return [setOrMovedChildrenPatches, childrenPatches];
}

function diffNonKeyedChildren(
    oldChildren: Array<VirtualNode | VirtualText | FragmentNode>,
    newChildren: Array<VirtualNode | VirtualText | FragmentNode>): [Array<Patch>, Array<ChildElementPatches>] {

    const setChildrenPatches: Array<Patch> = [];

    const childrenPatches: Array<ChildElementPatches> = [];

    for (let i = 0; i < newChildren.length; ++i) {

        const oldChild = oldChildren[i];

        const newChild = newChildren[i];

        if (isUndefinedOrNull(oldChild)) { // Add a child at that index

            setChildrenPatches.push(
                new SetChildPatch(i, newChild as VirtualNode | VirtualText) // Set it at the new index
            );
        }
        else {

            const childPatches = diff(oldChild, newChild);

            if (childPatches.hasPatches()) {

                childrenPatches.push(
                    new ChildElementPatches(
                        /*index*/
                        i,
                        /*patches*/
                        childPatches
                    )
                );
            }
        }
    }

    return [setChildrenPatches, childrenPatches];
}

export default function diff(
    oldNode?: VirtualNode | VirtualText | FragmentNode,
    newNode?: VirtualNode | VirtualText | FragmentNode
): ElementPatches {

    if (isUndefinedOrNull(newNode)) {

        if (isUndefinedOrNull(oldNode)) {

            return new ElementPatches( // Nothing to patch
                /*patches*/
                [],
                /*childrenPatches*/
                []
            );
        }
        else {

            if ((oldNode as FragmentNode).isFragmentNode) {

                if ((oldNode as FragmentNode).children.length === 0) { // Nothing to remove

                    return new ElementPatches(
                        /*patches*/
                        [],
                        /*childrenPatches*/
                        []
                    );
                }
                else { // Remove all the children of the fragment

                    return new ElementPatches(
                        /*patches*/
                        [new RemoveChildrenPatch()],
                        /*childrenPatches*/
                        []
                    );
                }
            }
            else {

                return new ElementPatches(
                    /*patches*/
                    [new RemoveElementPatch()],
                    /*childrenPatches*/
                    []
                );
            }

        }
    }

    if (isUndefinedOrNull(oldNode)) {

        return new ElementPatches(
            /*patches*/
            [new SetElementPatch(newNode!)],
            /*childrenPatches*/
            []
        );
    }

    if (isVirtualNode(newNode!)) {

        if (isVirtualNode(oldNode!)) {

            if ((oldNode as VirtualNode).name !== (newNode as VirtualNode).name) {

                return new ElementPatches(
                    /*patches*/
                    [new ReplaceElementPatch((newNode as VirtualNode | VirtualText)!)],
                    /*childrenPatches*/
                    []
                );
            }
            else { // Same name, diff attributes and children

                const oldChildren = (oldNode as VirtualNode).children;

                const newChildren = (newNode as VirtualNode | FragmentNode).children;

                // In certain cases with the children, it is more convenient to apply the patches to the parent
                if (newChildren.length === 0) {

                    if (oldChildren.length === 0) {

                        return new ElementPatches(
                            /*patches*/
                            [...diffAttributes((oldNode as VirtualNode).props, (newNode as VirtualNode).props)],
                            /*childrenPatches*/
                            [] // No children to diff
                        );
                    }
                    else { // There are old children

                        return new ElementPatches(
                            /*patches*/
                            [
                                ...diffAttributes((oldNode as VirtualNode).props, (newNode as VirtualNode).props),
                                new RemoveChildrenPatch() // Remove all the old children
                            ],
                            /*childrenPatches*/
                            [] // No children to diff
                        );
                    }
                }
                else { // There are new children

                    if (oldChildren.length === 0) {

                        return new ElementPatches(
                            /*patches*/
                            [
                                ...diffAttributes((oldNode as VirtualNode).props, (newNode as VirtualNode).props),
                                new AddChildrenPatch(newChildren) // Add all the old children
                            ],
                            /*childrenPatches*/
                            [] // No children to diff
                        );
                    }
                    else { // There are old children

                        let patches: Array<Patch>;

                        let childrenPatches: Array<ChildElementPatches>;

                        if (hasKeys(newChildren)) {

                            [patches, childrenPatches] = diffKeyedChildren(oldChildren as Array<VirtualNode>, newChildren as Array<VirtualNode>);
                        }
                        else {

                            [patches, childrenPatches] = diffNonKeyedChildren(oldChildren, newChildren);
                        }

                        // Remove the old children that do not appear in the new nodes
                        const removeChildrenPatches: Array<Patch> = [];

                        const childrenToRemoveCount: number = oldChildren!.length - newChildren.length;

                        if (childrenToRemoveCount > 0) {

                            removeChildrenPatches.push(
                                new RemoveChildrenRangePatch(newChildren.length, childrenToRemoveCount)
                            );
                        }

                        return new ElementPatches(
                            /*patches*/
                            [
                                ...diffAttributes((oldNode as VirtualNode).props, (newNode as VirtualNode).props),
                                ...patches,
                                ...removeChildrenPatches
                            ],
                            /*childrenPatches*/
                            [...childrenPatches]
                        );
                    }
                }
            }
        }
        else if (isFragmentNode(oldNode!)) {

            if ((oldNode as FragmentNode).children.length === 0) { // Nothing to replace

                return new ElementPatches(
                    /*patches*/
                    [new SetElementPatch(newNode!)],
                    /*childrenPatches*/
                    []
                );
            }
            else { // Remove all the children of the fragment

                return new ElementPatches(
                    /*patches*/
                    [
                        new RemoveChildrenPatch(),
                        new SetElementPatch(newNode!)
                    ],
                    /*childrenPatches*/
                    []
                );
            }
        }
        else { // Old node is a virtual text

            return new ElementPatches(
                /*patches*/
                [new ReplaceElementPatch((newNode as VirtualNode | VirtualText)!)],
                /*childrenPatches*/
                []
            );
        }
    }
    else if (isFragmentNode(newNode!)) {

        if ((newNode as FragmentNode).children.length === 0) { // Nothing to replace

            if (isVirtualNode(oldNode!)) {

                return new ElementPatches(
                    /*patches*/
                    [new RemoveElementPatch()],
                    /*childrenPatches*/
                    []
                );
            }
            else if (isFragmentNode(oldNode!)) {

                if ((oldNode as FragmentNode).children.length === 0) {

                    return new ElementPatches( // Nothing to change
                        /*patches*/
                        [],
                        /*childrenPatches*/
                        []
                    );
                }
                else {

                    return new ElementPatches(
                        /*patches*/
                        [new RemoveChildrenPatch()],
                        /*childrenPatches*/
                        []
                    );
                }
            }
            else { // Old node is a virtual text

                return new ElementPatches(
                    /*patches*/
                    [new RemoveElementPatch()],
                    /*childrenPatches*/
                    []
                );
            }
        }
        else { // The new fragment node has children

            if (isVirtualNode(oldNode!)) {

                return new ElementPatches(
                    /*patches*/
                    [
                        new RemoveElementPatch(),
                        new SetElementPatch(newNode!)
                    ],
                    /*childrenPatches*/
                    []
                );
            }
            else if (isFragmentNode(oldNode!)) {

                const oldChildren = (oldNode as FragmentNode).children;

                if (oldChildren.length === 0) { // Add the fragment

                    return new ElementPatches(
                        /*patches*/
                        [new SetElementPatch(newNode!)],
                        /*childrenPatches*/
                        []
                    );
                }
                else { // The old node fragment and the new one both has children: compare their children

                    // Assign the old node's element so we can keep track of the parent
                    newNode!.element = oldNode!.element;

                    const newChildren = (newNode as FragmentNode).children;

                    let patches: Array<Patch>;

                    let childrenPatches: Array<ChildElementPatches>;

                    if (hasKeys(newChildren)) {

                        [patches, childrenPatches] = diffKeyedChildren(oldChildren as any, newChildren as any);
                    }
                    else {

                        [patches, childrenPatches] = diffNonKeyedChildren(oldChildren, newChildren);
                    }

                    // Remove the old children that do not appear in the new nodes
                    const removeChildrenPatches: Array<Patch> = [];

                    const childrenToRemoveCount: number = oldChildren!.length - newChildren.length;

                    if (childrenToRemoveCount > 0) {

                        removeChildrenPatches.push(
                            new RemoveChildrenRangePatch(newChildren.length, childrenToRemoveCount)
                        );
                    }

                    return new ElementPatches(
                        /*patches*/
                        [
                            ...diffAttributes((oldNode as FragmentNode).props, (newNode as FragmentNode).props),
                            ...patches,
                            ...removeChildrenPatches
                        ],
                        /*childrenPatches*/
                        [...childrenPatches]
                    );
                }
            }
            else { // Old node is a virtual text

                return new ElementPatches(
                    /*patches*/
                    [
                        new RemoveElementPatch(),
                        new SetElementPatch(newNode!)
                    ],
                    /*childrenPatches*/
                    []
                );
            }
        }
    }
    else { // New node is a virtual text

        if (isVirtualNode(oldNode!)) {

            return new ElementPatches(
                /*patches*/
                [new ReplaceElementPatch((newNode as VirtualNode | VirtualText)!)],
                /*childrenPatches*/
                []
            );
        }
        else if (isFragmentNode(oldNode!)) {

            if ((oldNode as FragmentNode).children.length === 0) { // Nothing to replace

                return new ElementPatches(
                    /*patches*/
                    [new SetElementPatch(newNode!)],
                    /*childrenPatches*/
                    []
                );
            }
            else { // Remove all the children of the fragment

                return new ElementPatches(
                    /*patches*/
                    [
                        new RemoveChildrenPatch(),
                        new SetElementPatch(newNode!)
                    ],
                    /*childrenPatches*/
                    []
                );
            }
        }
        else { // Old node is a virtual text

            const oldText = oldNode as VirtualText;

            const newText = newNode as VirtualText;

            if (oldText.text !== newText.text) {

                return new ElementPatches(
                    /*patches*/
                    [
                        new SetTextPatch(newText)
                    ],
                    /*childrenPatches*/
                    []
                );
            }
            else {

                // Nothing to patch
                return new ElementPatches(
                    /*patches*/
                    [],
                    /*childrenPatches*/
                    []
                );
            }
        }
    }
}