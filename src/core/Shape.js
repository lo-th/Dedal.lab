import { IDX } from '../constants';
//import { _Math } from '../math/Math';

function Shape () {

    this.id = IDX.get('shape');//_Math.generateUUID();
    //DDLS.ShapeID ++;
    this.segments = [];
    
};

Shape.prototype = {

    constructor: Shape,

    dispose: function() {

        while(this.segments.length > 0) this.segments.pop().dispose();
        this.segments = null;

    }

};

export { Shape };