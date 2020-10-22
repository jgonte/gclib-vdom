export default class CustomPropertyDescriptor {

    constructor(
        /**
         * The name of the property
         */
        public name: string,

        /**
         * The type of the property
         */
        public type?: Function,

        /**
         * The initial value of the property
         */
        public value?: any,

        /**
         * The name of the attribute linked to the property
         */
        public attribute?: string,

        /**
         * Whether to sync the value of the property with the attribute
         */
        public reflect?: boolean
    ) {}
}