import createElement from "../src/createElement";

describe("render tests", () => {

    it("creates an HTMLElement from a virtual node with the name of the element", () => {

        const node = createElement('div', null, null);

        const element = node.render();

        expect(element.outerHTML).toEqual('<div></div>');
    });

    it("creates an HTMLElement from a virtual node with the name of the element and attributes", () => {

        const node = createElement('div', {
            id: 'myElement',
            class: "class1 class2",
            style: "color: red;"
        }, null);

        const element = node.render();

        expect(element.outerHTML).toEqual('<div id=\"myElement\" class=\"class1 class2\" style=\"color: red;\"></div>');
    });

    it("creates an HTMLElement from a virtual node with the name of the element and children", () => {

        const node = createElement('div', null,
            createElement('img', {
                src: 'http://images/image.gif'
            }, null),

            createElement('div', null,
                createElement('span', null, 'Some text')
            )
        );

        const element = node.render();

        expect(element.outerHTML).toEqual('<div><img src=\"http://images/image.gif\"><div><span>Some text</span></div></div>');
    });

    it("creates an HTMLElement from a virtual node with the name of the element, attributes and children", () => {

        const node = createElement('div', { id: 'myElement' },

            createElement('img', {
                src: 'http://images/image.gif'
            }, null),

            createElement('span', null, 'Some text')
        );

        const element = node.render();

        expect(element.outerHTML).toEqual('<div id=\"myElement\"><img src=\"http://images/image.gif\"><span>Some text</span></div>');
    });
});