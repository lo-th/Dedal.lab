DDLS.ShapeSimplifier = function(coords,epsilon) {
    epsilon = epsilon || 1;
    var len = coords.length;
    //DDLS.Debug.assertFalse((len & 1) != 0,"Wrong size",{ fileName : "ShapeSimplifier.hx", lineNumber : 18, className : "DDLS.ShapeSimplifier", methodName : "simplify"});
    if(len <= 4) return [].concat(coords);
    var firstPointX = coords[0];
    var firstPointY = coords[1];
    var lastPointX = coords[len - 2];
    var lastPointY = coords[len - 1];
    var index = -1;
    var dist = 0.;
    var _g1 = 1;
    var _g = len >> 1;
    while(_g1 < _g) {
        var i = _g1++;
        var currDist = DDLS.Geom2D.distanceSquaredPointToSegment(new DDLS.Point(coords[i << 1],coords[(i << 1) + 1]),new DDLS.Point(firstPointX,firstPointY),new DDLS.Point(lastPointX,lastPointY));
        //var currDist = DDLS.Geom2D.distanceSquaredPointToSegment(coords[i << 1],coords[(i << 1) + 1],firstPointX,firstPointY,lastPointX,lastPointY);
        if(currDist > dist) {
            dist = currDist;
            index = i;
        }
    }
    if(dist > epsilon * epsilon) {
        var l1 = coords.slice(0,(index << 1) + 2);
        var l2 = coords.slice(index << 1);
        var r1 = DDLS.ShapeSimplifier(l1,epsilon);
        var r2 = DDLS.ShapeSimplifier(l2,epsilon);
        var rs = r1.slice(0,r1.length - 2).concat(r2);
        return rs;
    } else return [firstPointX,firstPointY,lastPointX,lastPointY];
};