import { IDX } from '../constants.js';
import { Point } from '../math/Point.js';
import { Matrix2D } from '../math/Matrix2D.js';


export class Object2D {

    constructor () {

        this.id = IDX.get('object2D');

        this._pivot = new Point();
        this._position = new Point();
        this._scale = new Point( 1, 1 );
        this._matrix = new Matrix2D();
        this._rotation = 0;
        this._constraintShape = null;
        this._coordinates = [];
        this.hasChanged = false;

    }

    get rotation (){
        return this._rotation;
    }

    set rotation ( value ){
        if( this._rotation !== value ) { this._rotation = value; this.hasChanged = true; }
    }

    get matrix (){
        return this._matrix;
    }

    set matrix ( value ){
        if( this._rotation !== value ) { this._rotation = value; this.hasChanged = true; }
    }

    get coordinates (){
        return this._coordinates;
    }

    set coordinates ( value ){
        this._coordinates = value; this.hasChanged = true;
    }

    get constraintShape (){
        return this._constraintShape;
    }

    set constraintShape ( value ){
        this._constraintShape = value; this.hasChanged = true;
    }

    get edges (){
        let res = [];
        let seg = this._constraintShape.segments;
        let l = seg.length, l2, n=0, n2=0, i=0, j=0;
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


    position ( x, y ) {

        this._position.set( x, y );
        this.hasChanged = true;

    }

    scale ( w, h ) {

        this._scale.set(w,h);
        this.hasChanged = true;

    }

    pivot ( x, y ) {

        this._pivot.set(x,y);
        this.hasChanged = true;

    }

    dispose () {

        this._matrix = null;
        this._coordinates = null;
        this._constraintShape = null;

    }

    updateValuesFromMatrix () {

    }

    updateMatrixFromValues () {

        this._matrix.identity().translate(this._pivot.negate()).scale(this._scale).rotate(this._rotation).translate(this._position);

    }

}