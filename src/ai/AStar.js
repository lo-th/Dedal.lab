import { Dictionary, Log } from '../constants';
import { _Math } from '../math/Math';
import { Point } from '../math/Point';
import { Geom2D } from '../math/Geom2D';
import { FromFaceToInnerEdges } from '../core/Iterators';

function AStar () {

    this.iterEdge = new FromFaceToInnerEdges();
    this.mesh = null;
    this._radius = 0;
    this.radiusSquared = 0;
    this.diameter = 0;
    this.diameterSquared = 0;


    Object.defineProperty(this, 'radius', {
        get: function() { return this._radius; },
        set: function(value) { 
            this._radius = value;
            this.radiusSquared = this._radius*this._radius;
            this.diameter = this._radius * 2;
            this.diameterSquared = this.diameter * this.diameter; 
        }
    });

};

AStar.prototype = {

    constructor: AStar,

    dispose: function() {

        this.mesh = null;
        this.closedFaces.dispose();
        this.openedFaces.dispose();
        this.entryEdges.dispose();
        this.predecessor.dispose();
        this.entryX.dispose();
        this.entryY.dispose();
        this.scoreF.dispose();
        this.scoreG.dispose();
        this.scoreH.dispose();

        this.sortedOpenedFaces = null;
        this.closedFaces = null;
        this.openedFaces = null;
        this.entryEdges = null;
        this.entryX = null;
        this.entryY = null;
        this.scoreF = null;
        this.scoreG = null;
        this.scoreH = null;
        this.predecessor = null;
    },

    findPath: function ( from, target, resultListFaces, resultListEdges ) {

        this.sortedOpenedFaces = [];
        this.closedFaces = new Dictionary(1);
        this.openedFaces = new Dictionary(1);
        this.entryEdges = new Dictionary(1);
        this.predecessor = new Dictionary(1);
        this.entryX = new Dictionary(1);
        this.entryY = new Dictionary(1);
        this.scoreF = new Dictionary(1);
        this.scoreG = new Dictionary(1);
        this.scoreH = new Dictionary(1);
        

        var loc, locEdge, locVertex, distance, p1, p2, p3;

        loc = Geom2D.locatePosition(from, this.mesh);
        if ( loc.type == 0 ){
            // vertex are always in constraint, so we abort
            locVertex = loc; return;
        } else if ( loc.type == 1 ){
            locEdge = loc
            // if the vertex lies on a constrained edge, we abort
            if (locEdge.isConstrained) return;
            this.fromFace = locEdge.leftFace;
        } else {
            this.fromFace = loc;
        }
        //
        loc = Geom2D.locatePosition( target, this.mesh );
        if ( loc.type == 0 ){
            locVertex = loc;
            this.toFace = locVertex.edge.leftFace;
        }else if ( loc.type == 1 ){
            locEdge = loc;
            this.toFace = locEdge.leftFace;
        }else{
            this.toFace = loc;
        }


        /*loc = Geom2D.locatePosition(fromX,fromY,this.mesh);
        switch(loc[1]) {
        case 0:
            var vertex = loc[2];
            locVertex = vertex;
            return;
        case 1:
            var edge = loc[2];
            locEdge = edge;
            if(locEdge.isConstrained) return;
            this.fromFace = locEdge.leftFace;
            break;
        case 2:
            var face = loc[2];
            this.fromFace = face;
            break;
        case 3:
            break;
        }
        loc = Geom2D.locatePosition(toX,toY,this.mesh);
        switch(loc[1]) {
        case 0:
            var vertex1 = loc[2];
            locVertex = vertex1;
            this.toFace = locVertex.edge.leftFace;
            break;
        case 1:
            var edge1 = loc[2];
            locEdge = edge1;
            this.toFace = locEdge.leftFace;
            break;
        case 2:
            var face1 = loc[2];
            this.toFace = face1;
            break;
        case 3:
            break;
        }*/
        this.sortedOpenedFaces.push(this.fromFace);
        this.entryEdges.set(this.fromFace,null);
        this.entryX.set(this.fromFace,from.x);
        this.entryY.set(this.fromFace,from.y);
        this.scoreG.set(this.fromFace,0);

        var dist = _Math.SquaredSqrt(target.x - from.x, target.y - from.y);

        this.scoreH.set(this.fromFace,dist);
        this.scoreF.set(this.fromFace,dist);

        var innerEdge, neighbourFace, f, g, h;
        var fromPoint = new Point();
        var entryPoint = new Point();
        var distancePoint = new Point();
        var fillDatas = false;
        while(true) {
            if(this.sortedOpenedFaces.length == 0) {
                Log("AStar no path found");
                this.curFace = null;
                break;
            }
            this.curFace = this.sortedOpenedFaces.pop();
            if(this.curFace == this.toFace) break;
            this.iterEdge.fromFace = this.curFace;
            while((innerEdge = this.iterEdge.next()) != null) {
                if(innerEdge.isConstrained) continue;
                neighbourFace = innerEdge.rightFace;
                if(!this.closedFaces.get(neighbourFace)) {
                    if(this.curFace != this.fromFace && this._radius > 0 && !this.isWalkableByRadius(this.entryEdges.get(this.curFace),this.curFace,innerEdge)) continue;
                    fromPoint.x = this.entryX.get(this.curFace);
                    fromPoint.y = this.entryY.get(this.curFace);
                    entryPoint.x = fromPoint.x;
                    entryPoint.y = fromPoint.y;
                    entryPoint.x = (innerEdge.originVertex.pos.x + innerEdge.destinationVertex.pos.x) * 0.5;
                    entryPoint.y = (innerEdge.originVertex.pos.y + innerEdge.destinationVertex.pos.y) * 0.5;
                    distancePoint.x = entryPoint.x - target.x;
                    distancePoint.y = entryPoint.y - target.y;
                    h = distancePoint.length();
                    distancePoint.x = fromPoint.x - entryPoint.x;
                    distancePoint.y = fromPoint.y - entryPoint.y;
                    g = this.scoreG.get(this.curFace) + distancePoint.length();
                    f = h + g;
                    fillDatas = false;
                    if(this.openedFaces.get(neighbourFace) == null || !this.openedFaces.get(neighbourFace)) {
                        this.sortedOpenedFaces.push(neighbourFace);
                        this.openedFaces.set(neighbourFace,true);
                        //true;
                        fillDatas = true;
                    } else if(this.scoreF.get(neighbourFace) > f) fillDatas = true;
                    if(fillDatas) {
                        this.entryEdges.set(neighbourFace,innerEdge);
                        this.entryX.set(neighbourFace,entryPoint.x);
                        this.entryY.set(neighbourFace,entryPoint.y);
                        this.scoreF.set(neighbourFace,f);
                        this.scoreG.set(neighbourFace,g);
                        this.scoreH.set(neighbourFace,h);
                        this.predecessor.set(neighbourFace,this.curFace);
                    }
                }
            }
            this.openedFaces.set(this.curFace,false);
            this.closedFaces.set(this.curFace,true);

            this.sortedOpenedFaces.sort( function(a,b) {
                if(this.scoreF.get(a) == this.scoreF.get(b)) return 0;
                else if(this.scoreF.get(a) < this.scoreF.get(b)) return 1;
                else return -1;
                }.bind(this)
            );
        }
        if(this.curFace == null) return;
        resultListFaces.push(this.curFace);
        while(this.curFace != this.fromFace) {
            resultListEdges.unshift(this.entryEdges.get(this.curFace));
            this.curFace = this.predecessor.get(this.curFace);
            resultListFaces.unshift(this.curFace);
        }
    },
    /*sortingFaces: function(a,b) {
        if(this.scoreF.get(a) == this.scoreF.get(b)) return 0; 
        else if(this.scoreF.get(a) < this.scoreF.get(b)) return 1; 
        else return -1;
    },*/
    isWalkableByRadius: function ( fromEdge, throughFace, toEdge ) {
        
        var vA = null; // the vertex on fromEdge not on toEdge
        var vB = null; // the vertex on toEdge not on fromEdge
        var vC = null; // the common vertex of the 2 edges (pivot)

        // we identify the points
        if(fromEdge.originVertex == toEdge.originVertex) {
            vA = fromEdge.destinationVertex;
            vB = toEdge.destinationVertex;
            vC = fromEdge.originVertex;
        } else if(fromEdge.destinationVertex == toEdge.destinationVertex) {
            vA = fromEdge.originVertex;
            vB = toEdge.originVertex;
            vC = fromEdge.destinationVertex;
        } else if(fromEdge.originVertex == toEdge.destinationVertex) {
            vA = fromEdge.destinationVertex;
            vB = toEdge.originVertex;
            vC = fromEdge.originVertex;
        } else if(fromEdge.destinationVertex == toEdge.originVertex) {
            vA = fromEdge.originVertex;
            vB = toEdge.destinationVertex;
            vC = fromEdge.destinationVertex;
        }

        var dot, result, distSquared, adjEdge;
        // if we have a right or obtuse angle on CAB
        dot = (vC.pos.x - vA.pos.x) * (vB.pos.x - vA.pos.x) + (vC.pos.y - vA.pos.y) * (vB.pos.y - vA.pos.y);
        if(dot <= 0) {
            // we compare length of AC with radius
            distSquared = _Math.Squared(vC.pos.x - vA.pos.x, vC.pos.y - vA.pos.y);
            if(distSquared >= this.diameterSquared) return true;
            else return false;
        }

        // if we have a right or obtuse angle on CBA
        dot = (vC.pos.x - vB.pos.x) * (vA.pos.x - vB.pos.x) + (vC.pos.y - vB.pos.y) * (vA.pos.y - vB.pos.y);
        if(dot <= 0) {
            // we compare length of BC with radius
            distSquared = _Math.Squared(vC.pos.x - vB.pos.x, vC.pos.y - vB.pos.y);
            if(distSquared >= this.diameterSquared) return true;
            else return false;
        }
        // we identify the adjacent edge (facing pivot vertex)
        if(throughFace.edge != fromEdge && throughFace.edge.oppositeEdge != fromEdge && throughFace.edge != toEdge && throughFace.edge.oppositeEdge != toEdge) adjEdge = throughFace.edge; 
        else if(throughFace.edge.nextLeftEdge != fromEdge && throughFace.edge.nextLeftEdge.oppositeEdge != fromEdge && throughFace.edge.nextLeftEdge != toEdge && throughFace.edge.nextLeftEdge.oppositeEdge != toEdge) adjEdge = throughFace.edge.nextLeftEdge; 
        else adjEdge = throughFace.edge.prevLeftEdge;

        // if the adjacent edge is constrained, we check the distance of orthognaly projected
        if(adjEdge.isConstrained) {
            var proj = new Point(vC.pos.x,vC.pos.y);
            Geom2D.projectOrthogonaly( proj, adjEdge );
            distSquared = _Math.Squared(proj.x - vC.pos.x, proj.y - vC.pos.y);
            if(distSquared >= this.diameterSquared) return true; 
            else return false;
        } else {// if the adjacent is not constrained
            var distSquaredA = _Math.Squared(vC.pos.x - vA.pos.x, vC.pos.y - vA.pos.y);
            var distSquaredB = _Math.Squared(vC.pos.x - vB.pos.x, vC.pos.y - vB.pos.y);
            if(distSquaredA < this.diameterSquared || distSquaredB < this.diameterSquared) return false; 
            else {
                var vFaceToCheck = [];
                var vFaceIsFromEdge = [];
                var facesDone = new Dictionary(1);
                vFaceIsFromEdge.push(adjEdge);
                if(adjEdge.leftFace == throughFace) {
                    vFaceToCheck.push(adjEdge.rightFace);
                    var k = adjEdge.rightFace;
                    facesDone.set(k,true);
                } else {
                    vFaceToCheck.push(adjEdge.leftFace);
                    var k1 = adjEdge.leftFace;
                    facesDone.set(k1,true);
                }
                var currFace, faceFromEdge, currEdgeA, nextFaceA, currEdgeB, nextFaceB;
                while(vFaceToCheck.length > 0) {
                    currFace = vFaceToCheck.shift();
                    faceFromEdge = vFaceIsFromEdge.shift();

                    // we identify the 2 edges to evaluate
                    if(currFace.edge == faceFromEdge || currFace.edge == faceFromEdge.oppositeEdge) {
                        currEdgeA = currFace.edge.nextLeftEdge;
                        currEdgeB = currFace.edge.nextLeftEdge.nextLeftEdge;
                    } else if(currFace.edge.nextLeftEdge == faceFromEdge || currFace.edge.nextLeftEdge == faceFromEdge.oppositeEdge) {
                        currEdgeA = currFace.edge;
                        currEdgeB = currFace.edge.nextLeftEdge.nextLeftEdge;
                    } else {
                        currEdgeA = currFace.edge;
                        currEdgeB = currFace.edge.nextLeftEdge;
                    }

                    // we identify the faces related to the 2 edges
                    if(currEdgeA.leftFace == currFace) nextFaceA = currEdgeA.rightFace; 
                    else nextFaceA = currEdgeA.leftFace;

                    if(currEdgeB.leftFace == currFace) nextFaceB = currEdgeB.rightFace; 
                    else nextFaceB = currEdgeB.leftFace;

                    // we check if the next face is not already in pipe
                    // and if the edge A is close to pivot vertex
                    if(!facesDone.get(nextFaceA) && Geom2D.distanceSquaredVertexToEdge(vC,currEdgeA) < this.diameterSquared) {
                        // if the edge is constrained
                        if(currEdgeA.isConstrained) return false; // so it is not walkable
                        else {
                            // if the edge is not constrained, we continue the search
                            vFaceToCheck.push(nextFaceA);
                            vFaceIsFromEdge.push(currEdgeA);
                            facesDone.set(nextFaceA,true);
                        }
                    }
                    // we check if the next face is not already in pipe
                    // and if the edge B is close to pivot vertex
                    if(!facesDone.get(nextFaceB) && Geom2D.distanceSquaredVertexToEdge(vC,currEdgeB) < this.diameterSquared) {
                        // if the edge is constrained
                        if(currEdgeB.isConstrained) return false; // so it is not walkable
                        else {
                            // if the edge is not constrained, we continue the search
                            vFaceToCheck.push(nextFaceB);
                            vFaceIsFromEdge.push(currEdgeB);
                            facesDone.set(nextFaceB,true);
                        }
                    }
                }
                // if we didn't previously meet a constrained edge
                facesDone.dispose();
                return true;
            }

        }
        //?\\return true;
    }
};

export { AStar };