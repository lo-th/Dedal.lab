import { Integral, Squared, SquaredSqrt } from '../core/Tools.js';
import { Point } from '../math/Point.js';
import { RandGenerator } from '../math/RandGenerator.js';

import { VERTEX, EDGE, FACE, NULL, Dictionary, Log, Debug, INFINITY, EPSILON_SQUARED, EPSILON_NORMAL, TTIER } from '../constants.js';
import { FromFaceToInnerEdges, FromMeshToVertices, FromVertexToHoldingFaces, FromVertexToIncomingEdges } from '../core/Iterators.js';

export const Geom2D = {

    __samples: [],
    __circumcenter: new Point(),
    _randGen: null,

    locatePosition: function ( p, mesh ) {

        let i, numSamples;

        // jump and walk algorithm

        if( Geom2D._randGen === null ) Geom2D._randGen = new RandGenerator();

        Geom2D._randGen.setSeed( Integral( p.x * 10 + 4 * p.y ) );
        
        Geom2D.__samples.splice( 0, Geom2D.__samples.length );
        numSamples = Integral( Math.pow( mesh._vertices.length, TTIER ));
        //let numSamples = Integral(Math.pow(mesh._vertices.length,));
        
        //console.log(numSamples, mesh._vertices.length);

        Geom2D._randGen.min = 0;
        Geom2D._randGen.max = mesh._vertices.length - 1;

        i = 0;
        while( i < numSamples ) {
        //while(i--){
        //for ( i = 0 ; i < numSamples; i++ ){
            Geom2D.__samples.push( mesh._vertices[ Geom2D._randGen.next() ] );
            i++;
        }

        let currVertex, currVertexPos, distSquared;
        let minDistSquared = INFINITY;
        let closedVertex = null;

        i = 0;
        //let n = 0
        while( i < numSamples ) {
        //for ( i = 0 ; i < numSamples; i++ ){
            currVertex = Geom2D.__samples[i];
            currVertexPos = currVertex.pos;
            distSquared = Squared( currVertexPos.x - p.x, currVertexPos.y - p.y );
            if( distSquared < minDistSquared ) {
                minDistSquared = distSquared;
                closedVertex = currVertex;
            }
            i++;
        }

        let iterFace = new FromVertexToHoldingFaces();

        if(closedVertex===null){ 
            Log('no closedVertex find ?');
            //return {type:NULL};
        }

        iterFace.fromVertex = closedVertex;

        let currFace = iterFace.next();

        let faceVisited = new Dictionary( 0 );
        let currEdge;
        let iterEdge = new FromFaceToInnerEdges();
        let relativPos = 0;
        let numIter = 0;

        let objectContainer = Geom2D.isInFace( p, currFace );

        while( faceVisited.get( currFace ) || objectContainer.type === NULL ){

            

            faceVisited.set( currFace, true );
            numIter++;
            if(numIter == 50) Log( "WALK TAKE MORE THAN 50 LOOP" );
            if(numIter == 1000){ 
                Log( "WALK TAKE MORE THAN 1000 LOOP -> WE ESCAPE" ); 
                objectContainer = { type: NULL }; 
                break; 
            }
            iterEdge.fromFace = currFace;
            do {
                currEdge = iterEdge.next();
                if(currEdge === null) {
                    Log("KILL PATH");
                    return null;
                }
                relativPos = Geom2D.getRelativePosition(p,currEdge);
            } while(relativPos == 1 || relativPos == 0);
            currFace = currEdge.rightFace;

            objectContainer = Geom2D.isInFace(p,currFace);
        }

        faceVisited.dispose();

        return objectContainer;

    },

    isCircleIntersectingAnyConstraint: function ( p, radius, mesh ) {

        if(p.x <= 0 || p.x >= mesh.width || p.y <= 0 || p.y >= mesh.height) return true;
        let loc = Geom2D.locatePosition( p, mesh );
        let face;
        switch(loc.type) {
            case 0: face = loc.edge.leftFace; break;
            case 1: face = loc.leftFace; break;
            case 2: face = loc; break;
            case 3: face = null; break;
        }
        let radiusSquared = radius * radius;
        let pos;
        let distSquared;
        pos = face.edge.originVertex.pos;
        distSquared = Squared(pos.x - p.x, pos.y - p.y);
        if(distSquared <= radiusSquared) return true;
        pos = face.edge.nextLeftEdge.originVertex.pos;
        distSquared = Squared(pos.x - p.x, pos.y - p.y);
        if(distSquared <= radiusSquared) return true;
        pos = face.edge.nextLeftEdge.nextLeftEdge.originVertex.pos;
        distSquared = Squared(pos.x - p.x, pos.y - p.y);
        if(distSquared <= radiusSquared) return true;
        let edgesToCheck = [];
        edgesToCheck.push(face.edge);
        edgesToCheck.push(face.edge.nextLeftEdge);
        edgesToCheck.push(face.edge.nextLeftEdge.nextLeftEdge);
        let edge, pos1, pos2;
        let checkedEdges = new Dictionary( 0 );
        let intersecting;
        while(edgesToCheck.length > 0) {
            edge = edgesToCheck.pop();
            checkedEdges.set(edge,true);
            //true;
            pos1 = edge.originVertex.pos;
            pos2 = edge.destinationVertex.pos;
            intersecting = Geom2D.intersectionsSegmentCircle(pos1, pos2, p, radius);
            if(intersecting) {
                if(edge.isConstrained) return true; 
                else {
                    edge = edge.oppositeEdge.nextLeftEdge;
                    if(!checkedEdges.get(edge) && !checkedEdges.get(edge.oppositeEdge) && edgesToCheck.indexOf(edge) == -1 && edgesToCheck.indexOf(edge.oppositeEdge) == -1) edgesToCheck.push(edge);

                    edge = edge.nextLeftEdge;
                    if(!checkedEdges.get(edge) && !checkedEdges.get(edge.oppositeEdge) && edgesToCheck.indexOf(edge) == -1 && edgesToCheck.indexOf(edge.oppositeEdge) == -1) edgesToCheck.push(edge);
                }
            }
        }
        //this.checkedEdges.dispose();
        return false;

    },

    getDirection: function ( p1, p2, p3 ) {

        let dot = (p3.x - p1.x) * (p2.y - p1.y) + (p3.y - p1.y) * (-p2.x + p1.x);
        return (dot == 0) ? 0 : ((dot > 0) ? 1 : -1);
        /*if(dot == 0) return 0; 
        else if(dot > 0) return 1; 
        else return -1;*/

    },

    

    getRelativePosition: function ( p, eUp ) {

        return Geom2D.getDirection( eUp.originVertex.pos, eUp.destinationVertex.pos, p );

    },

    getRelativePosition2: function ( p, eUp ) {

        if( eUp === undefined ) {
            console.log( 'error no eUp' );//eUp.originVertex.pos, eUp.destinationVertex.pos, p )
            return 0;
        }

        return Geom2D.Orient2d( eUp.originVertex.pos, eUp.destinationVertex.pos, p );

    },

    Orient2d: function ( p1, p2, p3 ) {

        let val = (p1.x - p3.x) * (p2.y - p3.y) - (p1.y - p3.y) * (p2.x - p3.x);
        if (val > -EPSILON_SQUARED && val < EPSILON_SQUARED) return 0;// collinear
        else if (val > 0) return -1;// ccw
        else return 1;// cw

    },

    // the function checks by priority:
    // - if the (x, y) lies on a vertex of the polygon, it will return this vertex
    // - if the (x, y) lies on a edge of the polygon, it will return this edge
    // - if the (x, y) lies inside the polygon, it will return the polygon
    // - if the (x, y) lies outside the polygon, it will return null
    isInFace: function ( p, polygon ) {

        // remember polygons are triangle only,
        // and we suppose we have not degenerated flat polygons !

        let result = { type: NULL };

        if(polygon === null) return result;

        let e1_2 = polygon.edge;
        let e2_3 = e1_2.nextLeftEdge;
        let e3_1 = e2_3.nextLeftEdge;

        if( Geom2D.getRelativePosition(p, e1_2) >= 0 && Geom2D.getRelativePosition(p, e2_3) >= 0 && Geom2D.getRelativePosition(p, e3_1) >= 0) {
            let v1 = e1_2.originVertex;
            let v2 = e2_3.originVertex;
            let v3 = e3_1.originVertex;
            let x1 = v1.pos.x;
            let y1 = v1.pos.y;
            let x2 = v2.pos.x;
            let y2 = v2.pos.y;
            let x3 = v3.pos.x;
            let y3 = v3.pos.y;
            let v_v1squared = Squared(x1 - p.x, y1 - p.y);
            let v_v2squared = Squared(x2 - p.x, y2 - p.y);
            let v_v3squared = Squared(x3 - p.x, y3 - p.y);
            let inv_v1_v2 = 1 / Squared(x2 - x1, y2 - y1);
            let inv_v2_v3 = 1 / Squared(x3 - x2, y3 - y2);
            let inv_v3_v1 = 1 / Squared(x1 - x3, y1 - y3);
            let dot_v_v1v2 = (p.x - x1) * (x2 - x1) + (p.y - y1) * (y2 - y1);
            let dot_v_v2v3 = (p.x - x2) * (x3 - x2) + (p.y - y2) * (y3 - y2);
            let dot_v_v3v1 = (p.x - x3) * (x1 - x3) + (p.y - y3) * (y1 - y3);
            let v_e1_2squared = v_v1squared - dot_v_v1v2 * dot_v_v1v2 * inv_v1_v2;
            let v_e2_3squared = v_v2squared - dot_v_v2v3 * dot_v_v2v3 * inv_v2_v3;
            let v_e3_1squared = v_v3squared - dot_v_v3v1 * dot_v_v3v1 * inv_v3_v1;
            let closeTo_e1_2 = v_e1_2squared <= EPSILON_SQUARED ? true:false;
            let closeTo_e2_3 = v_e2_3squared <= EPSILON_SQUARED ? true:false;
            let closeTo_e3_1 = v_e3_1squared <= EPSILON_SQUARED ? true:false;
            if(closeTo_e1_2) {
                if(closeTo_e3_1) result = v1; 
                else if(closeTo_e2_3) result = v2; 
                else result = e1_2;
            } else if(closeTo_e2_3) {
                if(closeTo_e3_1) result = v3; 
                else result = e2_3;
            } else if(closeTo_e3_1) result = e3_1; 
            else result = polygon;
        }
        return result;
    },

    clipSegmentByTriangle: function ( s1, s2, t1, t2, t3, pResult1, pResult2 ) {

        let side1_1 = Geom2D.getDirection(t1, t2, s1);
        let side1_2 = Geom2D.getDirection(t1, t2, s2);
        if(side1_1 <= 0 && side1_2 <= 0) return false;
        let side2_1 = Geom2D.getDirection(t2, t3, s1);
        let side2_2 = Geom2D.getDirection(t2, t3, s2);
        if(side2_1 <= 0 && side2_2 <= 0) return false;
        let side3_1 = Geom2D.getDirection(t3, t1, s1);
        let side3_2 = Geom2D.getDirection(t3, t1, s2);
        if(side3_1 <= 0 && side3_2 <= 0) return false;
        if(side1_1 >= 0 && side2_1 >= 0 && side3_1 >= 0 && (side1_2 >= 0 && side2_2 >= 0 && side3_2 >= 0)) {
            pResult1 = s1.clone();
            pResult2 = s2.clone();
            return true;
        }
        let n = 0;
        if( Geom2D.intersections2segments(s1, s2, t1, t2, pResult1, null)) n++;
        if(n == 0) {
            if( Geom2D.intersections2segments(s1, s2, t2, t3, pResult1, null)) n++;
        } else if( Geom2D.intersections2segments(s1, s2, t2, t3, pResult2, null)) {
            if(-0.01 > pResult1.x - pResult2.x || pResult1.x - pResult2.x > EPSILON_NORMAL || -EPSILON_NORMAL > pResult1.y - pResult2.y || pResult1.y - pResult2.y > EPSILON_NORMAL) n++;
        }
        if(n == 0) {
            if( Geom2D.intersections2segments(s1, s2, t3, t1, pResult1, null)) n++;
        } else if(n == 1) {
            if( Geom2D.intersections2segments(s1, s2, t3, t1, pResult2, null)) {
                if(-EPSILON_NORMAL > pResult1.x - pResult2.x || pResult1.x - pResult2.x > EPSILON_NORMAL || -EPSILON_NORMAL > pResult1.y - pResult2.y || pResult1.y - pResult2.y > EPSILON_NORMAL) n++;
            }
        }
        if(n == 1) {
            if(side1_1 >= 0 && side2_1 >= 0 && side3_1 >= 0) pResult2 = s1.clone();
            else if(side1_2 >= 0 && side2_2 >= 0 && side3_2 >= 0) pResult2 = s2.clone();
            else n = 0;
        }
        if(n > 0) return true; 
        else return false;

    },

    /*isSegmentIntersectingTriangle: function( s1, s2, t1, t2, t3 ) {

        let side1_1 = Geom2D.getDirection(t1, t2, s1);
        let side1_2 = Geom2D.getDirection(t1, t2, s2);
        if(side1_1 <= 0 && side1_2 <= 0) return false;
        let side2_1 = Geom2D.getDirection(t2, t3, s1);
        let side2_2 = Geom2D.getDirection(t2, t3, s2);
        if(side2_1 <= 0 && side2_2 <= 0) return false;
        let side3_1 = Geom2D.getDirection(t3, t1, s1);
        let side3_2 = Geom2D.getDirection(t3, t1, s2);
        if(side3_1 <= 0 && side3_2 <= 0) return false;
        if(side1_1 == 1 && side2_1 == 1 && side3_1 == 1) return true;
        if(side1_1 == 1 && side2_1 == 1 && side3_1 == 1) return true;
        let side1, side2;
        if(side1_1 == 1 && side1_2 <= 0 || side1_1 <= 0 && side1_2 == 1) {
            side1 = Geom2D.getDirection(s1, s2, t1);
            side2 = Geom2D.getDirection(s1, s2, t2);
            if(side1 == 1 && side2 <= 0 || side1 <= 0 && side2 == 1) return true;
        }
        if(side2_1 == 1 && side2_2 <= 0 || side2_1 <= 0 && side2_2 == 1) {
            side1 = Geom2D.getDirection(s1, s2, t2);
            side2 = Geom2D.getDirection(s1, s2, t3);
            if(side1 == 1 && side2 <= 0 || side1 <= 0 && side2 == 1) return true;
        }
        if(side3_1 == 1 && side3_2 <= 0 || side3_1 <= 0 && side3_2 == 1) {
            side1 = Geom2D.getDirection(s1, s2, t3);
            side2 = Geom2D.getDirection(s1, s2, t1);
            if(side1 == 1 && side2 <= 0 || side1 <= 0 && side2 == 1) return true;
        }
        return false;

    },*/

    isDelaunay: function ( edge ) {

        let vLeft = edge.originVertex;
        let vRight = edge.destinationVertex;
        let vCorner = edge.nextLeftEdge.destinationVertex;
        let vOpposite = edge.nextRightEdge.destinationVertex;
        //getCircumcenter(vCorner.pos.x,vCorner.pos.y,vLeft.pos.x,vLeft.pos.y,vRight.pos.x,vRight.pos.y,__circumcenter);
        Geom2D.getCircumcenter(vCorner.pos, vLeft.pos, vRight.pos, Geom2D.__circumcenter);
        let squaredRadius = (vCorner.pos.x - Geom2D.__circumcenter.x) * (vCorner.pos.x - Geom2D.__circumcenter.x) + (vCorner.pos.y - Geom2D.__circumcenter.y) * (vCorner.pos.y - Geom2D.__circumcenter.y);
        let squaredDistance = (vOpposite.pos.x - Geom2D.__circumcenter.x) * (vOpposite.pos.x - Geom2D.__circumcenter.x) + (vOpposite.pos.y - Geom2D.__circumcenter.y) * (vOpposite.pos.y - Geom2D.__circumcenter.y);
        return squaredDistance >= squaredRadius ? true : false;

    },

    getCircumcenter: function ( p1, p2, p3, result ) {

        if(result == null) result = new Point();
        let m1 = (p1.x + p2.x) * 0.5;
        let m2 = (p1.y + p2.y) * 0.5;
        let m3 = (p1.x + p3.x) * 0.5;
        let m4 = (p1.y + p3.y) * 0.5;
        let t1 = (m1 * (p1.x - p3.x) + (m2 - m4) * (p1.y - p3.y) + m3 * (p3.x - p1.x)) / (p1.x * (p3.y - p2.y) + p2.x * (p1.y - p3.y) + p3.x * (p2.y - p1.y));
        result.x = m1 + t1 * (p2.y - p1.y);
        result.y = m2 - t1 * (p2.x - p1.x);
        return result;

    },

    intersections2segments: function ( s1p1, s1p2, s2p1, s2p2, posIntersection, paramIntersection, infiniteLineMode ) {

        if(infiniteLineMode == null) infiniteLineMode = false;
        let t1 = 0;
        let t2 = 0;
        let result;
        let divisor = (s1p1.x - s1p2.x) * (s2p1.y - s2p2.y) + (s1p2.y - s1p1.y) * (s2p1.x - s2p2.x);
        if(divisor == 0) result = false; 
        else {
            result = true;
            let invDivisor = 1 / divisor;
            if(!infiniteLineMode || posIntersection != null || paramIntersection != null) {
                t1 = (s1p1.x * (s2p1.y - s2p2.y) + s1p1.y * (s2p2.x - s2p1.x) + s2p1.x * s2p2.y - s2p1.y * s2p2.x) * invDivisor;
                t2 = (s1p1.x * (s2p1.y - s1p2.y) + s1p1.y * (s1p2.x - s2p1.x) - s1p2.x * s2p1.y + s1p2.y * s2p1.x) * invDivisor;
                if(!infiniteLineMode && !(0 <= t1 && t1 <= 1 && 0 <= t2 && t2 <= 1)) result = false;
            }
        }
        if(result) {
            if(posIntersection != null) {
                posIntersection.x = s1p1.x + t1 * (s1p2.x - s1p1.x);
                posIntersection.y = s1p1.y + t1 * (s1p2.y - s1p1.y);
            }
            if(paramIntersection != null) {
                paramIntersection.push(t1, t2);
            }
        }
        return result;

    },

    intersections2edges: function ( edge1, edge2, posIntersection, paramIntersection, infiniteLineMode ) {

        if(infiniteLineMode == null) infiniteLineMode = false;
        return Geom2D.intersections2segments( edge1.originVertex.pos, edge1.destinationVertex.pos, edge2.originVertex.pos, edge2.destinationVertex.pos, posIntersection,paramIntersection,infiniteLineMode);

    },

    isConvex: function ( edge ) {

        let result = true;
        let eLeft;
        let vRight;
        eLeft = edge.nextLeftEdge.oppositeEdge;
        vRight = edge.nextRightEdge.destinationVertex;
        if( Geom2D.getRelativePosition(vRight.pos, eLeft) != -1) result = false; else {
            eLeft = edge.prevRightEdge;
            vRight = edge.prevLeftEdge.originVertex;
            if( Geom2D.getRelativePosition(vRight.pos, eLeft) != -1) result = false;
        }
        return result;

    },

    projectOrthogonaly: function ( vertexPos, edge ) {

        let a = edge.originVertex.pos.x;
        let b = edge.originVertex.pos.y;
        let c = edge.destinationVertex.pos.x;
        let d = edge.destinationVertex.pos.y;
        let e = vertexPos.x;
        let f = vertexPos.y;
        let t1 = (a * a - a * c - a * e + b * b - b * d - b * f + c * e + d * f) / (a * a - 2 * a * c + b * b - 2 * b * d + c * c + d * d);
        vertexPos.x = a + t1 * (c - a);
        vertexPos.y = b + t1 * (d - b);

    },

    /*projectOrthogonalyOnSegment: function  (px, py, sp1x, sp1y, sp2x, sp2y, result) {
        let a = sp1x;
        let b = sp1y;
        let c = sp2x;
        let d = sp2y;
        let e = px;
        let f = py;       
        let t1 = (a*a - a*c - a*e + b*b - b*d - b*f + c*e + d*f) / (a*a - 2*a*c + b*b - 2*b*d + c*c + d*d);
        result.x = a + t1*(c - a);
        result.y = b + t1*(d - b);
    },*/

    intersections2Circles: function ( c1, r1, c2, r2, result ){

        let factor, a, b, first, dist, invd, trans;
        dist = Squared(c2.x - c1.x, c2.y - c1.y);
        invd = 1 / (2 * dist);
        if((c1.x != c2.x || c1.y != c2.y) && dist <= (r1 + r2) * (r1 + r2) && dist >= (r1 - r2) * (r1 - r2)) {
            trans = Math.sqrt(((r1 + r2) * (r1 + r2) - dist) * (dist - (r2 - r1) * (r2 - r1)));
            factor = c2.clone().sub(c1).mul(invd);
            a = c1.clone().add(c2).mul(0.5);
            b = factor.clone().mul(r1 * r1 - r2 * r2);
            //b = c2.clone().sub(c1).mul(r1 * r1 - r2 * r2).mul(invd);
            first = a.clone().add(b);

            

            /*let xFirstPart = (c1.x + c2.x) * 0.5 + (c2.x - c1.x) * (r1 * r1 - r2 * r2) * invd;
            let yFirstPart = (c1.y + c2.y) * 0.5 + (c2.y - c1.y) * (r1 * r1 - r2 * r2) * invd;
            let xFactor = (c2.y - c1.y) * invd;
            let yFactor = (c2.x - c1.x) * invd;*/
            if(result != null) {
                //result.push(  xFirstPart + xFactor * trans , yFirstPart - yFactor * trans  , xFirstPart - xFactor * trans , yFirstPart + yFactor * trans );
                //result.push(  xFirstPart + factor.y * trans , yFirstPart - factor.x * trans  , xFirstPart - factor.y * trans , yFirstPart + factor.x * trans );
                result.push(  first.x + factor.y * trans , first.y - factor.x * trans  , first.x - factor.y * trans , first.y + factor.x * trans );
            }
            return true;
        } else return false;

    },

    intersectionsSegmentCircle: function ( p0, p1, c, r, result ) {

        let p0xSQD = p0.x * p0.x;
        let p0ySQD = p0.y * p0.y;
        let a = p1.y * p1.y - 2 * p1.y * p0.y + p0ySQD + p1.x * p1.x - 2 * p1.x * p0.x + p0xSQD;
        let b = 2 * p0.y * c.y - 2 * p0xSQD + 2 * p1.y * p0.y - 2 * p0ySQD + 2 * p1.x * p0.x - 2 * p1.x * c.x + 2 * p0.x * c.x - 2 * p1.y * c.y;
        let cc = p0ySQD + c.y * c.y + c.x * c.x - 2 * p0.y * c.y - 2 * p0.x * c.x + p0xSQD - r * r;
        let delta = b * b - 4 * a * cc;
        let deltaSQRT;
        let t0;
        let t1;
        if(delta < 0) return false; 
        else if(delta == 0) {
            t0 = -b / (2 * a);
            if(t0 < 0 || t0 > 1) return false;
            if(result != null) {
                result.push( p0.x + t0*(p1.x - p0.x), p0.y + t0*(p1.y - p0.y),  t0 );
            }
            return true;
        } else {
            deltaSQRT = Math.sqrt(delta);
            t0 = (-b + deltaSQRT) / (2 * a);
            t1 = (-b - deltaSQRT) / (2 * a);
            let intersecting = false;
            if(0 <= t0 && t0 <= 1) {
                if(result != null) {
                    result.push( p0.x + t0*(p1.x - p0.x), p0.y + t0*(p1.y - p0.y), t0 );
                }
                intersecting = true;
            }
            if(0 <= t1 && t1 <= 1) {
                if(result != null) {
                    result.push( p0.x + t1*(p1.x - p0.x), p0.y + t1*(p1.y - p0.y), t1 );
                }
                intersecting = true;
            }
            return intersecting;
        }

    },

    /*intersectionsLineCircle: function(p0x,p0y,p1x,p1y,cx,cy,r,result) {
        let p0xSQD = p0x * p0x;
        let p0ySQD = p0y * p0y;
        let a = p1y * p1y - 2 * p1y * p0y + p0ySQD + p1x * p1x - 2 * p1x * p0x + p0xSQD;
        let b = 2 * p0y * cy - 2 * p0xSQD + 2 * p1y * p0y - 2 * p0ySQD + 2 * p1x * p0x - 2 * p1x * cx + 2 * p0x * cx - 2 * p1y * cy;
        let c = p0ySQD + cy * cy + cx * cx - 2 * p0y * cy - 2 * p0x * cx + p0xSQD - r * r;
        let delta = b * b - 4 * a * c;
        let deltaSQRT, t0, t1;
        if(delta < 0) return false; 
        else if(delta == 0) {
            t0 = -b / (2 * a);
            result.push( p0x + t0*(p1x - p0x), p0y + t0*(p1y - p0y),  t0 );
        } else if(delta > 0) {
            deltaSQRT = Math.sqrt(delta);
            t0 = (-b + deltaSQRT) / (2 * a);
            t1 = (-b - deltaSQRT) / (2 * a);
            result.push( p0x + t0*(p1x - p0x), p0y + t0*(p1y - p0y), t0, p0x + t1*(p1x - p0x), p0y + t1*(p1y - p0y), t1 );
        }
        return true;
    },*/

    tangentsPointToCircle: function ( p, c, r, result ) {

        let c2 = p.clone().add(c).mul(0.5);
        let r2 = 0.5 * SquaredSqrt(p.x - c.x, p.y - c.y);
        return Geom2D.intersections2Circles(c2, r2, c, r, result);

    },

    tangentsCrossCircleToCircle: function ( r, c1, c2, result ) {

        let distance = SquaredSqrt(c1.x - c2.x, c1.y - c2.y);
        let radius = distance * 0.25;
        let center = c2.clone().sub(c1).mul(0.25).add(c1);

        if( Geom2D.intersections2Circles( c1, r, center, radius, result )) {

            let t1x = result[0];
            let t1y = result[1];
            let t2x = result[2];
            let t2y = result[3];
            let mid = c1.clone().add(c2).mul(0.5);

            let dotProd = (t1x - mid.x) * (c2.y - c1.y) + (t1y - mid.y) * (-c2.x + c1.x);
            let tproj = dotProd / (distance * distance);
            let projx = mid.x + tproj * (c2.y - c1.y);
            let projy = mid.y - tproj * (c2.x - c1.x);
            let t4x = 2 * projx - t1x;
            let t4y = 2 * projy - t1y;
            let t3x = t4x + t2x - t1x;
            let t3y = t2y + t4y - t1y;
            result.push( t3x, t3y, t4x, t4y );
            return true;
            
        } else return false;

    },

    tangentsParalCircleToCircle: function ( r, c1, c2, result ) {

        let distance = SquaredSqrt(c1.x - c2.x, c1.y - c2.y);
        let invD = 1 / distance;
        let t1x = c1.x + r * (c2.y - c1.y) * invD;
        let t1y = c1.y + r * (-c2.x + c1.x) * invD;
        let t2x = 2 * c1.x - t1x;
        let t2y = 2 * c1.y - t1y;
        let t3x = t2x + c2.x - c1.x;
        let t3y = t2y + c2.y - c1.y;
        let t4x = t1x + c2.x - c1.x;
        let t4y = t1y + c2.y - c1.y;
        result.push( t1x, t1y, t2x, t2y, t3x, t3y, t4x, t4y );

    },

    /*distanceSquaredPointToLine: function(p,a,b) {
        let a_b_squared = Squared(b.x - a.x, b.y - a.y);
        let dotProduct = (p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y);
        let p_a_squared = Squared(a.x - p.x, a.y - p.y);
        return p_a_squared - dotProduct * dotProduct / a_b_squared;
    },*/

    distanceSquaredPointToSegment: function ( p, a, b ) {

        let a_b_squared = Squared(b.x - a.x, b.y - a.y);
        let dotProduct = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / a_b_squared;
        if(dotProduct < 0) return Squared(p.x - a.x, p.y - a.y); 
        else if(dotProduct <= 1) {
            let p_a_squared = Squared(a.x - p.x, a.y - p.y);
            return p_a_squared - dotProduct * dotProduct * a_b_squared;
        } else return Squared(p.x - b.x, p.y - b.y);

    },

    distanceSquaredVertexToEdge: function ( vertex, edge ) {

        return Geom2D.distanceSquaredPointToSegment(vertex.pos, edge.originVertex.pos, edge.destinationVertex.pos);

    },

    pathLength: function( path ) {

        let sumDistance = 0.;
        let fromX = path[0];
        let fromY = path[1];
        let nextX, nextY, x, y, distance;
        let i = 2;
        let l = path.length;

        while( i < l ) {

            nextX = path[i];
            nextY = path[i + 1];
            x = nextX - fromX;
            y = nextY - fromY;
            distance = SquaredSqrt(x, y);
            sumDistance += distance;
            fromX = nextX;
            fromY = nextY;
            i += 2;
        }

        return sumDistance;

    },

}