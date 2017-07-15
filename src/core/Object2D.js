import { IDX } from '../constants';
import { Point } from '../math/Point';
import { Matrix2D } from '../math/Matrix2D';

function Object2D() {

    this.id = IDX.get('object2D');

    this._pivot = new Point();
    this._position = new Point();
    this._scale = new Point( 1, 1 );
    this._matrix = new Matrix2D();
    this._rotation = 0;
    this._constraintShape = null;
    this._coordinates = [];
    this.hasChanged = false;

};

Object.defineProperties( Object2D.prototype, {

    rotation: {
        get: function () { return this._rotation; },
        set: function ( value ) { if( this._rotation !== value ) { this._rotation = value; this.hasChanged = true; } }
    },

    matrix: {
        get: function () { return this._matrix; },
        set: function ( value ) { this._matrix = value; this.hasChanged = true; }
    },

    coordinates: {
        get: function () { return this._coordinates; },
        set: function ( value ) { this._coordinates = value; this.hasChanged = true; }
    },

    constraintShape: {
        get: function () { return this._constraintShape; },
        set: function ( value ) { this._constraintShape = value; this.hasChanged = true; }
    },

    edges: {
        
        get: function () {

            var res = [];
            var seg = this._constraintShape.segments;
            var l = seg.length, l2, n=0, n2=0, i=0, j=0;
            while(n < l) {
                i = n++;
                n2 = 0;
                l2 = seg[i].edges.length;
                while(n2 < l2) {
                    j = n2++;
                    res.push(seg[i].edges[j]);
                }
            }
            return res;

        }

    }

} );

Object.assign( Object2D.prototype, {
    
    constructor: Object2D,

    position: function ( x, y ) {

        this._position.set( x, y );
        this.hasChanged = true;

    },

    scale: function ( w, h ) {

        this._scale.set(w,h);
        this.hasChanged = true;

    },

    pivot: function ( x, y ) {

        this._pivot.set(x,y);
        this.hasChanged = true;

    },

    dispose: function () {

        this._matrix = null;
        this._coordinates = null;
        this._constraintShape = null;

    },

    updateValuesFromMatrix: function () {

    },

    updateMatrixFromValues: function () {

        this._matrix.identity().translate(this._pivot.negate()).scale(this._scale).rotate(this._rotation).translate(this._position);

    }

} );

export { Object2D };