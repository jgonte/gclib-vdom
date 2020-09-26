import PatchingContext from "../helpers/PatchingContext";

export abstract class Patch {

    /** 
     * Executes the patch on the node
     */
    abstract apply(node: ChildNode | undefined, context: PatchingContext) : void;
}