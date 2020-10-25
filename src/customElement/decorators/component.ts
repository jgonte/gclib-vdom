import CustomPropertyDescriptor from "../CustomPropertyDescriptor";

export interface ComponentOptions {

    tag: string;

    styleUrls?: Array<string>;

    mixins?: Array<Function>;
}

export interface CustomHTMLElementConstructor extends Function {
  
    styleUrls?: Array<string>;

    mixins?: Array<Function>;

    isComponentRegistered: boolean;

    propDescriptors: Array<CustomPropertyDescriptor>;
}

export default function component(options: ComponentOptions) : ClassDecorator {

    const { 
        tag, 
        styleUrls, 
        mixins 
    } = options;

    return (ctor: any) => {

        ctor.styleUrls = styleUrls;

        ctor.mixins = mixins;

        window.customElements.define(tag, ctor);

        console.log(`Defined custom element. tag: '${tag}', class: '${ctor.name}'`)
    };
}

// export function Component(options: ComponentOptions) {

//     const { tag, styleUrls, mixins } = options;

//     return function (ctor: CustomElement) {

//         // Set the style URL
//         ctor.styleUrls = styleUrls;

//         // Set the mixins
//         ctor.mixins = mixins;

//         // Set the styles loaded observer
//         //ctor['_stylesLoadedObserver'] = new Observer('onStylesLoaded');

//         // Register the component
//         if (!ctor.isComponentRegistered) {

//             // At this moment the static observedAttributes of the custom element gets called 
//             window.customElements.define(tag, ctor);

//             ctor.isComponentRegistered = true;
//         }
//     }
// }