import VirtualNode from "../nodes/VirtualNode";
import VirtualText from "../nodes/VirtualText";
import applyMixins from "../utils/applyMixins";
import { getAllConstructors } from "./helpers/getAllConstructors";
import { createProperty } from "./helpers/createProperty";
import CustomPropertyDescriptor from "./CustomPropertyDescriptor";
import { CustomHTMLElementConstructor } from "./decorators/component";
import VirtualDomComponent from "../VirtualDomComponent";

abstract class CustomElement extends HTMLElement {

    constructor() {

        super();

        (this as any).bindLifecycleCallbacks();

        this.attachShadow({ mode: "open" });
    }

    abstract render(): VirtualNode | VirtualText;

    /**
     * Static initialization
     */
    static get observedAttributes() {

        console.log('observedAttributes');

        const ctor = this.prototype.constructor as CustomHTMLElementConstructor;

        applyMixins(ctor, ctor.mixins || []);

        //this.initializeStyles(ctor);

        const _observedAttributes: Array<string> = [];

        const allConstructors = getAllConstructors(ctor);

        allConstructors.forEach(ctor => {

            // Initialize the properties
            (ctor.prototype || []).forEach((descriptor: CustomPropertyDescriptor) => {

                createProperty(this.prototype, descriptor as CustomPropertyDescriptor);

                //_observedAttributes.push(descriptor.attribute);
            });

            // Initialize the states
            // (ctor["_stateDescriptors"] || []).forEach(descriptor => {

            //     this.createStateProperty(this.prototype, descriptor);
            // });
        });

        return _observedAttributes;
    }

    connectedCallback() {

        (this as any).update(); // First update
    }

    get rootElement() {

        return this.shadowRoot!.lastChild;
    }
}

interface CustomElement extends HTMLElement, VirtualDomComponent { }

export default applyMixins(CustomElement, [VirtualDomComponent]);