import VirtualNode from "./nodes/VirtualNode"
import VirtualText from "./nodes/VirtualText";
import FragmentNode from "./nodes/FragmentNode";
import { isUndefinedOrNull } from "./utils/utils";
import getCSSClass from "./nodes/helpers/getCSSClass";
import getCSSStyle from "./nodes/helpers/getCSSStyle";

/**
 * Creates a virtual node
 * @param name Name of the virtual node
 * @param attributes Attributes of the virtual node
 * @param children Children of the virtual node
 */
export default function h(
    name: string | FunctionConstructor,
    attributes: any = {},
    ...children: Array<VirtualNode | FragmentNode | string | number | boolean>): VirtualNode {

    // if (attributes !== null) {

    //     // Stringify the class and style attributes if any
    //     if (!isUndefinedOrNull(attributes.class) && typeof attributes.class === 'object') {

    //         attributes.class = getCSSClass(attributes.class);
    //     }

    //     if (!isUndefinedOrNull(attributes.style) && typeof attributes.style === 'object') {

    //         attributes.style = getCSSStyle(attributes.style);
    //     }
    // }

    // Extract the children if an array was passed
    if (Array.isArray(children[0])) {

        children = children[0];
    }

    const childrenNodes: Array<VirtualNode | FragmentNode | VirtualText> = [];

    children.forEach(child => {

        // Do not alter the order of these tests
        if (child === null) {

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

        if (name.name === 'Fragment') {

            return new FragmentNode(attributes, childrenNodes as any) as any;
        }
        else { // It is a component

            return new (name as any)(attributes, childrenNodes).render();
        }
    }
}