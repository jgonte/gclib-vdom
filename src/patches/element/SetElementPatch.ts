import { Patch, PatchOptions } from "../Patch";
import VirtualNode from "../../nodes/VirtualNode";
import VirtualText from "../../nodes/VirtualText";

/**
 * Patch to set a new child at a given index
 */
export default class SetElementPatch implements Patch {

    constructor(

        /**
         * The new node to replace the existing element
         */
        public newNode: VirtualNode | VirtualText
    ) {}

    applyPatch(options: PatchOptions): void {

        const { parentNode, hooks } = options;

        const {
            nodeWillConnect: onBeforeMount,
            nodeDidConnect: onAfterMount
        } = hooks || {};

        const newNode = this.newNode.render();

        if (onBeforeMount) {

            onBeforeMount(newNode);
        }

        parentNode.appendChild(newNode);

        if (onAfterMount) {

            onAfterMount(newNode);
        }
    }
}