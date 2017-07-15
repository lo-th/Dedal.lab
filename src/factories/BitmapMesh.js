import { Potrace } from '../core/Potrace';
import { ShapeSimplifier } from '../core/Tools';
import { RectMesh } from '../factories/RectMesh';

var BitmapMesh = {};

BitmapMesh.buildFromBmpData = function ( pixel, precision, color ) {

    if( color !== undefined ) Potrace.setColor( color );
    precision = precision || 1;

    var i, j, lng, lng2;

    // OUTLINES STEP-LIKE SHAPES GENERATION

    var shapes = Potrace.buildShapes( pixel );

    if( precision >= 1 ) {

        i = shapes.length;
        while ( i-- ) shapes[i] = ShapeSimplifier( shapes[i], precision );
        
    }

    // GRAPHS OF POTENTIAL SEGMENTS GENERATION

    var graphs = [];
    lng = shapes.length;

    for ( i = 0; i < lng; i++ ) graphs.push( Potrace.buildGraph( shapes[i] ) );
    

    // OPTIMIZED POLYGONS GENERATION

    var polygons = [];
    lng = graphs.length;

    for ( i = 0; i < lng; i++ ) polygons.push( Potrace.buildPolygon( graphs[i] ));
    

    // MESH GENERATION

    var mesh = new RectMesh( pixel.width, pixel.height );
    lng = polygons.length;

    for ( i = 0; i < lng; i++ ) {

        lng2 = polygons[i].length - 2;

        for ( j = 0; j < lng2; j += 2 ) mesh.insertConstraintSegment( polygons[i][j], polygons[i][j+1], polygons[i][j+2], polygons[i][j+3] );

        mesh.insertConstraintSegment( polygons[i][0], polygons[i][1], polygons[i][j], polygons[i][j+1] );

    }

    return mesh;

};

export { BitmapMesh };