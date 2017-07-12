import { _Math } from '../math/Math';

function Shape () {

    this.id = _Math.generateUUID();
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