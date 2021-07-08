import FragmentNode from "../FragmentNode";
import ElementNode from "../ElementNode";
import TextNode from "../TextNode";
import parseFromString from "./parseFromString";
import toVDom from "./toVDom";

export default function markupToVDom(markup: string, type: 'html' | 'xml' = 'xml', options: any = {})
    : ElementNode | TextNode | FragmentNode | null {

    const nodes = parseFromString(markup, type);

    if (nodes === null) {

        return null;
    }

    return nodes.length > 1 ?
        new FragmentNode(null,
            Array.from(nodes)
                .map(n => toVDom(n, options))
                .filter(n => n !== null)
        ) :
        toVDom(nodes[0], options);
}