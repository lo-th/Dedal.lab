import { Potrace } from '../core/Potrace';
import { ShapeSimplifier } from '../core/Tools';
import { Object2D } from '../core/Object2D';

var BitmapObject = {};

BitmapObject.buildFromBmpData = function( pixel, precision, color ) {

    if( color !== undefined ) Potrace.setColor( color );
    precision = precision || 1;

    var i, j, lng, lng2;
    
    // OUTLINES STEP-LIKE SHAPES GENERATION

    var shapes = Potrace.buildShapes( pixel );

    if( precision >= 1 ) {

        i = shapes.length;
        while ( i-- ) shapes[i] = ShapeSimplifier( shapes[i], precision );
        
    }

    // OPTIMIZED POLYGONS GENERATION FROM GRAPH  OF POTENTIAL SEGMENTS GENERATION

    lng = shapes.length;
    var polygons = new Array( lng );
    
    for ( i = 0; i < lng; i++ ){ 

        polygons[i] = Potrace.buildPolygon( Potrace.buildGraph( shapes[i] ) );

    }

    // OBJECT GENERATION

    var obj = new Object2D();

    lng = polygons.length;

    for ( i = 0; i < lng; i++ ) {

        lng2 = polygons[i].length - 2;

        for ( j = 0; j < lng2; j += 2 ) obj.coordinates.push( polygons[i][j], polygons[i][j+1], polygons[i][j+2], polygons[i][j+3] );

        obj.coordinates.push( polygons[i][0], polygons[i][1], polygons[i][j], polygons[i][j+1] );

    }

    return obj;

};

export { BitmapObject };