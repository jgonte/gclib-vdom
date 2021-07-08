import FragmentNode from "../../nodes/FragmentNode";
import ElementNode from "../../nodes/ElementNode";
import TextNode from "../../nodes/TextNode";

export function renderNode(vnode: ElementNode | TextNode | FragmentNode): Node {

    if ((vnode as any).isComponent) {

        let node = vnode.renderDom();

        node = (node as any).render();

        (vnode as any).mountedNode = node;

        (node as any).component = vnode;

        return node;
    }
    else {

        return vnode.renderDom();
    }
}