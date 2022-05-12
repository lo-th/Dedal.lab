import { Integral, Squared, SquaredSqrt, fix } from '../core/Tools.js';
import { Point } from '../math/Point.js';
import { Geom2D } from '../math/Geom2D.js';
import { Dictionary, Log, EDGE, TwoPI } from '../constants.js';


export class Funnel {

    constructor () {

        this._currPoolPointsIndex = 0;
        this._poolPointsSize = 3000;
        this._numSamplesCircle = 16;
        this._radiusSquared = 0;
        this._radius = 0;
        this._poolPoints = [];
        let l = this._poolPointsSize, n=0;
        while(n < l) {
            let i = n++;
            this._poolPoints.push(new Point());
        }


    }

    get radius () {

        return this._radius

    }

    set radius ( value ) {

        this._radius = Math.max(0,value);
        this._radiusSquared = this._radius * this._radius;
        this._sampleCircle = [];
        if(this._radius == 0) return;
        let l = this._numSamplesCircle, n = 0, r;
        while(n < l) {
            let i = n++;
            r = - TwoPI * i / this._numSamplesCircle;
            this._sampleCircle.push(new Point(this._radius * Math.cos(r),this._radius * Math.sin(r)));
        }
        this._sampleCircleDistanceSquared = Squared(this._sampleCircle[0].x - this._sampleCircle[1].x, this._sampleCircle[0].y - this._sampleCircle[1].y);

    }

    dispose () {

        this._sampleCircle = null;

    }

    getPoint ( x, y ) {

        y = y || 0;
        x = x || 0;
        this.__point = this._poolPoints[this._currPoolPointsIndex];
        this.__point.set(x,y);
        this._currPoolPointsIndex++;
        if(this._currPoolPointsIndex == this._poolPointsSize) {
            this._poolPoints.push(new Point());
            this._poolPointsSize++;
        }
        return this.__point;
    }

    getCopyPoint ( pointToCopy ) {

        return this.getPoint( pointToCopy.x, pointToCopy.y );

    }

