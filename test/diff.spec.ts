import h from "../src/h";
import diff from "../src/diff";
import displayObject from "../src/utils/displayObject";
import ElementPatches from "../src/patches/ElementPatches";
import ElementNode from "../src/nodes/ElementNode";
import TextNode from "../src/nodes/TextNode";
import { NodeChanges } from "../src/patches/Patch";
import { Fragment } from "../src/nodes/FragmentNode";
import ComponentNode from "../src/nodes/ComponentNode";

function comparePatches(patches: ElementPatches, expected: string): void {

    const actual: string = displayObject(patches);

    if (expected) {

        expect(actual.replace(/\s/g, '')).toEqual(expected.replace(/\s/g, ''));
    }
    else { // Allow to pretty display the string

        expect(actual).toEqual(expected);
    }
}

function createShadowRoot() {

    const element = document.createElement('div');

    return element.attachShadow({ mode: 'open' });
}

function setupLifecycleHooks() {

    const hooks = {

        nodeWillConnect(node: Node): void { },

        nodeDidConnect(node: Node): void { },

        nodeWillDisconnect(node: Node): void { },

        nodeDidUpdate(node: Node, updatedChildren: NodeChanges): void { }
    }

    return {

        hooks,

        spyNodeWillConnect: jest.spyOn(hooks, 'nodeWillConnect'),

        spyNodeDidConnect: jest.spyOn(hooks, 'nodeDidConnect'),

        spyNodeWillDisconnect: jest.spyOn(hooks, 'nodeWillDisconnect'),

        spyNodeDidUpdate: jest.spyOn(hooks, 'nodeDidUpdate')
    };
}

