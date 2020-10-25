import VirtualDomComponent from "../VirtualDomComponent";

export type ComponentConstructor = new (...args: Array<any>) => Component;

export abstract class Component extends VirtualDomComponent {

    get document(): ShadowRoot | Document | Node {

        return document;
    }

    get rootElement(): Node | null {
        
        return null;
    }
}