    findPath ( from, target, listFaces, listEdges, resultPath ) {

        let p_from = from;
        let p_to = target;
        let rad = this._radius * 1.01;
        this._currPoolPointsIndex = 0;
        if(this._radius > 0) {
            let checkFace = listFaces[0];
            let distanceSquared, distance, p1, p2, p3;
            p1 = checkFace.edge.originVertex.pos;
            p2 = checkFace.edge.destinationVertex.pos;
            p3 = checkFace.edge.nextLeftEdge.destinationVertex.pos;
            distanceSquared = Squared(p1.x - p_from.x, p1.y - p_from.y);
            if(distanceSquared <= this._radiusSquared) {
                distance = Math.sqrt(distanceSquared);
                p_from.sub(p1).div(distance).mul(rad).add(p1);
                //p_from.x = this._radius * 1.01 * ((p_from.x - p1.x) / distance) + p1.x;
                //p_from.y = this._radius * 1.01 * ((p_from.y - p1.y) / distance) + p1.y;
            } else {
                distanceSquared = Squared(p2.x - p_from.x, p2.y - p_from.y);
                if(distanceSquared <= this._radiusSquared) {
                    distance = Math.sqrt(distanceSquared);
                    p_from.sub(p2).div(distance).mul(rad).add(p2);
                    //p_from.x = this._radius * 1.01 * ((p_from.X - p2.x) / distance) + p2.x;
                    //p_from.y = this._radius * 1.01 * ((p_from.y - p2.y) / distance) + p2.y;
                } else {
                    distanceSquared = Squared(p3.x - p_from.x, p3.y - p_from.y);
                    if(distanceSquared <= this._radiusSquared) {
                        distance = Math.sqrt(distanceSquared);
                        p_from.sub(p3).div(distance).mul(rad).add(p3);
                        //p_from.x = this._radius * 1.01 * ((p_from.x - p3.x) / distance) + p3.x;
                        //p_from.y = this._radius * 1.01 * ((p_from.y - p3.y) / distance) + p3.y;
                    }
                }
            }
            checkFace = listFaces[listFaces.length - 1];
            p1 = checkFace.edge.originVertex.pos;
            p2 = checkFace.edge.destinationVertex.pos;
            p3 = checkFace.edge.nextLeftEdge.destinationVertex.pos;
            distanceSquared = Squared(p1.x - p_to.x, p1.y - p_to.y);
            if(distanceSquared <= this._radiusSquared) {
                distance = Math.sqrt(distanceSquared);
                p_to.sub(p1).div(distance).mul(rad).add(p1);
                //p_to.x = this._radius * 1.01 * ((p_to.x - p1.x) / distance) + p1.x;
                //p_to.y = this._radius * 1.01 * ((p_to.y - p1.y) / distance) + p1.y;
            } else {
                distanceSquared = Squared(p2.x - p_to.x, p2.y - p_to.y);
                if(distanceSquared <= this._radiusSquared) {
                    distance = Math.sqrt(distanceSquared);
                    p_to.sub(p2).div(distance).mul(rad).add(p2);
                    //p_to.x = this._radius * 1.01 * ((p_to.x - p2.x) / distance) + p2.x;
                    //p_to.y = this._radius * 1.01 * ((p_to.y - p2.y) / distance) + p2.y;
                } else {
                    distanceSquared = Squared(p3.x - p_to.x, p3.y - p_to.y);
                    if(distanceSquared <= this._radiusSquared) {
                        distance = Math.sqrt(distanceSquared);
                        p_to.sub(p3).div(distance).mul(rad).add(p3);
                        //p_to.x = this._radius * 1.01 * ((p_to.x - p3.x) / distance) + p3.x;
                        //p_to.y = this._radius * 1.01 * ((p_to.y - p3.y) / distance) + p3.y;
                    }
                }
            }
        }
        // we build starting and ending points
        let startPoint, endPoint;
        startPoint = p_from.clone();//new Point(fromX,fromY);
        endPoint = p_to.clone();//new Point(toX,toY);
        if(listFaces.length == 1) {
            resultPath.push(fix(startPoint.x));
            resultPath.push(fix(startPoint.y));
            resultPath.push(fix(endPoint.x));
            resultPath.push(fix(endPoint.y));
            return;
        }
        let i, j, k, l, n;
        let currEdge = null;
        let currVertex = null;
        let direction;



        // first we skip the first face and first edge if the starting point lies on the first interior edge:

        let edgeTmp = Geom2D.isInFace( p_from, listFaces[0] );

        if ( edgeTmp.type === EDGE ){
            if ( listEdges[0] === edgeTmp ){
                if( listEdges.length > 1 ) listEdges.shift();
                if( listFaces.length > 1 ) listFaces.shift();
                //if(listEdges === undefined ) listEdges = [];
                Log( '!! isShift' )
            }
        }
        //{
           /* let _g = Geom2D.isInFacePrime(fromX,fromY,listFaces[0]);
            let _g = Geom2D.isInFace(fromX,fromY,listFaces[0]);
            switch(_g[1]) {
            case 1:
                let edge = _g[2];
                if(listEdges[0] == edge) {
                    listEdges.shift();
                    listFaces.shift();
                }
                break;
            default:
            }*/
        //}

        // our funnels, inited with starting point  

        let funnelLeft = [];
        let funnelRight = [];
        funnelLeft.push(startPoint);
        funnelRight.push(startPoint);
        let verticesDoneSide = new Dictionary( 1 );
        let pointsList = [];
        let pointSides = new Dictionary( 0 );
        let pointSuccessor = new Dictionary( 0 );
        pointSides.set(startPoint,0);
        //0;
        currEdge = listEdges[0];
        let relativPos = Geom2D.getRelativePosition2(p_from,currEdge);
        let prevPoint;
        let newPointA;
        let newPointB;
        newPointA = this.getCopyPoint(currEdge.destinationVertex.pos);
        newPointB = this.getCopyPoint(currEdge.originVertex.pos);
        pointsList.push(newPointA);
        pointsList.push(newPointB);
        pointSuccessor.set(startPoint,newPointA);
        pointSuccessor.set(newPointA,newPointB);
        prevPoint = newPointB;
        if(relativPos == 1) {
            pointSides.set(newPointA,1);
            pointSides.set(newPointB,-1);
            verticesDoneSide.set(currEdge.destinationVertex,1);
            verticesDoneSide.set(currEdge.originVertex,-1);
        } else if(relativPos == -1) {
            pointSides.set(newPointA,-1);
            pointSides.set(newPointB,1);
            verticesDoneSide.set(currEdge.destinationVertex,-1);
            verticesDoneSide.set(currEdge.originVertex,1);
        }
        let fromVertex = listEdges[0].originVertex;
        let fromFromVertex = listEdges[0].destinationVertex;
        let _g1 = 1;
        let _g2 = listEdges.length;
        while(_g1 < _g2) {
            let i1 = _g1++;
            currEdge = listEdges[i1];
            if(currEdge.originVertex == fromVertex) currVertex = currEdge.destinationVertex; 
            else if(currEdge.destinationVertex == fromVertex) currVertex = currEdge.originVertex; 
            else if(currEdge.originVertex == fromFromVertex) {
                currVertex = currEdge.destinationVertex;
                fromVertex = fromFromVertex;
            } else if(currEdge.destinationVertex == fromFromVertex) {
                currVertex = currEdge.originVertex;
                fromVertex = fromFromVertex;
            } else Log("IMPOSSIBLE TO IDENTIFY THE VERTEX !!!");
            newPointA = this.getCopyPoint(currVertex.pos);
            pointsList.push(newPointA);
            direction = -verticesDoneSide.get(fromVertex);
            pointSides.set(newPointA,direction);
            pointSuccessor.set(prevPoint,newPointA);
            verticesDoneSide.set(currVertex,direction);
            prevPoint = newPointA;
            fromFromVertex = fromVertex;
            fromVertex = currVertex;
        }
        // we then we add the end point
        pointSuccessor.set(prevPoint,endPoint);
        pointSides.set(endPoint,0);

        let pathPoints = [];
        let pathSides = new Dictionary( 1 );
        pathPoints.push(startPoint);
        pathSides.set(startPoint,0);
        //0;
        let currPos;
        let _g11 = 0;
        let _g3 = pointsList.length;
        while(_g11 < _g3) {
            let i2 = _g11++;
            currPos = pointsList[i2];
            if(pointSides.get(currPos) == -1) {
                j = funnelLeft.length - 2;
                while(j >= 0) {
                    direction = Geom2D.getDirection(funnelLeft[j], funnelLeft[j + 1], currPos);
                    if(direction != -1) {
                        funnelLeft.shift();
                        let _g21 = 0;
                        while(_g21 < j) {
                            let k5 = _g21++;
                            pathPoints.push(funnelLeft[0]);
                            pathSides.set(funnelLeft[0],1);
                            funnelLeft.shift();
                        }
                        pathPoints.push(funnelLeft[0]);
                        pathSides.set(funnelLeft[0],1);
                        funnelRight.splice(0,funnelRight.length);
                        funnelRight.push(funnelLeft[0]);
                        funnelRight.push(currPos);
                        break;
                    }
                    j--;
                }
                funnelRight.push(currPos);
                j = funnelRight.length - 3;
                while(j >= 0) {
                    direction = Geom2D.getDirection(funnelRight[j], funnelRight[j + 1], currPos);
                    if(direction == -1) break; 
                    else funnelRight.splice(j + 1,1);
                    j--;
                }
            } else {
                j = funnelRight.length - 2;
                while(j >= 0) {
                    direction = Geom2D.getDirection(funnelRight[j], funnelRight[j + 1], currPos);
                    if(direction != 1) {
                        funnelRight.shift();
                        let _g22 = 0;
                        while(_g22 < j) {
                            let k6 = _g22++;
                            pathPoints.push(funnelRight[0]);
                            pathSides.set(funnelRight[0],-1);
                            funnelRight.shift();
                        }
                        pathPoints.push(funnelRight[0]);
                        pathSides.set(funnelRight[0],-1);
                        funnelLeft.splice(0,funnelLeft.length);
                        funnelLeft.push(funnelRight[0]);
                        funnelLeft.push(currPos);
                        break;
                    }
                    j--;
                }
                funnelLeft.push(currPos);
                j = funnelLeft.length - 3;
                while(j >= 0) {
                    direction = Geom2D.getDirection(funnelLeft[j], funnelLeft[j + 1], currPos);
                    if(direction == 1) break; 
                    else funnelLeft.splice(j + 1,1);
                    j--;
                }
            }
        }
        let blocked = false;
        j = funnelRight.length - 2;
        while(j >= 0) {
            direction = Geom2D.getDirection(funnelRight[j], funnelRight[j + 1], p_to);
            if(direction != 1) {
                funnelRight.shift();
                let _g12 = 0;
                let _g4 = j + 1;
                while(_g12 < _g4) {
                    let k7 = _g12++;
                    pathPoints.push(funnelRight[0]);
                    pathSides.set(funnelRight[0],-1);
                    funnelRight.shift();
                }
                pathPoints.push(endPoint);
                pathSides.set(endPoint,0);
                blocked = true;
                break;
            }
            j--;
        }
        if(!blocked) {
            j = funnelLeft.length - 2;
            while(j >= 0) {
                direction = Geom2D.getDirection(funnelLeft[j], funnelLeft[j + 1], p_to);
                if(direction != -1) {
                    funnelLeft.shift();
                    let _g13 = 0;
                    let _g5 = j + 1;
                    while(_g13 < _g5) {
                        let k8 = _g13++;
                        pathPoints.push(funnelLeft[0]);
                        pathSides.set(funnelLeft[0],1);
                        funnelLeft.shift();
                    }
                    pathPoints.push(endPoint);
                    pathSides.set(endPoint,0);
                    blocked = true;
                    break;
                }
                j--;
            }
        }
        if(!blocked) {
            pathPoints.push(endPoint);
            pathSides.set(endPoint,0);
            blocked = true;
        }
        let adjustedPoints = [];
        if(this._radius > 0) {
            let newPath = [];
            if(pathPoints.length == 2) this.adjustWithTangents(pathPoints[0],false,pathPoints[1],false,pointSides,pointSuccessor,newPath,adjustedPoints); else if(pathPoints.length > 2) {
                this.adjustWithTangents(pathPoints[0],false,pathPoints[1],true,pointSides,pointSuccessor,newPath,adjustedPoints);
                if(pathPoints.length > 3) {
                    let _g14 = 1;
                    let _g6 = pathPoints.length - 3 + 1;
                    while(_g14 < _g6) {
                        let i3 = _g14++;
                        this.adjustWithTangents(pathPoints[i3],true,pathPoints[i3 + 1],true,pointSides,pointSuccessor,newPath,adjustedPoints);
                    }
                }
                let pathLength = pathPoints.length;
                this.adjustWithTangents(pathPoints[pathLength - 2],true,pathPoints[pathLength - 1],false,pointSides,pointSuccessor,newPath,adjustedPoints);
            }
            newPath.push(endPoint);
            this.checkAdjustedPath(newPath,adjustedPoints,pointSides);
            let smoothPoints = [];
            i = newPath.length - 2;
            while(i >= 1) {
                this.smoothAngle(adjustedPoints[i * 2 - 1],newPath[i],adjustedPoints[i * 2],pointSides.get(newPath[i]),smoothPoints);
                while(smoothPoints.length != 0) {
                    adjustedPoints.splice(i*2, 0, smoothPoints.pop());
                }
                i--;
            }
        } else adjustedPoints = pathPoints;
        n = 0;
        l = adjustedPoints.length;
        while(n < l) {
            i = n++;
            resultPath.push(fix(adjustedPoints[i].x));
            resultPath.push(fix(adjustedPoints[i].y));
        }

    }

