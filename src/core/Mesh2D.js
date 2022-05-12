import { Point } from '../math/Point.js';
import { Matrix2D } from '../math/Matrix2D.js';
import { Geom2D } from '../math/Geom2D.js';

import { IDX, Dictionary, Log, INFINITY, EPSILON_SQUARED } from '../constants.js';
import { Squared } from '../core/Tools.js';

import { FromVertexToOutgoingEdges, FromMeshToVertices, FromVertexToIncomingEdges } from '../core/Iterators.js';
import { Shape } from '../core/Shape.js';
import { Segment } from '../core/Segment.js';
import { Edge } from '../core/Edge.js';
import { Face } from '../core/Face.js';
import { Vertex } from '../core/Vertex.js';

export class Mesh2D {

    constructor ( width, height ) {

        this.id = IDX.get('mesh2D');
        this.__objectsUpdateInProgress = false;
        this.__centerVertex = null;
        this.width = width;
        this.height = height;
        this.clipping = true;
        
        this._edges = [];
        this._faces = [];
        this._objects = [];
        this._vertices = [];
        this._constraintShapes = [];

        this.__edgesToCheck = [];

        this.AR_vertex = null;
        this.AR_edge = null;

        this.isRedraw = true;

    }

    deDuplicEdge () {

        let edges = this._edges;
        let lng = edges.length; 

        let i, j, a, b, m, n;

        for( j = lng; j; ) {
            b = edges[--j];
            a = edges[--j];

            for( i = j; i; ) {
                n = edges[--i];
                m = edges[--i];

                if((a === m && b === n) || (a === n && b === m)) {
                    edges.splice(j, 2);
                    edges.splice(i, 2);
                    break;
                }
            }
        }

    }

    clear ( notObjects ) {

        while(this._vertices.length > 0) this._vertices.pop().dispose();
        this._vertices = [];
        while(this._edges.length > 0) this._edges.pop().dispose();
        this._edges = [];
        while(this._faces.length > 0) this._faces.pop().dispose();
        this._faces = [];
        while(this._constraintShapes.length > 0) this._constraintShapes.pop().dispose();
        this._constraintShapes = [];
        if(!notObjects){
            while(this._objects.length > 0) this._objects.pop().dispose();
        }
        this._objects = [];
        
        this.__edgesToCheck = [];
        this.__centerVertex = [];

        this.AR_vertex = null;
        this.AR_edge = null;

    }
    
    dispose () {

        while(this._vertices.length > 0) this._vertices.pop().dispose();
        this._vertices = null;
        while(this._edges.length > 0) this._edges.pop().dispose();
        this._edges = null;
        while(this._faces.length > 0) this._faces.pop().dispose();
        this._faces = null;
        while(this._constraintShapes.length > 0) this._constraintShapes.pop().dispose();
        this._constraintShapes = null;
        while(this._objects.length > 0) this._objects.pop().dispose();
        this._objects = null;
        
        this.__edgesToCheck = null;
        this.__centerVertex = null;

        this.AR_vertex = null;
        this.AR_edge = null;

    }

    buildFromRecord ( rec ) {

        let positions = rec.split(";");
        let l = positions.length, i = 0;
        while(i < l) {
            this.insertConstraintSegment(parseFloat(positions[i]),parseFloat(positions[i + 1]),parseFloat(positions[i + 2]),parseFloat(positions[i + 3]));
            i += 4;
        }

    }

    insertObject ( o ) {

        if( o.constraintShape != null ) this.deleteObject( o );

        let shape = new Shape();
        let segment;
        let coordinates = o.coordinates;
        
        o.updateMatrixFromValues();
        let m = o.matrix || new Matrix2D();
        let p1 = new Point();
        let p2 = new Point();

        let l = coordinates.length, i = 0;
        //while(i < l) {
        for (i=0; i<l; i+=4){
            p1.set( coordinates[i], coordinates[i+1] ).transformMat2D(m);
            p2.set( coordinates[i+2], coordinates[i+3] ).transformMat2D(m);
            segment = this.insertConstraintSegment( p1.x, p1.y, p2.x, p2.y );
            if(segment != null) {
                segment.fromShape = shape;
                shape.segments.push(segment);
            }
            //i += 4;
        }

        this._constraintShapes.push( shape );
        o.constraintShape = shape;

        if( !this.__objectsUpdateInProgress ) this._objects.push( o );

    }

    deleteObject ( o ) {

        if( o.constraintShape == null ) return;
        this.deleteConstraintShape( o.constraintShape );
        o.constraintShape = null;
        if(!this.__objectsUpdateInProgress) {
            let index = this._objects.indexOf( o );
            this._objects.splice( index, 1 );
        }

    }

    updateObjects () {

        this.__objectsUpdateInProgress = true;
        let l = this._objects.length, i = 0, o;
        while( i < l ) {

            o = this._objects[i];

            if( o.hasChanged ) {
                this.deleteObject( o );
                this.insertObject( o );
                o.hasChanged = false;
                this.isRedraw = true;
            }
            i++;
        }
        this.__objectsUpdateInProgress = false;

    }

    // insert a new collection of constrained edges.
    // Coordinates parameter is a list with form [x0, y0, x1, y1, x2, y2, x3, y3, x4, y4, ....]
    // where each 4-uple sequence (xi, yi, xi+1, yi+1) is a constraint segment (with i % 4 == 0)
    // and where each couple sequence (xi, yi) is a point.
    // Segments are not necessary connected.
    // Segments can overlap (then they will be automaticaly subdivided).
    insertConstraintShape ( coordinates ) {

        let shape = new Shape();
        let segment = null;
        let l = coordinates.length, i = 0;

        while( i < l ) {
            segment = this.insertConstraintSegment( coordinates[i], coordinates[i + 1], coordinates[i + 2], coordinates[i + 3] );
            if(segment != null) {
                segment.fromShape = shape;
                shape.segments.push(segment);
            }
            i += 4;
        }
        this._constraintShapes.push(shape);
        return shape;

    }

    deleteConstraintShape ( shape ) {

        let i = 0, l = shape.segments.length;
        while( i < l ) {
            this.deleteConstraintSegment(shape.segments[i]);
            i++;
        }
        
        //console.log('yoch', this._constraintShapes.indexOf(shape))
        this._constraintShapes.splice(this._constraintShapes.indexOf(shape),1);
        shape.dispose();

    }

