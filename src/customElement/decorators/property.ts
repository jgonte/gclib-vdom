import CustomElement from "../CustomElement";
import CustomElementMixin from "../CustomElementMixin";
import CustomPropertyDescriptor from "../CustomPropertyDescriptor";
import { CustomHTMLElementConstructor } from "./component";

/**
 * Options for the attribute decorator
 */
interface PropertyOptions {

    name: string;

    type: Function;

    value?: any;

    reflect?: boolean;
}

export default function property(options?: PropertyOptions) {

    const { name, type, value, reflect } = options || {};

    return function (target: any | CustomElementMixin, propertyKey: string) {

        const propDescriptors = (target.constructor as CustomHTMLElementConstructor).propDescriptors || [];

        propDescriptors.push(
            new CustomPropertyDescriptor(
                /*name*/
                propertyKey,
                /*type*/
                type,
                /*value*/
                value,
                /*attributeName*/
                name || propertyKey,
                /*reflect*/
                reflect
            )
        );
    }
}