    adjustWithTangents( p1, applyRadiusToP1, p2, applyRadiusToP2, pointSides, pointSuccessor, newPath, adjustedPoints ) {

        let tangentsResult = [];
        let side1 = pointSides.get(p1);
        let side2 = pointSides.get(p2);
        let pTangent1 = null;
        let pTangent2 = null;
        if(!applyRadiusToP1 && !applyRadiusToP2) {
            pTangent1 = p1;
            pTangent2 = p2;
        } else if(!applyRadiusToP1) {
            if(Geom2D.tangentsPointToCircle(p1, p2, this._radius, tangentsResult)) {
                if(side2 == 1) {
                    pTangent1 = p1;
                    pTangent2 = this.getPoint(tangentsResult[2],tangentsResult[3]);
                } else {
                    pTangent1 = p1;
                    pTangent2 = this.getPoint(tangentsResult[0],tangentsResult[1]);
                }
            } else {
                Log("NO TANGENT");
                return;
            }
        } else if(!applyRadiusToP2) {
            if(Geom2D.tangentsPointToCircle(p2, p1, this._radius, tangentsResult)) {
                if(tangentsResult.length > 0) {
                    if(side1 == 1) {
                        pTangent1 = this.getPoint(tangentsResult[0],tangentsResult[1]);
                        pTangent2 = p2;
                    } else {
                        pTangent1 = this.getPoint(tangentsResult[2],tangentsResult[3]);
                        pTangent2 = p2;
                    }
                }
            } else {
                Log("NO TANGENT");
                return;
            }
        } else if(side1 == 1 && side2 == 1) {
            Geom2D.tangentsParalCircleToCircle(this._radius, p1, p2, tangentsResult);
            pTangent1 = this.getPoint(tangentsResult[2],tangentsResult[3]);
            pTangent2 = this.getPoint(tangentsResult[4],tangentsResult[5]);
        } else if(side1 == -1 && side2 == -1) {
            Geom2D.tangentsParalCircleToCircle(this._radius, p1, p2, tangentsResult);
            pTangent1 = this.getPoint(tangentsResult[0],tangentsResult[1]);
            pTangent2 = this.getPoint(tangentsResult[6],tangentsResult[7]);
        } else if(side1 == 1 && side2 == -1) {
            if(Geom2D.tangentsCrossCircleToCircle(this._radius, p1, p2, tangentsResult)) {
                pTangent1 = this.getPoint(tangentsResult[2],tangentsResult[3]);
                pTangent2 = this.getPoint(tangentsResult[6],tangentsResult[7]);
            } else {
                Log("NO TANGENT, points are too close for radius");
                return;
            }
        } else if(Geom2D.tangentsCrossCircleToCircle(this._radius, p1, p2, tangentsResult)) {
            pTangent1 = this.getPoint(tangentsResult[0],tangentsResult[1]);
            pTangent2 = this.getPoint(tangentsResult[4],tangentsResult[5]);
        } else {
            Log("NO TANGENT, points are too close for radius");
            return;
        }
        let successor = pointSuccessor.get(p1);
        let distance;
        while(successor != p2) {
            distance = Geom2D.distanceSquaredPointToSegment(successor,pTangent1,pTangent2);
            if(distance < this._radiusSquared) {
                this.adjustWithTangents(p1,applyRadiusToP1,successor,true,pointSides,pointSuccessor,newPath,adjustedPoints);
                this.adjustWithTangents(successor,true,p2,applyRadiusToP2,pointSides,pointSuccessor,newPath,adjustedPoints);
                return;
            } else successor = pointSuccessor.get(successor);
        }
        adjustedPoints.push(pTangent1);
        adjustedPoints.push(pTangent2);
        newPath.push(p1);

    }

