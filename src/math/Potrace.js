
DDLS.EdgeData = function() {};
DDLS.NodeData = function() {};

DDLS.Potrace = {};

//DDLS.Potrace.MAX_INT = 2147483647;
DDLS.Potrace.maxDistance = 1;

DDLS.getWhite = function( bmpData, col, row ){
    //col = col | 0;
    //row = row | 0;
    if(col>bmpData.width || col<0) return false;
    if(row>bmpData.height || row<0) return false;
    //var p = row * bmpData.width + col << 2;
    var p = row * (bmpData.width*4) + (col*4);
    //var p = (row-1) * (bmpData.width*4) + ((col-1)*4);
    //var p = row * (bmpData.width) + (col*4);
    var r = bmpData.bytes[p+0];
    var g = bmpData.bytes[p+1];
    var b = bmpData.bytes[p+2];
    var a = bmpData.bytes[p+3];

    if( a === 0 ) return true;
    if( r === 255 && g === 255 && b === 255 ) return true;

    return false;
};

/*DDLS.getPixel = function( bmpData, col, row ){
    //col = col | 0;
    //row = row | 0;
    if(col>bmpData.width || col<0) return 0x000000;
    if(row>bmpData.height || row<0) return 0x000000;
    //var p = row * bmpData.width + col << 2;
    var p = row * (bmpData.width*4) + (col*4);
    //var p = (row-1) * (bmpData.width*4) + ((col-1)*4);
    //var p = row * (bmpData.width) + (col*4);
    var r = bmpData.bytes[p+0];// << 16;
    var g = bmpData.bytes[p+1];// << 8;
    var b = bmpData.bytes[p+2];
    var a = bmpData.bytes[p+3];

   // console.log(bmpData.bytes[p+0])
   // var hex = '0x'+('000000'+ (r|g|b).toString(16) ).substr(-6);
    if( a === 0 ) return hex = 0xFFFFFF;
    //return '0x' + ( '000000' + ( ( r ) << 16 ^ ( g ) << 8 ^ ( b ) << 0 ).toString( 16 ) ).slice( - 6 );

    return  r << 16 ^ g << 8 ^ b << 0; //).toString( 16 ) ).slice( - 6 );
    
   // return hex;
};*/

DDLS.Potrace.buildShapes = function( bmpData, debugBmp, debugShape ) {

    var shapes = [];
    //var dictPixelsDone = new DDLS.StringMap();
    var dictPixelsDone = new DDLS.Dictionary(2);

    var r = bmpData.height-1;
    var c = bmpData.width-1;

    for (var row = 1; row < r; row++){
        for (var col = 0 ; col < c; col++){
            //console.log( DDLS.getPixel(bmpData, col, row) )
            if ( DDLS.getWhite(bmpData, col, row) && !DDLS.getWhite( bmpData, col+1, row ) ){
            //if ( DDLS.getPixel(bmpData, col, row) === 0xFFFFFF && DDLS.getPixel( bmpData, col+1, row ) < 0xFFFFFF ){
                if (!dictPixelsDone.get( (col+1) + "_" + row) )//[(col+1) + "_" + row])
                    shapes.push( DDLS.Potrace.buildShape( bmpData, row, col + 1 , dictPixelsDone, debugBmp, debugShape ));
                    //shapes.push( buildShape(bmpData, row, col+1, dictPixelsDone, debugBmp, debugShape) );
            }
        }
    }





   /* var _g1 = 1;
    var _g = bmpData.height - 1;
    while(_g1 < _g) {
        var row = _g1++;
        var _g3 = 0;
        var _g2 = bmpData.width - 1;
        while(_g3 < _g2) {
            var col = _g3++;
            if( DDLS.getPixel(bmpData, col, row) == 0xFFFFFF && DDLS.getPixel(bmpData, col+1, row) < 0xFFFFFF){
            //if( DDLS.getPixel(bmpData, col, row) == 0xFFFFFF && DDLS.getPixel(bmpData, col, row) < 0xFFFFFF){
                if( !dictPixelsDone.get( (col+1) + "_" + row) ) shapes.push( DDLS.Potrace.buildShape( bmpData, row, col + 1 , dictPixelsDone, debugBmp, debugShape ));

                //if( !dictPixelsDone.get( (col) + "_" + row) ) shapes.push( DDLS.Potrace.buildShape( bmpData, row, col , dictPixelsDone, debugBmp, debugShape ));
            }



            /*if((function(_this) {
                var _r;
                var pos = row * bmpData.width + col << 2;
                var r = bmpData.bytes[pos + 1] << 16;
                var g = bmpData.bytes[pos + 2] << 8;
                var b = bmpData.bytes[pos + 3];
                _r = r | g | b;
                return _r;
            }(this)) == 16777215 && (function(_this) {
                var _r;
                var pos1 = row * bmpData.width + (col + 1) << 2;
                var r1 = bmpData.bytes[pos1 + 1] << 16;
                var g1 = bmpData.bytes[pos1 + 2] << 8;
                var b1 = bmpData.bytes[pos1 + 3];
                _r = r1 | g1 | b1;
                return _r;
            }(this)) < 16777215) {
                if(!dictPixelsDone.get(col + 1 + "_" + row)) shapes.push(DDLS.Potrace.buildShape(bmpData,row,col + 1,dictPixelsDone,debugBmp,debugShape));
            }*/
     //   }
    //}

    dictPixelsDone.dispose();
    //console.log('shapes done');
    return shapes;
};