describe("diff tests", () => {

    it("diff null to null", () => {

        const oldNode = null;

        const newNode = null;

        const patches = diff(oldNode as unknown as ElementNode, newNode as unknown as ElementNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches: [],
            childrenPatches: []
        }`);

        const shadowRoot = createShadowRoot();

        patches.applyPatches(shadowRoot);

        expect(shadowRoot.childNodes.length).toEqual(0); // Unchanged
    });

    it("diff virtual text to undefined", () => {

        const oldNode = new TextNode('someText');

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element.textContent).toEqual('someText');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = undefined;

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (RemoveElementPatch) {}
            ],
            childrenPatches: []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(1);

        expect(spyNodeWillDisconnect).toHaveBeenCalledWith(element);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(shadowRoot, new NodeChanges({
            removed: [element]
        }));

        expect(shadowRoot.childNodes.length).toEqual(0); // Removed
    });

    it("diff undefined to virtual text", () => {

        const oldNode = undefined;

        const newNode = new TextNode('someText');

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (SetElementPatch) {
                    newNode:
                    (TextNode) {
                        text: 'someText',
                        isText: true
                    }
                }
            ],
            childrenPatches: []
        }`);

        const shadowRoot = createShadowRoot();

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, undefined, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // Added

        const element = shadowRoot.firstChild!;

        expect(element.textContent).toEqual('someText');

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(1);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(1);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(shadowRoot, new NodeChanges({
            inserted: [element]
        }));
    });

    it("diff virtual node to undefined", () => {

        const oldNode = h('div', null);

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element.outerHTML).toEqual('<div></div>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = undefined;

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (RemoveElementPatch) {}
            ],
            childrenPatches: []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(1);

        expect(spyNodeWillDisconnect).toHaveBeenCalledWith(element);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(shadowRoot, new NodeChanges({
            removed: [element]
        }));

        expect(shadowRoot.childNodes.length).toEqual(0); // Removed
    });

    it("diff undefined to virtual node", () => {

        const oldNode = undefined;

        const newNode = h('div', null);

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (SetElementPatch) {
                    newNode:
                    (ElementNode) {
                        name: 'div',
                        props: null,
                        children: [],
                        isElement: true
                    }
                }
            ],
            childrenPatches: []
        }`);

        const shadowRoot = createShadowRoot();

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, undefined, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // Added

        const element = shadowRoot.firstChild! as HTMLElement;

        expect(element.outerHTML).toEqual('<div></div>');

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(1);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(1);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(shadowRoot, new NodeChanges({
            inserted: [element]
        }));
    });

    it("diff undefined to functional component", () => {

        const oldNode = undefined;

        class MyComponent extends ComponentNode {

            value: string = "Some text"

            render(): ElementNode | TextNode {

                return h('span', null, this.value);
            }
        }

        const newNode = h(MyComponent as any, null);

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (SetElementPatch) {
                    newNode:
                    (ElementNode) {
                        name: 'span',
                        props: null,
                        children:
                        [
                            (TextNode) {
                                text: 'Some text',
                                isText: true
                            }
                        ],
                        isElement: true
                    }
                }
            ],
            childrenPatches:
            []
        }`);

        const shadowRoot = createShadowRoot();

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, undefined, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // Added

        const element = shadowRoot.firstChild! as HTMLElement;

        expect(element.outerHTML).toEqual('<span>Some text</span>');

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(1);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(1);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(shadowRoot, new NodeChanges({
            inserted: [element]
        }));
    });

    it("diff empty fragment node to undefined", () => {

        const oldNode = h(Fragment as any, null);

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element).toBeInstanceOf(DocumentFragment);

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = undefined;

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches: [],
            childrenPatches: []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(0);

        expect(shadowRoot.childNodes.length).toEqual(0); // Removed
    });

    it("diff undefined to empty fragment node", () => {

        const oldNode = undefined;

        const newNode = h(Fragment as any, null);

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (SetElementPatch) {
                    newNode:
                    (FragmentNode) {
                        props: null,
                        children:
                        [],
                        isFragment: true
                    }
                }
            ],
            childrenPatches:
            []
        }`);

        const shadowRoot = createShadowRoot();

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, undefined, hooks);

        expect(shadowRoot.childNodes.length).toEqual(0); // Fragment has no children, therefore no element was added

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(0);
    });

    it("diff fragment node to undefined", () => {

        const oldNode = h(Fragment as any,
            null,
            h("td", null, "Hello"),
            h("td", null, "World")
        );

        // Get the element to get patched
        const element = oldNode.renderDom();

        const children = Array.from(element.childNodes);

        expect(element).toBeInstanceOf(DocumentFragment);

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = undefined;

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (RemoveChildrenPatch) {}
            ],
            childrenPatches:
            []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(2);

        expect(spyNodeWillDisconnect).toHaveBeenNthCalledWith(1, children[0]);

        expect(spyNodeWillDisconnect).toHaveBeenNthCalledWith(2, children[1]);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(shadowRoot, new NodeChanges({
            removed: children
        }));

        expect(shadowRoot.childNodes.length).toEqual(0); // Removed
    });

    it("diff fragment node to empty fragment node", () => {

        const oldNode = h(Fragment as any,
            null,
            h("td", null, "Hello"),
            h("td", null, "World")
        );

        // Get the element to get patched
        const element = oldNode.renderDom();

        const children = Array.from(element.childNodes);

        expect(element).toBeInstanceOf(DocumentFragment);

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h(Fragment as any, null);

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (RemoveChildrenPatch) {}
            ],
            childrenPatches:
            []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(2);

        expect(spyNodeWillDisconnect).toHaveBeenNthCalledWith(1, children[0]);

        expect(spyNodeWillDisconnect).toHaveBeenNthCalledWith(2, children[1]);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(shadowRoot, new NodeChanges({
            removed: children
        }));

        expect(shadowRoot.childNodes.length).toEqual(0); // Removed
    });

    it("diff undefined to fragment node", () => {

        const oldNode = undefined;

        const open = false;

        const newNode = h(Fragment as any,
            {
                'aria-hidden': open ? 'false' : 'true',
                class: {
                    'todo-list': true,
                    'is-open': open
                },
                style: {
                    width: '1px',
                    height: '1px',
                    backgroundColor: 'red',
                    transform: 'rotateZ(45deg)'
                }
            },
            h("td", null, "Hello"),
            h("td", null, "World"),
            h("style", null, "@import './import1.css'")
        );

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (SetElementPatch) {
                    newNode:
                    (FragmentNode) {
                        props:
                        {
                            aria-hidden: 'true',
                            class:
                            {
                                todo-list: true,
                                is-open: false
                            },
                            style:
                            {
                                width: '1px',
                                height: '1px',
                                backgroundColor: 'red',
                                transform: 'rotateZ(45deg)'
                            }
                        },
                        children:
                        [
                            (ElementNode) {
                                name: 'td',
                                props: null,
                                children:
                                [
                                    (TextNode) {
                                        text: 'Hello',
                                        isText: true
                                    }
                                ],
                                isElement: true
                            },
                            (ElementNode) {
                                name: 'td',
                                props: null,
                                children:
                                [
                                    (TextNode) {
                                        text: 'World',
                                        isText: true
                                    }
                                ],
                                isElement: true
                            },
                            (ElementNode) {
                                name: 'style',
                                props: null,
                                children:
                                [
                                    (TextNode) {
                                        text: '@import './import1.css'',
                                        isText: true
                                    }
                                ],
                                isElement: true
                            }
                        ],
                        isFragment: true
                    }
                }
            ],
            childrenPatches:
            []
        }`);

        const shadowRoot = createShadowRoot();

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, undefined, hooks);

        expect(shadowRoot.childNodes.length).toEqual(3); // The three children of the fragment have been added

        const firstChild = shadowRoot.childNodes[0]! as HTMLElement;

        expect(firstChild.outerHTML).toEqual('<td>Hello</td>');

        const secondChild = shadowRoot.childNodes[1]! as HTMLElement;

        expect(secondChild.outerHTML).toEqual('<td>World</td>');

        const thirdChild = shadowRoot.childNodes[2]! as HTMLElement;

        expect(thirdChild.outerHTML).toEqual("<style>@import './import1.css'</style>");

        expect(shadowRoot.host.outerHTML).toEqual('<div aria-hidden=\"true\" class=\"todo-list\" style=\"width:1px;height:1px;background-color:red;transform:rotateZ(45deg);\"></div>');

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(3);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(3);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(shadowRoot, new NodeChanges({
            inserted: Array.from(shadowRoot.childNodes)
        }));
    });

    it("diff virtual text to virtual node", () => {

        const oldNode = new TextNode('some text');

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element.textContent).toEqual('some text');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = new ElementNode('span', null, [new TextNode('Some other text')]);

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (ReplaceElementPatch) {
                    newNode:
                    (ElementNode) {
                        name: 'span',
                        props: null,
                        children:
                        [
                            (TextNode) {
                                text: 'Some other text',
                                isText: true
                            }
                        ],
                        isElement: true
                    }
                }
            ],
            childrenPatches: []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // Replaced

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<span>Some other text</span>');

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(1);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(1);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(shadowRoot, new NodeChanges({
            inserted: [child],
            removed: [element]
        }));
    });

    it("diff virtual node to virtual text", () => {

        const oldNode = new ElementNode('span', null, [new TextNode('Some text')]);

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element.textContent).toEqual('Some text');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = new TextNode('Some other text');

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (ReplaceElementPatch) {
                    newNode:
                    (TextNode) {
                        text: 'Some other text',
                        isText: true
                    }
                }
            ],
            childrenPatches: []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // Replaced

        const child = shadowRoot.firstChild! as Text;

        expect(child.textContent).toEqual('Some other text');

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(1);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(1);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(shadowRoot, new NodeChanges({
            inserted: [child],
            removed: [element]
        }));
    });

    it("diff empty fragment node to virtual node", () => {

        const oldNode = h(Fragment as any, null);

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element).toBeInstanceOf(DocumentFragment);

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = new ElementNode('span', null, [new TextNode('Some text')]);

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (SetElementPatch) {
                    newNode:
                    (ElementNode) {
                        name: 'span',
                        props: null,
                        children:
                        [
                            (TextNode) {
                                text: 'Some text',
                                isText: true
                            }
                        ],
                        isElement: true
                    }
                }
            ],
            childrenPatches:
            []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // Added

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<span>Some text</span>');

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(1);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(1);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(shadowRoot, new NodeChanges({
            inserted: [child]
        }));
    });

    it("diff empty fragment node to virtual text", () => {

        const oldNode = h(Fragment as any, null);

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element).toBeInstanceOf(DocumentFragment);

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = new TextNode('Some text');

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (SetElementPatch) {
                    newNode:
                    (TextNode) {
                        text: 'Some text',
                        isText: true
                    }
                }
            ],
            childrenPatches:
            []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // Added

        const child = shadowRoot.firstChild! as Text;

        expect(child.textContent).toEqual('Some text');

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(1);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(1);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(shadowRoot, new NodeChanges({
            inserted: [child]
        }));
    });

    it("diff empty fragment node to fragment node", () => {

        const oldNode = h(Fragment as any, null);

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element).toBeInstanceOf(DocumentFragment);

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h(Fragment as any,
            {
                'open': true
            },
            h("td", null, "Hello"),
            h("td", null, "World")
        );

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (SetElementPatch) {
                    newNode:
                    (FragmentNode) {
                        props:
                        {
                            open: true
                        },
                        children:
                        [
                            (ElementNode) {
                                name: 'td',
                                props: null,
                                children:
                                [
                                    (TextNode) {
                                        text: 'Hello',
                                        isText: true
                                    }
                                ],
                                isElement: true
                            },
                            (ElementNode) {
                                name: 'td',
                                props: null,
                                children:
                                [
                                    (TextNode) {
                                        text: 'World',
                                        isText: true
                                    }
                                ],
                                isElement: true
                            }
                        ],
                        isFragment: true
                    }
                }
            ],
            childrenPatches:
            []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(2); // Added

        expect(shadowRoot.innerHTML).toEqual('<td>Hello</td><td>World</td>');

        expect(shadowRoot.host.outerHTML).toEqual('<div open=\"true\"></div>');

        const newChildren = Array.from(shadowRoot.childNodes);

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(2);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(2);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(shadowRoot, new NodeChanges({
            inserted: newChildren
        }));
    });

    it("diff fragment node to virtual node", () => {

        const oldNode = h(Fragment as any,
            null,
            h("td", null, "Hello"),
            h("td", null, "World")
        );

        // Get the element to get patched
        const element = oldNode.renderDom();

        const children = Array.from(element.childNodes);

        expect(element).toBeInstanceOf(DocumentFragment);

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = new ElementNode('span', null, [new TextNode('Some text')]);

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (RemoveChildrenPatch) {},
                (SetElementPatch) {
                    newNode:
                    (ElementNode) {
                        name: 'span',
                        props: null,
                        children:
                        [
                            (TextNode) {
                                text: 'Some text',
                                isText: true
                            }
                        ],
                        isElement: true
                    }
                }
            ],
            childrenPatches:
            []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // Replaced

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<span>Some text</span>');

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(1);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(1);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(2);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(shadowRoot, new NodeChanges({
            removed: children,
            inserted: [child]
        }));
    });

    it("diff virtual node to empty fragment node", () => {

        const oldNode = new ElementNode('span', null, [new TextNode('Some text')]);

        // Get the element to get patched
        const element = oldNode.renderDom();

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h(Fragment as any, null);

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (RemoveElementPatch) {}
            ],
            childrenPatches:
            []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(0); // Removed original node

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(shadowRoot, new NodeChanges({
            removed: [element]
        }));
    });

    it("diff virtual node to fragment node", () => {

        const oldNode = new ElementNode('span', null, [new TextNode('Some text')]);

        // Get the element to get patched
        const element = oldNode.renderDom();

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h(Fragment as any,
            {
                open: true
            },
            h("td", null, "Hello"),
            h("td", null, "World")
        );

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (RemoveElementPatch) {},
                (SetElementPatch) {
                    newNode:
                    (FragmentNode) {
                        props:
                        {
                            open: true
                        },
                        children:
                        [
                            (ElementNode) {
                                name: 'td',
                                props: null,
                                children:
                                [
                                    (TextNode) {
                                        text: 'Hello',
                                        isText: true
                                    }
                                ],
                                isElement: true
                            },
                            (ElementNode) {
                                name: 'td',
                                props: null,
                                children:
                                [
                                    (TextNode) {
                                        text: 'World',
                                        isText: true
                                    }
                                ],
                                isElement: true
                            }
                        ],
                        isFragment: true
                    }
                }
            ],
            childrenPatches:
            []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(2); // Replaced by the 2 nodes

        expect(shadowRoot.innerHTML).toEqual('<td>Hello</td><td>World</td>');

        expect(shadowRoot.host.outerHTML).toEqual('<div open=\"true\"></div>');

        const newChildren = Array.from(shadowRoot.childNodes);

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(2);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(2);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(shadowRoot, new NodeChanges({
            removed: [element],
            inserted: newChildren
        }));
    });

    it("diff fragment node to virtual text", () => {

        const oldNode = h(Fragment as any,
            null,
            h("td", null, "Hello"),
            h("td", null, "World")
        );

        // Get the element to get patched
        const element = oldNode.renderDom();

        const children = Array.from(element.childNodes);

        expect(element).toBeInstanceOf(DocumentFragment);

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = new TextNode('Some text');

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (RemoveChildrenPatch) {},
                (SetElementPatch) {
                    newNode:
                    (TextNode) {
                        text: 'Some text',
                        isText: true
                    }
                }
            ],
            childrenPatches:
            []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // Replaced

        const child = shadowRoot.firstChild! as Text;

        expect(child.textContent).toEqual('Some text');

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(1);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(1);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(2);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(shadowRoot, new NodeChanges({
            removed: children,
            inserted: [child]
        }));
    });

    it("diff virtual text to empty fragment node", () => {

        const oldNode = new TextNode('Some text');

        // Get the element to get patched
        const element = oldNode.renderDom();

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h(Fragment as any, null);

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (RemoveElementPatch) {}
            ],
            childrenPatches:
            []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(0); // Removed original node

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(shadowRoot, new NodeChanges({
            removed: [element]
        }));
    });

    it("diff virtual text to fragment node", () => {

        const oldNode = new TextNode('Some text');

        // Get the element to get patched
        const element = oldNode.renderDom();

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h(Fragment as any,
            {
                class: {
                    'my-class': true,
                    enabled: true
                }
            },
            h("td", null, "Hello"),
            h("td", null, "World")
        );

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (RemoveElementPatch) {},
                (SetElementPatch) {
                    newNode:
                    (FragmentNode) {
                        props:
                        {
                            class:
                            {
                                my-class: true,
                                enabled: true
                            }
                        },
                        children:
                        [
                            (ElementNode) {
                                name: 'td',
                                props: null,
                                children:
                                [
                                    (TextNode) {
                                        text: 'Hello',
                                        isText: true
                                    }
                                ],
                                isElement: true
                            },
                            (ElementNode) {
                                name: 'td',
                                props: null,
                                children:
                                [
                                    (TextNode) {
                                        text: 'World',
                                        isText: true
                                    }
                                ],
                                isElement: true
                            }
                        ],
                        isFragment: true
                    }
                }
            ],
            childrenPatches:
            []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(2); // Replaced by the 2 nodes

        expect(shadowRoot.innerHTML).toEqual('<td>Hello</td><td>World</td>');

        expect(shadowRoot.host.outerHTML).toEqual('<div class=\"my-class enabled\"></div>');

        const newChildren = Array.from(shadowRoot.childNodes);

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(2);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(2);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(shadowRoot, new NodeChanges({
            removed: [element],
            inserted: newChildren
        }));
    });

    it("diff virtual text to virtual text same text", () => {

        const oldNode = new TextNode('Some text');

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element.textContent).toEqual('Some text');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = new TextNode('Some text');

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches: [],
            childrenPatches: []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(0);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as Text;

        expect(child.textContent).toEqual('Some text'); // Kept the same text

        expect(child).toEqual(element); // Kept the same node
    });

    it("diff virtual text to virtual text different text", () => {

        const oldNode = new TextNode('Some text');

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element.textContent).toEqual('Some text');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = new TextNode('Some other text');

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (SetTextPatch) {
                    value:
                    (TextNode) {
                        text: 'Some other text',
                        isText: true
                    }
                }
            ],
            childrenPatches: []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as Text;

        expect(child.textContent).toEqual('Some other text'); // Changed the text

        expect(child).toEqual(element); // Kept the same node

        // No mount changes but maybe onTextChanged event?

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(shadowRoot.firstChild, new NodeChanges({
            text: {
                oldValue: 'Some text',
                newValue: 'Some other text'
            }
        }));
    });

    it("diff textarea virtual text to virtual text different text", () => {

        const oldNode = h("textarea", null, 'Some text');

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element.outerHTML).toEqual('<textarea>Some text</textarea>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h("textarea", null, 'Some other text');

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [],
            childrenPatches:
            [
                (ChildElementPatches) {
                    index: 0,
                    patches:
                    (ElementPatches) {
                        patches:
                        [
                            (SetTextPatch) {
                                value:
                                (TextNode) {
                                    text: 'Some other text',
                                    isText: true
                                }
                            }
                        ],
                        childrenPatches:
                        []
                    }
                }
            ]
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLTextAreaElement;

        expect(child.value).toEqual('Some other text'); // Changed the text

        expect(child).toEqual(element); // Kept the same node

        // No mount changes but maybe onTextChanged event?

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(shadowRoot.firstChild!.childNodes[0]!, new NodeChanges({
            text: {
                oldValue: 'Some text',
                newValue: 'Some other text'
            }
        }));
    });

    it("diff same node type", () => {

        const oldNode = h("div", null);

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element.outerHTML).toEqual('<div></div>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h("div", null);

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches: [],
            childrenPatches: []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(0);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<div></div>'); // Nothing changed

        expect(child).toEqual(element); // Kept the same node
    });

    it("diff same node type with different props", () => {

        const oldNode = h('div', {
            id: 'myElement1',
            class: "class1 class2",
        });

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element.outerHTML).toEqual('<div id=\"myElement1\" class=\"class1 class2\"></div>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h('div', {
            id: 'myElement2', // Replace attribute value
            //class: "class1 class2", // Remove attribute
            href: "http://someurl.com" // Add attribute
        });

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (SetAttributePatch) {
                    name: 'id',
                    oldValue: 'myElement1',
                    newValue: 'myElement2'
                },
                (AddAttributePatch) {
                    name: 'href',
                    value: 'http://someurl.com'
                },
                (RemoveAttributePatch) {
                    name: 'class',
                    oldValue: 'class1 class2'
                }
            ],
            childrenPatches:
            []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        // Track the changed attributes?

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(element, new NodeChanges({
            attributes: [
                {
                    key: 'id',
                    oldValue: 'myElement1',
                    newValue: 'myElement2'
                },
                {
                    key: 'href',
                    newValue: 'http://someurl.com'
                },
                {
                    key: 'class',
                    oldValue: 'class1 class2'
                }]
        }));

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<div id=\"myElement2\" href=\"http://someurl.com\"></div>');

        expect(child).toEqual(element); // Kept the same node
    });

    it("diff same node type with same prop set from true to false", () => {

        const oldNode = h('div', {
            selected: "true",
        });

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element.outerHTML).toEqual('<div selected=\"true\"></div>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h('div', {
            selected: "false",
        });

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (RemoveAttributePatch) {
                    name: 'selected',
                    oldValue: 'true'
                }
            ],
            childrenPatches:
            []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        // Track the changed attributes?

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(element, new NodeChanges({
            attributes: [
                {
                    key: 'selected',
                    oldValue: 'true'
                }]
        }));

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<div></div>');

        expect(child).toEqual(element); // Kept the same node
    });

    it("diff same node type with same prop set from false to true", () => {

        const oldNode = h('div', {
            selected: false,
        });

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element.outerHTML).toEqual('<div></div>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h('div', {
            selected: true,
        });

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (SetAttributePatch) {
                    name: 'selected',
                    oldValue: false,
                    newValue: true
                }
            ],
            childrenPatches:
            []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        // Track the changed attributes?

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(element, new NodeChanges({
            attributes: [
                {
                    key: 'selected',
                    oldValue: false,
                    newValue: true
                }]
        }));

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<div selected=\"true\"></div>');

        expect(child).toEqual(element); // Kept the same node
    });

    it("diff same node type add event listener", () => {

        const oldNode = h('span', null, 'Some text');

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element.outerHTML).toEqual('<span>Some text</span>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const onClick = () => alert('clicked');

        const newNode = h('span', { onClick }, 'Some text');

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (AddAttributePatch) {
                    name: 'onClick',
                    value: 'function () { return alert('clicked'); }'
                }
            ],
            childrenPatches:
            []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(element, new NodeChanges({
            attributes: [{
                key: 'onClick',
                newValue: onClick
            }]
        }));

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<span>Some text</span>');

        expect(child).toEqual(element); // Kept the same node

        // Test the listener was added
        const listener = (element as any)._listeners['click'];

        expect(listener).toEqual([onClick]);

        // Test the tracked listener was added
        const trackedListener = (element as any)._trackedListeners['onClick'];

        expect(trackedListener).toEqual({
            eventName: 'click',
            value: onClick,
            useCapture: false
        });
    });

    it("diff same node type add event listener with capture", () => {

        const oldNode = h('span', null, 'Some text');

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element.outerHTML).toEqual('<span>Some text</span>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const onClick = () => alert('clicked');

        const newNode = h('span', { onClick_capture: onClick }, 'Some text');

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (AddAttributePatch) {
                    name: 'onClick_capture',
                    value: 'function () { return alert('clicked'); }'
                }
            ],
            childrenPatches:
            []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(element, new NodeChanges({
            attributes: [{
                key: 'onClick_capture',
                newValue: onClick
            }]
        }));

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<span>Some text</span>');

        expect(child).toEqual(element); // Kept the same node

        // Test the listener was added
        const listener = (element as any)._listeners['click'];

        expect(listener).toEqual([onClick]);

        // Test the tracked listener was added
        const trackedListener = (element as any)._trackedListeners['onClick_capture'];

        expect(trackedListener).toEqual({
            eventName: 'click',
            value: onClick,
            useCapture: true
        });
    });

    it("diff same node type add function to be bound", () => {

        const oldNode = h('span', null, 'Some text');

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element.outerHTML).toEqual('<span>Some text</span>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const onSomeAction = () => alert('something happened!');

        const newNode = h('span', { onSomeAction }, 'Some text');

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (AddAttributePatch) {
                    name: 'onSomeAction',
                    value: 'function () { return alert('something happened!'); }'
                }
            ],
            childrenPatches:
            []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(element, new NodeChanges({
            attributes: [{
                key: 'onSomeAction',
                newValue: onSomeAction
            }]
        }));

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<span>Some text</span>');

        expect(child).toEqual(element); // Kept the same node

        // Test no listener was added
        expect((element as any)._listeners).toEqual({});

        // Test no tracked listener was added
        expect((element as any)._trackedListeners).toEqual(undefined);

        // Test the function is attached and bound to the element
        expect((element as any).onSomeAction.name).toEqual('bound onSomeAction');
    });

    it("diff same node type remove event listener", () => {

        const onClick = () => alert('clicked');

        const oldNode = h('span', { onClick }, 'Some text');

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element.outerHTML).toEqual('<span>Some text</span>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h('span', null, 'Some text');

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (RemoveAttributePatch) {
                    name: 'onClick',
                    oldValue: 'function () { return alert('clicked'); }'
                }
            ],
            childrenPatches:
            []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(element, new NodeChanges({
            attributes: [{
                key: 'onClick',
                oldValue: onClick
            }]
        }));

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<span>Some text</span>');

        expect(child).toEqual(element); // Kept the same node

        // Test the listener was removed
        const listener = (element as any)._listeners['click'];

        expect(listener).toEqual([]);

        // Test the tracked listener was removed
        expect((element as any)._trackedListeners['onClick']).toBe(undefined);
    });

    it("diff same node type remove event listener with capture", () => {

        const onClick = () => alert('clicked');

        const oldNode = h('span', { onClick_capture: onClick }, 'Some text');

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element.outerHTML).toEqual('<span>Some text</span>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h('span', null, 'Some text');

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (RemoveAttributePatch) {
                    name: 'onClick_capture',
                    oldValue: 'function () { return alert('clicked'); }'
                }
            ],
            childrenPatches:
            []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(element, new NodeChanges({
            attributes: [{
                key: 'onClick_capture',
                oldValue: onClick
            }]
        }));

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<span>Some text</span>');

        expect(child).toEqual(element); // Kept the same node

        // Test the listener was removed
        const listener = (element as any)._listeners['click'];

        expect(listener).toEqual([]);

        // Test the tracked listener was removed
        expect((element as any)._trackedListeners['onClick_capture']).toBe(undefined);
    });

    it("diff same node type remove event listener by setting the attribute to null", () => {

        const onClick = () => alert('clicked');

        const oldNode = h('span', { onClick }, 'Some text');

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element.outerHTML).toEqual('<span>Some text</span>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h('span', { onClick: null }, 'Some text');

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (SetAttributePatch) {
                    name: 'onClick',
                    oldValue: 'function () { return alert('clicked'); }',
                    newValue: null
                }
            ],
            childrenPatches:
            []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(element, new NodeChanges({
            attributes: [{
                key: 'onClick',
                oldValue: onClick,
                newValue: null
            }]
        }));

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<span>Some text</span>');

        expect(child).toEqual(element); // Kept the same node

        // Test the listener was removed
        const listener = (element as any)._listeners['click'];

        expect(listener).toEqual([]);

        // Test the tracked listener was removed
        expect((element as any)._trackedListeners['onClick']).toBe(undefined);
    });

    it("diff same node type replace event listener", () => {

        const onOldClick = () => alert('old clicked');

        const oldNode = h('span', { onClick: onOldClick }, 'Some text');

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element.outerHTML).toEqual('<span>Some text</span>');

        // Test the listener was replaced
        let listener = (element as any)._listeners['click'];

        expect(listener).toEqual([onOldClick]);

        // Test the tracked listener was replaced
        let trackedListener = (element as any)._trackedListeners['onClick'];

        expect(trackedListener).toEqual({
            eventName: 'click',
            value: onOldClick,
            useCapture: false
        });

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const onNewClick = () => alert('new clicked');

        const newNode = h('span', { onClick: onNewClick }, 'Some text');

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (SetAttributePatch) {
                    name: 'onClick',
                    oldValue: 'function () { return alert('old clicked'); }',
                    newValue: 'function () { return alert('new clicked'); }'
                }
            ],
            childrenPatches:
            []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(element, new NodeChanges({
            attributes: [{
                key: 'onClick',
                oldValue: onOldClick,
                newValue: onNewClick
            }]
        }));

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<span>Some text</span>');

        expect(child).toEqual(element); // Kept the same node

        // Test the listener was replaced
        listener = (element as any)._listeners['click'];

        expect(listener).toEqual([onNewClick]);

        // Test the tracked listener was replaced
        trackedListener = (element as any)._trackedListeners['onClick'];

        expect(trackedListener).toEqual({
            eventName: 'click',
            value: onNewClick,
            useCapture: false
        });
    });

    it("diff same node type with different text", () => {

        const oldNode = h('span', null, 'Some text');

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element.outerHTML).toEqual('<span>Some text</span>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h('span', null, 'Some other text');

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches: [],
            childrenPatches:
            [
                (ChildElementPatches) {
                    index: 0,
                    patches:
                    (ElementPatches) {
                        patches:
                        [
                            (SetTextPatch) {
                                value:
                                (TextNode) {
                                    text: 'Some other text',
                                    isText: true
                                }
                            }
                        ],
                        childrenPatches: []
                    }
                }
            ]
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(element.firstChild, new NodeChanges({
            text: {
                oldValue: 'Some text',
                newValue: 'Some other text'
            }
        }));

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<span>Some other text</span>');

        expect(child).toEqual(element); // Kept the same node
    });

    it("diff same node type with children to without children", () => {

        const oldNode = h("ul", null,
            h("li", null, "Item1"),
            h("li", null, "Item2"),
            h("li", null, "Item3")
        );

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element.outerHTML).toEqual('<ul><li>Item1</li><li>Item2</li><li>Item3</li></ul>');

        const originalChildNodes = Array.from(element.childNodes);

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h("ul", null);

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (RemoveChildrenPatch) {}
            ],
            childrenPatches: []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(3);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(shadowRoot.firstChild, new NodeChanges({
            removed: originalChildNodes
        }));

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul></ul>');

        expect(child).toEqual(element); // Kept the same node
    });

    it("diff same node type without children to with children", () => {

        const oldNode = h("ul", null);

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element.outerHTML).toEqual('<ul></ul>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h("ul", null,
            h("li", null, "Item1"),
            h("li", null, "Item2"),
            h("li", null, "Item3")
        );

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (AddChildrenPatch) {
                    children:
                    [
                        (ElementNode) {
                            name: 'li',
                            props: null,
                            children:
                            [
                                (TextNode) {
                                    text: 'Item1',
                                    isText: true
                                }
                            ],
                            isElement: true
                        },
                        (ElementNode) {
                            name: 'li',
                            props: null,
                            children:
                            [
                                (TextNode) {
                                    text: 'Item2',
                                    isText: true
                                }
                            ],
                            isElement: true
                        },
                        (ElementNode) {
                            name: 'li',
                            props: null,
                            children:
                            [
                                (TextNode) {
                                    text: 'Item3',
                                    isText: true
                                }
                            ],
                            isElement: true
                        }
                    ]
                }
            ],
            childrenPatches: []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li>Item1</li><li>Item2</li><li>Item3</li></ul>');

        expect(child).toEqual(element); // Kept the same node

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(3);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(3);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        const insertedChildNodes = Array.from(child.childNodes);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(child, new NodeChanges({
            inserted: insertedChildNodes
        }));
    });

    it("diff virtual node to virtual node with different name", () => {

        const oldNode = new ElementNode('div', null, [new TextNode('Some text')]);

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element.outerHTML).toEqual('<div>Some text</div>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = new ElementNode('span', null, [new TextNode('Some other text')]);

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (ReplaceElementPatch) {
                    newNode:
                    (ElementNode) {
                        name: 'span',
                        props: null,
                        children:
                        [
                            (TextNode) {
                                text: 'Some other text',
                                isText: true
                            }
                        ],
                        isElement: true
                    }
                }
            ],
            childrenPatches: []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<span>Some other text</span>');

        expect(child).not.toEqual(element); // Replaced the node

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(1);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(1);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(shadowRoot, new NodeChanges({
            inserted: [child],
            removed: [element]
        }));
    });

    it("diff empty fragment node to empty fragment node", () => {

        const oldNode = h(Fragment as any, null);

        // Get the element to get patched
        const element = oldNode.renderDom();

        const children = Array.from(element.childNodes);

        expect(element).toBeInstanceOf(DocumentFragment);

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h(Fragment as any, null);

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [],
            childrenPatches:
            []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(0); // Nothing replaced

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(0);
    });

    it("diff empty fragment node to fragment node", () => {

        const oldNode = h(Fragment as any, null);

        // Get the element to get patched
        const element = oldNode.renderDom();

        const children = Array.from(element.childNodes);

        expect(element).toBeInstanceOf(DocumentFragment);

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h(Fragment as any,
            {
                class: {
                    'my-class': true,
                    enabled: true
                }
            },
            h("td", null, "Hello"),
            h("td", null, "World")
        );

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (SetElementPatch) {
                    newNode:
                    (FragmentNode) {
                        props:
                        {
                            class:
                            {
                                my-class: true,
                                enabled: true
                            }
                        },
                        children:
                        [
                            (ElementNode) {
                                name: 'td',
                                props: null,
                                children:
                                [
                                    (TextNode) {
                                        text: 'Hello',
                                        isText: true
                                    }
                                ],
                                isElement: true
                            },
                            (ElementNode) {
                                name: 'td',
                                props: null,
                                children:
                                [
                                    (TextNode) {
                                        text: 'World',
                                        isText: true
                                    }
                                ],
                                isElement: true
                            }
                        ],
                        isFragment: true
                    }
                }
            ],
            childrenPatches:
            []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(2); // The two children of the fragment have been added

        const firstChild = shadowRoot.childNodes[0]! as HTMLElement;

        expect(firstChild.outerHTML).toEqual('<td>Hello</td>');

        const secondChild = shadowRoot.childNodes[1]! as HTMLElement;

        expect(secondChild.outerHTML).toEqual('<td>World</td>');

        expect(shadowRoot.host.outerHTML).toEqual('<div class=\"my-class enabled\"></div>');

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(2);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(2);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(shadowRoot, new NodeChanges({
            inserted: Array.from(shadowRoot.childNodes)
        }));
    });

    it("diff fragment node to fragment node no children keys", () => {

        const oldNode = h(Fragment as any,
            null,
            h("td", null, "Hello"),
            h("td", null, "World")
        );

        // Get the element to get patched
        const element = oldNode.renderDom();

        const children = Array.from(element.childNodes);

        expect(element).toBeInstanceOf(DocumentFragment);

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h(Fragment as any,
            null,
            h("td", null, "Hello 1"),
            h("td", null, "World 1")
        );

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [],
            childrenPatches:
            [
                (ChildElementPatches) {
                    index: 0,
                    patches:
                    (ElementPatches) {
                        patches:
                        [],
                        childrenPatches:
                        [
                            (ChildElementPatches) {
                                index: 0,
                                patches:
                                (ElementPatches) {
                                    patches:
                                    [
                                        (SetTextPatch) {
                                            value:
                                            (TextNode) {
                                                text: 'Hello 1',
                                                isText: true
                                            }
                                        }
                                    ],
                                    childrenPatches:
                                    []
                                }
                            }
                        ]
                    }
                },
                (ChildElementPatches) {
                    index: 1,
                    patches:
                    (ElementPatches) {
                        patches:
                        [],
                        childrenPatches:
                        [
                            (ChildElementPatches) {
                                index: 0,
                                patches:
                                (ElementPatches) {
                                    patches:
                                    [
                                        (SetTextPatch) {
                                            value:
                                            (TextNode) {
                                                text: 'World 1',
                                                isText: true
                                            }
                                        }
                                    ],
                                    childrenPatches:
                                    []
                                }
                            }
                        ]
                    }
                }
            ]
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(2); // The two children of the fragment have been kept

        const firstChild = shadowRoot.childNodes[0]! as HTMLElement;

        expect(firstChild.outerHTML).toEqual('<td>Hello 1</td>');

        const secondChild = shadowRoot.childNodes[1]! as HTMLElement;

        expect(secondChild.outerHTML).toEqual('<td>World 1</td>');

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(2);

        expect(spyNodeDidUpdate).toHaveBeenNthCalledWith(1, firstChild.childNodes[0], new NodeChanges({
            text: {
                oldValue: 'Hello',
                newValue: 'Hello 1'
            }
        }));

        expect(spyNodeDidUpdate).toHaveBeenNthCalledWith(2, secondChild.childNodes[0], new NodeChanges({
            text: {
                oldValue: 'World',
                newValue: 'World 1'
            }
        }));
    });

    it("diff change attribute of nested virtual node children with fragment", () => {

        const oldNode = h('div', null,
            h("select", null,
                h(Fragment as any, null,
                    h("option", { value: '10', selected: false }, '10')
                )
            )
        );

        // Get the element to get patched
        const element = oldNode.renderDom();

        //expect(element).toBeInstanceOf(DocumentFragment);

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h('div', null,
            h("select", null,
                h(Fragment as any, null,
                    h("option", { value: '10', selected: true }, '10')
                )
            )
        );

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `   
            (ElementPatches) {
                patches:
                [],
                childrenPatches:
                [
                    (ChildElementPatches) {
                        index: 0,
                        patches:
                        (ElementPatches) {
                            patches:
                            [],
                            childrenPatches:
                            [
                                (ChildElementPatches) {
                                    index: 0,
                                    patches:
                                    (ElementPatches) {
                                        patches:
                                        [
                                            (SetAttributePatch) {
                                                name: 'selected',
                                                oldValue: false,
                                                newValue: true
                                            }
                                        ],
                                        childrenPatches:
                                        []
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        `);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // The single child has been kept

        const firstChild = shadowRoot.childNodes[0]! as HTMLElement;

        expect(firstChild.outerHTML).toEqual('<div><select><option value=\"10\" selected=\"true\">10</option></select></div>');

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenNthCalledWith(1, firstChild.childNodes[0].childNodes[0], new NodeChanges({
            attributes: [
                {
                    key: 'selected',
                    oldValue: false,
                    newValue: true
                }
            ]
        }));
    });

    it("diff change attribute of nested virtual node children and a fragment node", () => {

        const oldNode = h(Fragment as any, null,
            h('div', null,
                h("select", null,
                    h(Fragment as any, null,
                        h("option", { value: '10', selected: false }, '10')
                    )
                )
            )
        );

        // Get the element to get patched
        const element = oldNode.renderDom();

        //expect(element).toBeInstanceOf(DocumentFragment);

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h(Fragment as any, null,
            h('div', null,
                h("select", null,
                    h(Fragment as any, null,
                        h("option", { value: '10', selected: true }, '10')
                    )
                )
            )
        );

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `       
            (ElementPatches) {
                patches:
                [],
                childrenPatches:
                [
                    (ChildElementPatches) {
                        index: 0,
                        patches:
                        (ElementPatches) {
                            patches:
                            [],
                            childrenPatches:
                            [
                                (ChildElementPatches) {
                                    index: 0,
                                    patches:
                                    (ElementPatches) {
                                        patches:
                                        [],
                                        childrenPatches:
                                        [
                                            (ChildElementPatches) {
                                                index: 0,
                                                patches:
                                                (ElementPatches) {
                                                    patches:
                                                    [
                                                        (SetAttributePatch) {
                                                            name: 'selected',
                                                            oldValue: false,
                                                            newValue: true
                                                        }
                                                    ],
                                                    childrenPatches:
                                                    []
                                                }
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        `);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // The single child has been kept

        const firstChild = shadowRoot.childNodes[0]! as HTMLElement;

        expect(firstChild.outerHTML).toEqual('<div><select><option value=\"10\" selected=\"true\">10</option></select></div>');

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenNthCalledWith(1, firstChild.childNodes[0].childNodes[0], new NodeChanges({
            attributes: [
                {
                    key: 'selected',
                    oldValue: false,
                    newValue: true
                }
            ]
        }));
    });

    it("diff change attribute of nested virtual node children with fragment and the child has a key set", () => {

        const oldNode = h("select", null,
            h(Fragment as any, null,
                h("option", { key: '10', value: '10', selected: false }, '10')
            )
        );

        // Get the element to get patched
        const element = oldNode.renderDom();

        //expect(element).toBeInstanceOf(DocumentFragment);

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h("select", null,
            h(Fragment as any, null,
                h("option", { key: '10', value: '10', selected: true }, '10')
            )
        );

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
            (ElementPatches) {
                patches:
                [],
                childrenPatches:
                [
                    (ChildElementPatches) {
                        index: 0,
                        patches:
                        (ElementPatches) {
                            patches:
                            [
                                (SetAttributePatch) {
                                    name: 'selected',
                                    oldValue: false,
                                    newValue: true
                                }
                            ],
                            childrenPatches:
                            []
                        }
                    }
                ]
            }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // The single child has been kept

        const firstChild = shadowRoot.childNodes[0]! as HTMLElement;

        expect(firstChild.outerHTML).toEqual('<select><option key=\"10\" value=\"10\" selected=\"true\">10</option></select>');

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenNthCalledWith(1, firstChild.childNodes[0], new NodeChanges({
            attributes: [
                {
                    key: 'selected',
                    oldValue: false,
                    newValue: true
                }
            ]
        }));
    });

    it("diff fragment node to fragment node keyed children combination", () => {

        const oldNode = h(Fragment as any,
            null,
            h('li', { key: '1' }, 'Text 1'),
            h('li', { key: '2' }, 'Text 2'),
            h('li', { key: '3' }, 'Text 3'),
            h('li', { key: '4' }, 'Text 4'),
            h('li', { key: '5' }, 'Text 5'),
            h('li', { key: '6' }, 'Text 6'),
            h('li', { key: '7' }, 'Text 7'),
            h('li', { key: '8' }, 'Text 8'),
            h('li', { key: '9' }, 'Text 9')
        );

        // Get the element to get patched
        const element = oldNode.renderDom();

        const oldChildren = Array.from(element.childNodes);

        expect(element).toBeInstanceOf(DocumentFragment);

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h(Fragment as any,
            null,
            h('li', { key: '11' }, 'Text 11'), // preppend
            h('li', { key: '8' }, 'Text 8'), // swap with 3
            h('li', { key: '4' }, 'Text 4'),
            h('li', { key: '12' }, 'Text 12'), // insert in the middle
            h('li', { key: '7' }, 'Text 7'),
            h('li', { key: '3' }, 'Text 3'), // swap with 8
            h('li', { key: '13' }, 'Text 13'), // insert at the end
        );

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (SetChildPatch) {
                    index: 0,
                    newNode:
                    (ElementNode) {
                        name: 'li',
                        props:
                        {
                            key: '11'
                        },
                        children:
                        [
                            (TextNode) {
                                text: 'Text 11',
                                isText: true
                            }
                        ],
                        isElement: true
                    }
                },
                (MoveChildPatch) {
                    from: 7,
                    to: 1,
                    offset: 0
                },
                (MoveChildPatch) {
                    from: 3,
                    to: 2,
                    offset: 0
                },
                (SetChildPatch) {
                    index: 3,
                    newNode:
                    (ElementNode) {
                        name: 'li',
                        props:
                        {
                            key: '12'
                        },
                        children:
                        [
                            (TextNode) {
                                text: 'Text 12',
                                isText: true
                            }
                        ],
                        isElement: true
                    }
                },
                (MoveChildPatch) {
                    from: 6,
                    to: 4,
                    offset: 1
                },
                (MoveChildPatch) {
                    from: 2,
                    to: 5,
                    offset: 0
                },
                (SetChildPatch) {
                    index: 6,
                    newNode:
                    (ElementNode) {
                        name: 'li',
                        props:
                        {
                            key: '13'
                        },
                        children:
                        [
                            (TextNode) {
                                text: 'Text 13',
                                isText: true
                            }
                        ],
                        isElement: true
                    }
                },
                (RemoveChildrenRangePatch) {
                    from: 7,
                    count: 2
                }
            ],
            childrenPatches: []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(7);

        expect(shadowRoot.innerHTML).toEqual('<li key=\"11\">Text 11</li><li key=\"8\">Text 8</li><li key=\"4\">Text 4</li><li key=\"12\">Text 12</li><li key=\"7\">Text 7</li><li key=\"3\">Text 3</li><li key=\"13\">Text 13</li>');

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(7);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(7);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(6);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(shadowRoot, new NodeChanges({ // ul
            inserted: [shadowRoot.childNodes[0], shadowRoot.childNodes[3], shadowRoot.childNodes[6]],
            moved: [oldChildren[7], oldChildren[3], oldChildren[6], oldChildren[2]], // from
            removed: [oldChildren[0], oldChildren[4], oldChildren[1], oldChildren[5], oldChildren[8]]
        }));
    });

    it("diff fragment node to fragment node change child attribute", () => {

        const oldNode = h(
            Fragment as any,
            {
                class: 'my-class'
            },
            h("svg", { role: "img" },
                h("use", { href: "my-path" })
            )
        );

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element).toBeInstanceOf(DocumentFragment);

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h(
            Fragment as any,
            {
                class: 'my-class'
            },
            h("svg", { role: "img" },
                h("use", { href: "my-new-path" })
            )
        )

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [],
            childrenPatches:
            [
                (ChildElementPatches) {
                    index: 0,
                    patches:
                    (ElementPatches) {
                        patches:
                        [],
                        childrenPatches:
                        [
                            (ChildElementPatches) {
                                index: 0,
                                patches:
                                (ElementPatches) {
                                    patches:
                                    [
                                        (SetAttributePatch) {
                                            name: 'href',
                                            oldValue: 'my-path',
                                            newValue: 'my-new-path'
                                        }
                                    ],
                                    childrenPatches:
                                    []
                                }
                            }
                        ]
                    }
                }
            ]
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.innerHTML).toEqual('<svg role=\"img\"><use href=\"my-new-path\"/></svg>');

        //expect(shadowRoot.host.className).toEqual('my-class');

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(shadowRoot!.firstChild!.firstChild!, new NodeChanges({
            attributes: [
                {
                    key: 'href',
                    oldValue: 'my-path',
                    newValue: 'my-new-path'
                }
            ]
        }));
    });

    it("diff fragment node to fragment node change class", () => {

        const oldNode = h(
            Fragment as any,
            {
                class: 'default'
            },
            h("svg", { role: "img" },
                h("use", { href: "my-path" })
            )
        );

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element).toBeInstanceOf(DocumentFragment);

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h(
            Fragment as any,
            {
                class: 'primary'
            },
            h("svg", { role: "img" },
                h("use", { href: "my-path" })
            )
        );

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (SetAttributePatch) {
                    name: 'class',
                    oldValue: 'default',
                    newValue: 'primary'
                }
            ],
            childrenPatches:
            []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.innerHTML).toEqual('<svg role=\"img\"><use href=\"my-path\"/></svg>');

        expect(shadowRoot.host.outerHTML).toEqual('<div class=\"primary\"></div>');

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(shadowRoot!.host, new NodeChanges({
            attributes: [
                {
                    key: 'class',
                    oldValue: 'default',
                    newValue: 'primary'
                }
            ]
        }));
    });

    it("diff a node with changed child image url and span text", () => {

        const oldNode = h('div', null,
            h('img', {
                src: 'http://images/image.gif'
            }),

            h('div', null,
                h('span', null, 'Some text')
            )
        );

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element.outerHTML).toEqual('<div><img src=\"http://images/image.gif\"/><div><span>Some text</span></div></div>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h('div', null,
            h('img', {
                src: 'http://images/newImage.gif' // changed
            }),

            h('div', null,
                h('span', null, 'Some other text') // changed
            )
        );

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [],
            childrenPatches:
            [
                (ChildElementPatches) {
                    index: 0,
                    patches:
                    (ElementPatches) {
                        patches:
                        [
                            (SetAttributePatch) {
                                name: 'src',
                                oldValue: 'http://images/image.gif',
                                newValue: 'http://images/newImage.gif'
                            }
                        ],
                        childrenPatches:
                        []
                    }
                },
                (ChildElementPatches) {
                    index: 1,
                    patches:
                    (ElementPatches) {
                        patches:
                        [],
                        childrenPatches:
                        [
                            (ChildElementPatches) {
                                index: 0,
                                patches:
                                (ElementPatches) {
                                    patches:
                                    [],
                                    childrenPatches:
                                    [
                                        (ChildElementPatches) {
                                            index: 0,
                                            patches:
                                            (ElementPatches) {
                                                patches:
                                                [
                                                    (SetTextPatch) {
                                                        value:
                                                        (TextNode) {
                                                            text: 'Some other text',
                                                            isText: true
                                                        }
                                                    }
                                                ],
                                                childrenPatches:
                                                []
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
            ]
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<div><img src=\"http://images/newImage.gif\"/><div><span>Some other text</span></div></div>');

        expect(child).toEqual(element); // Kept the node

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(2);

        expect(spyNodeDidUpdate).toHaveBeenNthCalledWith(1, child.childNodes[0], new NodeChanges({
            attributes: [{
                key: 'src',
                oldValue: 'http://images/image.gif',
                newValue: 'http://images/newImage.gif'
            }]
        }));

        expect(spyNodeDidUpdate).toHaveBeenNthCalledWith(2, child.childNodes[1].childNodes[0].childNodes[0], new NodeChanges({
            text: {
                oldValue: 'Some text',
                newValue: 'Some other text'
            }
        }));
    });

    it("diff a node with changed child image url and replace span child with text", () => {

        const oldNode = h('div', null,
            h('img', {
                src: 'http://images/image.gif'
            }),

            h('div', null,
                h('span', null, 'Some text')
            )
        );

        // Get the element to get patched
        const element = oldNode.renderDom();

        const spanToRemove = element.childNodes[1].childNodes[0];

        expect(element.outerHTML).toEqual('<div><img src=\"http://images/image.gif\"/><div><span>Some text</span></div></div>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h('div', null,
            h('img', {
                src: 'http://images/newImage.gif' // changed
            }),

            h('div', null, 'Some other text') // replaced 'span' child with text
        );

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [],
            childrenPatches:
            [
                (ChildElementPatches) {
                    index: 0,
                    patches:
                    (ElementPatches) {
                        patches:
                        [
                            (SetAttributePatch) {
                                name: 'src',
                                oldValue: 'http://images/image.gif',
                                newValue: 'http://images/newImage.gif'
                            }
                        ],
                        childrenPatches:
                        []
                    }
                },
                (ChildElementPatches) {
                    index: 1,
                    patches:
                    (ElementPatches) {
                        patches:
                        [],
                        childrenPatches:
                        [
                            (ChildElementPatches) {
                                index: 0,
                                patches:
                                (ElementPatches) {
                                    patches:
                                    [
                                        (ReplaceElementPatch) {
                                            newNode:
                                            (TextNode) {
                                                text: 'Some other text',
                                                isText: true
                                            }
                                        }
                                    ],
                                    childrenPatches:
                                    []
                                }
                            }
                        ]
                    }
                }
            ]
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        const textToAdd = child.childNodes[1].childNodes[0];

        expect(child.outerHTML).toEqual('<div><img src=\"http://images/newImage.gif\"/><div>Some other text</div></div>');

        expect(child).toEqual(element); // Kept the node

        const secondDiv = child.childNodes[1];

        expect(secondDiv).toEqual(element.childNodes[1]); // Second div was kept as well

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(1);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(1);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(2);

        expect(spyNodeDidUpdate).toHaveBeenNthCalledWith(1, child.childNodes[0], new NodeChanges({
            attributes: [{
                key: 'src',
                oldValue: 'http://images/image.gif',
                newValue: 'http://images/newImage.gif'
            }]
        }));

        expect(spyNodeDidUpdate).toHaveBeenNthCalledWith(2, secondDiv, new NodeChanges({ // div
            inserted: [textToAdd],
            removed: [spanToRemove]
        }));
    });

    it("diff a node with children components replaced with text", () => {

        const oldNode = h('div', null,
            h('img', {
                src: 'http://images/image.gif'
            }),

            h('p', null,
                h('span', null, 'Some text')
            )
        );

        // Get the element to get patched
        const element = oldNode.renderDom();

        const oldImg = element.childNodes[0];

        const oldParagraph = element.childNodes[1];

        expect(element.outerHTML).toEqual('<div><img src=\"http://images/image.gif\"/><p><span>Some text</span></p></div>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h('div', null, 'Some text');

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (RemoveChildrenRangePatch) {
                    from: 1,
                    count: 1
                }
            ],
            childrenPatches:
            [
                (ChildElementPatches) {
                    index: 0,
                    patches:
                    (ElementPatches) {
                        patches:
                        [
                            (ReplaceElementPatch) {
                                newNode:
                                (TextNode) {
                                    text: 'Some text',
                                    isText: true
                                }
                            }
                        ],
                        childrenPatches: []
                    }
                }
            ]
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<div>Some text</div>');

        expect(child).toEqual(element); // Kept the node

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(1);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(1);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(2);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(element, new NodeChanges({ // div
            inserted: [child.childNodes[0]], // text node
            removed: [oldParagraph, oldImg]
        }));
    });

    it("diff a node with text replaced with children components", () => {

        const oldNode = h('div', null, 'Some text');

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element.outerHTML).toEqual('<div>Some text</div>');

        const oldChildren = Array.from(element.childNodes);

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h('div', null,

            h('img', {
                src: 'http://images/image.gif'
            }),

            h('div', null,
                h('span', null, 'Some text')
            )
        );

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (SetChildPatch) {
                    index: 1,
                    newNode:
                    (ElementNode) {
                        name: 'div',
                        props: null,
                        children:
                        [
                            (ElementNode) {
                                name: 'span',
                                props: null,
                                children:
                                [
                                    (TextNode) {
                                        text: 'Some text',
                                        isText: true
                                    }
                                ],
                                isElement: true
                            }
                        ],
                        isElement: true
                    }
                }
            ],
            childrenPatches:
            [
                (ChildElementPatches) {
                    index: 0,
                    patches:
                    (ElementPatches) {
                        patches:
                        [
                            (ReplaceElementPatch) {
                                newNode:
                                (ElementNode) {
                                    name: 'img',
                                    props:
                                    {
                                        src: 'http://images/image.gif'
                                    },
                                    children:
                                    [],
                                    isElement: true
                                }
                            }
                        ],
                        childrenPatches: []
                    }
                }
            ]
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<div><img src=\"http://images/image.gif\"/><div><span>Some text</span></div></div>');

        expect(child).toEqual(element); // Kept the node

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(2);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(2);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(child, new NodeChanges({ // div
            inserted: [child.childNodes[1], child.childNodes[0]],
            removed: oldChildren
        }));
    });

    it("diff a node with children components modify children no key", () => {

        const oldNode = h('ul', null,
            h('li', null, 'Text 1'),
            h('li', null, 'Text 2'),
            h('li', null, 'Text 3')
        );

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element.outerHTML).toEqual('<ul><li>Text 1</li><li>Text 2</li><li>Text 3</li></ul>');

        const nodeToRemove = element.lastChild;

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h('ul', null,
            h('li', null, 'Text 4'),
            h('li', null, 'Text 5')
        );

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (RemoveChildrenRangePatch) {
                    from: 2,
                    count: 1
                }
            ],
            childrenPatches:
            [
                (ChildElementPatches) {
                    index: 0,
                    patches:
                    (ElementPatches) {
                        patches: [],
                        childrenPatches:
                        [
                            (ChildElementPatches) {
                                index: 0,
                                patches:
                                (ElementPatches) {
                                    patches:
                                    [
                                        (SetTextPatch) {
                                            value:
                                            (TextNode) {
                                                text: 'Text 4',
                                                isText: true
                                            }
                                        }
                                    ],
                                    childrenPatches: []
                                }
                            }
                        ]
                    }
                },
                (ChildElementPatches) {
                    index: 1,
                    patches:
                    (ElementPatches) {
                        patches: [],
                        childrenPatches:
                        [
                            (ChildElementPatches) {
                                index: 0,
                                patches:
                                (ElementPatches) {
                                    patches:
                                    [
                                        (SetTextPatch) {
                                            value:
                                            (TextNode) {
                                                text: 'Text 5',
                                                isText: true
                                            }
                                        }
                                    ],
                                    childrenPatches: []
                                }
                            }
                        ]
                    }
                }
            ]
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li>Text 4</li><li>Text 5</li></ul>');

        expect(child).toEqual(element); // Kept the node

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(3);

        expect(spyNodeDidUpdate).toHaveBeenNthCalledWith(1, child.childNodes[0].childNodes[0], new NodeChanges({
            text: {
                oldValue: 'Text 1',
                newValue: 'Text 4'
            }
        })); // text node

        expect(spyNodeDidUpdate).toHaveBeenNthCalledWith(2, child.childNodes[1].childNodes[0], new NodeChanges({
            text: {
                oldValue: 'Text 2',
                newValue: 'Text 5'
            }
        })); // text node

        expect(spyNodeDidUpdate).toHaveBeenNthCalledWith(3, element, new NodeChanges({ // div
            removed: [nodeToRemove!], // last child of initial children
        }));
    });

    it("diff a node with keyed children. Add a child to an empty container ", () => {

        const oldNode = h('ul', null);

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element.outerHTML).toEqual('<ul></ul>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h('ul', null,
            h('li', { key: 1 }, 'Text 1'), // insert new
        );

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (AddChildrenPatch) {
                    children:
                    [
                        (ElementNode) {
                            name: 'li',
                            props:
                            {
                                key: 1
                            },
                            children:
                            [
                                (TextNode) {
                                    text: 'Text 1',
                                    isText: true
                                }
                            ],
                            isElement: true
                        }
                    ]
                }
            ],
            childrenPatches: []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li></ul>');

        expect(child).toEqual(element); // Kept the node

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(1);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(1);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(element, new NodeChanges({ // ul
            inserted: [child.childNodes[0]],
        }));
    });

    it("diff a node with keyed children. Prepend a child to existing children change text in old one", () => {

        const oldNode = h('ul', null,
            h('li', { key: '1' }, 'Text 1')
        );

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li></ul>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h('ul', null,
            h('li', { key: '3' }, 'Text 3'), // insert new
            h('li', { key: '1' }, 'Text 11') // change text
        );

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (SetChildPatch) {
                    index: 0,
                    newNode:
                    (ElementNode) {
                        name: 'li',
                        props:
                        {
                            key: '3'
                        },
                        children:
                        [
                            (TextNode) {
                                text: 'Text 3',
                                isText: true
                            }
                        ],
                        isElement: true
                    }
                },
                (MoveChildPatch) {
                    from: 0,
                    to: 1,
                    offset: 0
                }
            ],
            childrenPatches:
            [
                (ChildElementPatches) {
                    index: 1,
                    patches:
                    (ElementPatches) {
                        patches: [],
                        childrenPatches:
                        [
                            (ChildElementPatches) {
                                index: 0,
                                patches:
                                (ElementPatches) {
                                    patches:
                                    [
                                        (SetTextPatch) {
                                            value:
                                            (TextNode) {
                                                text: 'Text 11',
                                                isText: true
                                            }
                                        }
                                    ],
                                    childrenPatches: []
                                }
                            }
                        ]
                    }
                }
            ]
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li key=\"3\">Text 3</li><li key=\"1\">Text 11</li></ul>');

        expect(child).toEqual(element); // Kept the node

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(2);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(2);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(2); // Prepended and moved node

        expect(spyNodeDidUpdate).toHaveBeenNthCalledWith(1, child.childNodes[1].childNodes[0], new NodeChanges({
            text: {
                oldValue: 'Text 1',
                newValue: 'Text 11'
            }
        })); // text node

        expect(spyNodeDidUpdate).toHaveBeenNthCalledWith(2, element, new NodeChanges({ // ul
            inserted: [child.childNodes[0]],
            moved: [child.childNodes[1]]
        }));
    });

    it("diff a node with keyed children. Append a child to existing children change text in old one", () => {

        const oldNode = h('ul', null,
            h('li', { key: '1' }, 'Text 1')
        );

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li></ul>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h('ul', null,
            h('li', { key: '1' }, 'Text 11'), // change text
            h('li', { key: '3' }, 'Text 3') // append new
        );

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (SetChildPatch) {
                    index: 1,
                    newNode:
                    (ElementNode) {
                        name: 'li',
                        props:
                        {
                            key: '3'
                        },
                        children:
                        [
                            (TextNode) {
                                text: 'Text 3',
                                isText: true
                            }
                        ],
                        isElement: true
                    }
                }
            ],
            childrenPatches:
            [
                (ChildElementPatches) {
                    index: 0,
                    patches:
                    (ElementPatches) {
                        patches: [],
                        childrenPatches:
                        [
                            (ChildElementPatches) {
                                index: 0,
                                patches:
                                (ElementPatches) {
                                    patches:
                                    [
                                        (SetTextPatch) {
                                            value:
                                            (TextNode) {
                                                text: 'Text 11',
                                                isText: true
                                            }
                                        }
                                    ],
                                    childrenPatches: []
                                }
                            }
                        ]
                    }
                }
            ]
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li key=\"1\">Text 11</li><li key=\"3\">Text 3</li></ul>');

        expect(child).toEqual(element); // Kept the node

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(1);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(1);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(2); // Prepended and moved node

        expect(spyNodeDidUpdate).toHaveBeenNthCalledWith(1, child.childNodes[0].childNodes[0], new NodeChanges({
            text: {
                oldValue: 'Text 1',
                newValue: 'Text 11'
            }
        })); // text node

        expect(spyNodeDidUpdate).toHaveBeenNthCalledWith(2, element, new NodeChanges({ // ul
            inserted: [child.childNodes[1]]
        }));
    });

    it("diff a node with keyed children. Insert at the beginning, in the middle and at the end", () => {

        const oldNode = h('ul', null,
            h('li', { key: '2' }, 'Text 2'),
            h('li', { key: '4' }, 'Text 4'),
        );

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element.outerHTML).toEqual('<ul><li key=\"2\">Text 2</li><li key=\"4\">Text 4</li></ul>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h('ul', null,
            h('li', { key: '1' }, 'Text 1'), // insert at the beginning
            h('li', { key: '2' }, 'Text 2'),
            h('li', { key: '3' }, 'Text 3'), // insert in the middle
            h('li', { key: '4' }, 'Text 4'),
            h('li', { key: '5' }, 'Text 5') // insert at the end
        );

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (SetChildPatch) {
                    index: 0,
                    newNode:
                    (ElementNode) {
                        name: 'li',
                        props:
                        {
                            key: '1'
                        },
                        children:
                        [
                            (TextNode) {
                                text: 'Text 1',
                                isText: true
                            }
                        ],
                        isElement: true
                    }
                },
                (MoveChildPatch) {
                    from: 0,
                    to: 1,
                    offset: 0
                },
                (SetChildPatch) {
                    index: 2,
                    newNode:
                    (ElementNode) {
                        name: 'li',
                        props:
                        {
                            key: '3'
                        },
                        children:
                        [
                            (TextNode) {
                                text: 'Text 3',
                                isText: true
                            }
                        ],
                        isElement: true
                    }
                },
                (MoveChildPatch) {
                    from: 1,
                    to: 3,
                    offset: 0
                },
                (SetChildPatch) {
                    index: 4,
                    newNode:
                    (ElementNode) {
                        name: 'li',
                        props:
                        {
                            key: '5'
                        },
                        children:
                        [
                            (TextNode) {
                                text: 'Text 5',
                                isText: true
                            }
                        ],
                        isElement: true
                    }
                }
            ],
            childrenPatches: []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"2\">Text 2</li><li key=\"3\">Text 3</li><li key=\"4\">Text 4</li><li key=\"5\">Text 5</li></ul>');

        expect(child).toEqual(element); // Kept the node

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(5);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(5);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(2);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1); // Prepended and moved node

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(element, new NodeChanges({ // ul
            inserted: [child.childNodes[0], child.childNodes[2], child.childNodes[4]],
            moved: [child.childNodes[1], child.childNodes[3]]
        }));
    });

    it("diff a node with keyed children. Insert two children at the beginning, two in the middle and two at the end", () => {

        const oldNode = h('ul', null,
            h('li', { key: '3' }, 'Text 3'),
            h('li', { key: '4' }, 'Text 4'),
            h('li', { key: '7' }, 'Text 7'),
            h('li', { key: '8' }, 'Text 8'),
        );

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element.outerHTML).toEqual('<ul><li key=\"3\">Text 3</li><li key=\"4\">Text 4</li><li key=\"7\">Text 7</li><li key=\"8\">Text 8</li></ul>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h('ul', null,
            h('li', { key: '1' }, 'Text 1'), // insert at the beginning
            h('li', { key: '2' }, 'Text 2'), // insert at the beginning
            h('li', { key: '3' }, 'Text 3'),
            h('li', { key: '4' }, 'Text 4'),
            h('li', { key: '5' }, 'Text 5'), // insert in the middle
            h('li', { key: '6' }, 'Text 6'), // insert in the middle
            h('li', { key: '7' }, 'Text 7'),
            h('li', { key: '8' }, 'Text 8'),
            h('li', { key: '9' }, 'Text 9'), // insert at the end
            h('li', { key: '10' }, 'Text 10') // insert at the end
        );

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (SetChildPatch) {
                    index: 0,
                    newNode:
                    (ElementNode) {
                        name: 'li',
                        props:
                        {
                            key: '1'
                        },
                        children:
                        [
                            (TextNode) {
                                text: 'Text 1',
                                isText: true
                            }
                        ],
                        isElement: true
                    }
                },
                (SetChildPatch) {
                    index: 1,
                    newNode:
                    (ElementNode) {
                        name: 'li',
                        props:
                        {
                            key: '2'
                        },
                        children:
                        [
                            (TextNode) {
                                text: 'Text 2',
                                isText: true
                            }
                        ],
                        isElement: true
                    }
                },
                (MoveChildPatch) {
                    from: 0,
                    to: 2,
                    offset: 0
                },
                (MoveChildPatch) {
                    from: 1,
                    to: 3,
                    offset: 1
                },
                (SetChildPatch) {
                    index: 4,
                    newNode:
                    (ElementNode) {
                        name: 'li',
                        props:
                        {
                            key: '5'
                        },
                        children:
                        [
                            (TextNode) {
                                text: 'Text 5',
                                isText: true
                            }
                        ],
                        isElement: true
                    }
                },
                (SetChildPatch) {
                    index: 5,
                    newNode:
                    (ElementNode) {
                        name: 'li',
                        props:
                        {
                            key: '6'
                        },
                        children:
                        [
                            (TextNode) {
                                text: 'Text 6',
                                isText: true
                            }
                        ],
                        isElement: true
                    }
                },
                (MoveChildPatch) {
                    from: 2,
                    to: 6,
                    offset: 0
                },
                (MoveChildPatch) {
                    from: 3,
                    to: 7,
                    offset: 0
                },
                (SetChildPatch) {
                    index: 8,
                    newNode:
                    (ElementNode) {
                        name: 'li',
                        props:
                        {
                            key: '9'
                        },
                        children:
                        [
                            (TextNode) {
                                text: 'Text 9',
                                isText: true
                            }
                        ],
                        isElement: true
                    }
                },
                (SetChildPatch) {
                    index: 9,
                    newNode:
                    (ElementNode) {
                        name: 'li',
                        props:
                        {
                            key: '10'
                        },
                        children:
                        [
                            (TextNode) {
                                text: 'Text 10',
                                isText: true
                            }
                        ],
                        isElement: true
                    }
                }
            ],
            childrenPatches: []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"2\">Text 2</li><li key=\"3\">Text 3</li><li key=\"4\">Text 4</li><li key=\"5\">Text 5</li><li key=\"6\">Text 6</li><li key=\"7\">Text 7</li><li key=\"8\">Text 8</li><li key=\"9\">Text 9</li><li key=\"10\">Text 10</li></ul>');

        expect(child).toEqual(element); // Kept the node

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(10);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(10);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(4);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(element, new NodeChanges({ // ul
            inserted: [child.childNodes[0], child.childNodes[1], child.childNodes[4], child.childNodes[5], child.childNodes[8], child.childNodes[9]],
            moved: [child.childNodes[2], child.childNodes[3], child.childNodes[6], child.childNodes[7]]
        }));
    });

    it("diff a node with keyed children. Remove first node", () => {

        const oldNode = h('ul', null,
            h('li', { key: '1' }, 'Text 1'),
            h('li', { key: '2' }, 'Text 2')
        );

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"2\">Text 2</li></ul>');

        const firstChild = element.childNodes[0];

        const secondChild = element.childNodes[1];

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h('ul', null,
            //h('li', { key: '1' }, 'Text 1'), First node removed
            h('li', { key: '2' }, 'Text 2')
        );

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (MoveChildPatch) {
                    from: 1,
                    to: 0,
                    offset: 0
                },
                (RemoveChildrenRangePatch) {
                    from: 1,
                    count: 1
                }
            ],
            childrenPatches: []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li key=\"2\">Text 2</li></ul>');

        expect(child).toEqual(element); // Kept the node

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(1);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(1);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(element, new NodeChanges({ // ul
            moved: [secondChild],
            removed: [firstChild]
        }));
    });

    it("diff a node with keyed children. Remove last node", () => {

        const oldNode = h('ul', null,
            h('li', { key: '1' }, 'Text 1'),
            h('li', { key: '2' }, 'Text 2')
        );

        // Get the element to get patched
        const element = oldNode.renderDom();

        const lastNode = element.childNodes[1];

        expect(element.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"2\">Text 2</li></ul>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h('ul', null,
            h('li', { key: '1' }, 'Text 1'),
            //h('li', { key: '2' }, 'Text 2') Last node removed
        );

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (RemoveChildrenRangePatch) {
                    from: 1,
                    count: 1
                }
            ],
            childrenPatches: []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li></ul>');

        expect(child).toEqual(element); // Kept the node

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(element, new NodeChanges({ // ul
            removed: [lastNode]
        }));
    });

    it("diff a node with keyed children. Remove middle node", () => {

        const oldNode = h('ul', null,
            h('li', { key: '1' }, 'Text 1'),
            h('li', { key: '2' }, 'Text 2'),
            h('li', { key: '3' }, 'Text 3')
        );

        // Get the element to get patched
        const element = oldNode.renderDom();

        const middleChild = element.childNodes[1];

        const lastChild = element.childNodes[2];

        expect(element.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"2\">Text 2</li><li key=\"3\">Text 3</li></ul>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h('ul', null,
            h('li', { key: '1' }, 'Text 1'),
            //h('li', { key: '2' }, 'Text 2') Middle node removed
            h('li', { key: '3' }, 'Text 3'),
        );

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (MoveChildPatch) {
                    from: 2,
                    to: 1,
                    offset: 0
                },
                (RemoveChildrenRangePatch) {
                    from: 2,
                    count: 1
                }
            ],
            childrenPatches: []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"3\">Text 3</li></ul>');

        expect(child).toEqual(element); // Kept the node

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(1);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(1);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(element, new NodeChanges({ // ul
            removed: [middleChild],
            moved: [lastChild]
        }));
    });

    it("diff a node with keyed children. Remove from the beginning, the middle and the end", () => {

        const oldNode = h('ul', null,
            h('li', { key: '1' }, 'Text 1'),
            h('li', { key: '2' }, 'Text 2'),
            h('li', { key: '3' }, 'Text 3'),
            h('li', { key: '4' }, 'Text 4'),
            h('li', { key: '5' }, 'Text 5')
        );

        // Get the element to get patched
        const element = oldNode.renderDom();

        const oldChildren = Array.from(element.childNodes);

        expect(element.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"2\">Text 2</li><li key=\"3\">Text 3</li><li key=\"4\">Text 4</li><li key=\"5\">Text 5</li></ul>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h('ul', null,
            //h('li', { key: '1' }, 'Text 1'), // Remove from the beginning
            h('li', { key: '2' }, 'Text 2'),
            //h('li', { key: '3' }, 'Text 3'), // Remove from the middle
            h('li', { key: '4' }, 'Text 4'),
            //h('li', { key: '5' }, 'Text 5') // Remove from the end
        );

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (MoveChildPatch) {
                    from: 1,
                    to: 0,
                    offset: 0
                },
                (MoveChildPatch) {
                    from: 3,
                    to: 1,
                    offset: 1
                },
                (RemoveChildrenRangePatch) {
                    from: 2,
                    count: 3
                }
            ],
            childrenPatches: []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li key=\"2\">Text 2</li><li key=\"4\">Text 4</li></ul>');

        expect(child).toEqual(element); // Kept the node

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(2);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(2);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(3);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(element, new NodeChanges({ // ul
            moved: [oldChildren[1], oldChildren[3]],
            removed: [oldChildren[4], oldChildren[0], oldChildren[2]]
        }));
    });

    it("diff a node with keyed children. Remove two children from the beginning, two from the middle and two from the end", () => {

        const oldNode = h('ul', null,
            h('li', { key: '1' }, 'Text 1'), // remove from the beginning
            h('li', { key: '2' }, 'Text 2'), // remove from the beginning
            h('li', { key: '3' }, 'Text 3'),
            h('li', { key: '4' }, 'Text 4'),
            h('li', { key: '5' }, 'Text 5'), // remove from the middle
            h('li', { key: '6' }, 'Text 6'), // remove from the middle
            h('li', { key: '7' }, 'Text 7'),
            h('li', { key: '8' }, 'Text 8'),
            h('li', { key: '9' }, 'Text 9'), // remove from the end
            h('li', { key: '10' }, 'Text 10') // remove from the end
        );

        // Get the element to get patched
        const element = oldNode.renderDom();

        const oldChildren = Array.from(element.childNodes);

        expect(element.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"2\">Text 2</li><li key=\"3\">Text 3</li><li key=\"4\">Text 4</li><li key=\"5\">Text 5</li><li key=\"6\">Text 6</li><li key=\"7\">Text 7</li><li key=\"8\">Text 8</li><li key=\"9\">Text 9</li><li key=\"10\">Text 10</li></ul>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h('ul', null,
            h('li', { key: '3' }, 'Text 3'),
            h('li', { key: '4' }, 'Text 4'),
            h('li', { key: '7' }, 'Text 7'),
            h('li', { key: '8' }, 'Text 8'),
        );

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (MoveChildPatch) {
                    from: 2,
                    to: 0,
                    offset: 0
                },
                (MoveChildPatch) {
                    from: 3,
                    to: 1,
                    offset: 1
                },
                (MoveChildPatch) {
                    from: 6,
                    to: 2,
                    offset: 2
                },
                (MoveChildPatch) {
                    from: 7,
                    to: 3,
                    offset: 3
                },
                (RemoveChildrenRangePatch) {
                    from: 4,
                    count: 6
                }
            ],
            childrenPatches: []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li key=\"3\">Text 3</li><li key=\"4\">Text 4</li><li key=\"7\">Text 7</li><li key=\"8\">Text 8</li></ul>');

        expect(child).toEqual(element); // Kept the node

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(4);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(4);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(6);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(element, new NodeChanges({ // ul
            moved: [
                oldChildren[2], //from
                oldChildren[3],
                oldChildren[6],
                oldChildren[7]
            ],
            removed: [
                oldChildren[8],
                oldChildren[9],
                oldChildren[0],
                oldChildren[1],
                oldChildren[4],
                oldChildren[5]
            ]
        }));
    });

    it("diff a node with keyed children. Swap children", () => {

        const oldNode = h('ul', null,
            h('li', { key: '1' }, 'Text 1'),
            h('li', { key: '2' }, 'Text 2')
        );

        // Get the element to get patched
        const element = oldNode.renderDom();

        const oldChildren = Array.from(element.childNodes);

        expect(element.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"2\">Text 2</li></ul>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h('ul', null,
            h('li', { key: '2' }, 'Text 2'),
            h('li', { key: '1' }, 'Text 1')
        );

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (MoveChildPatch) {
                    from: 1,
                    to: 0,
                    offset: 0
                },
                (MoveChildPatch) {
                    from: 0,
                    to: 1,
                    offset: 0
                }
            ],
            childrenPatches: []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li key=\"2\">Text 2</li><li key=\"1\">Text 1</li></ul>');

        expect(child).toEqual(element); // Kept the node

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(2);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(2);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(element, new NodeChanges({ // ul
            moved: [
                oldChildren[1], //from
                oldChildren[0]
            ]
        }));
    });

    it("diff a node with keyed children. Add at the beginning, remove from the end", () => {

        const oldNode = h('ul', null,
            h('li', { key: '2' }, 'Text 2'),
            h('li', { key: '3' }, 'Text 3'),
        );

        // Get the element to get patched
        const element = oldNode.renderDom();

        const oldChildren = Array.from(element.childNodes);

        expect(element.outerHTML).toEqual('<ul><li key=\"2\">Text 2</li><li key=\"3\">Text 3</li></ul>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h('ul', null,
            h('li', { key: '1' }, 'Text 1'),
            h('li', { key: '2' }, 'Text 2'),
            //h('li', { key: '3' }, 'Text 3') removed
        );

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (SetChildPatch) {
                    index: 0,
                    newNode:
                    (ElementNode) {
                        name: 'li',
                        props:
                        {
                            key: '1'
                        },
                        children:
                        [
                            (TextNode) {
                                text: 'Text 1',
                                isText: true
                            }
                        ],
                        isElement: true
                    }
                },
                (MoveChildPatch) {
                    from: 0,
                    to: 1,
                    offset: 0
                }
            ],
            childrenPatches: []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"2\">Text 2</li></ul>');

        expect(child).toEqual(element); // Kept the node

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(2);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(2);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(2);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(element, new NodeChanges({ // ul
            inserted: [child.childNodes[0]],
            moved: [oldChildren[0]], // from
            removed: [oldChildren[1]]
        }));
    });

    it("diff a node with keyed children. Add at the end, remove from the beginning", () => {

        const oldNode = h('ul', null,
            h('li', { key: '3' }, 'Text 3'),
            h('li', { key: '1' }, 'Text 1'),
        );

        // Get the element to get patched
        const element = oldNode.renderDom();

        const oldChildren = Array.from(element.childNodes);

        expect(element.outerHTML).toEqual('<ul><li key=\"3\">Text 3</li><li key=\"1\">Text 1</li></ul>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h('ul', null,
            //h('li', { key: '3' }, 'Text 3') removed
            h('li', { key: '1' }, 'Text 1'),
            h('li', { key: '2' }, 'Text 2'),
        );

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (MoveChildPatch) {
                    from: 1,
                    to: 0,
                    offset: 0
                },
                (SetChildPatch) {
                    index: 1,
                    newNode:
                    (ElementNode) {
                        name: 'li',
                        props:
                        {
                            key: '2'
                        },
                        children:
                        [
                            (TextNode) {
                                text: 'Text 2',
                                isText: true
                            }
                        ],
                        isElement: true
                    }
                }
            ],
            childrenPatches: []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"2\">Text 2</li></ul>');

        expect(child).toEqual(element); // Kept the node

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(2);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(2);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(element, new NodeChanges({ // ul
            inserted: [child.childNodes[1]],
            moved: [oldChildren[1]], // from
            removed: [oldChildren[0]]
        }));
    });

    it("diff a node with keyed children. Swap children and add one in the middle", () => {

        const oldNode = h('ul', null,
            h('li', { key: '1' }, 'Text 1'),
            h('li', { key: '2' }, 'Text 2')
        );

        // Get the element to get patched
        const element = oldNode.renderDom();

        const oldChildren = Array.from(element.childNodes);

        expect(element.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"2\">Text 2</li></ul>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h('ul', null,
            h('li', { key: '2' }, 'Text 2'),
            h('li', { key: '3' }, 'Text 3'),
            h('li', { key: '1' }, 'Text 1')
        );

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (MoveChildPatch) {
                    from: 1,
                    to: 0,
                    offset: 0
                },
                (SetChildPatch) {
                    index: 1,
                    newNode:
                    (ElementNode) {
                        name: 'li',
                        props:
                        {
                            key: '3'
                        },
                        children:
                        [
                            (TextNode) {
                                text: 'Text 3',
                                isText: true
                            }
                        ],
                        isElement: true
                    }
                },
                (MoveChildPatch) {
                    from: 0,
                    to: 2,
                    offset: 0
                }
            ],
            childrenPatches: []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li key=\"2\">Text 2</li><li key=\"3\">Text 3</li><li key=\"1\">Text 1</li></ul>');

        expect(child).toEqual(element); // Kept the node

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(3);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(3);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(element, new NodeChanges({ // ul
            inserted: [child.childNodes[1]],
            moved: [oldChildren[1], oldChildren[0]] // from
        }));
    });

    it("diff a node with keyed children. Swap children and remove one from the middle", () => {

        const oldNode = h('ul', null,
            h('li', { key: '1' }, 'Text 1'),
            h('li', { key: '2' }, 'Text 2'),
            h('li', { key: '3' }, 'Text 3'),
        );

        // Get the element to get patched
        const element = oldNode.renderDom();

        const oldChildren = Array.from(element.childNodes);

        expect(element.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"2\">Text 2</li><li key=\"3\">Text 3</li></ul>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h('ul', null,
            h('li', { key: '3' }, 'Text 3'),
            //h('li', { key: '2' }, 'Text 2'), // remove from the middle
            h('li', { key: '1' }, 'Text 1')
        );

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (MoveChildPatch) {
                    from: 2,
                    to: 0,
                    offset: 0
                },
                (MoveChildPatch) {
                    from: 0,
                    to: 1,
                    offset: 0
                },
                (RemoveChildrenRangePatch) {
                    from: 2,
                    count: 1
                }
            ],
            childrenPatches: []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li key=\"3\">Text 3</li><li key=\"1\">Text 1</li></ul>');

        expect(child).toEqual(element); // Kept the node

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(2);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(2);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(2);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(element, new NodeChanges({ // ul
            moved: [oldChildren[2], oldChildren[0]], // from
            removed: [oldChildren[1]]
        }));
    });

    it("diff a node with keyed children. Reverse children", () => {

        const oldNode = h('ul', null,
            h('li', { key: '1' }, 'Text 1'),
            h('li', { key: '2' }, 'Text 2'),
            h('li', { key: '3' }, 'Text 3'),
            h('li', { key: '4' }, 'Text 4'),
            h('li', { key: '5' }, 'Text 5'),
        );

        // Get the element to get patched
        const element = oldNode.renderDom();

        const oldChildren = Array.from(element.childNodes);

        expect(element.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"2\">Text 2</li><li key=\"3\">Text 3</li><li key=\"4\">Text 4</li><li key=\"5\">Text 5</li></ul>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h('ul', null,
            h('li', { key: '5' }, 'Text 5'),
            h('li', { key: '4' }, 'Text 4'),
            h('li', { key: '3' }, 'Text 3'),
            h('li', { key: '2' }, 'Text 2'),
            h('li', { key: '1' }, 'Text 1')
        );

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (MoveChildPatch) {
                    from: 4,
                    to: 0,
                    offset: 0
                },
                (MoveChildPatch) {
                    from: 3,
                    to: 1,
                    offset: 0
                },
                (MoveChildPatch) {
                    from: 1,
                    to: 3,
                    offset: 0
                },
                (MoveChildPatch) {
                    from: 0,
                    to: 4,
                    offset: 0
                }
            ],
            childrenPatches: []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li key=\"5\">Text 5</li><li key=\"4\">Text 4</li><li key=\"3\">Text 3</li><li key=\"2\">Text 2</li><li key=\"1\">Text 1</li></ul>');

        expect(child).toEqual(element); // Kept the node

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(4);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(4);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(2);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(element, new NodeChanges({ // ul
            moved: [oldChildren[4], oldChildren[3], oldChildren[1], oldChildren[0]] // from
        }));
    });

    it("diff a node with keyed children. Combination of all the above v1", () => {

        const oldNode = h('ul', null,
            h('li', { key: '1' }, 'Text 1'),
            h('li', { key: '2' }, 'Text 2'),
            h('li', { key: '3' }, 'Text 3'),
            h('li', { key: '4' }, 'Text 4')
        );

        // Get the element to get patched
        const element = oldNode.renderDom();

        const oldChildren = Array.from(element.childNodes);

        expect(element.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"2\">Text 2</li><li key=\"3\">Text 3</li><li key=\"4\">Text 4</li></ul>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h('ul', null,
            h('li', { key: '4' }, 'Text 4'), // swap with 1
            h('li', { key: '5' }, 'Text 5'), // insert middle
            // h('li', { key: '3' }, 'Text 3'), // remove
            h('li', { key: '1' }, 'Text 1'), // append
        );

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (MoveChildPatch) {
                    from: 3,
                    to: 0,
                    offset: 0
                },
                (SetChildPatch) {
                    index: 1,
                    newNode:
                    (ElementNode) {
                        name: 'li',
                        props:
                        {
                            key: '5'
                        },
                        children:
                        [
                            (TextNode) {
                                text: 'Text 5',
                                isText: true
                            }
                        ],
                        isElement: true
                    }
                },
                (MoveChildPatch) {
                    from: 0,
                    to: 2,
                    offset: 0
                },
                (RemoveChildrenRangePatch) {
                    from: 3,
                    count: 1
                }
            ],
            childrenPatches: []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li key=\"4\">Text 4</li><li key=\"5\">Text 5</li><li key=\"1\">Text 1</li></ul>');

        expect(child).toEqual(element); // Kept the node

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(3);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(3);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(3);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(element, new NodeChanges({ // ul
            inserted: [element.childNodes[1]],
            moved: [oldChildren[3], oldChildren[0]], // from
            removed: [oldChildren[1], oldChildren[2]]
        }));
    });

    it("diff a node with keyed children. Combination of all the above", () => {

        const oldNode = h('ul', null,
            h('li', { key: '1' }, 'Text 1'),
            h('li', { key: '2' }, 'Text 2'),
            h('li', { key: '3' }, 'Text 3'),
            h('li', { key: '4' }, 'Text 4'),
            h('li', { key: '5' }, 'Text 5'),
            h('li', { key: '6' }, 'Text 6'),
            h('li', { key: '7' }, 'Text 7'),
            h('li', { key: '8' }, 'Text 8'),
            h('li', { key: '9' }, 'Text 9')
        );

        // Get the element to get patched
        const element = oldNode.renderDom();

        const oldChildren = Array.from(element.childNodes);

        expect(element.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"2\">Text 2</li><li key=\"3\">Text 3</li><li key=\"4\">Text 4</li><li key=\"5\">Text 5</li><li key=\"6\">Text 6</li><li key=\"7\">Text 7</li><li key=\"8\">Text 8</li><li key=\"9\">Text 9</li></ul>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h('ul', null,
            h('li', { key: '11' }, 'Text 11'), // preppend
            h('li', { key: '8' }, 'Text 8'), // swap with 3
            h('li', { key: '4' }, 'Text 4'),
            h('li', { key: '12' }, 'Text 12'), // insert in the middle
            h('li', { key: '7' }, 'Text 7'),
            h('li', { key: '3' }, 'Text 3'), // swap with 8
            h('li', { key: '13' }, 'Text 13'), // insert at the end
        );

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (SetChildPatch) {
                    index: 0,
                    newNode:
                    (ElementNode) {
                        name: 'li',
                        props:
                        {
                            key: '11'
                        },
                        children:
                        [
                            (TextNode) {
                                text: 'Text 11',
                                isText: true
                            }
                        ],
                        isElement: true
                    }
                },
                (MoveChildPatch) {
                    from: 7,
                    to: 1,
                    offset: 0
                },
                (MoveChildPatch) {
                    from: 3,
                    to: 2,
                    offset: 0
                },
                (SetChildPatch) {
                    index: 3,
                    newNode:
                    (ElementNode) {
                        name: 'li',
                        props:
                        {
                            key: '12'
                        },
                        children:
                        [
                            (TextNode) {
                                text: 'Text 12',
                                isText: true
                            }
                        ],
                        isElement: true
                    }
                },
                (MoveChildPatch) {
                    from: 6,
                    to: 4,
                    offset: 1
                },
                (MoveChildPatch) {
                    from: 2,
                    to: 5,
                    offset: 0
                },
                (SetChildPatch) {
                    index: 6,
                    newNode:
                    (ElementNode) {
                        name: 'li',
                        props:
                        {
                            key: '13'
                        },
                        children:
                        [
                            (TextNode) {
                                text: 'Text 13',
                                isText: true
                            }
                        ],
                        isElement: true
                    }
                },
                (RemoveChildrenRangePatch) {
                    from: 7,
                    count: 2
                }
            ],
            childrenPatches: []
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li key=\"11\">Text 11</li><li key=\"8\">Text 8</li><li key=\"4\">Text 4</li><li key=\"12\">Text 12</li><li key=\"7\">Text 7</li><li key=\"3\">Text 3</li><li key=\"13\">Text 13</li></ul>');

        expect(child).toEqual(element); // Kept the node

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(7);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(7);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(6);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(element, new NodeChanges({ // ul
            inserted: [element.childNodes[0], element.childNodes[3], element.childNodes[6]],
            moved: [oldChildren[7], oldChildren[3], oldChildren[6], oldChildren[2]], // from
            removed: [oldChildren[0], oldChildren[4], oldChildren[1], oldChildren[5], oldChildren[8]]
        }));
    });

    it("diff a node with non-keyed children. Counter", () => {

        let count: number = 5;

        const increment = () => ++count;

        const oldNode = h("div", null,
            h("h4", null, "Counter"),
            count,
            h("button", { onClick: increment }, "Increment")
        );

        // Get the element to get patched
        const element = oldNode.renderDom();

        expect(element.outerHTML).toEqual('<div><h4>Counter</h4>5<button>Increment</button></div>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        increment();

        const newNode = h("div", null,
            h("h4", null, "Counter"),
            count,
            h("button", { onClick: increment }, "Increment")
        );

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches: [],
            childrenPatches:
            [
                (ChildElementPatches) {
                    index: 1,
                    patches:
                    (ElementPatches) {
                        patches:
                        [
                            (SetTextPatch) {
                                value:
                                (TextNode) {
                                    text: 6,
                                    isText: true
                                }
                            }
                        ],
                        childrenPatches: []
                    }
                }
            ]
        }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<div><h4>Counter</h4>6<button>Increment</button></div>');

        expect(child).toEqual(element); // Kept the node

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(0);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(0);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(child.childNodes[1], new NodeChanges({
            text: {
                oldValue: '5',
                newValue: '6'
            }
        }));
    });

    /**
     <ul>
        <li class="hoverable" size="medium" value="1">1</li>
        <li class="hoverable" size="medium" value="2">2</li>
        <li class="hoverable" size="medium" value="3">3</li>
    </ul>
     */

    it("diff a node from list of slot to list with items", () => {

        const oldNode = h('ul', null,
            h('slot', null)
        );

        // Get the element to get patched
        const element = oldNode.renderDom();

        const oldChildren = Array.from(element.childNodes);

        expect(element.outerHTML).toEqual('<ul><slot></slot></ul>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h('ul', null,
            h('li', { value: '1' }, '1'),
            h('li', { value: '2' }, '2'),
            h('li', { value: '3' }, '3')
        );

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        
    (ElementPatches) {
        patches:
        [
            (SetChildPatch) {
                index: 1,
                newNode:
                (ElementNode) {
                    name: 'li',
                    props:
                    {
                        value: '2'
                    },
                    children:
                    [
                        (TextNode) {
                            text: '2',
                            isText: true
                        }
                    ],
                    isElement: true
                }
            },
            (SetChildPatch) {
                index: 2,
                newNode:
                (ElementNode) {
                    name: 'li',
                    props:
                    {
                        value: '3'
                    },
                    children:
                    [
                        (TextNode) {
                            text: '3',
                            isText: true
                        }
                    ],
                    isElement: true
                }
            }
        ],
        childrenPatches:
        [
            (ChildElementPatches) {
                index: 0,
                patches:
                (ElementPatches) {
                    patches:
                    [
                        (ReplaceElementPatch) {
                            newNode:
                            (ElementNode) {
                                name: 'li',
                                props:
                                {
                                    value: '1'
                                },
                                children:
                                [
                                    (TextNode) {
                                        text: '1',
                                        isText: true
                                    }
                                ],
                                isElement: true
                            }
                        }
                    ],
                    childrenPatches:
                    []
                }
            }
        ]
    }`);

        const {
            hooks,
            spyNodeWillConnect,
            spyNodeDidConnect,
            spyNodeWillDisconnect,
            spyNodeDidUpdate
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li value=\"1\">1</li><li value=\"2\">2</li><li value=\"3\">3</li></ul>');

        expect(child).toEqual(element); // Kept the node

        expect(spyNodeWillConnect).toHaveBeenCalledTimes(3);

        expect(spyNodeDidConnect).toHaveBeenCalledTimes(3);

        expect(spyNodeWillDisconnect).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledTimes(1);

        expect(spyNodeDidUpdate).toHaveBeenCalledWith(element, new NodeChanges({ // ul
            inserted: [element.childNodes[1], element.childNodes[2], element.childNodes[0]],
            removed: [oldChildren[0]]
        }));
    });
});
