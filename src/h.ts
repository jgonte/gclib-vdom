import VirtualNode from "./nodes/VirtualNode"
import VirtualText from "./nodes/VirtualText";
import FragmentNode, { Fragment } from "./nodes/FragmentNode";

/**
 * Creates a virtual node
 * @param name Name of the virtual node
 * @param attributes Attributes of the virtual node
 * @param children Children of the virtual node
 */
export default function h(
    name: string | FunctionConstructor,
    attributes: object | null = {},
    ...children: Array<VirtualNode | FragmentNode | string | number | boolean>): VirtualNode {

    // Extract the children if an array was passed
    if (Array.isArray(children[0])) {

        children = children[0];
    }

    const childrenNodes: Array<VirtualNode | FragmentNode | VirtualText> = [];

    children.forEach(child => {

        if (child === null) { // Do not alter the order of these tests

            // Do nothing
        }
        else if ((child as VirtualNode).isVirtualNode) {

            childrenNodes.push(child as VirtualNode);
        }
        else if ((child as FragmentNode).isFragmentNode) {

            childrenNodes.push(child as FragmentNode);
        }
        else if (typeof child === 'object') {

            throw new Error('Invalid object');
        }
        else {

            childrenNodes.push(new VirtualText(child));
        }
    });

    if (typeof name === 'string') {

        return new VirtualNode(name, attributes, childrenNodes);
    }
    else {

        return new FragmentNode(childrenNodes as any) as any;
    }
}