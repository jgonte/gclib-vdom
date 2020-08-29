// import { Patch } from "./Patch";
// import VirtualNode from "../VirtualNode";

// /**
//  * Patch to replace the element in the DOM
//  */
// export default class ReplaceElementPatch extends Patch {

//     constructor(

//         /**
//          * The new node to replace the element
//          */
//         public newNode: VirtualNode
//     ) {
//         super();
//     }

//     apply(element: HTMLElement): void {

//         const newElement = this.newNode.render();

//         element.replaceWith(newElement);
//     }

// }