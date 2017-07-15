import { IDX, VERTEX } from '../constants';
import { Point } from '../math/Point';


function Vertex () {

    this.type = VERTEX;
    this.id = IDX.get('vertex');
    this.pos = new Point();
    this.fromConstraintSegments = [];
    this.edge = null;
    this.isReal = false;

};

Vertex.prototype = {
    
    constructor: Vertex,

    setDatas: function ( edge, isReal ) {

        this.isReal = isReal !== undefined ? isReal : true;
        this.edge = edge;

    },

    addFromConstraintSegment: function ( segment ) {

        if ( this.fromConstraintSegments.indexOf(segment) === -1 ) this.fromConstraintSegments.push( segment );

    },

    removeFromConstraintSegment: function ( segment ) {

        var index = this.fromConstraintSegments.indexOf( segment );
        if ( index !== -1 ) this.fromConstraintSegments.splice( index, 1 );

    },

    dispose: function() {

        this.pos = null;
        this.edge = null;
        this.fromConstraintSegments = null;

    },

    toString: function() {

        return "ver_id " + this.id;

    }

};

export { Vertex };