    checkAdjustedPath( newPath, adjustedPoints, pointSides ) {

        let needCheck = true;
        let point0;
        let point0Side;
        let point1;
        let point1Side;
        let point2;
        let point2Side;
        let pt1;
        let pt2;
        let pt3;
        let dot;
        let tangentsResult = [];
        let pTangent1 = null;
        let pTangent2 = null;
        while(needCheck) {
            needCheck = false;
            let i = 2;
            while(i < newPath.length) {
                point2 = newPath[i];
                point2Side = pointSides.get(point2);
                point1 = newPath[i - 1];
                point1Side = pointSides.get(point1);
                point0 = newPath[i - 2];
                point0Side = pointSides.get(point0);
                if(point1Side == point2Side) {
                    pt1 = adjustedPoints[(i - 2) * 2];
                    pt2 = adjustedPoints[(i - 1) * 2 - 1];
                    pt3 = adjustedPoints[(i - 1) * 2];
                    dot = (pt1.x - pt2.x) * (pt3.x - pt2.x) + (pt1.y - pt2.y) * (pt3.y - pt2.y);
                    if(dot > 0) {
                        if(i == 2) {
                            Geom2D.tangentsPointToCircle(point0, point2, this._radius, tangentsResult);
                            if(point2Side == 1) {
                                pTangent1 = point0;
                                pTangent2 = this.getPoint(tangentsResult[2],tangentsResult[3]);
                            } else {
                                pTangent1 = point0;
                                pTangent2 = this.getPoint(tangentsResult[0],tangentsResult[1]);
                            }
                        } else if(i == newPath.length - 1) {
                            Geom2D.tangentsPointToCircle(point2, point0, this._radius, tangentsResult);
                            if(point0Side == 1) {
                                pTangent1 = this.getPoint(tangentsResult[0],tangentsResult[1]);
                                pTangent2 = point2;
                            } else {
                                pTangent1 = this.getPoint(tangentsResult[2],tangentsResult[3]);
                                pTangent2 = point2;
                            }
                        } else if(point0Side == 1 && point2Side == -1) {
                            Geom2D.tangentsCrossCircleToCircle(this._radius, point0, point2, tangentsResult);
                            pTangent1 = this.getPoint(tangentsResult[2],tangentsResult[3]);
                            pTangent2 = this.getPoint(tangentsResult[6],tangentsResult[7]);
                        } else if(point0Side == -1 && point2Side == 1) {
                            Geom2D.tangentsCrossCircleToCircle(this._radius, point0, point2, tangentsResult);
                            pTangent1 = this.getPoint(tangentsResult[0],tangentsResult[1]);
                            pTangent2 = this.getPoint(tangentsResult[4],tangentsResult[5]);
                        } else if(point0Side == 1 && point2Side == 1) {
                            Geom2D.tangentsParalCircleToCircle(this._radius, point0, point2, tangentsResult);
                            pTangent1 = this.getPoint(tangentsResult[2],tangentsResult[3]);
                            pTangent2 = this.getPoint(tangentsResult[4],tangentsResult[5]);
                        } else if(point0Side == -1 && point2Side == -1) {
                            Geom2D.tangentsParalCircleToCircle(this._radius, point0, point2, tangentsResult);
                            pTangent1 = this.getPoint(tangentsResult[0],tangentsResult[1]);
                            pTangent2 = this.getPoint(tangentsResult[6],tangentsResult[7]);
                        }
                        adjustedPoints.splice((i-2)*2, 1, pTangent1);
                        adjustedPoints.splice(i*2-1, 1, pTangent2);
                        // delete useless point
                        newPath.splice(i-1, 1);
                        adjustedPoints.splice((i-1)*2-1, 2);
                        tangentsResult.splice(0, tangentsResult.length);
                        /*let temp = (i - 2) * 2;
                        adjustedPoints.splice(temp,1);
                        adjustedPoints.splice(temp,0,pTangent1);
                        temp = i * 2 - 1;
                        adjustedPoints.splice(temp,1);
                        adjustedPoints.splice(temp,0,pTangent2);
                        newPath.splice(i - 1,1);
                        adjustedPoints.splice((i - 1) * 2 - 1,2);
                        tangentsResult.splice(0,tangentsResult.length);*/
                        i--;
                    }
                }
                i++;
            }
        }
    }

