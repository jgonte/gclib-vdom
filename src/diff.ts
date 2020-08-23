import VirtualNode from "./VirtualNode";
import VirtualText from "./VirtualText";
import ElementPatches from "./ElementPatches";
import ChildElementPatches from "./ChildElementPatches";
import { Patch } from "./patches/Patch";
import AddAttributePatch from "./patches/attributes/AddAttributePatch";
import RemoveAttributePatch from "./patches/attributes/RemoveAttributePatch";
import SetAttributePatch from "./patches/attributes/SetAttributePatch";
import SetTextPatch from "./patches/text/SetTextPatch";
import RemoveTextPatch from "./patches/text/RemoveTextPatch";

import RemoveElementPatch from "./patches/RemoveElementPatch";
import ReplaceElementPatch from "./patches/ReplaceElementPatch";

import RemoveChildrenPatch from "./patches/children/RemoveChildrenPatch";
import SetChildPatch from "./patches/children/SetChildPatch";
import AddChildrenPatch from "./patches/children/AddChildrenPatch";
import MoveChildPatch from "./patches/children/MoveChildPatch";
import RemoveChildrenRangePatch from "./patches/children/RemoveChildrenRangePatch";
import OffsetManager from "./OffsetManager";

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

                if (v !== oldAttributes[k]) {

                    patches.push(new SetAttributePatch(k, v));
                }

                oldAttributeNames.splice(i, 1); // Remove the name of the attribute to not to create a RemoveAttributePatch for it
            }
            else {

                patches.push(new AddAttributePatch(k, v));
            }
        }

    }

    if (oldAttributeNames.length) {

        // Remove old attributes
        for (const k of oldAttributeNames) {

            patches.push(new RemoveAttributePatch(k));
        }
    }

    return patches;
}

function haveKeys(children: VirtualNode[]): boolean {

    let keys: any = {};

    let missingFirstKey: boolean = false;

    children.forEach((child, i) => {

        const key = child.key;

        if (key) {

            if (missingFirstKey) {

                throw new Error('Missing key at index: [0] in children collection.');
            }

            if (keys[key]) {

                throw new Error(`Duplicate key: ${key} at index: [${i}] in children collection.`);
            }

            keys[key] = true; // Add it to the keys dictionary
        }
        else { // No key

            if (i == 0) {

                missingFirstKey = true;
            }
            else if (Object.keys(keys).length) {

                throw new Error(`Missing key at index: [${i}] in children collection.`);
            }

        }

    });

    return Object.keys(keys).length > 0;
}


