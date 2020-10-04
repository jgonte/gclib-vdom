import PatchingContext from "./helpers/PatchingContext";

export abstract class Patch {

    abstract applyPatch(
        parentNode: ShadowRoot | Node | Document, 
        node?: Node | null, 
        context?: PatchingContext): void;
}