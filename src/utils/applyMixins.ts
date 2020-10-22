class FunctionList {

    private functions: Array<Function> = [];

    addFunction(fcn: Function): void {

        this.functions.push(fcn);
    }

    /**
     * Generates a wrapper function that calls the chain of functions
     */
    generateWrapper(): Function {

        const me = this; // this -> FunctionList

        return function () {

            const args: IArguments = arguments;

            //@ts-ignore
            me.functions.reverse().forEach(fcn => fcn.apply(this, args)); // this -> who binds this function
        }
    }
}

export default function applyMixins(derivedCtor: any, baseCtors: any[]) : any {

    let propertyNames: Array<string> = Object.getOwnPropertyNames(derivedCtor.prototype);

    const chainedFunctions = new Map<string, FunctionList | undefined>();

    baseCtors.forEach(baseCtor => {

        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {

            const descriptor = Object.getOwnPropertyDescriptor(baseCtor.prototype, name);

            if (propertyNames.includes(name)) { // A property exists in the derived protytype

                //console.log(`Property of name: '${name}' exists in prototype of constructor: '${derivedCtor.name}'`);

                const value = descriptor!.value;

                if (typeof value === 'function') {

                    let chainedFunction = chainedFunctions.get(name);

                    if (typeof chainedFunction === 'undefined') {

                        chainedFunction = new FunctionList();

                        // Add the function of the derived constructor
                        const derivedDescriptor = Object.getOwnPropertyDescriptor(derivedCtor.prototype, name);

                        // Could not be a function
                        if (typeof derivedDescriptor!.value !== 'function') {

                            throw new Error(`Property of name: '${name}' in prototype: '${name}' is not a function`);
                        }

                        chainedFunction.addFunction(derivedDescriptor!.value);

                        // Add the function of the mixin one
                        chainedFunction.addFunction(value);

                        chainedFunctions.set(name, chainedFunction);
                    }
                    else {

                        // Add the function of the mixin one
                        chainedFunction.addFunction(value);
                    }
                }
                else {

                    throw Error('Not implemented');
                }
            }
            else {

                Object.defineProperty(derivedCtor.prototype, name, <PropertyDescriptor & ThisType<any>>descriptor);

                // Update the list of properties
                propertyNames = Object.getOwnPropertyNames(derivedCtor.prototype);
            }
        });
    });

    // We have all the chained functions built
    // Lets replace the original functions in the protoype of the derived constructor with the wrappers
    chainedFunctions.forEach((chainedFunction, name) => {

        if (name !== 'constructor') { // We process the constructor after add the members to the prototype

            derivedCtor.prototype[name] = chainedFunction!.generateWrapper();
        }       
    });

    const ctorChainedFunction = chainedFunctions.get('constructor');

    if (typeof ctorChainedFunction !== 'undefined') {

        const prototype = derivedCtor.prototype; // Keep the previous prototype

        derivedCtor = ctorChainedFunction!.generateWrapper(); // Replace constructor function

        derivedCtor.prototype = prototype; // Restore previous prototype
    }

    return derivedCtor;
}