    insertConstraintSegment ( x1, y1, x2, y2 ) {

        let newX1 = x1;
        let newY1 = y1;
        let newX2 = x2;
        let newY2 = y2;

        if ( (x1 > this.width && x2 > this.width) || (x1 < 0 && x2 < 0) || (y1 > this.height && y2 > this.height) || (y1 < 0 && y2 < 0)  ) return null;
        else{
            let nx = x2 - x1;
            let ny = y2 - y1;
            let tmin = - INFINITY;
            let tmax = INFINITY;
            
            if (nx != 0.0){
                let tx1 = (0 - x1)/nx;
                let tx2 = (this.width - x1)/nx;
                
                tmin = Math.max(tmin, Math.min(tx1, tx2));
                tmax = Math.min(tmax, Math.max(tx1, tx2));
            }
            if (ny != 0.0){
                let ty1 = (0 - y1)/ny;
                let ty2 = (this.height - y1)/ny;
                
                tmin = Math.max(tmin, Math.min(ty1, ty2));
                tmax = Math.min(tmax, Math.max(ty1, ty2));
            }
            if (tmax >= tmin){
                if (tmax < 1){
                    //Clip end point
                    newX2 = nx*tmax + x1;
                    newY2 = ny*tmax + y1;
                }
                if (tmin > 0){
                    //Clip start point
                    newX1 = nx*tmin + x1;
                    newY1 = ny*tmin + y1;
                }
            }
            else return null;
        }

        // we check the vertices insertions
        let vertexDown = this.insertVertex(newX1,newY1);
        if(vertexDown == null) return null;
        let vertexUp = this.insertVertex(newX2,newY2);
        if(vertexUp == null) return null;
        if(vertexDown.id === vertexUp.id) return null;
        //if(vertexDown === vertexUp) return null;

        // useful
        let iterVertexToOutEdges = new FromVertexToOutgoingEdges();
        let currVertex;
        let currEdge;
        let i;

        // the new constraint segment
        let segment = new Segment();
        let tempEdgeDownUp = new Edge();
        let tempSdgeUpDown = new Edge();
        tempEdgeDownUp.setDatas(vertexDown,tempSdgeUpDown,null,null,true,true);
        tempSdgeUpDown.setDatas(vertexUp,tempEdgeDownUp,null,null,true,true);

        let intersectedEdges = [];
        let leftBoundingEdges = [];
        let rightBoundingEdges = [];

        let currObjet = {type:3};
        let pIntersect = new Point();
        let edgeLeft;
        let newEdgeDownUp;
        let newEdgeUpDown;
        let done = false;
        currVertex = vertexDown;

        currObjet = currVertex;
        //currObjet = currVertex;
        while( true ) {
            done = false;
            if ( currObjet.type === 0 ){ // VERTEX
                currVertex = currObjet;
                iterVertexToOutEdges.fromVertex = currVertex;
                while((currEdge = iterVertexToOutEdges.next()) != null) {
                    //if(currEdge.destinationVertex == vertexUp) {
                    if(currEdge.destinationVertex.id === vertexUp.id) {
                        if(!currEdge.isConstrained) {
                            currEdge.isConstrained = true;
                            currEdge.oppositeEdge.isConstrained = true;
                        }
                        currEdge.addFromConstraintSegment(segment);
                        currEdge.oppositeEdge.fromConstraintSegments = currEdge.fromConstraintSegments;
                        vertexDown.addFromConstraintSegment(segment);
                        vertexUp.addFromConstraintSegment(segment);
                        segment.addEdge(currEdge);
                        return segment;
                    }
                    if( Geom2D.distanceSquaredVertexToEdge(currEdge.destinationVertex,tempEdgeDownUp) <= EPSILON_SQUARED) {
                        if(!currEdge.isConstrained) {
                            currEdge.isConstrained = true;
                            currEdge.oppositeEdge.isConstrained = true;
                        }
                        currEdge.addFromConstraintSegment(segment);
                        currEdge.oppositeEdge.fromConstraintSegments = currEdge.fromConstraintSegments;
                        vertexDown.addFromConstraintSegment(segment);
                        segment.addEdge(currEdge);
                        vertexDown = currEdge.destinationVertex;
                        tempEdgeDownUp.originVertex = vertexDown;
                        currObjet = vertexDown;
                        done = true;
                        break;
                    }
                }
                if( done ) continue;

                iterVertexToOutEdges.fromVertex = currVertex;
                while((currEdge = iterVertexToOutEdges.next()) != null) {
                    currEdge = currEdge.nextLeftEdge;
                    if( Geom2D.intersections2edges(currEdge,tempEdgeDownUp,pIntersect)) {
                        if(currEdge.isConstrained) {
                            vertexDown = this.splitEdge(currEdge,pIntersect.x,pIntersect.y);
                            iterVertexToOutEdges.fromVertex = currVertex;
                            while((currEdge = iterVertexToOutEdges.next()) != null){
                                //if(currEdge.destinationVertex == vertexDown) {
                                if(currEdge.destinationVertex.id === vertexDown.id) {
                                    currEdge.isConstrained = true;
                                    currEdge.oppositeEdge.isConstrained = true;
                                    currEdge.addFromConstraintSegment(segment);
                                    currEdge.oppositeEdge.fromConstraintSegments = currEdge.fromConstraintSegments;
                                    segment.addEdge(currEdge);
                                    break;
                                }
                            }
                            currVertex.addFromConstraintSegment(segment);
                            tempEdgeDownUp.originVertex = vertexDown;
                            currObjet = vertexDown;
                        } else {
                            intersectedEdges.push(currEdge);
                            leftBoundingEdges.unshift(currEdge.nextLeftEdge);
                            rightBoundingEdges.push(currEdge.prevLeftEdge);
                            currEdge = currEdge.oppositeEdge;
                            currObjet = currEdge;
                        }
                        break;
                    }
                }
            } else if ( currObjet.type === 1 ){ // EDGE
                currEdge = currObjet;
                edgeLeft = currEdge.nextLeftEdge;
                if ( edgeLeft.destinationVertex.id === vertexUp.id ){
                //if ( edgeLeft.destinationVertex == vertexUp ){
                    //trace("end point reached");
                    leftBoundingEdges.unshift(edgeLeft.nextLeftEdge);
                    rightBoundingEdges.push(edgeLeft);
                    
                    newEdgeDownUp = new Edge();
                    newEdgeUpDown = new Edge();
                    newEdgeDownUp.setDatas(vertexDown, newEdgeUpDown, null, null, true, true);
                    newEdgeUpDown.setDatas(vertexUp, newEdgeDownUp, null, null, true, true);
                    leftBoundingEdges.push(newEdgeDownUp);
                    rightBoundingEdges.push(newEdgeUpDown);
                    this.insertNewConstrainedEdge(segment, newEdgeDownUp, intersectedEdges, leftBoundingEdges, rightBoundingEdges);
                    
                    return segment;
                } else if ( Geom2D.distanceSquaredVertexToEdge( edgeLeft.destinationVertex, tempEdgeDownUp) <= EPSILON_SQUARED ){
                    //trace("we met a vertex");
                    leftBoundingEdges.unshift(edgeLeft.nextLeftEdge);
                    rightBoundingEdges.push(edgeLeft);
                    
                    newEdgeDownUp = new Edge();
                    newEdgeUpDown = new Edge();
                    newEdgeDownUp.setDatas(vertexDown, newEdgeUpDown, null, null, true, true);
                    newEdgeUpDown.setDatas(edgeLeft.destinationVertex, newEdgeDownUp, null, null, true, true);
                    leftBoundingEdges.push(newEdgeDownUp);
                    rightBoundingEdges.push(newEdgeUpDown);
                    this.insertNewConstrainedEdge(segment, newEdgeDownUp, intersectedEdges, leftBoundingEdges, rightBoundingEdges);
                    
                    intersectedEdges.splice(0, intersectedEdges.length);
                    leftBoundingEdges.splice(0, leftBoundingEdges.length);
                    rightBoundingEdges.splice(0, rightBoundingEdges.length);
                    
                    vertexDown = edgeLeft.destinationVertex;
                    tempEdgeDownUp.originVertex = vertexDown;
                    currObjet = vertexDown;
                } else {
                    if ( Geom2D.intersections2edges(edgeLeft, tempEdgeDownUp, pIntersect) ){
                        //trace("1st left edge intersected");
                        if (edgeLeft.isConstrained){
                            //trace("edge is constrained");
                            currVertex = this.splitEdge(edgeLeft, pIntersect.x, pIntersect.y);
                            
                            iterVertexToOutEdges.fromVertex = currVertex;
                            while ( (currEdge = iterVertexToOutEdges.next()) != null){
                                if (currEdge.destinationVertex == leftBoundingEdges[0].originVertex) leftBoundingEdges.unshift(currEdge);
                                if (currEdge.destinationVertex == rightBoundingEdges[rightBoundingEdges.length-1].destinationVertex) rightBoundingEdges.push(currEdge.oppositeEdge);
                            }
                            
                            newEdgeDownUp = new Edge();
                            newEdgeUpDown = new Edge();
                            newEdgeDownUp.setDatas(vertexDown, newEdgeUpDown, null, null, true, true);
                            newEdgeUpDown.setDatas(currVertex, newEdgeDownUp, null, null, true, true);
                            leftBoundingEdges.push(newEdgeDownUp);
                            rightBoundingEdges.push(newEdgeUpDown);
                            this.insertNewConstrainedEdge(segment, newEdgeDownUp, intersectedEdges, leftBoundingEdges, rightBoundingEdges);
                            
                            intersectedEdges.splice(0, intersectedEdges.length);
                            leftBoundingEdges.splice(0, leftBoundingEdges.length);
                            rightBoundingEdges.splice(0, rightBoundingEdges.length);

                            vertexDown = currVertex;
                            tempEdgeDownUp.originVertex = vertexDown;
                            currObjet = vertexDown;
                        } else {
                            //trace("edge is not constrained");
                            intersectedEdges.push(edgeLeft);
                            leftBoundingEdges.unshift(edgeLeft.nextLeftEdge);
                            currEdge = edgeLeft.oppositeEdge; // we keep the edge from left to right
                            currObjet = currEdge;
                        }
                    } else {
                        //trace("2nd left edge intersected");
                        edgeLeft = edgeLeft.nextLeftEdge;
                        Geom2D.intersections2edges(edgeLeft, tempEdgeDownUp, pIntersect);
                        if (edgeLeft.isConstrained){
                            //trace("edge is constrained");
                            currVertex = this.splitEdge(edgeLeft, pIntersect.x, pIntersect.y);
                            
                            iterVertexToOutEdges.fromVertex = currVertex;
                            /*while ( (currEdge = iterVertexToOutEdges.next()) != null ){
                                if (currEdge.destinationVertex == leftBoundingEdges[0].originVertex) leftBoundingEdges.unshift(currEdge);
                                if (currEdge.destinationVertex == rightBoundingEdges[rightBoundingEdges.length-1].destinationVertex) rightBoundingEdges.push(currEdge.oppositeEdge);
                            }*/

                            while ( (currEdge = iterVertexToOutEdges.next()) != null ){
                                if (currEdge.destinationVertex.id === leftBoundingEdges[0].originVertex.id) leftBoundingEdges.unshift(currEdge);
                                if (currEdge.destinationVertex.id === rightBoundingEdges[rightBoundingEdges.length-1].destinationVertex.id) rightBoundingEdges.push(currEdge.oppositeEdge);
                            }
                            
                            newEdgeDownUp = new Edge();
                            newEdgeUpDown = new Edge();
                            newEdgeDownUp.setDatas(vertexDown, newEdgeUpDown, null, null, true, true);
                            newEdgeUpDown.setDatas(currVertex, newEdgeDownUp, null, null, true, true);
                            leftBoundingEdges.push(newEdgeDownUp);
                            rightBoundingEdges.push(newEdgeUpDown);
                            this.insertNewConstrainedEdge( segment, newEdgeDownUp, intersectedEdges, leftBoundingEdges, rightBoundingEdges );
                            
                            intersectedEdges.splice(0, intersectedEdges.length);
                            leftBoundingEdges.splice(0, leftBoundingEdges.length);
                            rightBoundingEdges.splice(0, rightBoundingEdges.length);

                            vertexDown = currVertex;
                            tempEdgeDownUp.originVertex = vertexDown;
                            currObjet = vertexDown;
                        } else {
                            //trace("edge is not constrained");
                            intersectedEdges.push(edgeLeft);
                            rightBoundingEdges.push(edgeLeft.prevLeftEdge);
                            currEdge = edgeLeft.oppositeEdge; // we keep the edge from left to right
                            currObjet = currEdge;
                        }
                    }
                }
            } else {
                Log( 'not finding') 
                return null;
            }
        }

        //return segment;

    }

