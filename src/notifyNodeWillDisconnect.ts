export default function notifyNodeWillDisconnect(node: Node) {

    const fc = (node as any).functionalComponent;

    if (fc !== undefined &&
        (fc as any).nodeWillDisconnect !== undefined) {

        (fc as any).nodeWillDisconnect(node);
    }

    const root = (node as any).shadowRoot;

    const n = root !== undefined && root !== null ?
        root :
        node;

    if (n.childNodes !== undefined) {

        n.childNodes.forEach((child: Node) => notifyNodeWillDisconnect(child));
    }
}