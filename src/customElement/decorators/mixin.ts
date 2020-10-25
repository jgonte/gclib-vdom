export interface MixinOptions {

    type: Function;
    
    excludedProperties?: Set<string>;
}

export default function mixin(options: MixinOptions) : ClassDecorator {

    const { 
        type,
        excludedProperties
    } = options;

    return (ctor: any) => {

        ctor.mixins = ctor.mixins || [];

        console.log(`Mixin type: '${type}'`);

        ctor.mixins.push(type); // Add the collection of mixins

        // Object.getOwnPropertyNames(type.prototype).forEach((name) => {

        //     // Do not overwrite the following properties
        //     if (!excludedProperties?.has(name)) {

        //         Object.defineProperty(
        //             ctor.prototype,
        //             name,
        //             Object.getOwnPropertyDescriptor(type.prototype, name)!
        //         );
        //     }
        // });
    };
}