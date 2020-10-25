import h from "../src/h";
import diff from "../src/diff";
import displayObject from "../src/utils/displayObject";
import ElementPatches from "../src/patches/ElementPatches";
import VirtualNode from "../src/nodes/VirtualNode";
import VirtualText from "../src/nodes/VirtualText";
import { UpdatedChildren } from "../src/patches/Patch";

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

        nodeWillConnect(node: Node): void {},

        nodeDidConnect(node: Node): void {},

        nodeWillDisconnect(node: Node): void {},

        nodeDidUpdate(node: Node, updatedChildren: UpdatedChildren): void {}
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

        const patches = diff(oldNode as unknown as VirtualNode, newNode as unknown as VirtualNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [],
            childrenPatches:
            [],
            _context:
            (PatchingContext) {
                _original:
                {}
            }
        }`);

        const shadowRoot = createShadowRoot();

        patches.applyPatches(shadowRoot);

        expect(shadowRoot.childNodes.length).toEqual(0); // Unchanged
    });

    it("diff virtual text to undefined", () => {

        const oldNode = new VirtualText('someText');

        // Get the element to get patched
        const element = oldNode.render();

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
            childrenPatches:
            [],
            _context:
            (PatchingContext) {
                _original:{}
            }
        }`);

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(spyOnBeforeMount).toHaveBeenCalledTimes(0);

        expect(spyOnAfterMount).toHaveBeenCalledTimes(0);

        expect(spyOnBeforeUnmount).toHaveBeenCalledTimes(1);

        //expect(spyOnBeforeUnmount).toBeCalledWith(shadowRoot.firstChild);

        expect(spyOnAfterChildrenUpdated).toHaveBeenCalledTimes(0);

        expect(shadowRoot.childNodes.length).toEqual(0); // Removed
    });

    it("diff undefined to virtual text", () => {

        const oldNode = undefined;

        const newNode = new VirtualText('someText');

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (SetElementPatch) {
                    newNode:
                    (VirtualText) {
                        text: 'someText'
                    }
                }
            ],
            childrenPatches:
            [],
            _context:
            (PatchingContext) {
                _original:
                {}
            }
        }`);

        const shadowRoot = createShadowRoot();

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();
        
        patches.applyPatches(shadowRoot, undefined, hooks);

        expect(spyOnBeforeMount).toHaveBeenCalledTimes(1);

        expect(spyOnAfterMount).toHaveBeenCalledTimes(1);

        expect(spyOnBeforeUnmount).toHaveBeenCalledTimes(0);

        expect(spyOnAfterChildrenUpdated).toHaveBeenCalledTimes(0);

        expect(shadowRoot.childNodes.length).toEqual(1); // Added

        const element = shadowRoot.firstChild!;

        expect(element.textContent).toEqual('someText');
    });

    it("diff virtual node to undefined", () => {

        const oldNode = h('div', null);

        // Get the element to get patched
        const element = oldNode.render();

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
            childrenPatches:
            [],
            _context:
            (PatchingContext) {
                _original:{}
            }
        }`);

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(spyOnBeforeMount).toHaveBeenCalledTimes(0);

        expect(spyOnAfterMount).toHaveBeenCalledTimes(0);

        expect(spyOnBeforeUnmount).toHaveBeenCalledTimes(1);

        expect(spyOnAfterChildrenUpdated).toHaveBeenCalledTimes(0);

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
                    (VirtualNode) {
                        name: 'div',
                        props: null,
                        children:
                        [],
                        isVirtualNode: true
                    }
                }
            ],
            childrenPatches:
            [],
            _context:
            (PatchingContext) {
                _original:
                {}
            }
        }`);

        const shadowRoot = createShadowRoot();

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, undefined, hooks);

        expect(spyOnBeforeMount).toHaveBeenCalledTimes(1);

        expect(spyOnAfterMount).toHaveBeenCalledTimes(1);

        expect(spyOnBeforeUnmount).toHaveBeenCalledTimes(0);

        expect(spyOnAfterChildrenUpdated).toHaveBeenCalledTimes(0);

        expect(shadowRoot.childNodes.length).toEqual(1); // Added

        const element = shadowRoot.firstChild! as HTMLElement;

        expect(element.outerHTML).toEqual('<div></div>');
    });

    it("diff virtual text to virtual node", () => {

        const oldNode = new VirtualText('some text');

        // Get the element to get patched
        const element = oldNode.render();

        expect(element.textContent).toEqual('some text');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = new VirtualNode('span', null, [new VirtualText('Some other text')]);

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (ReplaceElementPatch) {
                    newNode:
                    (VirtualNode) {
                        name: 'span',
                        props: null,
                        children:
                        [
                            (VirtualText) {
                                text: 'Some other text'
                            }
                        ],
                        isVirtualNode: true
                    }
                }
            ],
            childrenPatches:
            [],
            _context:
            (PatchingContext) {
                _original:
                {}
            }
        }`);

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(spyOnBeforeMount).toHaveBeenCalledTimes(1);

        expect(spyOnAfterMount).toHaveBeenCalledTimes(1);

        expect(spyOnBeforeUnmount).toHaveBeenCalledTimes(1);

        expect(spyOnAfterChildrenUpdated).toHaveBeenCalledTimes(0);

        expect(shadowRoot.childNodes.length).toEqual(1); // Replaced

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<span>Some other text</span>');
    });

    it("diff virtual node to virtual text", () => {

        const oldNode = new VirtualNode('span', null, [new VirtualText('Some text')]);

        // Get the element to get patched
        const element = oldNode.render();

        expect(element.textContent).toEqual('Some text');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = new VirtualText('Some other text');

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (ReplaceElementPatch) {
                    newNode:
                    (VirtualText) {
                        text: 'Some other text'
                    }
                }
            ],
            childrenPatches:
            [],
            _context:
            (PatchingContext) {
                _original:
                {}
            }
        }`);

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(spyOnBeforeMount).toHaveBeenCalledTimes(1);

        expect(spyOnAfterMount).toHaveBeenCalledTimes(1);

        expect(spyOnBeforeUnmount).toHaveBeenCalledTimes(1);

        expect(spyOnAfterChildrenUpdated).toHaveBeenCalledTimes(0);

        expect(shadowRoot.childNodes.length).toEqual(1); // Replaced

        const child = shadowRoot.firstChild! as Text;

        expect(child.textContent).toEqual('Some other text');
    });

    it("diff virtual text to virtual text same text", () => {

        const oldNode = new VirtualText('Some text');

        // Get the element to get patched
        const element = oldNode.render();

        expect(element.textContent).toEqual('Some text');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = new VirtualText('Some text');

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [],
            childrenPatches:
            [],
            _context:
            (PatchingContext) {
                _original:
                {}
            }
        }`);

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(spyOnBeforeMount).toHaveBeenCalledTimes(0);

        expect(spyOnAfterMount).toHaveBeenCalledTimes(0);

        expect(spyOnBeforeUnmount).toHaveBeenCalledTimes(0);

        expect(spyOnAfterChildrenUpdated).toHaveBeenCalledTimes(0);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as Text;

        expect(child.textContent).toEqual('Some text'); // Kept the same text

        expect(child).toEqual(element); // Kept the same node
    });

    it("diff virtual text to virtual text different text", () => {

        // CustomElement's render converts literals to virtual texts
        const oldNode = new VirtualText('Some text');

        // Get the element to get patched
        const element = oldNode.render();

        expect(element.textContent).toEqual('Some text');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = new VirtualText('Some other text');

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (SetTextPatch) {
                    value:
                    (VirtualText) {
                        text: 'Some other text'
                    }
                }
            ],
            childrenPatches:
            [],
            _context:
            (PatchingContext) {
                _original:
                {}
            }
        }`);

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        // No mount changes but maybe onTextChanged event?

        expect(spyOnBeforeMount).toHaveBeenCalledTimes(0);

        expect(spyOnAfterMount).toHaveBeenCalledTimes(0);

        expect(spyOnBeforeUnmount).toHaveBeenCalledTimes(0);

        expect(spyOnAfterChildrenUpdated).toHaveBeenCalledTimes(0);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as Text;

        expect(child.textContent).toEqual('Some other text'); // Changed the text

        expect(child).toEqual(element); // Kept the same node
    });

    it("diff same node type", () => {

        const oldNode = h("div", null);

        // Get the element to get patched
        const element = oldNode.render();

        expect(element.outerHTML).toEqual('<div></div>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h("div", null);

        const patches = diff(oldNode, newNode);

        expect(patches).toEqual({
            "_context": {
                "_original": {},
                "_newNode": undefined
            },
            "childrenPatches": [],
            "patches": []
        });

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(spyOnBeforeMount).toHaveBeenCalledTimes(0);

        expect(spyOnAfterMount).toHaveBeenCalledTimes(0);

        expect(spyOnBeforeUnmount).toHaveBeenCalledTimes(0);

        expect(spyOnAfterChildrenUpdated).toHaveBeenCalledTimes(0);

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
        const element = oldNode.render();

        expect(element.outerHTML).toEqual('<div id=\"myElement1\" class=\"class1 class2\"></div>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h('div', {
            id: 'myElement2', // Replace attribute value
            //class: "class1 class2", // Remove attribute
            href: "http://someurl.com" // Add attribute
        });

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `(ElementPatches) {
            patches:
            [
                (SetAttributePatch) {
                    name: 'id',
                    value: 'myElement2'
                },
                (AddAttributePatch) {
                    name: 'href',
                    value: 'http://someurl.com'
                },
                (RemoveAttributePatch) {
                    name: 'class'
                }
            ],
            childrenPatches:
            [],
            _context:(PatchingContext) {_original:{}}
        }`);

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        // Implement attribute changed events?

        expect(spyOnBeforeMount).toHaveBeenCalledTimes(0);

        expect(spyOnAfterMount).toHaveBeenCalledTimes(0);

        expect(spyOnBeforeUnmount).toHaveBeenCalledTimes(0);

        expect(spyOnAfterChildrenUpdated).toHaveBeenCalledTimes(0);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<div id=\"myElement2\" href=\"http://someurl.com\"></div>');

        expect(child).toEqual(element); // Kept the same node
    });

    it("diff same node type with different text", () => {

        const oldNode = h('span', null, 'Some text');

        // Get the element to get patched
        const element = oldNode.render();

        expect(element.outerHTML).toEqual('<span>Some text</span>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = h('span', null, 'Some other text');

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
                                (VirtualText) {
                                    text: 'Some other text'
                                }
                            }
                        ],
                        childrenPatches:
                        [],
                        _context:
                        (PatchingContext) {
                            _original:
                            {}
                        }
                    }
                }
            ],
            _context:
            (PatchingContext) {
                _original:
                {}
            }
        }`);

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(spyOnBeforeMount).toHaveBeenCalledTimes(0);

        expect(spyOnAfterMount).toHaveBeenCalledTimes(0);

        expect(spyOnBeforeUnmount).toHaveBeenCalledTimes(0);

        expect(spyOnAfterChildrenUpdated).toHaveBeenCalledTimes(0);

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
        const element = oldNode.render();

        expect(element.outerHTML).toEqual('<ul><li>Item1</li><li>Item2</li><li>Item3</li></ul>');

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
            childrenPatches:
            [],
            _context:
            (PatchingContext) {
                _original:
                {}
            }
        }`);

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(spyOnBeforeMount).toHaveBeenCalledTimes(0);

        expect(spyOnAfterMount).toHaveBeenCalledTimes(0);

        expect(spyOnBeforeUnmount).toHaveBeenCalledTimes(3); // Called for the children

        expect(spyOnAfterChildrenUpdated).toHaveBeenCalledTimes(1);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul></ul>');

        expect(child).toEqual(element); // Kept the same node
    });

    it("diff same node type without children to with children", () => {

        const oldNode = h("ul", null);

        // Get the element to get patched
        const element = oldNode.render();

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
                        (VirtualNode) {
                            name: 'li',
                            props: null,
                            children:
                            [
                                (VirtualText) {
                                    text: 'Item1'
                                }
                            ],
                            isVirtualNode: true
                        },
                        (VirtualNode) {
                            name: 'li',
                            props: null,
                            children:
                            [
                                (VirtualText) {
                                    text: 'Item2'
                                }
                            ],
                            isVirtualNode: true
                        },
                        (VirtualNode) {
                            name: 'li',
                            props: null,
                            children:
                            [
                                (VirtualText) {
                                    text: 'Item3'
                                }
                            ],
                            isVirtualNode: true
                        }
                    ]
                }
            ],
            childrenPatches:
            [],
            _context:
            (PatchingContext) {
                _original:
                {}
            }
        }`);

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(spyOnBeforeMount).toHaveBeenCalledTimes(3); // For the children

        expect(spyOnAfterMount).toHaveBeenCalledTimes(3); // For the children

        expect(spyOnBeforeUnmount).toHaveBeenCalledTimes(0);

        expect(spyOnAfterChildrenUpdated).toHaveBeenCalledTimes(1);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li>Item1</li><li>Item2</li><li>Item3</li></ul>');

        expect(child).toEqual(element); // Kept the same node
    });

    it("diff virtual node to virtual node with different name", () => {

        const oldNode = new VirtualNode('div', null, [new VirtualText('Some text')]);

        // Get the element to get patched
        const element = oldNode.render();

        expect(element.outerHTML).toEqual('<div>Some text</div>');

        const shadowRoot = createShadowRoot();

        shadowRoot.appendChild(element);

        const newNode = new VirtualNode('span', null, [new VirtualText('Some other text')]);

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (ReplaceElementPatch) {
                    newNode:
                    (VirtualNode) {
                        name: 'span',
                        props: null,
                        children:
                        [
                            (VirtualText) {
                                text: 'Some other text'
                            }
                        ],
                        isVirtualNode: true
                    }
                }
            ],
            childrenPatches:
            [],
            _context:
            (PatchingContext) {
                _original:
                {}
            }
        }`);

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);
        
        expect(spyOnBeforeMount).toHaveBeenCalledTimes(1);

        expect(spyOnAfterMount).toHaveBeenCalledTimes(1);

        expect(spyOnBeforeUnmount).toHaveBeenCalledTimes(1);

        expect(spyOnAfterChildrenUpdated).toHaveBeenCalledTimes(0);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<span>Some other text</span>');

        expect(child).not.toEqual(element); // Replaced the node
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
        const element = oldNode.render();

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
                                value: 'http://images/newImage.gif'
                            }
                        ],
                        childrenPatches:
                        [],
                        _context:
                        (PatchingContext) {
                            _original:
                            {}
                        }
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
                                                        (VirtualText) {
                                                            text: 'Some other text'
                                                        }
                                                    }
                                                ],
                                                childrenPatches:
                                                [],
                                                _context:
                                                (PatchingContext) {
                                                    _original:
                                                    {}
                                                }
                                            }
                                        }
                                    ],
                                    _context:
                                    (PatchingContext) {
                                        _original:
                                        {}
                                    }
                                }
                            }
                        ],
                        _context:
                        (PatchingContext) {
                            _original:
                            {}
                        }
                    }
                }
            ],
            _context:
            (PatchingContext) {
                _original:
                {}
            }
        }`);

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(spyOnBeforeMount).toHaveBeenCalledTimes(0);

        expect(spyOnAfterMount).toHaveBeenCalledTimes(0);

        expect(spyOnBeforeUnmount).toHaveBeenCalledTimes(0);

        expect(spyOnAfterChildrenUpdated).toHaveBeenCalledTimes(0);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<div><img src=\"http://images/newImage.gif\"/><div><span>Some other text</span></div></div>');

        expect(child).toEqual(element); // Kept the node
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
        const element = oldNode.render();

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
                                value: 'http://images/newImage.gif'
                            }
                        ],
                        childrenPatches:
                        [],
                        _context:
                        (PatchingContext) {
                            _original:
                            {}
                        }
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
                                            (VirtualText) {
                                                text: 'Some other text'
                                            }
                                        }
                                    ],
                                    childrenPatches:
                                    [],
                                    _context:
                                    (PatchingContext) {
                                        _original:
                                        {}
                                    }
                                }
                            }
                        ],
                        _context:
                        (PatchingContext) {
                            _original:
                            {}
                        }
                    }
                }
            ],
            _context:
            (PatchingContext) {
                _original:
                {}
            }
        }`);

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(spyOnBeforeMount).toHaveBeenCalledTimes(1);

        expect(spyOnAfterMount).toHaveBeenCalledTimes(1);

        expect(spyOnBeforeUnmount).toHaveBeenCalledTimes(1);

        expect(spyOnAfterChildrenUpdated).toHaveBeenCalledTimes(0);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<div><img src=\"http://images/newImage.gif\"/><div>Some other text</div></div>');

        expect(child).toEqual(element); // Kept the node
    });

    it("diff a node with children components replaced with text", () => {

        const oldNode = h('div', null,
            h('img', {
                src: 'http://images/image.gif'
            }),

            h('div', null,
                h('span', null, 'Some text')
            )
        );

        // Get the element to get patched
        const element = oldNode.render();

        expect(element.outerHTML).toEqual('<div><img src=\"http://images/image.gif\"/><div><span>Some text</span></div></div>');

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
                                (VirtualText) {
                                    text: 'Some text'
                                }
                            }
                        ],
                        childrenPatches:
                        [],
                        _context:
                        (PatchingContext) {
                            _original:
                            {}
                        }
                    }
                }
            ],
            _context:
            (PatchingContext) {
                _original:
                {}
            }
        }`);

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(spyOnBeforeMount).toHaveBeenCalledTimes(1);

        expect(spyOnAfterMount).toHaveBeenCalledTimes(1);

        expect(spyOnBeforeUnmount).toHaveBeenCalledTimes(2);

        expect(spyOnAfterChildrenUpdated).toHaveBeenCalledTimes(1);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<div>Some text</div>');

        expect(child).toEqual(element); // Kept the node
    });

    it("diff a node with text replaced with children components", () => {

        const oldNode = h('div', null, 'Some text');

        // Get the element to get patched
        const element = oldNode.render();

        expect(element.outerHTML).toEqual('<div>Some text</div>');

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
                    (VirtualNode) {
                        name: 'div',
                        props: null,
                        children:
                        [
                            (VirtualNode) {
                                name: 'span',
                                props: null,
                                children:
                                [
                                    (VirtualText) {
                                        text: 'Some text'
                                    }
                                ],
                                isVirtualNode: true
                            }
                        ],
                        isVirtualNode: true
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
                                (VirtualNode) {
                                    name: 'img',
                                    props:
                                    {
                                        src: 'http://images/image.gif'
                                    },
                                    children:
                                    [],
                                    isVirtualNode: true
                                }
                            }
                        ],
                        childrenPatches:
                        [],
                        _context:
                        (PatchingContext) {
                            _original:
                            {}
                        }
                    }
                }
            ],
            _context:
            (PatchingContext) {
                _original:
                {}
            }
        }`);

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(spyOnBeforeMount).toHaveBeenCalledTimes(2);

        expect(spyOnAfterMount).toHaveBeenCalledTimes(2);

        expect(spyOnBeforeUnmount).toHaveBeenCalledTimes(1);

        expect(spyOnAfterChildrenUpdated).toHaveBeenCalledTimes(1);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<div><img src=\"http://images/image.gif\"/><div><span>Some text</span></div></div>');

        expect(child).toEqual(element); // Kept the node
    });

    it("diff a node with children components modify children no key", () => {

        const oldNode = h('ul', null,
            h('li', null, 'Text 1'),
            h('li', null, 'Text 2'),
            h('li', null, 'Text 3')
        );

        // Get the element to get patched
        const element = oldNode.render();

        expect(element.outerHTML).toEqual('<ul><li>Text 1</li><li>Text 2</li><li>Text 3</li></ul>');

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
                                            (VirtualText) {
                                                text: 'Text 4'
                                            }
                                        }
                                    ],
                                    childrenPatches:
                                    [],
                                    _context:
                                    (PatchingContext) {
                                        _original:
                                        {}
                                    }
                                }
                            }
                        ],
                        _context:
                        (PatchingContext) {
                            _original:
                            {}
                        }
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
                                            (VirtualText) {
                                                text: 'Text 5'
                                            }
                                        }
                                    ],
                                    childrenPatches:
                                    [],
                                    _context:
                                    (PatchingContext) {
                                        _original:
                                        {}
                                    }
                                }
                            }
                        ],
                        _context:
                        (PatchingContext) {
                            _original:
                            {}
                        }
                    }
                }
            ],
            _context:
            (PatchingContext) {
                _original:
                {}
            }
        }`);

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(spyOnBeforeMount).toHaveBeenCalledTimes(0);

        expect(spyOnAfterMount).toHaveBeenCalledTimes(0);

        expect(spyOnBeforeUnmount).toHaveBeenCalledTimes(1);

        expect(spyOnAfterChildrenUpdated).toHaveBeenCalledTimes(1);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li>Text 4</li><li>Text 5</li></ul>');

        expect(child).toEqual(element); // Kept the node
    });

    it("diff a node with keyed children. Add a child to an empty container ", () => {

        const oldNode = h('ul', null);

        // Get the element to get patched
        const element = oldNode.render();

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
                        (VirtualNode) {
                            name: 'li',
                            props:
                            {
                                key: 1
                            },
                            children:
                            [
                                (VirtualText) {
                                    text: 'Text 1'
                                }
                            ],
                            isVirtualNode: true
                        }
                    ]
                }
            ],
            childrenPatches:
            [],
            _context:
            (PatchingContext) {
                _original:{}
            }
        }`);

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li></ul>');

        expect(child).toEqual(element); // Kept the node
    });

    it("diff a node with keyed children. Prepend a child to existing children change text in old one", () => {

        const oldNode = h('ul', null,
            h('li', { key: '1' }, 'Text 1')
        );

        // Get the element to get patched
        const element = oldNode.render();

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
                    (VirtualNode) {
                        name: 'li',
                        props:
                        {
                            key: '3'
                        },
                        children:
                        [
                            (VirtualText) {
                                text: 'Text 3'
                            }
                        ],
                        isVirtualNode: true
                    }
                },
                (MoveElementPatch) {
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
                                            (VirtualText) {
                                                text: 'Text 11'
                                            }
                                        }
                                    ],
                                    childrenPatches:
                                    [],
                                    _context:
                                    (PatchingContext) {
                                        _original:
                                        {}
                                    }
                                }
                            }
                        ],
                        _context:
                        (PatchingContext) {
                            _original:
                            {}
                        }
                    }
                }
            ],
            _context:
            (PatchingContext) {
                _original:
                {}
            }
        }`);

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li key=\"3\">Text 3</li><li key=\"1\">Text 11</li></ul>');

        expect(child).toEqual(element); // Kept the node
    });

    it("diff a node with keyed children. Append a child to existing children change text in old one", () => {

        const oldNode = h('ul', null,
            h('li', { key: '1' }, 'Text 1')
        );

        // Get the element to get patched
        const element = oldNode.render();

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
                    (VirtualNode) {
                        name: 'li',
                        props:
                        {
                            key: '3'
                        },
                        children:
                        [
                            (VirtualText) {
                                text: 'Text 3'
                            }
                        ],
                        isVirtualNode: true
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
                                            (VirtualText) {
                                                text: 'Text 11'
                                            }
                                        }
                                    ],
                                    childrenPatches:
                                    [],
                                    _context:
                                    (PatchingContext) {
                                        _original:
                                        {}
                                    }
                                }
                            }
                        ],
                        _context:
                        (PatchingContext) {
                            _original:
                            {}
                        }
                    }
                }
            ],
            _context:
            (PatchingContext) {
                _original:
                {}
            }
        }`);

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li key=\"1\">Text 11</li><li key=\"3\">Text 3</li></ul>');

        expect(child).toEqual(element); // Kept the node
    });

    it("diff a node with keyed children. Insert at the beginning, in the middle and at the end", () => {

        const oldNode = h('ul', null,
            h('li', { key: '2' }, 'Text 2'),
            h('li', { key: '4' }, 'Text 4'),
        );

        // Get the element to get patched
        const element = oldNode.render();

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
                    (VirtualNode) {
                        name: 'li',
                        props:
                        {
                            key: '1'
                        },
                        children:
                        [
                            (VirtualText) {
                                text: 'Text 1'
                            }
                        ],
                        isVirtualNode: true
                    }
                },
                (MoveElementPatch) {
                    from: 0,
                    to: 1,
                    offset: 0
                },
                (SetChildPatch) {
                    index: 2,
                    newNode:
                    (VirtualNode) {
                        name: 'li',
                        props:
                        {
                            key: '3'
                        },
                        children:
                        [
                            (VirtualText) {
                                text: 'Text 3'
                            }
                        ],
                        isVirtualNode: true
                    }
                },
                (MoveElementPatch) {
                    from: 1,
                    to: 3,
                    offset: 0
                },
                (SetChildPatch) {
                    index: 4,
                    newNode:
                    (VirtualNode) {
                        name: 'li',
                        props:
                        {
                            key: '5'
                        },
                        children:
                        [
                            (VirtualText) {
                                text: 'Text 5'
                            }
                        ],
                        isVirtualNode: true
                    }
                }
            ],
            childrenPatches:
            [],
            _context:
            (PatchingContext) {
                _original:{}
            }
        }`);

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"2\">Text 2</li><li key=\"3\">Text 3</li><li key=\"4\">Text 4</li><li key=\"5\">Text 5</li></ul>');

        expect(child).toEqual(element); // Kept the node
    });

    it("diff a node with keyed children. Insert two children at the beginning, two in the middle and two at the end", () => {

        const oldNode = h('ul', null,
            h('li', { key: '3' }, 'Text 3'),
            h('li', { key: '4' }, 'Text 4'),
            h('li', { key: '7' }, 'Text 7'),
            h('li', { key: '8' }, 'Text 8'),
        );

        // Get the element to get patched
        const element = oldNode.render();

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
                    (VirtualNode) {
                        name: 'li',
                        props:
                        {
                            key: '1'
                        },
                        children:
                        [
                            (VirtualText) {
                                text: 'Text 1'
                            }
                        ],
                        isVirtualNode: true
                    }
                },
                (SetChildPatch) {
                    index: 1,
                    newNode:
                    (VirtualNode) {
                        name: 'li',
                        props:
                        {
                            key: '2'
                        },
                        children:
                        [
                            (VirtualText) {
                                text: 'Text 2'
                            }
                        ],
                        isVirtualNode: true
                    }
                },
                (MoveElementPatch) {
                    from: 0,
                    to: 2,
                    offset: 0
                },
                (MoveElementPatch) {
                    from: 1,
                    to: 3,
                    offset: 1
                },
                (SetChildPatch) {
                    index: 4,
                    newNode:
                    (VirtualNode) {
                        name: 'li',
                        props:
                        {
                            key: '5'
                        },
                        children:
                        [
                            (VirtualText) {
                                text: 'Text 5'
                            }
                        ],
                        isVirtualNode: true
                    }
                },
                (SetChildPatch) {
                    index: 5,
                    newNode:
                    (VirtualNode) {
                        name: 'li',
                        props:
                        {
                            key: '6'
                        },
                        children:
                        [
                            (VirtualText) {
                                text: 'Text 6'
                            }
                        ],
                        isVirtualNode: true
                    }
                },
                (MoveElementPatch) {
                    from: 2,
                    to: 6,
                    offset: 0
                },
                (MoveElementPatch) {
                    from: 3,
                    to: 7,
                    offset: 0
                },
                (SetChildPatch) {
                    index: 8,
                    newNode:
                    (VirtualNode) {
                        name: 'li',
                        props:
                        {
                            key: '9'
                        },
                        children:
                        [
                            (VirtualText) {
                                text: 'Text 9'
                            }
                        ],
                        isVirtualNode: true
                    }
                },
                (SetChildPatch) {
                    index: 9,
                    newNode:
                    (VirtualNode) {
                        name: 'li',
                        props:
                        {
                            key: '10'
                        },
                        children:
                        [
                            (VirtualText) {
                                text: 'Text 10'
                            }
                        ],
                        isVirtualNode: true
                    }
                }
            ],
            childrenPatches:
            [],
            _context:
            (PatchingContext) {
                _original:{}
            }
        }`);

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"2\">Text 2</li><li key=\"3\">Text 3</li><li key=\"4\">Text 4</li><li key=\"5\">Text 5</li><li key=\"6\">Text 6</li><li key=\"7\">Text 7</li><li key=\"8\">Text 8</li><li key=\"9\">Text 9</li><li key=\"10\">Text 10</li></ul>');

        expect(child).toEqual(element); // Kept the node
    });

    it("diff a node with keyed children. Remove first node", () => {

        const oldNode = h('ul', null,
            h('li', { key: '1' }, 'Text 1'),
            h('li', { key: '2' }, 'Text 2')
        );

        // Get the element to get patched
        const element = oldNode.render();

        expect(element.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"2\">Text 2</li></ul>');

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
                (MoveElementPatch) {
                    from: 1,
                    to: 0,
                    offset: 0
                },
                (RemoveChildrenRangePatch) {
                    from: 1,
                    count: 1
                }
            ],
            childrenPatches:
            [],
            _context:
            (PatchingContext) {
                _original:{}
            }
        }`);

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li key=\"2\">Text 2</li></ul>');

        expect(child).toEqual(element); // Kept the node
    });

    it("diff a node with keyed children. Remove last node", () => {

        const oldNode = h('ul', null,
            h('li', { key: '1' }, 'Text 1'),
            h('li', { key: '2' }, 'Text 2')
        );

        // Get the element to get patched
        const element = oldNode.render();

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
            childrenPatches:
            [],
            _context:
            (PatchingContext) {
                _original:{}
            }
        }`);

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li></ul>');

        expect(child).toEqual(element); // Kept the node
    });

    it("diff a node with keyed children. Remove middle node", () => {

        const oldNode = h('ul', null,
            h('li', { key: '1' }, 'Text 1'),
            h('li', { key: '2' }, 'Text 2'),
            h('li', { key: '3' }, 'Text 3')
        );

        // Get the element to get patched
        const element = oldNode.render();

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
                (MoveElementPatch) {
                    from: 2,
                    to: 1,
                    offset: 0
                },
                (RemoveChildrenRangePatch) {
                    from: 2,
                    count: 1
                }
            ],
            childrenPatches:
            [],
            _context:
            (PatchingContext) {
                _original:{}
            }
        }`);

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"3\">Text 3</li></ul>');

        expect(child).toEqual(element); // Kept the node
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
        const element = oldNode.render();

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
                (MoveElementPatch) {
                    from: 1,
                    to: 0,
                    offset: 0
                },
                (MoveElementPatch) {
                    from: 3,
                    to: 1,
                    offset: 1
                },
                (RemoveChildrenRangePatch) {
                    from: 2,
                    count: 3
                }
            ],
            childrenPatches:
            [],
            _context:
            (PatchingContext) {
                _original:{}
            }
        }`);

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li key=\"2\">Text 2</li><li key=\"4\">Text 4</li></ul>');

        expect(child).toEqual(element); // Kept the node
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
        const element = oldNode.render();

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
                (MoveElementPatch) {
                    from: 2,
                    to: 0,
                    offset: 0
                },
                (MoveElementPatch) {
                    from: 3,
                    to: 1,
                    offset: 1
                },
                (MoveElementPatch) {
                    from: 6,
                    to: 2,
                    offset: 2
                },
                (MoveElementPatch) {
                    from: 7,
                    to: 3,
                    offset: 3
                },
                (RemoveChildrenRangePatch) {
                    from: 4,
                    count: 6
                }
            ],
            childrenPatches:
            [],
            _context:
            (PatchingContext) {
                _original:{}
            }
        }`);

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li key=\"3\">Text 3</li><li key=\"4\">Text 4</li><li key=\"7\">Text 7</li><li key=\"8\">Text 8</li></ul>');

        expect(child).toEqual(element); // Kept the node
    });

    it("diff a node with keyed children. Swap children", () => {

        const oldNode = h('ul', null,
            h('li', { key: '1' }, 'Text 1'),
            h('li', { key: '2' }, 'Text 2')
        );

        // Get the element to get patched
        const element = oldNode.render();

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
                (MoveElementPatch) {
                    from: 1,
                    to: 0,
                    offset: 0
                },
                (MoveElementPatch) {
                    from: 0,
                    to: 1,
                    offset: 0
                }
            ],
            childrenPatches:
            [],
            _context:
            (PatchingContext) {
                _original:{}
            }
        }`);

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li key=\"2\">Text 2</li><li key=\"1\">Text 1</li></ul>');

        expect(child).toEqual(element); // Kept the node
    });

    it("diff a node with keyed children. Add at the beginning, remove from the end", () => {

        const oldNode = h('ul', null,
            h('li', { key: '2' }, 'Text 2'),
            h('li', { key: '3' }, 'Text 3'),
        );

        // Get the element to get patched
        const element = oldNode.render();

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
                    (VirtualNode) {
                        name: 'li',
                        props:
                        {
                            key: '1'
                        },
                        children:
                        [
                            (VirtualText) {
                                text: 'Text 1'
                            }
                        ],
                        isVirtualNode: true
                    }
                },
                (MoveElementPatch) {
                    from: 0,
                    to: 1,
                    offset: 0
                }
            ],
            childrenPatches:
            [],
            _context:
            (PatchingContext) {
                _original:{}
            }
        }`);

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"2\">Text 2</li></ul>');

        expect(child).toEqual(element); // Kept the node
    });

    it("diff a node with keyed children. Add at the end, remove from the beginning", () => {

        const oldNode = h('ul', null,
            h('li', { key: '3' }, 'Text 3'),
            h('li', { key: '1' }, 'Text 1'),
        );

        // Get the element to get patched
        const element = oldNode.render();

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
                (MoveElementPatch) {
                    from: 1,
                    to: 0,
                    offset: 0
                },
                (SetChildPatch) {
                    index: 1,
                    newNode:
                    (VirtualNode) {
                        name: 'li',
                        props:
                        {
                            key: '2'
                        },
                        children:
                        [
                            (VirtualText) {
                                text: 'Text 2'
                            }
                        ],
                        isVirtualNode: true
                    }
                }
            ],
            childrenPatches:
            [],
            _context:
            (PatchingContext) {
                _original:{}
            }
        }`);

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"2\">Text 2</li></ul>');

        expect(child).toEqual(element); // Kept the node
    });

    it("diff a node with keyed children. Swap children and add one in the middle", () => {

        const oldNode = h('ul', null,
            h('li', { key: '1' }, 'Text 1'),
            h('li', { key: '2' }, 'Text 2')
        );

        // Get the element to get patched
        const element = oldNode.render();

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
                (MoveElementPatch) {
                    from: 1,
                    to: 0,
                    offset: 0
                },
                (SetChildPatch) {
                    index: 1,
                    newNode:
                    (VirtualNode) {
                        name: 'li',
                        props:
                        {
                            key: '3'
                        },
                        children:
                        [
                            (VirtualText) {
                                text: 'Text 3'
                            }
                        ],
                        isVirtualNode: true
                    }
                },
                (MoveElementPatch) {
                    from: 0,
                    to: 2,
                    offset: 0
                }
            ],
            childrenPatches:
            [],
            _context:
            (PatchingContext) {
                _original:{}
            }
        }`);

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li key=\"2\">Text 2</li><li key=\"3\">Text 3</li><li key=\"1\">Text 1</li></ul>');

        expect(child).toEqual(element); // Kept the node
    });

    it("diff a node with keyed children. Swap children and remove one from the middle", () => {

        const oldNode = h('ul', null,
            h('li', { key: '1' }, 'Text 1'),
            h('li', { key: '2' }, 'Text 2'),
            h('li', { key: '3' }, 'Text 3'),
        );

        // Get the element to get patched
        const element = oldNode.render();

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
                (MoveElementPatch) {
                    from: 2,
                    to: 0,
                    offset: 0
                },
                (MoveElementPatch) {
                    from: 0,
                    to: 1,
                    offset: 0
                },
                (RemoveChildrenRangePatch) {
                    from: 2,
                    count: 1
                }
            ],
            childrenPatches:
            [],
            _context:
            (PatchingContext) {
                _original:{}
            }
        }`);

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li key=\"3\">Text 3</li><li key=\"1\">Text 1</li></ul>');

        expect(child).toEqual(element); // Kept the node
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
        const element = oldNode.render();

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
                (MoveElementPatch) {
                    from: 4,
                    to: 0,
                    offset: 0
                },
                (MoveElementPatch) {
                    from: 3,
                    to: 1,
                    offset: 0
                },
                (MoveElementPatch) {
                    from: 1,
                    to: 3,
                    offset: 0
                },
                (MoveElementPatch) {
                    from: 0,
                    to: 4,
                    offset: 0
                }
            ],
            childrenPatches:
            [],
            _context:
            (PatchingContext) {
                _original:{}
            }
        }`);

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li key=\"5\">Text 5</li><li key=\"4\">Text 4</li><li key=\"3\">Text 3</li><li key=\"2\">Text 2</li><li key=\"1\">Text 1</li></ul>');

        expect(child).toEqual(element); // Kept the node
    });

    it("diff a node with keyed children. Combination of all the above v1", () => {

        const oldNode = h('ul', null,
            h('li', { key: '1' }, 'Text 1'),
            h('li', { key: '2' }, 'Text 2'),
            h('li', { key: '3' }, 'Text 3'),
            h('li', { key: '4' }, 'Text 4')
        );

        // Get the element to get patched
        const element = oldNode.render();

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
                (MoveElementPatch) {
                    from: 3,
                    to: 0,
                    offset: 0
                },
                (SetChildPatch) {
                    index: 1,
                    newNode:
                    (VirtualNode) {
                        name: 'li',
                        props:
                        {
                            key: '5'
                        },
                        children:
                        [
                            (VirtualText) {
                                text: 'Text 5'
                            }
                        ],
                        isVirtualNode: true
                    }
                },
                (MoveElementPatch) {
                    from: 0,
                    to: 2,
                    offset: 0
                },
                (RemoveChildrenRangePatch) {
                    from: 3,
                    count: 1
                }
            ],
            childrenPatches:
            [],
            _context:
            (PatchingContext) {
                _original:{}
            }
        }`);

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li key=\"4\">Text 4</li><li key=\"5\">Text 5</li><li key=\"1\">Text 1</li></ul>');

        expect(child).toEqual(element); // Kept the node
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
        const element = oldNode.render();

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
                    (VirtualNode) {
                        name: 'li',
                        props:
                        {
                            key: '11'
                        },
                        children:
                        [
                            (VirtualText) {
                                text: 'Text 11'
                            }
                        ],
                        isVirtualNode: true
                    }
                },
                (MoveElementPatch) {
                    from: 7,
                    to: 1,
                    offset: 0
                },
                (MoveElementPatch) {
                    from: 3,
                    to: 2,
                    offset: 0
                },
                (SetChildPatch) {
                    index: 3,
                    newNode:
                    (VirtualNode) {
                        name: 'li',
                        props:
                        {
                            key: '12'
                        },
                        children:
                        [
                            (VirtualText) {
                                text: 'Text 12'
                            }
                        ],
                        isVirtualNode: true
                    }
                },
                (MoveElementPatch) {
                    from: 6,
                    to: 4,
                    offset: 1
                },
                (MoveElementPatch) {
                    from: 2,
                    to: 5,
                    offset: 0
                },
                (SetChildPatch) {
                    index: 6,
                    newNode:
                    (VirtualNode) {
                        name: 'li',
                        props:
                        {
                            key: '13'
                        },
                        children:
                        [
                            (VirtualText) {
                                text: 'Text 13'
                            }
                        ],
                        isVirtualNode: true
                    }
                },
                (RemoveChildrenRangePatch) {
                    from: 7,
                    count: 2
                }
            ],
            childrenPatches:
            [],
            _context:
            (PatchingContext) {
                _original:{}
            }
        }`);

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<ul><li key=\"11\">Text 11</li><li key=\"8\">Text 8</li><li key=\"4\">Text 4</li><li key=\"12\">Text 12</li><li key=\"7\">Text 7</li><li key=\"3\">Text 3</li><li key=\"13\">Text 13</li></ul>');

        expect(child).toEqual(element); // Kept the node
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
        const element = oldNode.render();

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
            patches:
            [],
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
                                (VirtualText) {
                                    text: 6
                                }
                            }
                        ],
                        childrenPatches:
                        [],
                        _context:
                        (PatchingContext) {
                            _original:{}
                        }
                    }
                }
            ],
            _context:
            (PatchingContext) {
                _original:{}
            }
        }`);

        const {
            hooks, 
            spyNodeWillConnect: spyOnBeforeMount,
            spyNodeDidConnect: spyOnAfterMount,
            spyNodeWillDisconnect: spyOnBeforeUnmount,
            spyNodeDidUpdate: spyOnAfterChildrenUpdated
        } = setupLifecycleHooks();

        patches.applyPatches(shadowRoot, element, hooks);

        expect(shadowRoot.childNodes.length).toEqual(1); // No children added or removed

        const child = shadowRoot.firstChild! as HTMLElement;

        expect(child.outerHTML).toEqual('<div><h4>Counter</h4>6<button>Increment</button></div>');

        expect(child).toEqual(element); // Kept the node
    });

});