import { VirtualNode, VirtualText } from "../gclib-vdom";

export interface ComponentBase {

    onBeforeMount(): void;

    onAfterMount(): void;

    onBeforeUnmount(): void;

    onAfterChildrenUpdated(updatedChildren: any): void;

    render(): VirtualNode | VirtualText;
}

export type ComponentBaseConstructor = new (props?: any) => ComponentBase;
