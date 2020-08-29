import ElementPatches from "./ElementPatches";

export default class ChildElementPatches {

    constructor(
        /**
         * The index or position of the child element in the collection of children nodes
         */
        public index: number,

        /**
         * The patches to apply to this child element
         */
        public patches: ElementPatches
    ) {}
}