    // fromSegment, edgeDownUp, intersectedEdges, leftBoundingEdges, rightBoundingEdges
    insertNewConstrainedEdge ( seg, edge, iEdge, lEdge, rEdge ) {

        this._edges.push( edge );
        this._edges.push( edge.oppositeEdge );
        edge.addFromConstraintSegment( seg );
        edge.oppositeEdge.fromConstraintSegments = edge.fromConstraintSegments;
        seg.addEdge( edge );
        edge.originVertex.addFromConstraintSegment( seg );
        edge.destinationVertex.addFromConstraintSegment( seg );
        this.untriangulate( iEdge );
        this.triangulate( lEdge, true );
        this.triangulate( rEdge, true );

    }

    deleteConstraintSegment ( segment ) {

        let vertexToDelete = [];
        let edge = null;
        let vertex;

        let l = segment.edges.length, i = 0;
        while( i < l ) {
            edge = segment.edges[i];
            edge.removeFromConstraintSegment(segment);
            if(edge.fromConstraintSegments.length == 0) {
                edge.isConstrained = false;
                edge.oppositeEdge.isConstrained = false;
            }
            vertex = edge.originVertex;
            vertex.removeFromConstraintSegment( segment );
            vertexToDelete.push( vertex );
            i++;
            
        }

        vertex = edge.destinationVertex;
        vertex.removeFromConstraintSegment( segment );
        vertexToDelete.push(vertex);

        l = vertexToDelete.length;
        i = 0;

        while( i < l ) {
            this.deleteVertex( vertexToDelete[i] );
            i++;
        }

        segment.dispose();
    }

