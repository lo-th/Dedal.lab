import { Dictionary, Log } from '../constants.js';
import { Point } from '../math/Point.js';
import { Geom2D } from '../math/Geom2D.js';
import { nearEqual } from '../core/Tools.js';
import { Graph } from '../core/Graph.js';


function EdgeData() {};
function NodeData() {};

export const Potrace = {

    color: { r:255, g:255, b:255 },
    nearly : 50,
    maxDistance: 1,

    setColor: function ( color ) { Potrace.color = color; },
    setNearly: function ( n ) { Potrace.nearly = n; },

    buildShapes: function ( bmpData ) {

        let shapes = [];
        let dictPixelsDone = new Dictionary( 2 );

        let r = bmpData.height-1;
        let c = bmpData.width-1;

        for (let row = 1; row < r; row++){
            for (let col = 0 ; col < c; col++){

                if ( Potrace.getWhite(bmpData, col, row) && !Potrace.getWhite( bmpData, col+1, row ) ){

                    if ( !dictPixelsDone.get( (col+1) + "_" + row) ) shapes.push( Potrace.buildShape( bmpData, row, col + 1 , dictPixelsDone ));
                }
            }
        }

        dictPixelsDone.dispose();
        return shapes;

    },

    getWhite: function ( bmpData, col, row ){

        let valide = false;

        let bytes = bmpData.bytes;
        let w = bmpData.width;
        let mask = Potrace.color;
        let nearly = Potrace.nearly;
        let id = ( col + ( row * w ) ) << 2; // * 4;

        if( mask.r !== undefined ){ if( nearEqual( bytes[id] , mask.r, nearly ) ) valide = true; }
        if( mask.g !== undefined ){ if( nearEqual( bytes[id+1] , mask.g, nearly ) ) valide = true; }
        if( mask.b !== undefined ){ if( nearEqual( bytes[id+2] , mask.b, nearly ) ) valide = true; }
        if( mask.a !== undefined ){ if( nearEqual( bytes[id+3] , mask.a, nearly ) ) valide = true; }

        return valide;

    },

    buildShape: function ( bmpData, fromPixelRow, fromPixelCol, dictPixelsDone ) {
        
        let newX = fromPixelCol;
        let newY = fromPixelRow;
        let path = [newX,newY];
        dictPixelsDone.set(newX + "_" + newY, true);

        let w = bmpData.width;
        let h = bmpData.height;

        let curDir = new Point(0,1);
        let newDir = new Point();
        let newPixelRow;
        let newPixelCol;
        let count = -1;
        
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

        let i = 0;
        let graph = new Graph();
        let node;

        while( i < shape.length ) {

            node = graph.insertNode();
            node.data = new NodeData();
            node.data.index = i;
            node.data.point = new Point(shape[i],shape[i + 1]);
            i += 2;

        }

        let node1;
        let node2;
        let subNode;
        let distSqrd;
        let sumDistSqrd;
        let count;
        let isValid = false;
        let edge;
        let edgeData;
        node1 = graph.node;

        while( node1 != null ) {

            if(node1.next != null) node2 = node1.next; else node2 = graph.node;
            while( node2 != node1 ) {
                isValid = true;
                //subNode = node1.next ? node1.next : graph.node;
                if(node1.next != null) subNode = node1.next; else subNode = graph.node;
                count = 2;
                sumDistSqrd = 0;
                while( subNode != node2 ) {
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
                if( !isValid ) break;
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

        let polygon = [], p1, p2, p3;
        let minNodeIndex = 2147483647;
        let edge;
        let score;
        let higherScore;
        let lowerScoreEdge = null;
        let currNode = graph.node;

        while( currNode.data.index < minNodeIndex ) {

            minNodeIndex = currNode.data.index;
            polygon.push( currNode.data.point.x );
            polygon.push( currNode.data.point.y );
            higherScore = 0;
            edge = currNode.outgoingEdge;
            while( edge != null ) {
                score = edge.data.nodesCount - edge.data.length * Math.sqrt( edge.data.sumDistancesSquared / edge.data.nodesCount );
                if( score > higherScore ) {
                    higherScore = score;
                    lowerScoreEdge = edge;
                }
                edge = edge.rotNextEdge;
            }
            currNode = lowerScoreEdge.destinationNode;

        }

        p1 = new Point( polygon[polygon.length - 2], polygon[polygon.length - 1] );
        p2 = new Point( polygon[0], polygon[1] );
        p3 = new Point( polygon[2], polygon[3] );

        if( Geom2D.getDirection( p1, p2, p3 ) === 0 ) {
            polygon.shift();
            polygon.shift();
        }

        return polygon;

    }

}