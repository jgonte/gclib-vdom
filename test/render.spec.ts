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

    it("creates an externally linked svg element with xlink:href", () => {

        const node = h('svg', null,

            h('use', {
                xlinkHref: 'http://icons/icons.svg#my-icon'
            })
        );

        const element = node.render();

        expect(element.outerHTML).toEqual('<svg><use xlink:href=\"http://icons/icons.svg#my-icon\"/></svg>');
    });

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

        expect(element.outerHTML).toEqual('<div></div>');

        expect((element as any).child).toEqual(childNode);
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
});