    check () {

        let l = this._edges.length, i = 0;

        while( i < l ) {
            
            if(this._edges[i].nextLeftEdge == null) {
                Log( "!!! missing nextLeftEdge" );
                return;
            }
            i++;
            
        }

        Log( "check OK" );

    }

    insertVertex ( x, y ) {

        if(x < 0 || y < 0 || x > this.width || y > this.height) return null;
        this.__edgesToCheck.splice(0,this.__edgesToCheck.length);
        let inObject = Geom2D.locatePosition( new Point(x,y), this);
        let newVertex = null;
        switch(inObject.type) {
        case 0:
            let vertex = inObject;
            newVertex = vertex;
            break;
        case 1:
            let edge = inObject;
            newVertex = this.splitEdge(edge,x,y);
            break;
        case 2:
            let face = inObject;
            newVertex = this.splitFace(face,x,y);
            break;
        case 3:
            break;
        }
        this.restoreAsDelaunay();
        return newVertex;

    }

    flipEdge ( edge ) {

        let eBot_Top = edge;
        let eTop_Bot = edge.oppositeEdge;
        let eLeft_Right = new Edge();
        let eRight_Left = new Edge();
        let eTop_Left = eBot_Top.nextLeftEdge;
        let eLeft_Bot = eTop_Left.nextLeftEdge;
        let eBot_Right = eTop_Bot.nextLeftEdge;
        let eRight_Top = eBot_Right.nextLeftEdge;

        let vBot = eBot_Top.originVertex;
        let vTop = eTop_Bot.originVertex;
        let vLeft = eLeft_Bot.originVertex;
        let vRight = eRight_Top.originVertex;

        let fLeft = eBot_Top.leftFace;
        let fRight = eTop_Bot.leftFace;
        let fBot = new Face();
        let fTop = new Face();

        // add the new edges
        this._edges.push(eLeft_Right);
        this._edges.push(eRight_Left);
        // add the new faces
        this._faces.push(fTop);
        this._faces.push(fBot);
        // set vertex, edge and face references for the new LEFT_RIGHT and RIGHT-LEFT edges
        eLeft_Right.setDatas(vLeft,eRight_Left,eRight_Top,fTop,edge.isReal,edge.isConstrained);
        eRight_Left.setDatas(vRight,eLeft_Right,eLeft_Bot,fBot,edge.isReal,edge.isConstrained);
        // set edge references for the new TOP and BOTTOM faces
        fTop.setDatas(eLeft_Right);
        fBot.setDatas(eRight_Left);
        // check the edge references of TOP and BOTTOM vertice
        //if(vTop.edge === eTop_Bot) vTop.setDatas(eTop_Left);
        //if(vBot.edge === eBot_Top) vBot.setDatas(eBot_Right);
        if(vTop.edge.id === eTop_Bot.id) vTop.setDatas(eTop_Left);
        if(vBot.edge.id === eBot_Top.id) vBot.setDatas(eBot_Right);
        // set the new edge and face references for the 4 bouding edges
        eTop_Left.nextLeftEdge = eLeft_Right;
        eTop_Left.leftFace = fTop;
        eLeft_Bot.nextLeftEdge = eBot_Right;
        eLeft_Bot.leftFace = fBot;
        eBot_Right.nextLeftEdge = eRight_Left;
        eBot_Right.leftFace = fBot;
        eRight_Top.nextLeftEdge = eTop_Left;
        eRight_Top.leftFace = fTop;
        // remove the old TOP-BOTTOM and BOTTOM-TOP edges
        this._edges.splice(this._edges.indexOf(eBot_Top),1);
        this._edges.splice(this._edges.indexOf(eTop_Bot),1);
        eBot_Top.dispose();
        eTop_Bot.dispose();
        // remove the old LEFT and RIGHT faces        
        this._faces.splice(this._faces.indexOf(fLeft),1);
        this._faces.splice(this._faces.indexOf(fRight),1);
        fLeft.dispose();
        fRight.dispose();

        return eRight_Left;

    }

