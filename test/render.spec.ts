import h from "../src/h";
import { Fragment } from "../src/nodes/FragmentNode";

describe("render tests", () => {

    it("creates an element from a virtual node with the name of the element", () => {

        const node = h('div', null);

        const element = node.render();

        expect(element.outerHTML).toEqual('<div></div>');
    });

    it("creates an element from a virtual node with the name of the element and attributes", () => {

        const node = h('div', {
            id: 'myElement',
            class: "class1 class2",
            style: "color: red;"
        });

        const element = node.render();

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

        const element = node.render();

        expect(element.outerHTML).toEqual('<div><img src=\"http://images/image.gif\"/><div><span>Some text</span></div></div>');
    });

    it("creates an element from a virtual node with the name of the element, attributes and children", () => {

        const node = h('div', { id: 'myElement' },

            h('img', {
                src: 'http://images/image.gif'
            }),

            h('span', null, 'Some text')
        );

        const element = node.render();

        expect(element.outerHTML).toEqual('<div id=\"myElement\"><img src=\"http://images/image.gif\"/><span>Some text</span></div>');
    });

    it("creates an externally linked svg element", () => {

        const node = h('svg', null,

            h('use', {
                href: 'http://icons/icons.svg#my-icon'
            })
        );

        const element = node.render();

        expect(element.outerHTML).toEqual('<svg><use href=\"http://icons/icons.svg#my-icon\"/></svg>');
    });

    // it("creates an externally linked svg element with xlink:href", () => {

    //     const node = h('svg', null,

    //         h('use', {
    //             xlinkHref: 'http://icons/icons.svg#my-icon'
    //         })
    //     );

    //     const element = node.render();

    //     expect(element.outerHTML).toEqual('<svg><use xlink:href=\"http://icons/icons.svg#my-icon\"/></svg>');
    // });

    it("creates an element from a virtual node with a undefined class", () => {

        const node = h('div', {
            class: undefined
        }, 'Some text');

        const element = node.render();

        expect(element.outerHTML).toEqual('<div>Some text</div>');
    });

    it("creates an element from a virtual node with a null class", () => {

        const node = h('div', {
            class: null
        }, 'Some text');

        const element = node.render();

        expect(element.outerHTML).toEqual('<div>Some text</div>');
    });

    it("creates an element from a virtual node with an empty class", () => {

        const childNode = h("span", null, "My title");

        const node = h("div", { child: childNode });

        const element = node.render();

        expect(element.outerHTML).toEqual('<div child=\"[object Object]\"></div>'); // Property is an object so that is expected by default
    });

    it("creates an element with event no capture", () => {

        const onClick = () => alert('event');

        const node = h("div", { onClick });

        const element = node.render();

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

        const element = node.render();

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

        const node = h(Fragment as any,
            null,
            h("td", null, "Hello"),
            h("td", null, "World")
        );

        const element = node.render();

        var div = document.createElement('div');

        div.appendChild(element);

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

        const element = node.render();

        expect(element.outerHTML).toEqual('<div><td>Hello</td><td>World</td></div>');
    });

    it("creates an element with a Fragment with two children", () => {

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

        const element = node.render();

        expect(element.outerHTML).toEqual('<thead><tr><th>Title 1</th><th>Title 2</th><th>Title 3</th></tr></thead>');
    });
});