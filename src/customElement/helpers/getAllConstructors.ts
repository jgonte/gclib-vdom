/**
 * Retrieves all the mixins for the derived constructor plus all the base constructors and their mixins up to the CustomElement one
 * @param ctor The constructor to retrieve the base one with the mixins
 */
export function getAllConstructors(ctor: any): Array<any> {

    const ctors: Array<any> = [];

    do {

        if (ctor.name === 'CustomElement') {

            break;
        }

        ctors.push(ctor);

        (ctor.mixins || []).forEach((mixin: any) => {

            ctors.push(mixin);
        });

        ctor = Object.getPrototypeOf(ctor);

    } while (true);

    return ctors;
}