    splitEdge ( edge, x, y ) {

        this.__edgesToCheck.splice( 0, this.__edgesToCheck.length );

        let eLeft_Right = edge;
        let eRight_Left = eLeft_Right.oppositeEdge;
        let eRight_Top = eLeft_Right.nextLeftEdge;
        let eTop_Left = eRight_Top.nextLeftEdge;
        let eLeft_Bot = eRight_Left.nextLeftEdge;
        let eBot_Right = eLeft_Bot.nextLeftEdge;

        let vTop = eTop_Left.originVertex;
        let vLeft = eLeft_Right.originVertex;
        let vBot = eBot_Right.originVertex;
        let vRight = eRight_Left.originVertex;

        let fTop = eLeft_Right.leftFace;
        let fBot = eRight_Left.leftFace;

        // check distance from the position to edge end points
        if((vLeft.pos.x - x) * (vLeft.pos.x - x) + (vLeft.pos.y - y) * (vLeft.pos.y - y) <= EPSILON_SQUARED) return vLeft;
        if((vRight.pos.x - x) * (vRight.pos.x - x) + (vRight.pos.y - y) * (vRight.pos.y - y) <= EPSILON_SQUARED) return vRight;
        // create new objects
        let vCenter = new Vertex();
        let eTop_Center = new Edge();
        let eCenter_Top = new Edge();
        let eBot_Center = new Edge();
        let eCenter_Bot = new Edge();

        let eLeft_Center = new Edge();
        let eCenter_Left = new Edge();
        let eRight_Center = new Edge();
        let eCenter_Right = new Edge();

        let fTopLeft = new Face();
        let fBotLeft = new Face();
        let fBotRight = new Face();
        let fTopRight = new Face();
        // add the new vertex
        this._vertices.push(vCenter);
        // add the new edges
        this._edges.push(eCenter_Top);
        this._edges.push(eTop_Center);
        this._edges.push(eCenter_Left);
        this._edges.push(eLeft_Center);
        this._edges.push(eCenter_Bot);
        this._edges.push(eBot_Center);
        this._edges.push(eCenter_Right);
        this._edges.push(eRight_Center);
        // add the new faces
        this._faces.push(fTopRight);
        this._faces.push(fBotRight);
        this._faces.push(fBotLeft);
        this._faces.push(fTopLeft);
        // set pos and edge reference for the new CENTER vertex
        vCenter.setDatas( fTop.isReal ? eCenter_Top : eCenter_Bot );
        vCenter.pos.x = x;
        vCenter.pos.y = y;
        Geom2D.projectOrthogonaly( vCenter.pos, eLeft_Right );

        // set the new vertex, edge and face references for the new 8 center crossing edges
        eCenter_Top.setDatas(vCenter, eTop_Center, eTop_Left, fTopLeft, fTop.isReal);
        eTop_Center.setDatas(vTop, eCenter_Top, eCenter_Right, fTopRight, fTop.isReal);
        eCenter_Left.setDatas(vCenter, eLeft_Center, eLeft_Bot, fBotLeft, edge.isReal, edge.isConstrained);
        eLeft_Center.setDatas(vLeft, eCenter_Left, eCenter_Top, fTopLeft, edge.isReal, edge.isConstrained);
        eCenter_Bot.setDatas(vCenter, eBot_Center, eBot_Right, fBotRight, fBot.isReal);
        eBot_Center.setDatas(vBot, eCenter_Bot, eCenter_Left, fBotLeft, fBot.isReal);
        eCenter_Right.setDatas(vCenter, eRight_Center, eRight_Top, fTopRight, edge.isReal, edge.isConstrained);
        eRight_Center.setDatas(vRight, eCenter_Right, eCenter_Bot, fBotRight, edge.isReal, edge.isConstrained);
        // set the new edge references for the new 4 faces
        fTopLeft.setDatas(eCenter_Top,fTop.isReal);
        fBotLeft.setDatas(eCenter_Left,fBot.isReal);
        fBotRight.setDatas(eCenter_Bot,fBot.isReal);
        fTopRight.setDatas(eCenter_Right,fTop.isReal);

        // check the edge references of LEFT and RIGHT vertices
        //if(vLeft.edge === eLeft_Right) vLeft.setDatas(eLeft_Center);
        //if(vRight.edge === eRight_Left) vRight.setDatas(eRight_Center);
        if( vLeft.edge.id === eLeft_Right.id ) vLeft.setDatas(eLeft_Center);
        if( vRight.edge.id === eRight_Left.id ) vRight.setDatas(eRight_Center);
        // set the new edge and face references for the 4 bounding edges
        eTop_Left.nextLeftEdge = eLeft_Center;
        eTop_Left.leftFace = fTopLeft;
        eLeft_Bot.nextLeftEdge = eBot_Center;
        eLeft_Bot.leftFace = fBotLeft;
        eBot_Right.nextLeftEdge = eRight_Center;
        eBot_Right.leftFace = fBotRight;
        eRight_Top.nextLeftEdge = eTop_Center;
        eRight_Top.leftFace = fTopRight;

        // if the edge was constrained, we must:
        // - add the segments the edge is from to the 2 new
        // - update the segments the edge is from by deleting the old edge and inserting the 2 new
        // - add the segments the edge is from to the new vertex
        if(eLeft_Right.isConstrained) {

            let fromSegments = eLeft_Right.fromConstraintSegments;
            eLeft_Center.fromConstraintSegments = fromSegments.slice(0);
            eCenter_Left.fromConstraintSegments = eLeft_Center.fromConstraintSegments;
            eCenter_Right.fromConstraintSegments = fromSegments.slice(0);
            eRight_Center.fromConstraintSegments = eCenter_Right.fromConstraintSegments;
            let edges;
            let index;
            //let n = 0;
            let l = eLeft_Right.fromConstraintSegments.length, i = 0;
            while(i < l) {
                //i = n++;
                edges = eLeft_Right.fromConstraintSegments[i].edges;
                index = edges.indexOf(eLeft_Right);
                if(index != -1) {
                    edges.splice(index, 1, eLeft_Center, eCenter_Right);
                } else {
                    edges.splice(edges.indexOf(eRight_Left), 1, eRight_Center, eCenter_Left);
                }
                i++;
            }
            vCenter.fromConstraintSegments = fromSegments.slice(0);
        }

        // remove the old LEFT-RIGHT and RIGHT-LEFT edges        
        this._edges.splice(this._edges.indexOf(eLeft_Right),1);
        this._edges.splice(this._edges.indexOf(eRight_Left),1);
        eLeft_Right.dispose();
        eRight_Left.dispose();

        // remove the old TOP and BOTTOM faces
        this._faces.splice(this._faces.indexOf(fTop),1);
        this._faces.splice(this._faces.indexOf(fBot),1);
        fTop.dispose();
        fBot.dispose();

        // add new bounds references for Delaunay restoring
        this.__centerVertex = vCenter;
        this.__edgesToCheck.push(eTop_Left);
        this.__edgesToCheck.push(eLeft_Bot);
        this.__edgesToCheck.push(eBot_Right);
        this.__edgesToCheck.push(eRight_Top);

        return vCenter;

    }

