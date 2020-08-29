import VirtualNode from "./nodes/VirtualNode"
import VirtualText from "./nodes/VirtualText";

/**
 * Creates a virtual node
 * @param name Name of the element
 * @param attributes Attributes of the element
 * @param children Children of the element
 */
export default function createElement(
    name: string,
    attributes: any | null,
    ...children: any[]): VirtualNode {

    const childrenNodes: any[] = [];

    children.forEach(child => {

        if (!child) {

            childrenNodes.push(null);
        }
        else if (child.isVirtualNode) {

            childrenNodes.push(child);
        }
        else if (typeof child === 'object') {

            throw new Error('Invalid object');
        }
        else {

            childrenNodes.push(new VirtualText(child));
        }
    });

    return new VirtualNode(name, attributes, childrenNodes);
}