import { AnyVirtualNode } from "../Definitions";
import ElementNode from "../ElementNode";
import TextNode from "../TextNode";

export default function toVDom(node?: Node, options: any = {}): AnyVirtualNode | null {

    if (node === null) {

        return null;
    }

    switch (node!.nodeType) {
        case 1: // html element
            {
                const element = node! as HTMLElement;

                const nodeName = element.nodeName.toLowerCase();

                if (nodeName === 'script' && !options.allowScripts) {

                    throw Error('Script elements are not allowed unless the allowScripts option is set to true');
                }

                const props = getProps(element.attributes);

                const children = getChildren(element.childNodes, options);

                return new ElementNode(nodeName, props, children);
            }
        case 3: // text
            {
                const text = node! as Text;

                const content = text.textContent || '';

                // Do not include text with white space characters ' ', '\t', '\r', '\n'
                if (options.excludeTextWithWhiteSpacesOnly &&
                    /^\s*$/g.test(content)) {

                    return null;
                }

                return new TextNode(content);
            }
        default: return null; // Node type is ignored
    }
}

function getProps(attributes: NamedNodeMap) {

    if (attributes === null) {

        return null;
    }

    const count = attributes.length;

    if (count == 0) {

        return null;
    }

    const props = {};

    for (let i = 0; i < attributes.length; i++) {

        const { name, value } = attributes[i];

        // if (name.substring(0,2)==='on' && walk.options.allowEvents){
		// 	value  = new Function(value); // eslint-disable-line no-new-func
		// }

        (props as any)[name] = value;        
    }

    return props;
}

function getChildren(childNodes: NodeListOf<ChildNode>, options: any): AnyVirtualNode[] {

    var vnodes: AnyVirtualNode[] = [];

    childNodes.forEach(childNode => {

        const vnode = toVDom(childNode, options);

        if (vnode != null) {

            vnodes.push(vnode);
        }     
    });

    return vnodes;
}

