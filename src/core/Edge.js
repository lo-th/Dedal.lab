//import { _Math } from '../math/Math';
import { IDX, EDGE } from '../constants';

function Edge () {

    this.type = EDGE;
    this.id = IDX.get('edge');//_Math.generateUUID();

    this.fromConstraintSegments = [];
    this.isConstrained = false;
    this.isReal = false;
    this.originVertex = null;
    this.oppositeEdge = null;
    this.nextLeftEdge = null;
    this.leftFace = null;

    Object.defineProperty(this, 'destinationVertex', {
        get: function() { return this.oppositeEdge.originVertex; }
    });

    Object.defineProperty(this, 'nextRightEdge', {
        get: function() { return this.oppositeEdge.nextLeftEdge.nextLeftEdge.oppositeEdge; }
    });

    Object.defineProperty(this, 'prevRightEdge', {
        get: function() { return this.oppositeEdge.nextLeftEdge.oppositeEdge; }
    });

    Object.defineProperty(this, 'prevLeftEdge', {
        get: function() { return this.nextLeftEdge.nextLeftEdge; }
    });

    Object.defineProperty(this, 'rotLeftEdge', {
        get: function() { return this.nextLeftEdge.nextLeftEdge.oppositeEdge; }
    });

    Object.defineProperty(this, 'rotRightEdge', {
        get: function() { return this.oppositeEdge.nextLeftEdge; }
    });

    Object.defineProperty(this, 'rightFace', {
        get: function() { return this.oppositeEdge.leftFace; }
    });


};

Edge.prototype = {

    constructor: Edge,

    setDatas: function( originVertex, oppositeEdge, nextLeftEdge, leftFace, isReal, isConstrained ) {

        this.isConstrained = isReal !== undefined ? isConstrained : false;
        this.isReal = isReal !== undefined ? isReal : true;
        this.originVertex = originVertex;
        this.oppositeEdge = oppositeEdge;
        this.nextLeftEdge = nextLeftEdge;
        this.leftFace = leftFace;

    },

    getDatas:function(){

        return [ this.originVertex.pos.x, this.originVertex.pos.y, this.destinationVertex.pos.x, this.destinationVertex.pos.y, this.isConstrained ? 1:0 ];

    },

    addFromConstraintSegment: function( segment ) {

        if ( this.fromConstraintSegments.indexOf(segment) === -1 ) this.fromConstraintSegments.push(segment);

    },

    removeFromConstraintSegment: function( segment ) {

        var index = this.fromConstraintSegments.indexOf( segment );
        if ( index !== -1 ) this.fromConstraintSegments.splice(index, 1);

    },

    dispose: function() {

        this.originVertex = null;
        this.oppositeEdge = null;
        this.nextLeftEdge = null;
        this.leftFace = null;
        this.fromConstraintSegments = null;

    },

    toString: function() {

        return "edge " + this.originVertex.id + " - " + this.destinationVertex.id;

    }

};

export { Edge };