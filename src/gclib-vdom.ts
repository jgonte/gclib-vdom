import ElementNode from './nodes/ElementNode';
import TextNode from './nodes/TextNode';
import FragmentNode, { Fragment } from './nodes/FragmentNode';
import ComponentNode from './nodes/ComponentNode';
import h from './h';
import ElementPatches from './patches/ElementPatches';
import setAttributes from './nodes/helpers/setAttributes';
import diff from './diff';
import { NodeChanges } from './patches/Patch';
import markupToVDom from './nodes/parser/markupToVDom';
import notifyNodeWillDisconnect from './notifyNodeWillDisconnect';

export {
    ElementNode as VirtualNode,
    TextNode as VirtualText,
    FragmentNode,
    Fragment,
    ComponentNode as Component,
    h,
    ElementPatches,
    diff,
    NodeChanges,
    setAttributes,
    markupToVDom,
    notifyNodeWillDisconnect
}