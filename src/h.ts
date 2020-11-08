import VirtualNode from "./nodes/VirtualNode"
import VirtualText from "./nodes/VirtualText";

/**
 * Creates a virtual node
 * @param name Name of the virtual node
 * @param attributes Attributes of the virtual node
 * @param children Children of the virtual node
 */
export default function h(
    name: string | FunctionConstructor,
    attributes: object | null = {},
    ...children: Array<VirtualNode | string | number | boolean>): VirtualNode {

    const childrenNodes: Array<VirtualNode | VirtualText> = [];

    children.forEach(child => {

        if (child === null) { // Keep it as the first test so the ones below are not executed

            // Do nothing
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