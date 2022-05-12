import { Dictionary, Log } from '../constants.js';
import { Squared, SquaredSqrt } from '../core/Tools.js';
import { Point } from '../math/Point.js';
import { Geom2D } from '../math/Geom2D.js';
import { FromFaceToInnerEdges } from '../core/Iterators.js';

export class AStar {

    constructor () {

        this.fromFace = null
        this.toFace = null
        this.curFace = null

        this.iterEdge = new FromFaceToInnerEdges()
        this.mesh = null
        this._radius = 0
        this.radiusSquared = 0
        this.diameter = 0
        this.diameterSquared = 0

    }

    get radius () {
        return this._radius;
    }

    set radius ( value ) {

        this._radius = value
        this.radiusSquared = this._radius * this._radius
        this.diameter = this._radius * 2
        this.diameterSquared = this.diameter * this.diameter

    }

    dispose () {

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
    }

    findPath ( from, target, resultListFaces, resultListEdges ) {

        this.sortedOpenedFaces = [];
        this.closedFaces = new Dictionary( 1 );
        this.openedFaces = new Dictionary( 1 );
        this.entryEdges = new Dictionary( 1 );
        this.predecessor = new Dictionary( 1 );
        this.entryX = new Dictionary( 1 );
        this.entryY = new Dictionary( 1 );
        this.scoreF = new Dictionary( 1 );
        this.scoreG = new Dictionary( 1 );
        this.scoreH = new Dictionary( 1 );
        

        let loc, distance, p1, p2, p3;

        loc = Geom2D.locatePosition( from, this.mesh );

        if ( loc.type === 0 ){
            // vertex are always in constraint, so we abort
            return;
        } else if ( loc.type === 1 ){
            // if the vertex lies on a constrained edge, we abort
            if ( loc.isConstrained ) return;
            this.fromFace = loc.leftFace;
        } else if ( loc.type === 2 ) {
            this.fromFace = loc;
        } 

        //

        loc = Geom2D.locatePosition( target, this.mesh );

        if ( loc.type === 0 ){
            this.toFace = loc.edge.leftFace;
        } else if ( loc.type === 1 ){
            //locEdge = loc;
            this.toFace = loc.leftFace;
        } else if ( loc.type === 2 ) {
            this.toFace = loc;
        } 

        this.sortedOpenedFaces.push(this.fromFace);
        this.entryEdges.set(this.fromFace,null);
        this.entryX.set(this.fromFace,from.x);
        this.entryY.set(this.fromFace,from.y);
        this.scoreG.set(this.fromFace,0);

        const dist = SquaredSqrt(target.x - from.x, target.y - from.y);

        this.scoreH.set(this.fromFace,dist);
        this.scoreF.set(this.fromFace,dist);

        let innerEdge, neighbourFace, f, g, h;
        const fromPoint = new Point();
        const entryPoint = new Point();
        const distancePoint = new Point();
        let fillDatas = false;

        while(true) {

            if(this.sortedOpenedFaces.length == 0) {
                Log("NO PATH FOUND (AStar)");
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

                    fromPoint.set( this.entryX.get(this.curFace), this.entryY.get(this.curFace) )



                    entryPoint.set( (innerEdge.originVertex.pos.x + innerEdge.destinationVertex.pos.x) * 0.5, (innerEdge.originVertex.pos.y + innerEdge.destinationVertex.pos.y) * 0.5 )
                    



                    // entryPoint will be the direct point of intersection between fromPoint and toXY if the edge innerEdge
                    // intersects it
                    //https://github.com/hxDaedalus/hxDaedalus/commit/f51504bd0fa822148d5e4bdeb7326809ecdbc731
                    /*const vw1 = innerEdge.originVertex.pos;
                    const vw2 = innerEdge.destinationVertex.pos;
                    if (!Geom2D.intersections2segments(fromPoint, target, vw1, vw2, entryPoint)) {
                        // Recycle the entryPoint variable to create a Point2D(toX, toY)
                        entryPoint.copy(target)
                        const vst = vw1.distanceSquaredTo(fromPoint) + vw1.distanceSquaredTo(entryPoint);
                        const wst = vw2.distanceSquaredTo(fromPoint) + vw2.distanceSquaredTo(entryPoint);
                        entryPoint.x = vst <= wst ? vw1.x : vw2.x;
                        entryPoint.y = vst <= wst ? vw1.y : vw2.y;
                    }*/
                    

                    distancePoint.copy( entryPoint ).sub( target )
                    h = distancePoint.length();
                    distancePoint.copy( fromPoint ).sub( entryPoint )

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
    }

    /*sortingFaces(a,b) {
        if(this.scoreF.get(a) == this.scoreF.get(b)) return 0; 
        else if(this.scoreF.get(a) < this.scoreF.get(b)) return 1; 
        else return -1;
    }*/

    isWalkableByRadius ( fromEdge, throughFace, toEdge ) {
        
        let vA = null; // the vertex on fromEdge not on toEdge
        let vB = null; // the vertex on toEdge not on fromEdge
        let vC = null; // the common vertex of the 2 edges (pivot)

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

        let dot, result, distSquared, adjEdge;
        // if we have a right or obtuse angle on CAB
        dot = (vC.pos.x - vA.pos.x) * (vB.pos.x - vA.pos.x) + (vC.pos.y - vA.pos.y) * (vB.pos.y - vA.pos.y);
        if(dot <= 0) {
            // we compare length of AC with radius
            distSquared = Squared(vC.pos.x - vA.pos.x, vC.pos.y - vA.pos.y);
            if(distSquared >= this.diameterSquared) return true;
            else return false;
        }

        // if we have a right or obtuse angle on CBA
        dot = (vC.pos.x - vB.pos.x) * (vA.pos.x - vB.pos.x) + (vC.pos.y - vB.pos.y) * (vA.pos.y - vB.pos.y);
        if(dot <= 0) {
            // we compare length of BC with radius
            distSquared = Squared(vC.pos.x - vB.pos.x, vC.pos.y - vB.pos.y);
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
            distSquared = Squared(proj.x - vC.pos.x, proj.y - vC.pos.y);
            if(distSquared >= this.diameterSquared) return true; 
            else return false;
        } else {// if the adjacent is not constrained
            let distSquaredA = Squared(vC.pos.x - vA.pos.x, vC.pos.y - vA.pos.y);
            let distSquaredB = Squared(vC.pos.x - vB.pos.x, vC.pos.y - vB.pos.y);
            if(distSquaredA < this.diameterSquared || distSquaredB < this.diameterSquared) return false; 
            else {
                let vFaceToCheck = [];
                let vFaceIsFromEdge = [];
                let facesDone = new Dictionary( 1 );
                vFaceIsFromEdge.push(adjEdge);
                if(adjEdge.leftFace == throughFace) {
                    vFaceToCheck.push(adjEdge.rightFace);
                    let k = adjEdge.rightFace;
                    facesDone.set(k,true);
                } else {
                    vFaceToCheck.push(adjEdge.leftFace);
                    let k1 = adjEdge.leftFace;
                    facesDone.set(k1,true);
                }
                let currFace, faceFromEdge, currEdgeA, nextFaceA, currEdgeB, nextFaceB;
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
}