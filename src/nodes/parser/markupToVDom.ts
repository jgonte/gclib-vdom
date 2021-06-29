import VirtualNode from "../VirtualNode";
import VirtualText from "../VirtualText";
import parseFromString from "./parseFromString";
import toVDom from "./toVDom";

export default function markupToVDom(markup: string, type: 'html' | 'xml' = 'xml', options: any = {})
    : VirtualNode | VirtualText | null {

    const node = parseFromString(markup, type);

    if (node === null) {

        return null;
    }

    return toVDom(node, options);
}