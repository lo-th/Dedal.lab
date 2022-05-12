import { IDX } from '../constants.js';


export class Segment {

    constructor ( x, y ) {

        this.id = IDX.get('segment');
        this.edges = [];
        this.fromShape = null;

    }

    addEdge ( edge ) {

        if ( this.edges.indexOf(edge) === -1 && this.edges.indexOf( edge.oppositeEdge ) === -1 ) this.edges.push( edge );

    }

    removeEdge ( edge ) {

        const index = this.edges.indexOf( edge );
        if ( index === -1 ) index = this.edges.indexOf( edge.oppositeEdge );
        if ( index !== -1 ) this.edges.splice( index, 1 );

    }

    dispose () {

        this.edges = null;
        this.fromShape = null;

    }

    toString () {

        return "seg_id " + this.id;

    }

}