import { IDX, VERTEX } from '../constants.js';
import { Point } from '../math/Point.js';

export class Vertex {

    constructor () {

        this.type = VERTEX;
        this.id = IDX.get('vertex');
        this.pos = new Point();
        this.fromConstraintSegments = [];
        this.edge = null;
        this.isReal = false;

    }

    setDatas ( edge, isReal ) {

        this.isReal = isReal !== undefined ? isReal : true;
        this.edge = edge;

    }

    addFromConstraintSegment ( segment ) {

        if ( this.fromConstraintSegments.indexOf(segment) === -1 ) this.fromConstraintSegments.push( segment );

    }

    removeFromConstraintSegment ( segment ) {

        const index = this.fromConstraintSegments.indexOf( segment );
        if ( index !== -1 ) this.fromConstraintSegments.splice( index, 1 );

    }

    dispose () {

        this.pos = null;
        this.edge = null;
        this.fromConstraintSegments = null;

    }

    toString () {

        return "ver_id " + this.id;

    }

}