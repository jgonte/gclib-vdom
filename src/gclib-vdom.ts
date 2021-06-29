import VirtualNode from './nodes/VirtualNode';
import VirtualText from './nodes/VirtualText';
import FragmentNode, { Fragment } from './nodes/FragmentNode';
import h from './h';
import ElementPatches from './patches/ElementPatches';
import setAttributes from './nodes/helpers/setAttributes';
import diff from './diff';
import { NodeChanges } from './patches/Patch';
import markupToVDom from './nodes/parser/markupToVDom';

export {
    VirtualNode,
    VirtualText,
    FragmentNode,
    Fragment,
    h,
    ElementPatches,
    diff,
    NodeChanges,
    setAttributes,
    markupToVDom
}