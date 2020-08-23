import VirtualNode from "./VirtualNode"
import VirtualText from "./VirtualText";

/**
 * Creates a virtual node
 * @param name Name of the element
 * @param attributes Attributes of the element
 * @param children Children of the element
 */
export default function createElement(
    name: string, attributes: any | null, 
    children: VirtualNode[] | string | number | boolean | null): VirtualNode {

    return new VirtualNode(
        name,
        attributes,
        children ?
            Array.isArray(children) ? 
                children as VirtualNode[] : 
                new VirtualText(children) :
            null
    );
}