import h from '../src/h';
import VirtualNode from '../src/nodes/VirtualNode';
import VirtualText from '../src/nodes/VirtualText';

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

        expect((node.children as VirtualNode[])!.length).toEqual(2);

        let child = (node.children as VirtualNode[])![0];

        expect(child.name).toEqual('img');

        expect(child.props).toEqual({
            src: 'http://images/image.gif'
        });

        expect(child.children).toEqual([]);

        child = (node.children as VirtualNode[])![1];

        expect(child.name).toEqual('div');

        expect(child.props).toEqual(null);

        expect((child.children as VirtualNode[])!.length).toEqual(1);

        const grandChild = (child.children as VirtualNode[])![0];

        expect(grandChild.name).toEqual('span');

        expect(grandChild.props).toEqual(null);

        expect(grandChild.children).toEqual([{
            "isVirtualText": true,
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

        expect((node.children as VirtualNode[])!.length).toEqual(2);

        let child = (node.children as VirtualNode[])![0];

        expect(child.name).toEqual('img');

        expect(child.props).toEqual({
            src: 'http://images/image.gif'
        });

        expect(child.children).toEqual([]);

        child = (node.children as VirtualNode[])![1];

        expect(child.name).toEqual('span');

        expect(child.props).toEqual(null);

        expect(child.children).toEqual([{
            "isVirtualText": true,
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

        expect((node.children as VirtualNode[])!.length).toEqual(3);

        let child: any = (node.children as VirtualNode[])![0];

        expect(child.name).toEqual('h4');

        expect(child.props).toEqual(null);

        expect(child.children).toEqual([{
            "isVirtualText": true,
            "text": "Counter"
        }]);

        child = (node.children as VirtualText[])![1];

        expect(child).toEqual(new VirtualText(5));

        child = (node.children as VirtualNode[])![2];

        expect(child.name).toEqual('button');

        expect(child.props).toEqual({ click: increment });

        expect(child.children).toEqual([{
            "isVirtualText": true,
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

        expect((node.children as VirtualNode[])!.length).toEqual(6);

        let child: any = (node.children as VirtualNode[])![0];

        expect(child.name).toEqual('h4');

        expect(child.props).toEqual(null);

        expect(child.children).toEqual([{
            "isVirtualText": true,
            "text": "Counter"
        }]);

        child = (node.children as VirtualText[])![1];

        expect(child).toEqual(new VirtualText(5));

        child = (node.children as VirtualNode[])![2];

        expect(child.name).toEqual('div');

        child = (child.children as VirtualText[])![0];

        expect(child).toEqual(new VirtualText('error1'));

        child = (node.children as VirtualNode[])![3];

        expect(child.name).toEqual('div');

        child = (child.children as VirtualText[])![0];

        expect(child).toEqual(new VirtualText('error2'));

        child = (node.children as VirtualNode[])![4];

        expect(child.name).toEqual('div');

        child = (child.children as VirtualText[])![0];

        expect(child).toEqual(new VirtualText('error3'));

        child = (node.children as VirtualNode[])![5];

        expect(child.name).toEqual('button');

        expect(child.props).toEqual({ click: increment });

        expect(child.children).toEqual([{
            "isVirtualText": true,
            "text": "Increment"
        }]);
    });

    it("creates a virtual node from a functional component", () => {

        class FC {

            render() {

                return h('span', null, 'child')
            }
        }

        const fc = new FC();

        const node = h('div', null, fc);

        expect(node.name).toEqual('div');

        expect(node.props).toEqual(null);

        expect(node.children).toEqual([
            {
                "children": [
                    {
                        "isVirtualText": true,
                        "text": "child",
                    }
                ],
                "functionalComponent": fc,
                "isVirtualNode": true,
                "name": "span",
                "props": null
            }
        ]);
    });
    
});