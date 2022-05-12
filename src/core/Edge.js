import { IDX, EDGE } from '../constants.js';

export class Edge {

    constructor () {

        this.type = EDGE;
        this.id = IDX.get('edge');

        this.fromConstraintSegments = [];
        this.isConstrained = false;
        this.isReal = false;
        this.originVertex = null;
        this.oppositeEdge = null;
        this.nextLeftEdge = null;
        this.leftFace = null;

    }

    get destinationVertex () {
        return this.oppositeEdge.originVertex
    }

    get nextRightEdge () {
        return this.oppositeEdge.nextLeftEdge.nextLeftEdge.oppositeEdge
    }

    get prevRightEdge () {
        return this.oppositeEdge.nextLeftEdge.oppositeEdge
    }

    get prevLeftEdge () {
        return this.nextLeftEdge.nextLeftEdge
    }

    get rotLeftEdge () {
        return this.nextLeftEdge.nextLeftEdge.oppositeEdge
    }

    get rotRightEdge () {
        return this.oppositeEdge.nextLeftEdge
    }

    get rightFace () {
        return this.oppositeEdge.leftFace
    }

    setDatas( originVertex, oppositeEdge, nextLeftEdge, leftFace, isReal, isConstrained ) {

        this.isConstrained = isReal !== undefined ? isConstrained : false;
        this.isReal = isReal !== undefined ? isReal : true;
        this.originVertex = originVertex;
        this.oppositeEdge = oppositeEdge;
        this.nextLeftEdge = nextLeftEdge;
        this.leftFace = leftFace;

    }

    getDatas () {

        return [ this.originVertex.pos.x, this.originVertex.pos.y, this.destinationVertex.pos.x, this.destinationVertex.pos.y, this.isConstrained ? 1:0 ];

    }

    addFromConstraintSegment ( segment ) {

        if ( this.fromConstraintSegments.indexOf(segment) === -1 ) this.fromConstraintSegments.push(segment);

    }

    removeFromConstraintSegment( segment ) {

        const index = this.fromConstraintSegments.indexOf( segment );
        if ( index !== -1 ) this.fromConstraintSegments.splice(index, 1);

    }

    dispose () {

        this.originVertex = null;
        this.oppositeEdge = null;
        this.nextLeftEdge = null;
        this.leftFace = null;
        this.fromConstraintSegments = null;

    }

    toString () {

        return "edge " + this.originVertex.id + " - " + this.destinationVertex.id;

    }

}