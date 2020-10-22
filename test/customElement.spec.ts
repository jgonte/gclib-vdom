import h from "../src/h";
import CustomElement from "../src/customElement/CustomElement";
import { VirtualNode, VirtualText } from "../src/gclib-vdom";
import component from "../src/customElement/decorators/component";
import property from "../src/customElement/decorators/property";

describe("custom element tests", () => {

    // it('should define a custom element', () => {

    //     @component({ tag: 'ce-1' })
    //     class MyCustomElement extends CustomElement {

    //         @property()
    //         value: string = "Some text";
        
    //         render(): VirtualNode | VirtualText {
        
    //             return h('span', null, this.value);
    //         }

    //         onBeforeMount(node: Node) {

    //             (node as HTMLElement).setAttribute('class', 'custom');
    //         }
    //     }
        
    //     const node = h('my-custom-element', null);

    //     const element = node.render() as CustomElement;

    //     expect(element.outerHTML).toEqual('<my-custom-element></my-custom-element>');    
        
    //     document.body.appendChild(element);

    //     const customElement = document.body.lastElementChild! as CustomElement;

    //     expect(customElement.tagName).toBe('MY-CUSTOM-ELEMENT');

    //     //expect((customElement as any).value).toBe("Some text");

    //     //expect((customElement.rootElement as HTMLElement).outerHTML).toBe('');
    // });


    it("simple custom HTML element", () => {

        class MyCustomElement extends CustomElement {

            value: string = "Some text";
        
            render(): VirtualNode | VirtualText {
        
                return h('span', null, this.value);
            }
        }
        
        customElements.define('my-custom-element', MyCustomElement as any);

        const node = h('my-custom-element', null);

        const element = node.render() as typeof CustomElement;

        expect(element.outerHTML).toEqual('<my-custom-element></my-custom-element>');      
        
        const spyUpdate = jest.spyOn(element as any, 'update');

        const spyOnBeforeMount = jest.spyOn(element as any, 'nodeWillConnect');

        document.body.appendChild(element);

        expect(spyUpdate).toHaveBeenCalledTimes(1);

        expect(spyOnBeforeMount).toHaveBeenCalledTimes(1);

    });

});