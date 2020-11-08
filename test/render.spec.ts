import h from "../src/h";
//import { Component } from "../src/component/Component";
//import { VirtualNode, VirtualText } from "../src/gclib-vdom";

describe("render tests", () => {

    it("creates an HTMLElement from a virtual node with the name of the element", () => {

        const node = h('div', null);

        const element = node.render();

        expect(element.outerHTML).toEqual('<div></div>');
    });

    it("creates an HTMLElement from a virtual node with the name of the element and attributes", () => {

        const node = h('div', {
            id: 'myElement',
            class: "class1 class2",
            style: "color: red;"
        });

        const element = node.render();

        expect(element.outerHTML).toEqual('<div id=\"myElement\" class=\"class1 class2\" style=\"color: red;\"></div>');
    });

    it("creates an HTMLElement from a virtual node with the name of the element and children", () => {

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

    it("creates an HTMLElement from a virtual node with the name of the element, attributes and children", () => {

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

    // it("creates a component", () => {

    //     class MyComponent extends Component {

    //         value: string = "Some text"

    //         render(): VirtualNode | VirtualText {

    //             return h('span', null, this.value);
    //         }
    //     }

    //     const node = h(MyComponent, null);

    //     const element = node.render();

    //     expect(element.outerHTML).toEqual('<span>Some text</span>');
    // });
});