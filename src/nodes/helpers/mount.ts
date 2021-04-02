import diff from "../../diff";
import { VirtualNode, VirtualText } from "../../gclib-vdom";
import { LifecycleHooks } from "../../patches/Patch";

export default function mount(
    rootNode: ShadowRoot | Document | Node,
    currentNode: VirtualNode | VirtualText,  
    previousNode?: VirtualNode | VirtualText,
    node?: Node | null,
    hooks?: LifecycleHooks) {

    const patches = diff(previousNode, currentNode);

    if (patches.hasPatches()) {

        if (previousNode === undefined) {

            hooks?.willMount?.();
        }
        else if (currentNode === undefined) {

            hooks?.willUnmount?.();
        }
        else {

            hooks?.willUpdate?.();
        }

        patches.applyPatches(rootNode, node, hooks);
    }
    
}