import FragmentNode from "../../nodes/FragmentNode";
import VirtualNode from "../../nodes/VirtualNode";
import VirtualText from "../../nodes/VirtualText";

export function renderNode(vnode: VirtualNode | VirtualText | FragmentNode): Node {

    if ((vnode as any).isComponent) {

        let node = vnode.render();

        node = (node as any).render();

        (vnode as any).mountedNode = node;

        (node as any).component = vnode;

        return node;
    }
    else {

        return vnode.render();
    }
}