    splitFace ( face, x, y ) {

        this.__edgesToCheck.splice(0,this.__edgesToCheck.length);
        let eTop_Left = face.edge;
        let eLeft_Right = eTop_Left.nextLeftEdge;
        let eRight_Top = eLeft_Right.nextLeftEdge;
        let vTop = eTop_Left.originVertex;
        let vLeft = eLeft_Right.originVertex;
        let vRight = eRight_Top.originVertex;

        // create new objects
        let vCenter = new Vertex();

        let eTop_Center = new Edge();
        let eCenter_Top = new Edge();
        let eLeft_Center = new Edge();
        let eCenter_Left = new Edge();
        let eRight_Center = new Edge();
        let eCenter_Right = new Edge();

        let fTopLeft = new Face();
        let fBot = new Face();
        let fTopRight = new Face();

        // add the new vertex
        this._vertices.push(vCenter);
        // add the new edges
        this._edges.push(eTop_Center);
        this._edges.push(eCenter_Top);
        this._edges.push(eLeft_Center);
        this._edges.push(eCenter_Left);
        this._edges.push(eRight_Center);
        this._edges.push(eCenter_Right);
        // add the new faces
        this._faces.push(fTopLeft);
        this._faces.push(fBot);
        this._faces.push(fTopRight);

        // set pos and edge reference for the new CENTER vertex
        vCenter.setDatas(eCenter_Top);
        vCenter.pos.x = x;
        vCenter.pos.y = y;

        // set the new vertex, edge and face references for the new 6 center crossing edges
        eTop_Center.setDatas(vTop,eCenter_Top,eCenter_Right,fTopRight);
        eCenter_Top.setDatas(vCenter,eTop_Center,eTop_Left,fTopLeft);
        eLeft_Center.setDatas(vLeft,eCenter_Left,eCenter_Top,fTopLeft);
        eCenter_Left.setDatas(vCenter,eLeft_Center,eLeft_Right,fBot);
        eRight_Center.setDatas(vRight,eCenter_Right,eCenter_Left,fBot);
        eCenter_Right.setDatas(vCenter,eRight_Center,eRight_Top,fTopRight);

        // set the new edge references for the new 3 faces
        fTopLeft.setDatas(eCenter_Top);
        fBot.setDatas(eCenter_Left);
        fTopRight.setDatas(eCenter_Right);

        // set the new edge and face references for the 3 bounding edges
        eTop_Left.nextLeftEdge = eLeft_Center;
        eTop_Left.leftFace = fTopLeft;
        eLeft_Right.nextLeftEdge = eRight_Center;
        eLeft_Right.leftFace = fBot;
        eRight_Top.nextLeftEdge = eTop_Center;
        eRight_Top.leftFace = fTopRight;

        // we remove the old face
        this._faces.splice(this._faces.indexOf(face),1);
        face.dispose();

        // add new bounds references for Delaunay restoring
        this.__centerVertex = vCenter;
        this.__edgesToCheck.push(eTop_Left);
        this.__edgesToCheck.push(eLeft_Right);
        this.__edgesToCheck.push(eRight_Top);

        return vCenter;

    }

    restoreAsDelaunay () {

        let edge;
        while(this.__edgesToCheck.length > 0) {
            edge = this.__edgesToCheck.shift();
            if(edge.isReal && !edge.isConstrained && !Geom2D.isDelaunay(edge)) {
                //if(edge.nextLeftEdge.destinationVertex == this.__centerVertex) {
                if(edge.nextLeftEdge.destinationVertex.id === this.__centerVertex.id) {
                    this.__edgesToCheck.push(edge.nextRightEdge);
                    this.__edgesToCheck.push(edge.prevRightEdge);
                } else {
                    this.__edgesToCheck.push(edge.nextLeftEdge);
                    this.__edgesToCheck.push(edge.prevLeftEdge);
                }
                this.flipEdge(edge);
            }
        }

    }

