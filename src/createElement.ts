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
    attributes: object | null = {},
    ...children: Array<VirtualNode | string | number | boolean>): VirtualNode {

    const childrenNodes: Array<VirtualNode | VirtualText> = [];

    children.forEach(child => {

        if (!child) {

            //childrenNodes.push(null);
        }
        else if ((child as VirtualNode).isVirtualNode) {

            childrenNodes.push(child as VirtualNode);
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