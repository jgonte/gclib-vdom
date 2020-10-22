import CustomElement from "../CustomElement";
import CustomPropertyDescriptor from "../CustomPropertyDescriptor";

export function createProperty(prototype: any, descriptor: CustomPropertyDescriptor) {

    const { name, value, attribute } = descriptor;

    // Define the internal property to hold the value
    const internalName: string = `_${name}`;

    Object.defineProperty(prototype, internalName, {
        writable: true,
        value: value || null,
        enumerable: false,
        configurable: false
    });

    // Define the flag to determine whether the property was read from the attributes
    const propertyReadName: string = `_${name}Read`;

    Object.defineProperty(prototype, propertyReadName, {
        writable: true,
        value: false,
        enumerable: false,
        configurable: false
    });

    Object.defineProperty(prototype, name, {
        get: function () {

            if (!(this as any)[propertyReadName]) {

                let value: string | null = (this as any).getAttribute(attribute!);

                if (descriptor.type === Boolean &&
                    value === '') {
                    value = 'true';
                }
                else if ((descriptor.type === Object || descriptor.type === Array) &&
                    typeof value === 'string') {

                    try {

                        value = JSON.parse(value); // Deserialize the JSON value
                    }
                    catch (error) {

                        // It might be a legitimate string value that is not JSON
                    }
                }

                if (value) {

                    (this as any)[internalName] = value;
                }

                (this as any)[propertyReadName] = true; // Flag as read
            }

            return (this as any)[internalName];
        },
        set: function (value: string) {

            if ((this as any)[internalName] !== value) {

                (this as any)[internalName] = value;

                if (descriptor.reflect) {

                    (this as any).setAttribute(attribute!, value);
                }
            }
        },
        enumerable: true,
        configurable: true
    });
}