    // Delete a vertex IF POSSIBLE and then fill the hole with a new triangulation.
    // A vertex can be deleted if:
    // - it is free of constraint segment (no adjacency to any constrained edge)
    // - it is adjacent to exactly 2 contrained edges and is not an end point of any constraint segment
    deleteVertex ( vertex ) {

        let i;
        let freeOfConstraint;
        let iterEdges = new FromVertexToOutgoingEdges();
        iterEdges.fromVertex = vertex;
        iterEdges.realEdgesOnly = false;
        let edge;
        let outgoingEdges = [];
        freeOfConstraint = (vertex.fromConstraintSegments.length == 0)? true : false;

        let bound = [];
        let realA = false;
        let realB = false;
        let boundA = [];
        let boundB = [];
        if(freeOfConstraint){ 
            //while(edge = iterEdges.next()) {
            while((edge = iterEdges.next()) != null) {
                outgoingEdges.push(edge);
                bound.push(edge.nextLeftEdge);
            }
        } else {
            // we check if the vertex is an end point of a constraint segment
            let edges;
            let _g1 = 0;
            let _g = vertex.fromConstraintSegments.length;
            while(_g1 < _g) {
                let i1 = _g1++;
                edges = vertex.fromConstraintSegments[i1].edges;
                //if(edges[0].originVertex == vertex || edges[edges.length - 1].destinationVertex == vertex) return false;
                if(edges[0].originVertex.id === vertex.id || edges[edges.length - 1].destinationVertex.id === vertex.id) return false;
            }
            // we check the count of adjacent constrained edges
            let count = 0;
            //while(edge = iterEdges.next()) {
            while((edge = iterEdges.next()) != null) {
                outgoingEdges.push(edge);
                if(edge.isConstrained) {
                    count++;
                    if(count > 2) return false;
                }
            }

            // if not disqualified, then we can process
            boundA = [];
            boundB = [];
            let constrainedEdgeA = null;
            let constrainedEdgeB = null;
            let edgeA = new Edge();
            let edgeB = new Edge();
            this._edges.push(edgeA);
            this._edges.push(edgeB);
            let _g11 = 0;
            let _g2 = outgoingEdges.length;
            while(_g11 < _g2) {
                let i2 = _g11++;
                edge = outgoingEdges[i2];
                if(edge.isConstrained) {
                    if(constrainedEdgeA == null) {
                        edgeB.setDatas(edge.destinationVertex,edgeA,null,null,true,true);
                        boundA.push(edgeA);
                        boundA.push(edge.nextLeftEdge);
                        boundB.push(edgeB);
                        constrainedEdgeA = edge;
                    } else if(constrainedEdgeB == null) {
                        edgeA.setDatas(edge.destinationVertex,edgeB,null,null,true,true);
                        boundB.push(edge.nextLeftEdge);
                        constrainedEdgeB = edge;
                    }
                } 
                else if(constrainedEdgeA == null) boundB.push(edge.nextLeftEdge); 
                else if(constrainedEdgeB == null) boundA.push(edge.nextLeftEdge); 
                else boundB.push(edge.nextLeftEdge);
            }
            // keep infos about reality
            realA = constrainedEdgeA.leftFace.isReal;
            realB = constrainedEdgeB.leftFace.isReal;
            // we update the segments infos
            edgeA.fromConstraintSegments = constrainedEdgeA.fromConstraintSegments.slice(0);
            edgeB.fromConstraintSegments = edgeA.fromConstraintSegments;
            let index;
            let _g12 = 0;
            let _g3 = vertex.fromConstraintSegments.length;
            while(_g12 < _g3) {
                let i3 = _g12++;
                edges = vertex.fromConstraintSegments[i3].edges;
                index = edges.indexOf(constrainedEdgeA);
                if(index != -1) {
                    edges.splice(index-1, 2, edgeA);
                    //edges.splice(index - 1,2);
                    //edges.splice(index - 1,0,edgeA);
                } else {
                    edges.splice(edges.indexOf(constrainedEdgeB)-1, 2, edgeB);
                    //let index2 = edges.indexOf(constrainedEdgeB) - 1;
                    //edges.splice(index2,2);
                    //edges.splice(index2,0,edgeB);
                }
            }
        }
        // Deletion of old faces and edges
        let faceToDelete;
        let _g13 = 0;
        let _g4 = outgoingEdges.length;
        while(_g13 < _g4) {
            let i4 = _g13++;
            edge = outgoingEdges[i4];
            faceToDelete = edge.leftFace;
            this._faces.splice(this._faces.indexOf(faceToDelete),1);
            faceToDelete.dispose();
            edge.destinationVertex.edge = edge.nextLeftEdge;
            this._edges.splice( this._edges.indexOf(edge.oppositeEdge),1);
            edge.oppositeEdge.dispose();
            this._edges.splice(this._edges.indexOf(edge),1);
            edge.dispose();
        }
        this._vertices.splice(this._vertices.indexOf(vertex),1);
        vertex.dispose();
        // finally we triangulate
        if(freeOfConstraint) this.triangulate(bound,true); 
        else {
            this.triangulate(boundA,realA);
            this.triangulate(boundB,realB);
        }
        return true;
    }
    // untriangulate is usually used while a new edge insertion in order to delete the intersected edges
    // edgesList is a list of chained edges oriented from right to left
    untriangulate ( edgesList ) {
        // we clean useless faces and adjacent vertices
        let i;
        let verticesCleaned = new Dictionary( 1 );
        let currEdge;
        let outEdge;
        let _g1 = 0;
        let _g = edgesList.length;
        while(_g1 < _g) {
            let i1 = _g1++;
            currEdge = edgesList[i1];
            if(verticesCleaned.get(currEdge.originVertex) == null ){
                currEdge.originVertex.edge = currEdge.prevLeftEdge.oppositeEdge;
                verticesCleaned.set(currEdge.originVertex,true);
            }
            if(verticesCleaned.get(currEdge.destinationVertex) == null ){
                currEdge.destinationVertex.edge = currEdge.nextLeftEdge;
                verticesCleaned.set(currEdge.destinationVertex,true);
            }
            this._faces.splice(this._faces.indexOf(currEdge.leftFace),1);
            currEdge.leftFace.dispose();
            if(i1 == edgesList.length - 1) {
                this._faces.splice(this._faces.indexOf(currEdge.rightFace),1);
                currEdge.rightFace.dispose();
            }
        }
        verticesCleaned.dispose();
        // finally we delete the intersected edges
        let _g11 = 0;
        let _g2 = edgesList.length;
        while(_g11 < _g2) {
            let i2 = _g11++;
            currEdge = edgesList[i2];
            this._edges.splice(this._edges.indexOf(currEdge.oppositeEdge),1);
            this._edges.splice(this._edges.indexOf(currEdge),1);
            currEdge.oppositeEdge.dispose();
            currEdge.dispose();
        }
    }

