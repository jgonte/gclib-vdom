import FragmentNode from "../../nodes/FragmentNode";
import VirtualNode from "../../nodes/VirtualNode";
import VirtualText from "../../nodes/VirtualText";

export function renderNode(vnode: VirtualNode | VirtualText | FragmentNode): Node {

    let node = vnode.render();

    if (node instanceof VirtualNode) { // Rendered by a component

        node = node.render();

        (node as any).component = vnode;
    }

    return node;
}