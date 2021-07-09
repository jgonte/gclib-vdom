import ElementNode from "./nodes/ElementNode"
import TextNode from "./nodes/TextNode";
import FragmentNode from "./nodes/FragmentNode";
import ComponentNode from "./nodes/ComponentNode";
import { AnyVirtualNode } from "./nodes/Definitions";
// import getCSSClass from "./nodes/helpers/getCSSClass";
// import getCSSStyle from "./nodes/helpers/getCSSStyle";

/**
 * Creates a virtual node
 * @param name Name of the virtual node
 * @param attributes Attributes of the virtual node
 * @param children Children of the virtual node
 */
export default function h(
    name: string | FunctionConstructor,
    attributes: any = {},
    ...children: Array<AnyVirtualNode | string | number | boolean | object>): ElementNode {

    // Extract the children if an array was passed
    if (Array.isArray(children[0])) {

        children = children[0];
    }

    const childrenNodes: AnyVirtualNode[] = [];

    children.forEach(child => {

        // Do not alter the order of these tests
        if (child === null) {

            return; // Nothing to push
        }

        if ((child as ElementNode).isElement) {

            childrenNodes.push(child as ElementNode);
        }
        else if ((child as TextNode).isText) {

            childrenNodes.push(child as TextNode);
        }
        else if ((child as FragmentNode).isFragment) {

            childrenNodes.push(child as FragmentNode);
        }
        else if (Array.isArray(child)) { // Flatten out the children array

            child.forEach(ch => childrenNodes.push(ch));
        }
        else if (typeof child === 'object') {

            if ((child as ComponentNode).isComponent) {

                const vNode = (child as ComponentNode).render();

                if (vNode !== null) {

                    vNode.component = child as ComponentNode; // Set the functional component to call its hooks if any
                }

                childrenNodes.push(vNode);
            }
            else {

                throw new Error('Invalid object. It must extend ComponentNode');
            }
        }
        else {

            childrenNodes.push(new TextNode(child));
        }
    });

    if (typeof name === 'string') {

        return new ElementNode(name, attributes, childrenNodes);
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