DDLS.Potrace.buildShape = function( bmpData, fromPixelRow, fromPixelCol, dictPixelsDone, debugBmp, debugShape ) {
    var newX = fromPixelCol;
    var newY = fromPixelRow;
    var path = [newX,newY];
    dictPixelsDone.set(newX + "_" + newY, true);

    var w = bmpData.width;
    var h = bmpData.height;
    //true;
    var curDir = new DDLS.Point(0,1);
    var newDir = new DDLS.Point();
    var newPixelRow;
    var newPixelCol;
    var count = -1;
    while(true) {
        /*if(debugBmp != null) {
            var pos = fromPixelRow * debugBmp.width + fromPixelCol << 2;
            var a = 255;
            var r = 255;
            var g = 0;
            var b = 0;
            debugBmp.bytes[pos] = a & 255;
            debugBmp.bytes[pos + 1] = r & 255;
            debugBmp.bytes[pos + 2] = g & 255;
            debugBmp.bytes[pos + 3] = b & 255;
        }*/

        // take the pixel at right
        newPixelRow = fromPixelRow + curDir.x + curDir.y;// | 0;
        newPixelCol = fromPixelCol + curDir.x - curDir.y;// | 0;

        //if(newPixelCol<0) break

       // newPixelCol = newPixelCol > w ? w : newPixelCol;
       // newPixelRow = newPixelRow > h ? h : newPixelRow;

      //  newPixelCol = newPixelCol < 0 ? 1 : newPixelCol;
       // newPixelRow = newPixelRow < 0 ? 1 : newPixelRow;

        //console.log(w, h, newPixelRow, newPixelCol)

  

        // if the pixel is not white
        if( !DDLS.getWhite( bmpData, newPixelCol, newPixelRow ) ){
        //if( DDLS.getPixel( bmpData, newPixelCol, newPixelRow ) < 0xFFFFFF ){

            // turn the direction right
            newDir.x = -curDir.y;
            newDir.y = curDir.x;

        } else {// if the pixel is white

            // take the pixel straight
            newPixelRow = fromPixelRow + curDir.y;// | 0;
            newPixelCol = fromPixelCol + curDir.x;// | 0;

            //if(newPixelCol<0) break

            //newPixelCol = newPixelCol < 0 ? 1 : newPixelCol;
            //newPixelRow = newPixelRow < 0 ? 1 : newPixelRow;

         //   newPixelCol = newPixelCol > w ? w : newPixelCol;
          //  newPixelRow = newPixelRow > h ? h : newPixelRow;

            // if the pixel is not white
            if( !DDLS.getWhite( bmpData, newPixelCol, newPixelRow ) ){
            //if( DDLS.getPixel( bmpData, newPixelCol, newPixelRow ) < 0xFFFFFF ){
                // the direction stays the same
                newDir.x = curDir.x;
                newDir.y = curDir.y;

            } else { // if the pixel is white
                // pixel stays the same
                newPixelRow = fromPixelRow;
                newPixelCol = fromPixelCol;
                // turn the direction left
                newDir.x = curDir.y;
                newDir.y = -curDir.x;
            }

        }

        newX = newX + curDir.x;
        newY = newY + curDir.y;

        if( newX === path[0] && newY === path[1] ){ 
            break; 
        } else {
            path.push( newX );
            path.push( newY );
            dictPixelsDone.set( newX + "_" + newY, true );
            fromPixelRow = newPixelRow;
            fromPixelCol = newPixelCol;
            curDir.x = newDir.x;
            curDir.y = newDir.y;
        }
        count--;
        if(count === 0) break;



        /*if((function(_this) {
            var _r;
            var pos1 = newPixelRow * bmpData.width + newPixelCol << 2;
            var r1 = bmpData.bytes[pos1 + 1] << 16;
            var g1 = bmpData.bytes[pos1 + 2] << 8;
            var b1 = bmpData.bytes[pos1 + 3];
            _r = r1 | g1 | b1;
            return _r;
        }(this)) < 16777215) {
            newDir.x = -curDir.y;
            newDir.y = curDir.x;
        } else {
            newPixelRow = fromPixelRow + curDir.y | 0;
            newPixelCol = fromPixelCol + curDir.x | 0;
            if((function(_this) {
                var _r;
                var pos2 = newPixelRow * bmpData.width + newPixelCol << 2;
                var r2 = bmpData.bytes[pos2 + 1] << 16;
                var g2 = bmpData.bytes[pos2 + 2] << 8;
                var b2 = bmpData.bytes[pos2 + 3];
                _r = r2 | g2 | b2;
                return _r;
            }(this)) < 16777215) {
                newDir.x = curDir.x;
                newDir.y = curDir.y;
            } else {
                newPixelRow = fromPixelRow;
                newPixelCol = fromPixelCol;
                newDir.x = curDir.y;
                newDir.y = -curDir.x;
            }
        }
        newX = newX + curDir.x;
        newY = newY + curDir.y;

        if(newX == path[0] && newY == path[1]) break; 
        else {
            path.push(newX);
            path.push(newY);
            dictPixelsDone.set(newX + "_" + newY, true);
            //true;
            fromPixelRow = newPixelRow;
            fromPixelCol = newPixelCol;
            curDir.x = newDir.x;
            curDir.y = newDir.y;
        }
        count--;
        if(count == 0) break;*/
    }
    /*if(debugShape != null) {
        debugShape.graphics.lineStyle(0.5,65280,1);
        debugShape.graphics.moveTo(path[0],path[1]);
        var i = 2;
        while(i < path.length) {
            debugShape.graphics.lineTo(path[i],path[i + 1]);
            i += 2;
        }
        debugShape.graphics.lineTo(path[0],path[1]);
    }*/
    //console.log('shape done');
    return path;
};