    smoothAngle( prevPoint, pointToSmooth, nextPoint, side, encirclePoints ) {

        let angleType = Geom2D.getDirection(prevPoint,pointToSmooth,nextPoint);
        let distanceSquared = Squared(prevPoint.x - nextPoint.x, prevPoint.y - nextPoint.y);
        if(distanceSquared <= this._sampleCircleDistanceSquared) return;
        let index = 0;
        let side1;
        let side2;
        let pointInArea;
        let p_toCheck;
        //let xToCheck;
        //let yToCheck;
        let _g1 = 0;
        let _g = this._numSamplesCircle;
        while(_g1 < _g) {
            let i = _g1++;
            pointInArea = false;
            p_toCheck = pointToSmooth.clone().add(this._sampleCircle[i]);
            //p_toCheck = new Point(pointToSmooth.x + this._sampleCircle[i].x, pointToSmooth.y + this._sampleCircle[i].y);
            //xToCheck = pointToSmooth.x + this._sampleCircle[i].x;
            //yToCheck = pointToSmooth.y + this._sampleCircle[i].y;
            side1 = Geom2D.getDirection(prevPoint,pointToSmooth,p_toCheck);
            side2 = Geom2D.getDirection(pointToSmooth,nextPoint,p_toCheck);
            if(side == 1) {
                if(angleType == -1) {
                    if(side1 == -1 && side2 == -1) pointInArea = true;
                } else if(side1 == -1 || side2 == -1) pointInArea = true;
            } else if(angleType == 1) {
                if(side1 == 1 && side2 == 1) pointInArea = true;
            } else if(side1 == 1 || side2 == 1) pointInArea = true;
            if(pointInArea) {
                encirclePoints.splice(index, 0, p_toCheck);
                //encirclePoints.splice(index, 0, new Point(xToCheck, yToCheck));
                //encirclePoints.splice(index,0);
                //let x = new Point(xToCheck,yToCheck);
                //encirclePoints.splice(index,0,x);
                index++;
            } else index = 0;
        }
        if(side == -1) encirclePoints.reverse();
        
    }
}