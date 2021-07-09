import ComponentNode from "./ComponentNode";

export default abstract class VirtualNode {

    /**
     * The DOM element rendered by this node
     */
    dom?: Node | null;

    /**
     * The reference to the component so we can call its hooks when rendering it
     */
     component?: ComponentNode;

}