    // triangulate is usually used to fill the hole after deletion of a vertex from mesh or after untriangulation
    // - bounds is the list of edges in CCW bounding the surface to retriangulate,
    triangulate ( bound, isReal ) {

        if(bound.length < 2) {
            Log("BREAK ! the hole has less than 2 edges");
            return;
        // if the hole is a 2 edges polygon, we have a big problem
        } else if(bound.length === 2) {
            Log("BREAK ! the hole has only 2 edges");
           // DDLS.Debug.trace("  - edge0: " + bound[0].originVertex.id + " -> " + bound[0].destinationVertex.id,{ fileName : "Mesh.hx", lineNumber : 1404, className : "DDLS.Mesh", methodName : "triangulate"});
           // DDLS.Debug.trace("  - edge1: " + bound[1].originVertex.id + " -> " + bound[1].destinationVertex.id,{ fileName : "Mesh.hx", lineNumber : 1405, className : "DDLS.Mesh", methodName : "triangulate"});
            return;
        // if the hole is a 3 edges polygon:
        } else if(bound.length === 3) {

            let f = new Face();
            f.setDatas(bound[0], isReal);
            this._faces.push(f);
            bound[0].leftFace = f;
            bound[1].leftFace = f;
            bound[2].leftFace = f;
            bound[0].nextLeftEdge = bound[1];
            bound[1].nextLeftEdge = bound[2];
            bound[2].nextLeftEdge = bound[0];
        // if more than 3 edges, we process recursively:
        } else {
            let baseEdge = bound[0];
            let vertexA = baseEdge.originVertex;
            let vertexB = baseEdge.destinationVertex;
            let vertexC;
            let vertexCheck;
            let circumcenter = new Point();
            let radiusSquared = 0;
            let distanceSquared = 0;
            let isDelaunay = false;
            let index = 0;
            let i;
            let _g1 = 2;
            let _g = bound.length;
            while(_g1 < _g) {
                let i1 = _g1++;
                vertexC = bound[i1].originVertex;
                if(Geom2D.getRelativePosition2(vertexC.pos,baseEdge) == 1) {
                    index = i1;
                    isDelaunay = true;
                    //DDLS.Geom2D.getCircumcenter(vertexA.pos.x,vertexA.pos.y,vertexB.pos.x,vertexB.pos.y,vertexC.pos.x,vertexC.pos.y,circumcenter);
                    Geom2D.getCircumcenter(vertexA.pos, vertexB.pos, vertexC.pos, circumcenter);
                    radiusSquared = Squared(vertexA.pos.x - circumcenter.x, vertexA.pos.y - circumcenter.y);
                    // for perfect regular n-sides polygons, checking strict delaunay circumcircle condition is not possible, so we substract EPSILON to circumcircle radius:
                    radiusSquared -= EPSILON_SQUARED;
                    let _g3 = 2;
                    let _g2 = bound.length;
                    while(_g3 < _g2) {
                        let j = _g3++;
                        if(j != i1) {
                            vertexCheck = bound[j].originVertex;
                            distanceSquared = Squared(vertexCheck.pos.x - circumcenter.x, vertexCheck.pos.y - circumcenter.y);
                            if(distanceSquared < radiusSquared) {
                                isDelaunay = false;
                                break;
                            }
                        }
                    }
                    if(isDelaunay) break;
                }
            }
            
            if(!isDelaunay) {
                // for perfect regular n-sides polygons, checking delaunay circumcircle condition is not possible
                Log("NO DELAUNAY FOUND");
                /*let s = "";
                let _g11 = 0;
                let _g4 = bound.length;
                while(_g11 < _g4) {
                    let i2 = _g11++;
                    s += bound[i2].originVertex.pos.x + " , ";
                    s += bound[i2].originVertex.pos.y + " , ";
                    s += bound[i2].destinationVertex.pos.x + " , ";
                    s += bound[i2].destinationVertex.pos.y + " , ";
                }*/
                index = 2;
            }

            let edgeA, edgeAopp, edgeB, edgeBopp, boundA, boundB, boundM = [];

            if(index < (bound.length - 1)) {
                edgeA = new Edge();
                edgeAopp = new Edge();
                this._edges.push( edgeA, edgeAopp );
                //this._edges.push(edgeAopp);
                edgeA.setDatas(vertexA,edgeAopp,null,null,isReal,false);
                edgeAopp.setDatas(bound[index].originVertex,edgeA,null,null,isReal,false);
                boundA = bound.slice(index);
                boundA.push(edgeA);
                this.triangulate(boundA,isReal);
            }
            if(index > 2) {
                edgeB = new Edge();
                edgeBopp = new Edge();
                this._edges.push(edgeB, edgeBopp);
                //this._edges.push(edgeBopp);
                edgeB.setDatas(bound[1].originVertex,edgeBopp,null,null,isReal,false);
                edgeBopp.setDatas(bound[index].originVertex,edgeB,null,null,isReal,false);
                boundB = bound.slice(1,index);
                boundB.push(edgeBopp);
                this.triangulate(boundB,isReal);
            }
            
            if( index === 2 ) boundM.push( baseEdge, bound[1], edgeAopp ); 
            else if( index === (bound.length - 1) ) boundM.push(baseEdge, edgeB, bound[index]); 
            else boundM.push(baseEdge, edgeB, edgeAopp );
            
            this.triangulate( boundM, isReal );

        }

        // test
        //this.deDuplicEdge();

    }

    findPositionFromBounds ( x, y ) {

        if(x <= 0) {
            if(y <= 0) return 1; 
            else if(y >= this.height) return 7; 
            else return 8;
        } else if(x >= this.width) {
            if(y <= 0) return 3; 
            else if(y >= this.height) return 5; 
            else return 4;
        } else if(y <= 0) return 2; 
        else if(y >= this.height) return 6; 
        else return 0;

    }

    // for drawing

    compute_Data () {

        this.AR_vertex = [];
        this.AR_edge = [];

        //let data_vertex = [];
        //let data_edges = [];
        let vertex;
        let edge;
        let holdingFace;
        let iterVertices = new FromMeshToVertices();
        iterVertices.fromMesh = this;
        let iterEdges = new FromVertexToIncomingEdges();
        let dictVerticesDone = new Dictionary( 1 );

        while((vertex = iterVertices.next()) != null) {

            dictVerticesDone.set(vertex,true);
            if( !this.vertexIsInsideAABB( vertex, this ) ) continue;
            this.AR_vertex.push(vertex.pos.x, vertex.pos.y);
            iterEdges.fromVertex = vertex;
            while((edge = iterEdges.next()) != null){ 
                if(!dictVerticesDone.get(edge.originVertex)){  
                    this.AR_edge = this.AR_edge.concat(edge.getDatas());
                }
            }
        }

        dictVerticesDone.dispose();

        /*this.AR_vertex = new ARRAY( data_vertex );
        this.AR_edge = new ARRAY( data_edges );

        data_vertex = null;
        data_edges = null;*/

    }

    vertexIsInsideAABB ( vertex, mesh ) {

        return !( vertex.pos.x < 0 || vertex.pos.x > mesh.width || vertex.pos.y < 0 || vertex.pos.y > mesh.height );

    }

}