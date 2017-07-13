import { Dictionary, Log } from '../constants';
import { Point } from '../math/Point';
import { Geom2D } from '../math/Geom2D';
import { nearEqual } from '../core/Tools';
import { Graph } from '../core/Graph';


function EdgeData() {};
function NodeData() {};

var Potrace = {

    color: { r:255, g:255, b:255 },
    nearly : 50,
    maxDistance: 1,

    setColor: function ( color ) { Potrace.color = color; },
    setNearly: function ( n ) { Potrace.nearly = n; },

    getWhite: function ( bmpData, col, row ){

        var valide = false;

        var bytes = bmpData.bytes;
        var w = bmpData.width;
        var mask = Potrace.color;
        var nearly = Potrace.nearly;
        var id = ( col + ( row * w ) ) << 2; // * 4;

        if( mask.r !== undefined ){ if( nearEqual( bytes[id] , mask.r, nearly ) ) valide = true; }
        if( mask.g !== undefined ){ if( nearEqual( bytes[id+1] , mask.g, nearly ) ) valide = true; }
        if( mask.b !== undefined ){ if( nearEqual( bytes[id+2] , mask.b, nearly ) ) valide = true; }
        if( mask.a !== undefined ){ if( nearEqual( bytes[id+3] , mask.a, nearly ) ) valide = true; }

        return valide;

    },

    buildShapes: function ( bmpData ) {

        var shapes = [];
        //var dictPixelsDone = new DDLS.StringMap();
        var dictPixelsDone = new Dictionary(2);

        var r = bmpData.height-1;
        var c = bmpData.width-1;

        for (var row = 1; row < r; row++){
            for (var col = 0 ; col < c; col++){
                //console.log( DDLS.getPixel(bmpData, col, row) )
                if ( Potrace.getWhite(bmpData, col, row) && !Potrace.getWhite( bmpData, col+1, row ) ){
                //if ( DDLS.getPixel(bmpData, col, row) === 0xFFFFFF && DDLS.getPixel( bmpData, col+1, row ) < 0xFFFFFF ){
                    if (!dictPixelsDone.get( (col+1) + "_" + row) )//[(col+1) + "_" + row])
                        shapes.push( Potrace.buildShape( bmpData, row, col + 1 , dictPixelsDone ));
                        //shapes.push( buildShape(bmpData, row, col+1, dictPixelsDone, debugBmp, debugShape) );
                }
            }
        }

        dictPixelsDone.dispose();
        return shapes;

    },

    buildShape: function ( bmpData, fromPixelRow, fromPixelCol, dictPixelsDone ) {
        
        var newX = fromPixelCol;
        var newY = fromPixelRow;
        var path = [newX,newY];
        dictPixelsDone.set(newX + "_" + newY, true);

        var w = bmpData.width;
        var h = bmpData.height;

        var curDir = new Point(0,1);
        var newDir = new Point();
        var newPixelRow;
        var newPixelCol;
        var count = -1;
        
        while(true) {

            // take the pixel at right
            newPixelRow = fromPixelRow + curDir.x + curDir.y;// | 0;
            newPixelCol = fromPixelCol + curDir.x - curDir.y;// | 0;
      
            // if the pixel is not white
            if( !Potrace.getWhite( bmpData, newPixelCol, newPixelRow ) ){
            //if( DDLS.getPixel( bmpData, newPixelCol, newPixelRow ) < 0xFFFFFF ){

                // turn the direction right
                newDir.x = -curDir.y;
                newDir.y = curDir.x;

            } else {// if the pixel is white

                // take the pixel straight
                newPixelRow = fromPixelRow + curDir.y;// | 0;
                newPixelCol = fromPixelCol + curDir.x;// | 0;

                // if the pixel is not white
                if( !Potrace.getWhite( bmpData, newPixelCol, newPixelRow ) ){
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
        }
        return path;
    },

    buildGraph: function ( shape ) {

        var i;
        var graph = new Graph();
        var node;
        i = 0;
        while(i < shape.length) {
            node = graph.insertNode();
            node.data = new NodeData();
            node.data.index = i;
            node.data.point = new Point(shape[i],shape[i + 1]);
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
                    distSqrd = Geom2D.distanceSquaredPointToSegment(subNode.data.point,node1.data.point,node2.data.point);
                    if(distSqrd < 0) distSqrd = 0;
                    if(distSqrd >= Potrace.maxDistance) {
                        isValid = false;
                        break;
                    }
                    count++;
                    sumDistSqrd += distSqrd;
                    if(subNode.next != null) subNode = subNode.next; else subNode = graph.node;
                }
                if(!isValid) break;
                edge = graph.insertEdge(node1,node2);
                edgeData = new EdgeData();
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
    },

    buildPolygon: function ( graph ) {
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
                score = edge.data.nodesCount - edge.data.length * Math.sqrt(edge.data.sumDistancesSquared / edge.data.nodesCount);
                if(score > higherScore) {
                    higherScore = score;
                    lowerScoreEdge = edge;
                }
                edge = edge.rotNextEdge;
            }
            currNode = lowerScoreEdge.destinationNode;
        }


        p1 = new Point(polygon[polygon.length - 2],polygon[polygon.length - 1]);
        p2 = new Point(polygon[0],polygon[1]);
        p3 = new Point(polygon[2],polygon[3]);

        if(Geom2D.getDirection(p1,p2,p3) == 0) {
            polygon.shift();
            polygon.shift();
        }

        return polygon;
    }

}

export { Potrace };