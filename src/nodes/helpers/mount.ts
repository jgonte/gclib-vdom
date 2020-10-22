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

    patches.applyPatches(rootNode, node, hooks);
}