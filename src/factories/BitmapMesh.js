DDLS.BitmapMesh = {};

DDLS.BitmapMesh.buildFromBmpData = function( bmpData, simpleEpsilon, debugBmp, debugShape ) {
    simpleEpsilon = simpleEpsilon || 1;
    //if(simpleEpsilon == null) simpleEpsilon = 1;
    var i, j;
    //DDLS.Debug.assertTrue(bmpData.width > 0 && bmpData.height > 0,"Invalid `bmpData` size (" + bmpData.width + ", " + bmpData.height + ")",{ fileName : "BitmapMesh.js", lineNumber : 24, className : "DDLS.BitmapMesh", methodName : "buildFromBmpData"});
    var shapes = DDLS.Potrace.buildShapes(bmpData,debugBmp,debugShape);
    if( simpleEpsilon >= 1 ) {
        var _g1 = 0;
        var _g = shapes.length;
        while(_g1 < _g) {
            var i1 = _g1++;
            shapes[i1] = DDLS.ShapeSimplifier( shapes[i1], simpleEpsilon );
        }
    }
    var graphs = [];
    var _g11 = 0;
    var _g2 = shapes.length;
    while(_g11 < _g2) {
        var i2 = _g11++;
        graphs.push( DDLS.Potrace.buildGraph( shapes[i2] ) );
    }
    var polygons = [];
    var _g12 = 0;
    var _g3 = graphs.length;
    while(_g12 < _g3) {
        var i3 = _g12++;
        polygons.push( DDLS.Potrace.buildPolygon( graphs[i3], debugShape ));
    }
    var mesh = DDLS.RectMesh( bmpData.width, bmpData.height );
    var _g13 = 0;
    var _g4 = polygons.length;
    while(_g13 < _g4) {
        var i4 = _g13++;
        j = 0;
        while(j < polygons[i4].length - 2) {
            mesh.insertConstraintSegment( polygons[i4][j], polygons[i4][j+1], polygons[i4][j+2], polygons[i4][j+3] );
            j += 2;
        }
        mesh.insertConstraintSegment( polygons[i4][j], polygons[i4][j+1], polygons[i4][j+2], polygons[i4][j+3] );
    }
    return mesh;
};