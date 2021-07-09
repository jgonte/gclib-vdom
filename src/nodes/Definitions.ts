import { LifecycleHooks } from '../patches/Patch';
import ComponentNode from './ComponentNode';
import ElementNode from './ElementNode';
import FragmentNode from './FragmentNode';
import TextNode from './TextNode';

/**
 * The virtual nodes
 */
export type AnyVirtualNode = ComponentNode | FragmentNode | ElementNode | TextNode | null;

/**
 * The DOM nodes
 */
export type CustomElementLike = Element & LifecycleHooks;