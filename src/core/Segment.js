import { IDX } from '../constants';
//import { _Math } from '../math/Math';

function Segment ( x, y ) {

    this.id = IDX.get('segment');//_Math.generateUUID();
    //DDLS.SegmentID ++;
    this.edges = [];
    this.fromShape = null;

};

Segment.prototype = {

    constructor: Segment,

    addEdge: function( edge ) {

        if ( this.edges.indexOf(edge) == -1 && this.edges.indexOf(edge.oppositeEdge) == -1 ) this.edges.push(edge);

    },

    removeEdge: function( edge ) {

        var index = this.edges.indexOf(edge);
        if ( index == -1 ) index = this.edges.indexOf(edge.oppositeEdge);
        if ( index != -1 ) this.edges.splice(index, 1);

    },

    dispose: function() {

        this.edges = null;
        this.fromShape = null;

    },

    toString: function() {

        return "seg_id " + this.id;

    }

};

export { Segment };