DDLS.Potrace.buildGraph = function( shape ) {

    var i;
    var graph = new DDLS.Graph();
    var node;
    i = 0;
    while(i < shape.length) {
        node = graph.insertNode();
        node.data = new DDLS.NodeData();
        node.data.index = i;
        node.data.point = new DDLS.Point(shape[i],shape[i + 1]);
        i += 2;
    }
    var node1;
    var node2;
    var subNode;
    var distSqrd;
    var sumDistSqrd;
    var count;
    var isValid = false;
    var edge;
    var edgeData;
    node1 = graph.node;
    while(node1 != null) {
        if(node1.next != null) node2 = node1.next; else node2 = graph.node;
        while(node2 != node1) {
            isValid = true;
            //subNode = node1.next ? node1.next : graph.node;
            if(node1.next != null) subNode = node1.next; else subNode = graph.node;
            count = 2;
            sumDistSqrd = 0;
            while(subNode != node2) {
                distSqrd = DDLS.Geom2D.distanceSquaredPointToSegment(subNode.data.point,node1.data.point,node2.data.point);
                if(distSqrd < 0) distSqrd = 0;
                if(distSqrd >= DDLS.Potrace.maxDistance) {
                    isValid = false;
                    break;
                }
                count++;
                sumDistSqrd += distSqrd;
                if(subNode.next != null) subNode = subNode.next; else subNode = graph.node;
            }
            if(!isValid) break;
            edge = graph.insertEdge(node1,node2);
            edgeData = new DDLS.EdgeData();
            edgeData.sumDistancesSquared = sumDistSqrd;
            edgeData.length = node1.data.point.distanceTo(node2.data.point);
            edgeData.nodesCount = count;
            edge.data = edgeData;
            if(node2.next != null) node2 = node2.next; else node2 = graph.node;
        }
        node1 = node1.next;
    }
    //console.log('graph done');
    return graph;
};

DDLS.Potrace.buildPolygon = function(graph,debugShape) {
    var polygon = [], p1, p2, p3;
    var currNode;
    var minNodeIndex = 2147483647;
    var edge;
    var score;
    var higherScore;
    var lowerScoreEdge = null;
    currNode = graph.node;
    while(currNode.data.index < minNodeIndex) {
        minNodeIndex = currNode.data.index;
        polygon.push(currNode.data.point.x);
        polygon.push(currNode.data.point.y);
        higherScore = 0;
        edge = currNode.outgoingEdge;
        while(edge != null) {
            score = edge.data.nodesCount - edge.data.length * DDLS.sqrt(edge.data.sumDistancesSquared / edge.data.nodesCount);
            if(score > higherScore) {
                higherScore = score;
                lowerScoreEdge = edge;
            }
            edge = edge.rotNextEdge;
        }
        currNode = lowerScoreEdge.destinationNode;
    }


    p1 = new DDLS.Point(polygon[polygon.length - 2],polygon[polygon.length - 1]);
    p2 = new DDLS.Point(polygon[0],polygon[1]);
    p3 = new DDLS.Point(polygon[2],polygon[3]);

    if(DDLS.Geom2D.getDirection(p1,p2,p3) == 0) {
        polygon.shift();
        polygon.shift();
    }

    /*if(debugShape != null) {
        debugShape.graphics.lineStyle(0.5,255);
        debugShape.graphics.moveTo(polygon[0],polygon[1]);
        var i = 2;
        while(i < polygon.length) {
            debugShape.graphics.lineTo(polygon[i],polygon[i + 1]);
            i += 2;
        }
        debugShape.graphics.lineTo(polygon[0],polygon[1]);
    }*/
    //console.log('polygone done');
    return polygon;
};