function diffChildren(oldNode: VirtualNode, newNode: VirtualNode): ElementPatches {

    const oldChildren: VirtualNode[] = (oldNode.children as VirtualNode[])!;

    const newChildren: VirtualNode[] = (newNode.children as VirtualNode[])!;

    if (haveKeys(newChildren)) {

        const setOrMovedChildrenPatches: Patch[] = [];

        const removedChildrenPatches: Patch[] = [];

        const childrenPatches: ChildElementPatches[] = [];

        const offsetManager = new OffsetManager();

        // Create the patches based on the new children
        newChildren!.forEach((newChild, newChildIndex) => {

            // Find the old child on its side
            const oldChildBySide = oldChildren[newChildIndex];

            if (oldChildBySide) { // There is an old child on its side

                if (oldChildBySide.key !== newChild.key) { // Either the old child does not exist or it is at a different index 

                    // Find the old child using the key
                    const oldChildByKey = oldChildren.find(c => c.key === newChild.key);

                    if (oldChildByKey) { // There is an old child with the key

                        // Find the index of the old child whose key is the same as the 
                        const oldChildByKeyIndex = oldChildren.indexOf(oldChildByKey);

                        // Offset the empty slots caused by moving children out
                        const fromOffset: number = offsetManager.getOffset(oldChildByKeyIndex);
 
                        setOrMovedChildrenPatches.push(
                            new MoveChildPatch(oldChildByKeyIndex, newChildIndex, fromOffset) // Move it to the new index
                        );

                        // Add the index where the child was removed
                        offsetManager.addRemoved(oldChildByKeyIndex);

                        const elemPatches = diff(oldChildByKey, newChild);

                        if (elemPatches.hasPatches()) {

                            childrenPatches.push(
                                new ChildElementPatches(
                                    /*index*/
                                    newChildIndex,
                                    /*patches*/
                                    elemPatches
                                )
                            );
                        }
                    }
                    else { // There is no old child with the same key as the new one

                        setOrMovedChildrenPatches.push(
                            new SetChildPatch(newChildIndex, newChild) // Set it at the new index
                        );
                    }

                }
                else { // The keys are the same, just diff the children

                    const elemPatches = diff(oldChildBySide, newChild);

                    if (elemPatches.hasPatches()) {

                        childrenPatches.push(
                            new ChildElementPatches(
                                /*index*/
                                newChildIndex,
                                /*patches*/
                                elemPatches
                            )
                        );
                    }
                }

            }
            else { // No child by side

                // Find the old child using the key
                const oldChildByKey = oldChildren.find(c => c.key === newChild.key);

                if (oldChildByKey) { // There is an old child with the key

                    // Find the index of the old child whose key is the same as the 
                    const oldChildByKeyIndex = oldChildren.indexOf(oldChildByKey);

                    setOrMovedChildrenPatches.push(
                        new MoveChildPatch(oldChildByKeyIndex, newChildIndex, 0) // Move it to the new index
                    );

                    const elemPatches = diff(oldChildByKey, newChild);

                    if (elemPatches.hasPatches()) {

                        childrenPatches.push(
                            new ChildElementPatches(
                                /*index*/
                                newChildIndex,
                                /*patches*/
                                elemPatches
                            )
                        );
                    }
                }
                else { // There is no old child with the same key as the new one

                    setOrMovedChildrenPatches.push(
                        new SetChildPatch(newChildIndex, newChild) // Set it at the new index
                    );
                }
            }

        });

        // Remove the old children that do not appear in the new nodes
        const childrenToRemoveCount = oldChildren.length - newChildren.length; /* + addedChildrenIndex.length - movedFromIndexes.length */;

        // When elements are being removed, the next element occupies the previous index so the initial index stays the same
        if (childrenToRemoveCount > 0) {

            removedChildrenPatches.push(
                new RemoveChildrenRangePatch(newChildren.length, childrenToRemoveCount)
            );
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

        return new ElementPatches(

            /*patches*/
            [
                ...diffAttributes(oldNode.attributes, newNode.attributes),
                ...setOrMovedChildrenPatches,
                ...removedChildrenPatches
            ],

            /*childrenPatches*/
            childrenPatches
        );
    }
    else { // Children without keys

        const removeChildrenPatches: Patch[] = [];

        const childrenPatches: ChildElementPatches[] = [];

        // Create the patches based on the new children
        newChildren!.forEach((newChild, i) => {

            childrenPatches.push(
                new ChildElementPatches(
                    /*index*/
                    i,
                    /*patches*/
                    diff(oldChildren[i], newChild)
                )
            );

        });

        // Remove the old children that do not appear in the new nodes
        const childrenToRemoveCount: number = oldChildren!.length - newChildren.length;

        if (childrenToRemoveCount > 0) {

            removeChildrenPatches.push(
                new RemoveChildrenRangePatch(newChildren.length, childrenToRemoveCount)
            );
        }

        return new ElementPatches(

            /*patches*/
            [
                ...diffAttributes(oldNode.attributes, newNode.attributes),
                ...removeChildrenPatches
            ],

            /*childrenPatches*/
            childrenPatches
        );
    }
}

export default function diff(oldNode: VirtualNode, newNode: VirtualNode): ElementPatches {

    if (!newNode) {

        return new ElementPatches(

            /*patches*/
            [new RemoveElementPatch()],

            /*childrenPatches*/
            []
        );
    }

    if (oldNode.name !== newNode.name) {

        return new ElementPatches(

            /*patches*/
            [new ReplaceElementPatch(newNode)],

            /*childrenPatches*/
            []
        );
    }

    // Handle the children nodes
    if (newNode.children) { // The newNode has either virtual nodes or a virtual text

        if (Array.isArray(newNode.children)) { // The children of newNode is an array the virtual nodes

            if (oldNode.children) { // The oldNode has either virtual nodes or a virtual text

                if (Array.isArray(oldNode.children)) { // The children of oldNode is an array the virtual nodes

                    return diffChildren(oldNode, newNode);
                }
                else { // The child of oldNode is a virtual text

                    return new ElementPatches(

                        /*patches*/
                        [
                            ...diffAttributes(oldNode.attributes, newNode.attributes),
                            new RemoveTextPatch(), // Remove the text child
                            new AddChildrenPatch((newNode.children as VirtualNode[])!) // Add the new children
                        ],

                        /*childrenPatches*/
                        []
                    );
                }
            }
            else { // oldNode has no children

                return new ElementPatches(

                    /*patches*/
                    [
                        ...diffAttributes(oldNode.attributes, newNode.attributes),
                        new AddChildrenPatch((newNode.children as VirtualNode[])!) // Add the new children
                    ],

                    /*childrenPatches*/
                    []
                );
            }
        }
        else { // The child of newNode is a virtual text

            if (oldNode.children) { // The oldNode has either virtual nodes or a virtual text

                if (Array.isArray(oldNode.children)) { // The children of oldNode is an array the virtual nodes

                    return new ElementPatches(

                        /*patches*/
                        [
                            ...diffAttributes(oldNode.attributes, newNode.attributes),
                            new RemoveChildrenPatch(),
                            new SetTextPatch(newNode.children)
                        ],

                        /*childrenPatches*/
                        []
                    );
                }
                else { // The child of oldNode is a virtual text

                    const oldText: VirtualText = oldNode.children;

                    const newText: VirtualText = newNode.children;

                    if (oldText.text !== newText.text) { // Replace text

                        return new ElementPatches(

                            /*patches*/
                            [
                                ...diffAttributes(oldNode.attributes, newNode.attributes),
                                new SetTextPatch(newText)
                            ],

                            /*childrenPatches*/
                            []
                        );
                    }
                    else { // Texts are equal, no need to replace them

                        return new ElementPatches(

                            /*patches*/
                            [
                                ...diffAttributes(oldNode.attributes, newNode.attributes)
                            ],

                            /*childrenPatches*/
                            []
                        );
                    }

                }
            }
            else { // oldNode has no children

                return new ElementPatches(

                    /*patches*/
                    [
                        ...diffAttributes(oldNode.attributes, newNode.attributes),
                        new SetChildPatch(0, newNode.children)
                    ],

                    /*childrenPatches*/
                    []
                );
            }
        }
    }
    else { // newNode has no children

        if (oldNode.children) { // The oldNode has either virtual nodes or a virtual text

            return new ElementPatches(

                /*patches*/
                [
                    ...diffAttributes(oldNode.attributes, newNode.attributes),
                    new RemoveChildrenPatch() // Remove all the children
                ],

                /*childrenPatches*/
                []
            );

        }
        else { // oldNode has no children either

            return new ElementPatches( // Diff the node only

                /*patches*/
                [
                    ...diffAttributes(oldNode.attributes, newNode.attributes)
                ],

                /*childrenPatches*/
                []
            );

        }
    }


}