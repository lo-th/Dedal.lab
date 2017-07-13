import { IDX } from '../constants';

function Shape () {

    this.id = IDX.get('shape');
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