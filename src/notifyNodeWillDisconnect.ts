export default function notifyNodeWillDisconnect(node: Node) {

    // If the node has a component attached then the component should have the hooks
    // otherwise the node itself might have tehm
    const c = (node as any).component !== undefined ?
        (node as any).component :
        node;

    if ((c as any).nodeWillDisconnect !== undefined) {

        (c as any).nodeWillDisconnect(node);
    }

    const root = (node as any).shadowRoot;

    const n = root !== undefined && root !== null ?
        root :
        node;

    if (n.childNodes !== undefined) {

        n.childNodes.forEach((child: Node) => notifyNodeWillDisconnect(child));
    }
}