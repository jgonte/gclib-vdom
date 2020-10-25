import CustomElement from "../CustomElement";

export default function callMixins(element: any, fcnName: string, node: Node) {

    const mixins = (element?.constructor as any)?.mixins || [];

    mixins.forEach((mixin: any) => {

        if (mixin[fcnName]) {

            mixin[fcnName].call(element, node);
        }
    });

}