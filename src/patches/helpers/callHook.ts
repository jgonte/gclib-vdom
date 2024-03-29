import { LifecycleHooks } from "../Patch";

export default function callHook(node: Node, name: string, hooks: LifecycleHooks = {}) {

    const component = (node as any).component;

    // If the node has a functional component attached and it is not undefined the call it
    if (component !== undefined &&
        component[name] !== undefined) {

        //console.log(`Calling hook: '${name}' of component: '${component.constructor.name}'`);

        component[name](node);
    } // Else call the one from the parent hook
    else if ((hooks as any)[name] !== undefined) {

        //console.log(`Calling hook: '${name}' of element: '${hooks.constructor.name}'`);

        (hooks as any)[name](node);
    }

    // const childNodes = Array.from(node.childNodes);

    // childNodes.forEach(childNode => callHook(childNode, name, hooks));
}