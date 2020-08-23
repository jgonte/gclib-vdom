import createElement from "../src/createElement";
import diff from "../src/diff";
import displayObject from "../src/utils/displayObject";
import ElementPatches from "../src/ElementPatches";

function comparePatches(patches: ElementPatches, expected: string): void {

    const actual: string = displayObject(patches);

    if (expected) {

        expect(actual.replace(/\s/g, '')).toEqual(expected.replace(/\s/g, ''));
    }
    else { // Allow to pretty display the string

        expect(actual).toEqual(expected);
    }
}

describe("diff tests", () => {

    it("diff same node type", () => {

        const oldNode = createElement('div', null, null);

        // Get the element to get patched
        const element = oldNode.render();

        expect(element.outerHTML).toEqual('<div></div>');

        const newNode = createElement('div', null, null);

        const patches = diff(oldNode, newNode);

        expect(patches).toEqual({
            "_context": {
                "_original": {}
            },
            "childrenPatches": [],
            "patches": []
        });

        patches.apply(element);

        // Nothing changed
        expect(element.outerHTML).toEqual('<div></div>');
    });

    it("diff same node type with different attributes", () => {

        const oldNode = createElement('div', {
            id: 'myElement1',
            class: "class1 class2",

        },
            null);

        // Get the element to get patched
        const element = oldNode.render();

        expect(element.outerHTML).toEqual('<div id=\"myElement1\" class=\"class1 class2\"></div>');

        const newNode = createElement('div', {
            id: 'myElement2', // Replace attribute value
            //class: "class1 class2", // Remove attribute
            href: "http://someurl.com" // Add attribute
        },
            null);

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

        patches.apply(element);

        expect(element.outerHTML).toEqual('<div id=\"myElement2\" href=\"http://someurl.com\"></div>');
    });

    it("diff same node type with different text", () => {

        const oldNode = createElement('span', null, 'Some text');

        // Get the element to get patched
        const element = oldNode.render();

        expect(element.outerHTML).toEqual('<span>Some text</span>');

        const newNode = createElement('span', null, 'Some other text');

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
            _context:(PatchingContext) {_original:{}}
        }`);

        patches.apply(element);

        expect(element.outerHTML).toEqual('<span>Some other text</span>');
    });

    it("diff a node with changed child image url and span text", () => {

        const oldNode = createElement('div', null,
            [
                createElement('img', {
                    src: 'http://images/image.gif'
                },
                    null),

                createElement('div', null, [
                    createElement('span', null, 'Some text')
                ])
            ]);

        // Get the element to get patched
        const element = oldNode.render();

        expect(element.outerHTML).toEqual('<div><img src=\"http://images/image.gif\"><div><span>Some text</span></div></div>');

        const newNode = createElement('div', null,
            [
                createElement('img', {
                    src: 'http://images/newImage.gif' // changed
                },
                    null),

                createElement('div', null, [
                    createElement('span', null, 'Some other text') // changed
                ])
            ]);

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
                        _context:(PatchingContext) {_original:{}}
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
                                                text: 'Some other text'
                                            }
                                        }
                                    ],
                                    childrenPatches:
                                    [],
                                    _context:(PatchingContext) {_original:{}}
                                }
                            }
                        ],
                        _context:(PatchingContext) {_original:{}}
                    }
                }
            ],
            _context:(PatchingContext) {_original:{}}
        }`);

        patches.apply(element);

        expect(element.outerHTML).toEqual('<div><img src=\"http://images/newImage.gif\"><div><span>Some other text</span></div></div>');
    });

    it("diff a node with changed child image url and replace span child with text", () => {

        const oldNode = createElement('div', null,
            [
                createElement('img', {
                    src: 'http://images/image.gif'
                },
                    null),

                createElement('div', null, [
                    createElement('span', null, 'Some text')
                ])
            ]);

        // Get the element to get patched
        const element = oldNode.render();

        expect(element.outerHTML).toEqual('<div><img src=\"http://images/image.gif\"><div><span>Some text</span></div></div>');

        const newNode = createElement('div', null,
            [
                createElement('img', {
                    src: 'http://images/newImage.gif' // changed
                },
                    null),

                createElement('div', null, 'Some other text') // replaced 'span' child with text
            ]);

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
                        _context:(PatchingContext) {_original:{}}
                    }
                },
                (ChildElementPatches) {
                    index: 1,
                    patches:
                    (ElementPatches) {
                        patches:
                        [
                            (RemoveChildrenPatch) {},
                            (SetTextPatch) {
                                value:
                                (VirtualText) {
                                    text: 'Some other text'
                                }
                            }
                        ],
                        childrenPatches:
                        [],
                        _context:(PatchingContext) {_original:{}}
                    }
                }
            ],
            _context:(PatchingContext) {_original:{}}
        }`);

        patches.apply(element);

        expect(element.outerHTML).toEqual('<div><img src=\"http://images/newImage.gif\"><div>Some other text</div></div>');
    });

    it("diff a node with children components replaced with text", () => {

        const oldNode = createElement('div', null,
            [
                createElement('img', {
                    src: 'http://images/image.gif'
                },
                    null),

                createElement('div', null, [
                    createElement('span', null, 'Some text')
                ])
            ]);

        // Get the element to get patched
        const element = oldNode.render();

        expect(element.outerHTML).toEqual('<div><img src=\"http://images/image.gif\"><div><span>Some text</span></div></div>');

        const newNode = createElement('div', null, 'Some text');

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (RemoveChildrenPatch) {},
                (SetTextPatch) {
                    value:
                    (VirtualText) {
                        text: 'Some text'
                    }
                }
            ],
            childrenPatches:
            [],
            _context:(PatchingContext) {_original:{}}
        }`);

        patches.apply(element);

        expect(element.outerHTML).toEqual('<div>Some text</div>');
    });

    it("diff a node with text replaced with children components", () => {

        const oldNode = createElement('div', null, 'Some text');

        // Get the element to get patched
        const element = oldNode.render();

        expect(element.outerHTML).toEqual('<div>Some text</div>');

        const newNode = createElement('div', null,
            [
                createElement('img', {
                    src: 'http://images/image.gif'
                },
                    null),

                createElement('div', null, [
                    createElement('span', null, 'Some text')
                ])
            ]);

        const patches = diff(oldNode, newNode);

        comparePatches(patches, `
        (ElementPatches) {
            patches:
            [
                (RemoveTextPatch) {},
                (AddChildrenPatch) {
                    children:
                    [
                        (VirtualNode) {
                            name: 'img',
                            attributes:
                            {
                                src: 'http://images/image.gif'
                            },
                            children: null
                        },
                        (VirtualNode) {
                            name: 'div',
                            attributes: null,
                            children:
                            [
                                (VirtualNode) {
                                    name: 'span',
                                    attributes: null,
                                    children:
                                    (VirtualText) {
                                        text: 'Some text'
                                    }
                                }
                            ]
                        }
                    ]
                }
            ],
            childrenPatches:
            [],
            _context:(PatchingContext) {_original:{}}
        }`);

        patches.apply(element);

        expect(element.outerHTML).toEqual('<div><img src=\"http://images/image.gif\"><div><span>Some text</span></div></div>');
    });

    it("diff a node with children components modify children no key", () => {

        const oldNode = createElement('ul', null, [
            createElement('li', null, 'Text 1'),
            createElement('li', null, 'Text 2'),
            createElement('li', null, 'Text 3')
        ]);

        // Get the element to get patched
        const element = oldNode.render();

        expect(element.outerHTML).toEqual('<ul><li>Text 1</li><li>Text 2</li><li>Text 3</li></ul>');

        const newNode = createElement('ul', null, [
            createElement('li', null, 'Text 4'),
            createElement('li', null, 'Text 5')
        ]);

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
                            _original:{}
                        }
                    }
                },
                (ChildElementPatches) {
                    index: 1,
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

        patches.apply(element);

        expect(element.outerHTML).toEqual('<ul><li>Text 4</li><li>Text 5</li></ul>');
    });

    it("diff a node with keyed children. Add a child to an empty container ", () => {

        const oldNode = createElement('ul', null, null);

        // Get the element to get patched
        const element = oldNode.render();

        expect(element.outerHTML).toEqual('<ul></ul>');

        const newNode = createElement('ul', null, [
            createElement('li', { key: 1 }, 'Text 1'), // insert new 
        ]);

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
                            attributes:
                            {
                                key: 1
                            },
                            children:
                            (VirtualText) {
                                text: 'Text 1'
                            }
                        }
                    ]
                }
            ],
            childrenPatches:
            [],
            _context:(PatchingContext) {_original:{}}
        }`);

        patches.apply(element);

        expect(element.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li></ul>');
    });

    it("diff a node with keyed children. Prepend a child to existing children change text in old one", () => {

        const oldNode = createElement('ul', null, [
            createElement('li', { key: '1' }, 'Text 1')
        ]);

        // Get the element to get patched
        const element = oldNode.render();

        expect(element.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li></ul>');

        const newNode = createElement('ul', null, [
            createElement('li', { key: '3' }, 'Text 3'), // insert new 
            createElement('li', { key: '1' }, 'Text 11') // change text
        ]);

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
                        attributes:
                        {
                            key: '3'
                        },
                        children:
                        (VirtualText) {
                            text: 'Text 3'
                        }
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
        }`);

        patches.apply(element);

        expect(element.outerHTML).toEqual('<ul><li key=\"3\">Text 3</li><li key=\"1\">Text 11</li></ul>');
    });

    it("diff a node with keyed children. Append a child to existing children change text in old one", () => {

        const oldNode = createElement('ul', null, [
            createElement('li', { key: '1' }, 'Text 1')
        ]);

        // Get the element to get patched
        const element = oldNode.render();

        expect(element.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li></ul>');

        const newNode = createElement('ul', null, [
            createElement('li', { key: '1' }, 'Text 11'), // change text
            createElement('li', { key: '3' }, 'Text 3') // append new 
        ]);

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
                        attributes:
                        {
                            key: '3'
                        },
                        children:
                        (VirtualText) {
                            text: 'Text 3'
                        }
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
        }`);

        patches.apply(element);

        expect(element.outerHTML).toEqual('<ul><li key=\"1\">Text 11</li><li key=\"3\">Text 3</li></ul>');
    });

    it("diff a node with keyed children. Insert at the beginning, in the middle and at the end", () => {

        const oldNode = createElement('ul', null, [
            createElement('li', { key: '2' }, 'Text 2'),
            createElement('li', { key: '4' }, 'Text 4'),
        ]);

        // Get the element to get patched
        const element = oldNode.render();

        expect(element.outerHTML).toEqual('<ul><li key=\"2\">Text 2</li><li key=\"4\">Text 4</li></ul>');

        const newNode = createElement('ul', null, [
            createElement('li', { key: '1' }, 'Text 1'), // insert at the beginning
            createElement('li', { key: '2' }, 'Text 2'),
            createElement('li', { key: '3' }, 'Text 3'), // insert in the middle 
            createElement('li', { key: '4' }, 'Text 4'),
            createElement('li', { key: '5' }, 'Text 5') // insert at the end
        ]);

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
                        attributes:
                        {
                            key: '1'
                        },
                        children:
                        (VirtualText) {
                            text: 'Text 1'
                        }
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
                        attributes:
                        {
                            key: '3'
                        },
                        children:
                        (VirtualText) {
                            text: 'Text 3'
                        }
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
                        attributes:
                        {
                            key: '5'
                        },
                        children:
                        (VirtualText) {
                            text: 'Text 5'
                        }
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

        patches.apply(element);

        expect(element.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"2\">Text 2</li><li key=\"3\">Text 3</li><li key=\"4\">Text 4</li><li key=\"5\">Text 5</li></ul>');
    });

    it("diff a node with keyed children. Insert two children at the beginning, two in the middle and two at the end", () => {

        const oldNode = createElement('ul', null, [
            createElement('li', { key: '3' }, 'Text 3'),
            createElement('li', { key: '4' }, 'Text 4'),
            createElement('li', { key: '7' }, 'Text 7'),
            createElement('li', { key: '8' }, 'Text 8'),
        ]);

        // Get the element to get patched
        const element = oldNode.render();

        expect(element.outerHTML).toEqual('<ul><li key=\"3\">Text 3</li><li key=\"4\">Text 4</li><li key=\"7\">Text 7</li><li key=\"8\">Text 8</li></ul>');

        const newNode = createElement('ul', null, [
            createElement('li', { key: '1' }, 'Text 1'), // insert at the beginning
            createElement('li', { key: '2' }, 'Text 2'), // insert at the beginning
            createElement('li', { key: '3' }, 'Text 3'),
            createElement('li', { key: '4' }, 'Text 4'),
            createElement('li', { key: '5' }, 'Text 5'), // insert in the middle
            createElement('li', { key: '6' }, 'Text 6'), // insert in the middle
            createElement('li', { key: '7' }, 'Text 7'),
            createElement('li', { key: '8' }, 'Text 8'),
            createElement('li', { key: '9' }, 'Text 9'), // insert at the end
            createElement('li', { key: '10' }, 'Text 10') // insert at the end
        ]);

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
                        attributes:
                        {
                            key: '1'
                        },
                        children:
                        (VirtualText) {
                            text: 'Text 1'
                        }
                    }
                },
                (SetChildPatch) {
                    index: 1,
                    newNode:
                    (VirtualNode) {
                        name: 'li',
                        attributes:
                        {
                            key: '2'
                        },
                        children:
                        (VirtualText) {
                            text: 'Text 2'
                        }
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
                        attributes:
                        {
                            key: '5'
                        },
                        children:
                        (VirtualText) {
                            text: 'Text 5'
                        }
                    }
                },
                (SetChildPatch) {
                    index: 5,
                    newNode:
                    (VirtualNode) {
                        name: 'li',
                        attributes:
                        {
                            key: '6'
                        },
                        children:
                        (VirtualText) {
                            text: 'Text 6'
                        }
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
                        attributes:
                        {
                            key: '9'
                        },
                        children:
                        (VirtualText) {
                            text: 'Text 9'
                        }
                    }
                },
                (SetChildPatch) {
                    index: 9,
                    newNode:
                    (VirtualNode) {
                        name: 'li',
                        attributes:
                        {
                            key: '10'
                        },
                        children:
                        (VirtualText) {
                            text: 'Text 10'
                        }
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

        patches.apply(element);

        expect(element.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"2\">Text 2</li><li key=\"3\">Text 3</li><li key=\"4\">Text 4</li><li key=\"5\">Text 5</li><li key=\"6\">Text 6</li><li key=\"7\">Text 7</li><li key=\"8\">Text 8</li><li key=\"9\">Text 9</li><li key=\"10\">Text 10</li></ul>');
    });

    it("diff a node with keyed children. Remove first node", () => {

        const oldNode = createElement('ul', null, [
            createElement('li', { key: '1' }, 'Text 1'),
            createElement('li', { key: '2' }, 'Text 2')
        ]);

        // Get the element to get patched
        const element = oldNode.render();

        expect(element.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"2\">Text 2</li></ul>');

        const newNode = createElement('ul', null, [
            //createElement('li', { key: '1' }, 'Text 1'), First node removed
            createElement('li', { key: '2' }, 'Text 2')
        ]);

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
                _original:
                {}
            }
        }`);

        patches.apply(element);

        expect(element.outerHTML).toEqual('<ul><li key=\"2\">Text 2</li></ul>');
    });

    it("diff a node with keyed children. Remove last node", () => {

        const oldNode = createElement('ul', null, [
            createElement('li', { key: '1' }, 'Text 1'),
            createElement('li', { key: '2' }, 'Text 2')
        ]);

        // Get the element to get patched
        const element = oldNode.render();

        expect(element.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"2\">Text 2</li></ul>');

        const newNode = createElement('ul', null, [
            createElement('li', { key: '1' }, 'Text 1'),
            //createElement('li', { key: '2' }, 'Text 2') Last node removed
        ]);

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
                _original:
                {}
            }
        }`);

        patches.apply(element);

        expect(element.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li></ul>');
    });

    it("diff a node with keyed children. Remove middle node", () => {

        const oldNode = createElement('ul', null, [
            createElement('li', { key: '1' }, 'Text 1'),
            createElement('li', { key: '2' }, 'Text 2'),
            createElement('li', { key: '3' }, 'Text 3')
        ]);

        // Get the element to get patched
        const element = oldNode.render();

        expect(element.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"2\">Text 2</li><li key=\"3\">Text 3</li></ul>');

        const newNode = createElement('ul', null, [
            createElement('li', { key: '1' }, 'Text 1'),
            //createElement('li', { key: '2' }, 'Text 2') Middle node removed
            createElement('li', { key: '3' }, 'Text 3'),
        ]);

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
                _original:
                {}
            }
        }`);

        patches.apply(element);

        expect(element.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"3\">Text 3</li></ul>');
    });

    it("diff a node with keyed children. Remove from the beginning, the middle and the end", () => {

        const oldNode = createElement('ul', null, [
            createElement('li', { key: '1' }, 'Text 1'),
            createElement('li', { key: '2' }, 'Text 2'),
            createElement('li', { key: '3' }, 'Text 3'),
            createElement('li', { key: '4' }, 'Text 4'),
            createElement('li', { key: '5' }, 'Text 5')
        ]);

        // Get the element to get patched
        const element = oldNode.render();

        expect(element.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"2\">Text 2</li><li key=\"3\">Text 3</li><li key=\"4\">Text 4</li><li key=\"5\">Text 5</li></ul>');

        const newNode = createElement('ul', null, [
            //createElement('li', { key: '1' }, 'Text 1'), // Remove from the beginning
            createElement('li', { key: '2' }, 'Text 2'),
            //createElement('li', { key: '3' }, 'Text 3'), // Remove from the middle 
            createElement('li', { key: '4' }, 'Text 4'),
            //createElement('li', { key: '5' }, 'Text 5') // Remove from the end
        ]);

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
                _original:
                {}
            }
        }`);

        patches.apply(element);

        expect(element.outerHTML).toEqual('<ul><li key=\"2\">Text 2</li><li key=\"4\">Text 4</li></ul>');
    });

    it("diff a node with keyed children. Remove two children from the beginning, two from the middle and two from the end", () => {

        const oldNode = createElement('ul', null, [
            createElement('li', { key: '1' }, 'Text 1'), // remove from the beginning
            createElement('li', { key: '2' }, 'Text 2'), // remove from the beginning
            createElement('li', { key: '3' }, 'Text 3'),
            createElement('li', { key: '4' }, 'Text 4'),
            createElement('li', { key: '5' }, 'Text 5'), // remove from the middle
            createElement('li', { key: '6' }, 'Text 6'), // remove from the middle
            createElement('li', { key: '7' }, 'Text 7'),
            createElement('li', { key: '8' }, 'Text 8'),
            createElement('li', { key: '9' }, 'Text 9'), // remove from the end
            createElement('li', { key: '10' }, 'Text 10') // remove from the end
        ]);

        // Get the element to get patched
        const element = oldNode.render();

        expect(element.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"2\">Text 2</li><li key=\"3\">Text 3</li><li key=\"4\">Text 4</li><li key=\"5\">Text 5</li><li key=\"6\">Text 6</li><li key=\"7\">Text 7</li><li key=\"8\">Text 8</li><li key=\"9\">Text 9</li><li key=\"10\">Text 10</li></ul>');

        const newNode = createElement('ul', null, [
            createElement('li', { key: '3' }, 'Text 3'),
            createElement('li', { key: '4' }, 'Text 4'),
            createElement('li', { key: '7' }, 'Text 7'),
            createElement('li', { key: '8' }, 'Text 8'),
        ]);

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
                _original:
                {}
            }
        }`);

        patches.apply(element);

        expect(element.outerHTML).toEqual('<ul><li key=\"3\">Text 3</li><li key=\"4\">Text 4</li><li key=\"7\">Text 7</li><li key=\"8\">Text 8</li></ul>');
    });

    it("diff a node with keyed children. Swap children", () => {

        const oldNode = createElement('ul', null, [
            createElement('li', { key: '1' }, 'Text 1'),
            createElement('li', { key: '2' }, 'Text 2')
        ]);

        // Get the element to get patched
        const element = oldNode.render();

        expect(element.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"2\">Text 2</li></ul>');

        const newNode = createElement('ul', null, [
            createElement('li', { key: '2' }, 'Text 2'),
            createElement('li', { key: '1' }, 'Text 1')

        ]);

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
                _original:
                {}
            }
        }`);

        patches.apply(element);

        expect(element.outerHTML).toEqual('<ul><li key=\"2\">Text 2</li><li key=\"1\">Text 1</li></ul>');
    });

    it("diff a node with keyed children. Add at the beginning, remove at the end", () => {

        const oldNode = createElement('ul', null, [
            createElement('li', { key: '2' }, 'Text 2'),
            createElement('li', { key: '3' }, 'Text 3'),
        ]);

        // Get the element to get patched
        const element = oldNode.render();

        expect(element.outerHTML).toEqual('<ul><li key=\"2\">Text 2</li><li key=\"3\">Text 3</li></ul>');

        const newNode = createElement('ul', null, [
            createElement('li', { key: '1' }, 'Text 1'),
            createElement('li', { key: '2' }, 'Text 2'),
            //createElement('li', { key: '3' }, 'Text 3') removed

        ]);

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
                        attributes:
                        {
                            key: '1'
                        },
                        children:
                        (VirtualText) {
                            text: 'Text 1'
                        }
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
                _original:
                {}
            }
        }`);

        patches.apply(element);

        expect(element.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"2\">Text 2</li></ul>');
    });

    it("diff a node with keyed children. Add at the end, remove from the beginning", () => {

        const oldNode = createElement('ul', null, [
            createElement('li', { key: '3' }, 'Text 3'),
            createElement('li', { key: '1' }, 'Text 1'),
        ]);

        // Get the element to get patched
        const element = oldNode.render();

        expect(element.outerHTML).toEqual('<ul><li key=\"3\">Text 3</li><li key=\"1\">Text 1</li></ul>');

        const newNode = createElement('ul', null, [
            //createElement('li', { key: '3' }, 'Text 3') removed
            createElement('li', { key: '1' }, 'Text 1'),
            createElement('li', { key: '2' }, 'Text 2'),
        ]);

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
                        attributes:
                        {
                            key: '2'
                        },
                        children:
                        (VirtualText) {
                            text: 'Text 2'
                        }
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

        patches.apply(element);

        expect(element.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"2\">Text 2</li></ul>');
    });

    it("diff a node with keyed children. Swap children and add one in the middle", () => {

        const oldNode = createElement('ul', null, [
            createElement('li', { key: '1' }, 'Text 1'),
            createElement('li', { key: '2' }, 'Text 2')
        ]);

        // Get the element to get patched
        const element = oldNode.render();

        expect(element.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"2\">Text 2</li></ul>');

        const newNode = createElement('ul', null, [
            createElement('li', { key: '2' }, 'Text 2'),
            createElement('li', { key: '3' }, 'Text 3'),
            createElement('li', { key: '1' }, 'Text 1')

        ]);

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
                        attributes:
                        {
                            key: '3'
                        },
                        children:
                        (VirtualText) {
                            text: 'Text 3'
                        }
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
                _original:
                {}
            }
        }`);

        patches.apply(element);

        expect(element.outerHTML).toEqual('<ul><li key=\"2\">Text 2</li><li key=\"3\">Text 3</li><li key=\"1\">Text 1</li></ul>');
    });

    it("diff a node with keyed children. Swap children and remove one from the middle", () => {

        const oldNode = createElement('ul', null, [
            createElement('li', { key: '1' }, 'Text 1'),
            createElement('li', { key: '2' }, 'Text 2'),
            createElement('li', { key: '3' }, 'Text 3'),
        ]);

        // Get the element to get patched
        const element = oldNode.render();

        expect(element.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"2\">Text 2</li><li key=\"3\">Text 3</li></ul>');

        const newNode = createElement('ul', null, [
            createElement('li', { key: '3' }, 'Text 3'),
            //createElement('li', { key: '2' }, 'Text 2'), // remove from the middle
            createElement('li', { key: '1' }, 'Text 1')

        ]);

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
                _original:
                {}
            }
        }`);

        patches.apply(element);

        expect(element.outerHTML).toEqual('<ul><li key=\"3\">Text 3</li><li key=\"1\">Text 1</li></ul>');
    });

    it("diff a node with keyed children. Reverse children", () => {

        const oldNode = createElement('ul', null, [
            createElement('li', { key: '1' }, 'Text 1'),
            createElement('li', { key: '2' }, 'Text 2'),
            createElement('li', { key: '3' }, 'Text 3'),
            createElement('li', { key: '4' }, 'Text 4'),
            createElement('li', { key: '5' }, 'Text 5'),
        ]);

        // Get the element to get patched
        const element = oldNode.render();

        expect(element.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"2\">Text 2</li><li key=\"3\">Text 3</li><li key=\"4\">Text 4</li><li key=\"5\">Text 5</li></ul>');

        const newNode = createElement('ul', null, [
            createElement('li', { key: '5' }, 'Text 5'),
            createElement('li', { key: '4' }, 'Text 4'),
            createElement('li', { key: '3' }, 'Text 3'),
            createElement('li', { key: '2' }, 'Text 2'),
            createElement('li', { key: '1' }, 'Text 1')

        ]);

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
                _original:
                {}
            }
        }`);

        patches.apply(element);

        expect(element.outerHTML).toEqual('<ul><li key=\"5\">Text 5</li><li key=\"4\">Text 4</li><li key=\"3\">Text 3</li><li key=\"2\">Text 2</li><li key=\"1\">Text 1</li></ul>');
    });

    it("diff a node with keyed children. Combination of all the above v1", () => {

        const oldNode = createElement('ul', null, [
            createElement('li', { key: '1' }, 'Text 1'),
            createElement('li', { key: '2' }, 'Text 2'),
            createElement('li', { key: '3' }, 'Text 3'),
            createElement('li', { key: '4' }, 'Text 4')
        ]);

        // Get the element to get patched
        const element = oldNode.render();

        expect(element.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"2\">Text 2</li><li key=\"3\">Text 3</li><li key=\"4\">Text 4</li></ul>');

        const newNode = createElement('ul', null, [
            createElement('li', { key: '4' }, 'Text 4'), // swap with 1
            createElement('li', { key: '5' }, 'Text 5'), // insert middle
            // createElement('li', { key: '3' }, 'Text 3'), // remove
            createElement('li', { key: '1' }, 'Text 1'), // append
           
        ]);

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
                        attributes:
                        {
                            key: '5'
                        },
                        children:
                        (VirtualText) {
                            text: 'Text 5'
                        }
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
                _original:
                {}
            }
        }`);

        patches.apply(element);

        expect(element.outerHTML).toEqual('<ul><li key=\"4\">Text 4</li><li key=\"5\">Text 5</li><li key=\"1\">Text 1</li></ul>');
    });

    it("diff a node with keyed children. Combination of all the above", () => {

        const oldNode = createElement('ul', null, [
            createElement('li', { key: '1' }, 'Text 1'),
            createElement('li', { key: '2' }, 'Text 2'),
            createElement('li', { key: '3' }, 'Text 3'),
            createElement('li', { key: '4' }, 'Text 4'),
            createElement('li', { key: '5' }, 'Text 5'),
            createElement('li', { key: '6' }, 'Text 6'),
            createElement('li', { key: '7' }, 'Text 7'),
            createElement('li', { key: '8' }, 'Text 8'),
            createElement('li', { key: '9' }, 'Text 9')
        ]);

        // Get the element to get patched
        const element = oldNode.render();

        expect(element.outerHTML).toEqual('<ul><li key=\"1\">Text 1</li><li key=\"2\">Text 2</li><li key=\"3\">Text 3</li><li key=\"4\">Text 4</li><li key=\"5\">Text 5</li><li key=\"6\">Text 6</li><li key=\"7\">Text 7</li><li key=\"8\">Text 8</li><li key=\"9\">Text 9</li></ul>');

        const newNode = createElement('ul', null, [
            createElement('li', { key: '11' }, 'Text 11'), // preppend
            createElement('li', { key: '8' }, 'Text 8'), // swap with 3
            createElement('li', { key: '4' }, 'Text 4'),
            createElement('li', { key: '12' }, 'Text 12'), // insert in the middle
            createElement('li', { key: '7' }, 'Text 7'),
            createElement('li', { key: '3' }, 'Text 3'), // swap with 8
            createElement('li', { key: '13' }, 'Text 13'), // insert at the end
        ]);

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
                        attributes:
                        {
                            key: '11'
                        },
                        children:
                        (VirtualText) {
                            text: 'Text 11'
                        }
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
                        attributes:
                        {
                            key: '12'
                        },
                        children:
                        (VirtualText) {
                            text: 'Text 12'
                        }
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
                        attributes:
                        {
                            key: '13'
                        },
                        children:
                        (VirtualText) {
                            text: 'Text 13'
                        }
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
                _original:
                {}
            }
        }`);

        patches.apply(element);

        expect(element.outerHTML).toEqual('<ul><li key=\"11\">Text 11</li><li key=\"8\">Text 8</li><li key=\"4\">Text 4</li><li key=\"12\">Text 12</li><li key=\"7\">Text 7</li><li key=\"3\">Text 3</li><li key=\"13\">Text 13</li></ul>');
    });

});