/**
 * When a child is removed from the DOM, the collection shrinks so we need an object
 * that manages the offsets according to the number of children set or removed at a given time
 */
export default class OffsetManager {

    // The indexes where the elements were moved from so we can determine the offset to shrinkage
    private _movedFromIndexes: number[] = [];

    /**
     * Sets an index when an element was removed
     * @param index 
     */
    addRemoved(index: number) {

        this._movedFromIndexes.push(index);
    }

    /**
     *  Retrieves the offset
     * @param index
     */
    getOffset(index: number): number {

        return this._movedFromIndexes.filter(i => i < index).length;
    }

}