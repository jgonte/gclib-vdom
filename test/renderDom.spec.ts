import h from '../src/h';
import { Fragment } from '../src/nodes/FragmentNode';
import ComponentNode from '../src/nodes/ComponentNode';
import ElementNode from '../src/nodes/ElementNode';
import TextNode from '../src/nodes/TextNode';

describe("renderDom tests", () => {

    it("creates an element from a virtual node with the name of the element", () => {

        const node = h('div', null);

        const element = node.renderDom();

        expect(element.outerHTML).toEqual('<div></div>');
    });

    it("creates an element from a virtual node with the name of the element and attributes", () => {

        const node = h('div', {
            id: 'myElement',
            class: "class1 class2",
            style: "color: red;"
        });

        const element = node.renderDom();

        expect(element.outerHTML).toEqual('<div id=\"myElement\" class=\"class1 class2\" style=\"color: red;\"></div>');
    });

    it("creates an element from a virtual node with the name of the element and children", () => {

        const node = h('div', null,
            h('img', {
                src: 'http://images/image.gif'
            }),

            h('div', null,
                h('span', null, 'Some text')
            )
        );

        const element = node.renderDom();

        expect(element.outerHTML).toEqual('<div><img src=\"http://images/image.gif\"/><div><span>Some text</span></div></div>');
    });

    it("creates an element from a virtual node with the name of the element, attributes and children", () => {

        const node = h('div', { id: 'myElement' },

            h('img', {
                src: 'http://images/image.gif'
            }),

            h('span', null, 'Some text')
        );

        const element = node.renderDom();

        expect(element.outerHTML).toEqual('<div id=\"myElement\"><img src=\"http://images/image.gif\"/><span>Some text</span></div>');
    });

    it("creates an externally linked svg element", () => {

        const node = h('svg', null,

            h('use', {
                href: 'http://icons/icons.svg#my-icon'
            })
        );

        const element = node.renderDom();

        expect(element.outerHTML).toEqual('<svg><use href=\"http://icons/icons.svg#my-icon\"/></svg>');
    });

    it("creates an element from a virtual node with a undefined class", () => {

        const node = h('div', {
            class: undefined
        }, 'Some text');

        const element = node.renderDom();

        expect(element.outerHTML).toEqual('<div>Some text</div>');
    });

    it("creates an element from a virtual node with a null class", () => {

        const node = h('div', {
            class: null
        }, 'Some text');

        const element = node.renderDom();

        expect(element.outerHTML).toEqual('<div>Some text</div>');
    });

    it("creates an element from a virtual node with an object class", () => {

        const visible = true;

        const count: number = 4;

        const node = h('div', {
            class: {
                'visible': visible,
                'three': count === 3,
                'four': count === 4
            }
        }, 'Some text');

        const element = node.renderDom();

        expect(element.outerHTML).toEqual('<div class=\"visible four\">Some text</div>');
    });

    it("creates an element from a virtual node with a undefined style", () => {

        const node = h('div', {
            style: undefined
        }, 'Some text');

        const element = node.renderDom();

        expect(element.outerHTML).toEqual('<div>Some text</div>');
    });

    it("creates an element from a virtual node with a null style", () => {

        const node = h('div', {
            style: null
        }, 'Some text');

        const element = node.renderDom();

        expect(element.outerHTML).toEqual('<div>Some text</div>');
    });

    it("creates an element from a virtual node with a style object", () => {

        const style = {
            width: '1px',
            height: '1px',
            backgroundColor: 'red',
            transform: 'rotateZ(45deg)'
        };

        const node = h('div', {
            style
        }, 'Some text');

        const element = node.renderDom();

        expect(element.outerHTML).toEqual('<div style=\"width:1px;height:1px;background-color:red;transform:rotateZ(45deg);\">Some text</div>');
    });

    it("creates an element from a virtual node with an empty class", () => {

        const childNode = h("span", null, "My title");

        const node = h("div", { child: childNode });

        const element = node.renderDom();

        // Property is an object so it is serialized to JSON
        expect(element.outerHTML).toEqual('<div child=\"{&#x22;name&#x22;:&#x22;span&#x22;,&#x22;props&#x22;:null,&#x22;children&#x22;:[{&#x22;text&#x22;:&#x22;My title&#x22;,&#x22;isText&#x22;:true}],&#x22;isElement&#x22;:true}\"></div>'); 
    });

    it("creates an element with event no capture", () => {

        const onClick = () => alert('event');

        const node = h("div", { onClick });

        const element = node.renderDom();

        expect(element.outerHTML).toEqual('<div></div>');

        // Test the listener is being tracked to we can remove it when needed
        const trackedListener = (element as any)._trackedListeners['onClick'];

        const {
            eventName,
            value,
            useCapture

        } = trackedListener;

        expect(eventName).toEqual('click');

        expect(value).toEqual(onClick);

        expect(useCapture).toEqual(false);

        // Test the listener was added
        const listener = (element as any)._listeners[eventName];

        expect(listener).toEqual([onClick]);

        // Use the tracked listener to remove the real one
        element.removeEventListener(eventName, value, useCapture);

        // Test the listener was removed
        (element as any)._listeners[eventName].length === 0;
    });

    it("creates an element with event with capture", () => {

        const onClick = () => alert('event');

        const node = h("div", { onClick_capture: onClick });

        const element = node.renderDom();

        expect(element.outerHTML).toEqual('<div></div>');

        // Test the listener is being tracked to we can remove it when needed
        const trackedListener = (element as any)._trackedListeners['onClick_capture'];

        const {

            eventName,
            value,
            useCapture

        } = trackedListener;

        expect(eventName).toEqual('click');

        expect(value).toEqual(onClick);

        expect(useCapture).toEqual(true);

        // Test the listener was added
        const listener = (element as any)._listeners[eventName];

        expect(listener).toEqual([onClick]);

        // Use the tracked listener to remove the real one
        element.removeEventListener(eventName, value, useCapture);

        // Test the listener was removed
        (element as any)._listeners[eventName].length === 0;
    });

    it("creates a Fragment with two children", () => {

        const open = false;

        const node = h(Fragment as any,
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
            h("td", null, "World")
        );

        const element = node.renderDom();

        var div = document.createElement('div');

        div.appendChild(element);

        // Notice that the properties of the fragment were not set in the parent div since that is done in nodeDidConnect

        expect(div.outerHTML).toEqual('<div><td>Hello</td><td>World</td></div>');
    });

    it("creates an element with a Fragment with two children", () => {

        const node = h("div",
            null,
            h(Fragment as any,
                null,
                h("td", null, "Hello"),
                h("td", null, "World")
            )
        );

        const element = node.renderDom();

        expect(element.outerHTML).toEqual('<div><td>Hello</td><td>World</td></div>');
    });

    it("creates an element with an array of children being passed to h", () => {

        const columns = [
            {
                title: 'Title 1'
            },
            {
                title: 'Title 2'
            },
            {
                title: 'Title 3'
            }
        ];

        const node = h("thead", null,
            h("tr", null,
                columns.map(c => {
                    return h("th", null, c.title);
                }) as any
            )
        );

        const element = node.renderDom();

        expect(element.outerHTML).toEqual('<thead><tr><th>Title 1</th><th>Title 2</th><th>Title 3</th></tr></thead>');
    });

    it("creates a component", () => {

        class MyComponent {

            value: string = "Some text"

            open: boolean = false;

            render(): ElementNode | TextNode {

                return h('span', {
                    'aria-hidden': this.open ? 'false' : 'true',
                    class: {
                        'todo-list': true,
                        'is-open': this.open
                    },
                    style: {
                        width: '1px',
                        height: '1px',
                        backgroundColor: 'red',
                        transform: 'rotateZ(45deg)'
                    }
                }, this.value);
            }
        }

        const node = h(MyComponent as any, null);

        const element = node.renderDom();

        expect(element.outerHTML).toEqual('<span aria-hidden=\"true\" class=\"todo-list\" style=\"width:1px;height:1px;background-color:red;transform:rotateZ(45deg);\">Some text</span>');
    });

    it("creates a virtual node from a functional component", () => {

        let node1;

        let node2;

        class MyComponent extends ComponentNode {

            render() {

                return h('span', null, 'child')
            }

            nodeWillConnect(node: Node) {

                node1 = node;
            }

            nodeDidConnect(node: Node) {

                node2 = node;
            }
        }

        const fc = new MyComponent(null, undefined);

        const node = h('div', null, fc);

        expect(node.name).toEqual('div');

        expect(node.props).toEqual(null);

        expect(node.children).toEqual([
            {
                "children": [
                    {
                        "isText": true,
                        "text": "child",
                    }
                ],
                "component": fc,
                "isElement": true,
                "name": "span",
                "props": null
            }
        ]);

        const element = node.renderDom();

        expect(element.outerHTML).toEqual('<div><span>child</span></div>');

        expect((element.children[0] as any).component).toEqual(fc);

        expect(element.children[0]).toEqual(node1);

        expect(element.children[0]).toEqual(node2);
    });
});