import { IDX } from '../constants.js';


export class Shape {

    constructor () {

        this.id = IDX.get('shape');
        this.segments = [];
        
    }

    dispose () {

        while(this.segments.length > 0) this.segments.pop().dispose();
        this.segments = null;

    }

}
