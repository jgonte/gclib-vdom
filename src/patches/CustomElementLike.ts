import { VirtualNode, VirtualText } from "../gclib-vdom";

export interface CustomElementBase {

    onBeforeMount(): void;

    onAfterMount(): void;

    onBeforeUnmount(): void;

    onAfterChildrenUpdated(updatedChildren: any): void;

    render(): VirtualNode | VirtualText;
}

export type CustomElementLike = (SVGElement | HTMLElement) & CustomElementBase;