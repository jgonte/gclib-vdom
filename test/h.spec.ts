import h from '../src/h';
import ComponentNode from '../src/nodes/ComponentNode';
import ElementNode from '../src/nodes/ElementNode';
import TextNode from '../src/nodes/TextNode';


describe("h tests", () => {

    it("creates a virtual node with the name of the element", () => {

        const node = h('div', null);

        expect(node.name).toEqual('div');

        expect(node.props).toEqual(null);

        expect(node.children).toEqual([]);
    });

    it("creates a virtual node with the name of the element and props", () => {

        const node = h('div', {
            id: 'myElement'
        });

        expect(node.name).toEqual('div');

        expect(node.props).toEqual({
            id: 'myElement'
        });

        expect(node.children).toEqual([]);
    });

    it("creates a virtual node with the name of the element and children", () => {

        const node = h('div', null,
            h('img', {
                src: 'http://images/image.gif'
            }),
            h('div', null,
                h('span', null, 'Some text')
            )
        );

        expect(node.name).toEqual('div');

        expect(node.props).toEqual(null);

        expect((node.children as ElementNode[])!.length).toEqual(2);

        let child = (node.children as ElementNode[])![0];

        expect(child.name).toEqual('img');

        expect(child.props).toEqual({
            src: 'http://images/image.gif'
        });

        expect(child.children).toEqual([]);

        child = (node.children as ElementNode[])![1];

        expect(child.name).toEqual('div');

        expect(child.props).toEqual(null);

        expect((child.children as ElementNode[])!.length).toEqual(1);

        const grandChild = (child.children as ElementNode[])![0];

        expect(grandChild.name).toEqual('span');

        expect(grandChild.props).toEqual(null);

        expect(grandChild.children).toEqual([{
            "isText": true,
            "text": "Some text"
        }]);
    });

    it("creates a virtual node with the name of the element, props and children", () => {

        const node = h('div',
            {
                id: 'myElement'
            },
            h('img', {
                src: 'http://images/image.gif'
            }),

            h('span', null, 'Some text')
        );

        expect(node.name).toEqual('div');

        expect(node.props).toEqual({
            id: 'myElement'
        });

        expect((node.children as ElementNode[])!.length).toEqual(2);

        let child = (node.children as ElementNode[])![0];

        expect(child.name).toEqual('img');

        expect(child.props).toEqual({
            src: 'http://images/image.gif'
        });

        expect(child.children).toEqual([]);

        child = (node.children as ElementNode[])![1];

        expect(child.name).toEqual('span');

        expect(child.props).toEqual(null);

        expect(child.children).toEqual([{
            "isText": true,
            "text": "Some text"
        }]);
    });

    it("creates a virtual node with the name of the element, props and children", () => {

        let count: number = 5;

        const increment = () => ++count;

        const node = h("div", null,
            h("h4", null, "Counter"),
            count,
            h("button", { click: increment }, "Increment")
        );

        expect(node.name).toEqual('div');

        expect(node.props).toEqual(null);

        expect((node.children as ElementNode[])!.length).toEqual(3);

        let child: any = (node.children as ElementNode[])![0];

        expect(child.name).toEqual('h4');

        expect(child.props).toEqual(null);

        expect(child.children).toEqual([{
            "isText": true,
            "text": "Counter"
        }]);

        child = (node.children as TextNode[])![1];

        expect(child).toEqual(new TextNode(5));

        child = (node.children as ElementNode[])![2];

        expect(child.name).toEqual('button');

        expect(child.props).toEqual({ click: increment });

        expect(child.children).toEqual([{
            "isText": true,
            "text": "Increment"
        }]);
    });

    it("creates a virtual node with the name of the element, props and an array of children", () => {

        const renderErrors = () => ['error1', 'error2', 'error3'].map(error => h("div", null, error));

        let count: number = 5;

        const increment = () => ++count;

        const node = h("div", null,
            h("h4", null, "Counter"),
            count,
            renderErrors() as any,
            h("button", { click: increment }, "Increment")
        );

        expect(node.name).toEqual('div');

        expect(node.props).toEqual(null);

        expect((node.children as ElementNode[])!.length).toEqual(6);

        let child: any = (node.children as ElementNode[])![0];

        expect(child.name).toEqual('h4');

        expect(child.props).toEqual(null);

        expect(child.children).toEqual([{
            "isText": true,
            "text": "Counter"
        }]);

        child = (node.children as TextNode[])![1];

        expect(child).toEqual(new TextNode(5));

        child = (node.children as ElementNode[])![2];

        expect(child.name).toEqual('div');

        child = (child.children as TextNode[])![0];

        expect(child).toEqual(new TextNode('error1'));

        child = (node.children as ElementNode[])![3];

        expect(child.name).toEqual('div');

        child = (child.children as TextNode[])![0];

        expect(child).toEqual(new TextNode('error2'));

        child = (node.children as ElementNode[])![4];

        expect(child.name).toEqual('div');

        child = (child.children as TextNode[])![0];

        expect(child).toEqual(new TextNode('error3'));

        child = (node.children as ElementNode[])![5];

        expect(child.name).toEqual('button');

        expect(child.props).toEqual({ click: increment });

        expect(child.children).toEqual([{
            "isText": true,
            "text": "Increment"
        }]);
    });

    it("creates a virtual node from a functional component", () => {

        class MyComponent extends ComponentNode {

            render() {

                return h('span', null, 'child')
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
    });
    
});