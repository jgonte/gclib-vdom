import createElement from '../src/createElement';
import VirtualNode from '../src/nodes/VirtualNode';
import VirtualText from '../src/nodes/VirtualText';

describe("createElement tests", () => {

    it("creates a virtual node with the name of the element", () => {

        const node = createElement('div', null, null);

        expect(node.name).toEqual('div');

        expect(node.attributes).toEqual(null);

        expect(node.children).toEqual([null]);
    });

    it("creates a virtual node with the name of the element and attributes", () => {

        const node = createElement('div', {
            id: 'myElement'
        },
            null);

        expect(node.name).toEqual('div');

        expect(node.attributes).toEqual({
            id: 'myElement'
        });

        expect(node.children).toEqual([null]);
    });

    it("creates a virtual node with the name of the element and children", () => {

        const node = createElement('div', null,
            createElement('img', {
                src: 'http://images/image.gif'
            }, null),
            createElement('div', null,
                createElement('span', null, 'Some text')
            )
        );

        expect(node.name).toEqual('div');

        expect(node.attributes).toEqual(null);

        expect((node.children as VirtualNode[])!.length).toEqual(2);

        let child = (node.children as VirtualNode[])![0];

        expect(child.name).toEqual('img');

        expect(child.attributes).toEqual({
            src: 'http://images/image.gif'
        });

        expect(child.children).toEqual([null]);

        child = (node.children as VirtualNode[])![1];

        expect(child.name).toEqual('div');

        expect(child.attributes).toEqual(null);

        expect((child.children as VirtualNode[])!.length).toEqual(1);

        const grandChild = (child.children as VirtualNode[])![0];

        expect(grandChild.name).toEqual('span');

        expect(grandChild.attributes).toEqual(null);

        expect(grandChild.children).toEqual([{ "text": "Some text" }]);
    });

    it("creates a virtual node with the name of the element, attributes and children", () => {

        const node = createElement('div',
            {
                id: 'myElement'
            },
            createElement('img', {
                src: 'http://images/image.gif'
            }, null),

            createElement('span', null, 'Some text')
        );

        expect(node.name).toEqual('div');

        expect(node.attributes).toEqual({
            id: 'myElement'
        });

        expect((node.children as VirtualNode[])!.length).toEqual(2);

        let child = (node.children as VirtualNode[])![0];

        expect(child.name).toEqual('img');

        expect(child.attributes).toEqual({
            src: 'http://images/image.gif'
        });

        expect(child.children).toEqual([null]);

        child = (node.children as VirtualNode[])![1];

        expect(child.name).toEqual('span');

        expect(child.attributes).toEqual(null);

        expect(child.children).toEqual([{ "text": "Some text" }]);
    });

    it("creates a virtual node with the name of the element, attributes and children", () => {

        let count: number = 5;

        const increment = () => ++count;

        const node = createElement("div", null,
            createElement("h4", null, "Counter"),
            count,
            createElement("button", { click: increment }, "Increment")
        );

        expect(node.name).toEqual('div');

        expect(node.attributes).toEqual(null);

        expect((node.children as VirtualNode[])!.length).toEqual(3);

        let child: any = (node.children as VirtualNode[])![0];

        expect(child.name).toEqual('h4');

        expect(child.attributes).toEqual(null);

        expect(child.children).toEqual([{ "text": "Counter" }]);

        child = (node.children as VirtualText[])![1];

        expect(child).toEqual(new VirtualText(5));

        child = (node.children as VirtualNode[])![2];

        expect(child.name).toEqual('button');

        expect(child.attributes).toEqual({ click: increment });

        expect(child.children).toEqual([{ "text": "Increment" }]);
    });
});