import applyMixins from '../src/utils/applyMixins';

describe("mixin tests", () => {

    it("it should create wrapper methods to call methods with same names in mixins", () => {

        abstract class Callable {

            constructor() {

                console.log('Callable constructor');
            }

            call() {
                console.log("call from Callable!")
            }
        }

        abstract class Activable {
            active: boolean = false
            activate() {
                this.active = true
                console.log("Activating…")
            }
            abstract deactivate(): void;

            call() {
                console.log("call from Activable!")
            }
        }

        class MyClass {
            constructor() {

                console.log('MyClass constructor')
            }

            deactivate() {
                this.active = false
                console.log("Deactivating…")
            }
        }

        interface MyClass extends Callable, Activable { }

        const MyClassWithMixins = applyMixins(MyClass, [Callable, Activable]);

        const myClass = new MyClassWithMixins();

        const spyCall = jest.spyOn(myClass, 'call');

        myClass.call();

        expect(spyCall).toHaveBeenCalledTimes(1);

        const spyActivate = jest.spyOn(myClass, 'activate');

        myClass.activate();

        expect(spyActivate).toHaveBeenCalledTimes(1);

        const spyDeactivate = jest.spyOn(myClass, 'deactivate');

        myClass.deactivate();

        expect(spyDeactivate).toHaveBeenCalledTimes(1);
    });

});