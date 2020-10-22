import { Patch, PatchOptions } from "../Patch";
import { VirtualNode, VirtualText } from "../../gclib-vdom";

/**
 * Patch to replace the element in the DOM
 */
export default class ReplaceElementPatch implements Patch {

    constructor(

        /**
         * The new node to replace the element
         */
        public newNode: VirtualNode | VirtualText
    ) {}

    applyPatch(options: PatchOptions): void {

        const { node, hooks } = options;

        const {
            nodeWillDisconnect: onBeforeUnmount,
            nodeWillConnect: onBeforeMount,
            nodeDidConnect: onAfterMount
        } = hooks || {};

        const newNode = this.newNode.render();

        if (onBeforeUnmount) {

            onBeforeUnmount(node!);
        }

        if (onBeforeMount) {

            onBeforeMount(newNode!);
        }

        (node as HTMLElement).replaceWith(newNode);

        if (onAfterMount) {

            onAfterMount(newNode);
        }
    }

}