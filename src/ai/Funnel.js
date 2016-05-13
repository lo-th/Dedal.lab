DDLS.Funnel = function() {
    this._currPoolPointsIndex = 0;
    this._poolPointsSize = 3000;
    this._numSamplesCircle = 16;
    this._radiusSquared = 0;
    this._radius = 0;
    this._poolPoints = [];
    var l = this._poolPointsSize, n=0;
    while(n < l) {
        var i = n++;
        this._poolPoints.push(new DDLS.Point());
    }

    Object.defineProperty(this, 'radius', {
        get: function() { return this._radius; },
        set: function(value) { 
            this._radius = DDLS.max(0,value);
            this._radiusSquared = this._radius * this._radius;
            this._sampleCircle = [];
            if(this._radius == 0) return;
            var l = this._numSamplesCircle, n = 0, r;
            while(n < l) {
                var i = n++;
                r = -DDLS.TwoPI * i / this._numSamplesCircle;
                this._sampleCircle.push(new DDLS.Point(this._radius * DDLS.cos(r),this._radius * DDLS.sin(r)));
            }
            this._sampleCircleDistanceSquared = DDLS.Squared(this._sampleCircle[0].x - this._sampleCircle[1].x, this._sampleCircle[0].y - this._sampleCircle[1].y);
        }
    });
};

DDLS.Funnel.prototype = {
    dispose: function() {
        this._sampleCircle = null;
    },
    getPoint: function(x,y) {
        y = y || 0;
        x = x || 0;
        this.__point = this._poolPoints[this._currPoolPointsIndex];
        this.__point.set(x,y);
        this._currPoolPointsIndex++;
        if(this._currPoolPointsIndex == this._poolPointsSize) {
            this._poolPoints.push(new DDLS.Point());
            this._poolPointsSize++;
        }
        return this.__point;
    },
    getCopyPoint: function(pointToCopy) {
        return this.getPoint(pointToCopy.x,pointToCopy.y);
    },
    findPath: function(from, target, listFaces, listEdges, resultPath) {
        var p_from = from;
        var p_to = target;
        var rad = this._radius * 1.01;
        this._currPoolPointsIndex = 0;
        if(this._radius > 0) {
            var checkFace = listFaces[0];
            var distanceSquared, distance, p1, p2, p3;
            p1 = checkFace.edge.originVertex.pos;
            p2 = checkFace.edge.destinationVertex.pos;
            p3 = checkFace.edge.nextLeftEdge.destinationVertex.pos;
            distanceSquared = DDLS.Squared(p1.x - p_from.x, p1.y - p_from.y);
            if(distanceSquared <= this._radiusSquared) {
                distance = DDLS.sqrt(distanceSquared);
                p_from.sub(p1).div(distance).mul(rad).add(p1);
                //p_from.x = this._radius * 1.01 * ((p_from.x - p1.x) / distance) + p1.x;
                //p_from.y = this._radius * 1.01 * ((p_from.y - p1.y) / distance) + p1.y;
            } else {
                distanceSquared = DDLS.Squared(p2.x - p_from.x, p2.y - p_from.y);
                if(distanceSquared <= this._radiusSquared) {
                    distance = DDLS.sqrt(distanceSquared);
                    p_from.sub(p2).div(distance).mul(rad).add(p2);
                    //p_from.x = this._radius * 1.01 * ((p_from.X - p2.x) / distance) + p2.x;
                    //p_from.y = this._radius * 1.01 * ((p_from.y - p2.y) / distance) + p2.y;
                } else {
                    distanceSquared = DDLS.Squared(p3.x - p_from.x, p3.y - p_from.y);
                    if(distanceSquared <= this._radiusSquared) {
                        distance = DDLS.sqrt(distanceSquared);
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
            distanceSquared = DDLS.Squared(p1.x - p_to.x, p1.y - p_to.y);
            if(distanceSquared <= this._radiusSquared) {
                distance = DDLS.sqrt(distanceSquared);
                p_to.sub(p1).div(distance).mul(rad).add(p1);
                //p_to.x = this._radius * 1.01 * ((p_to.x - p1.x) / distance) + p1.x;
                //p_to.y = this._radius * 1.01 * ((p_to.y - p1.y) / distance) + p1.y;
            } else {
                distanceSquared = DDLS.Squared(p2.x - p_to.x, p2.y - p_to.y);
                if(distanceSquared <= this._radiusSquared) {
                    distance = DDLS.sqrt(distanceSquared);
                    p_to.sub(p2).div(distance).mul(rad).add(p2);
                    //p_to.x = this._radius * 1.01 * ((p_to.x - p2.x) / distance) + p2.x;
                    //p_to.y = this._radius * 1.01 * ((p_to.y - p2.y) / distance) + p2.y;
                } else {
                    distanceSquared = DDLS.Squared(p3.x - p_to.x, p3.y - p_to.y);
                    if(distanceSquared <= this._radiusSquared) {
                        distance = DDLS.sqrt(distanceSquared);
                        p_to.sub(p3).div(distance).mul(rad).add(p3);
                        //p_to.x = this._radius * 1.01 * ((p_to.x - p3.x) / distance) + p3.x;
                        //p_to.y = this._radius * 1.01 * ((p_to.y - p3.y) / distance) + p3.y;
                    }
                }
            }
        }
        // we build starting and ending points
        var startPoint, endPoint;
        startPoint = p_from.clone();//new DDLS.Point(fromX,fromY);
        endPoint = p_to.clone();//new DDLS.Point(toX,toY);
        if(listFaces.length == 1) {
            resultPath.push(DDLS.fix(startPoint.x));
            resultPath.push(DDLS.fix(startPoint.y));
            resultPath.push(DDLS.fix(endPoint.x));
            resultPath.push(DDLS.fix(endPoint.y));
            return;
        }
        var i, j, k, l, n;
        var currEdge = null;
        var currVertex = null;
        var direction;
        // first we skip the first face and first edge if the starting point lies on the first interior edge:
        if ( listEdges[0] == DDLS.Geom2D.isInFace(p_from, listFaces[0]) ){
            listEdges.shift();
            listFaces.shift();
        }
        //{
           /* var _g = DDLS.Geom2D.isInFacePrime(fromX,fromY,listFaces[0]);
            var _g = DDLS.Geom2D.isInFace(fromX,fromY,listFaces[0]);
            switch(_g[1]) {
            case 1:
                var edge = _g[2];
                if(listEdges[0] == edge) {
                    listEdges.shift();
                    listFaces.shift();
                }
                break;
            default:
            }*/
        //}
        var funnelLeft = [];
        var funnelRight = [];
        funnelLeft.push(startPoint);
        funnelRight.push(startPoint);
        var verticesDoneSide = new DDLS.Dictionary(1);
        var pointsList = [];
        var pointSides = new DDLS.Dictionary(0);
        var pointSuccessor = new DDLS.Dictionary(0);
        pointSides.set(startPoint,0);
        //0;
        currEdge = listEdges[0];
        var relativPos = DDLS.Geom2D.getRelativePosition2(p_from,currEdge);
        var prevPoint;
        var newPointA;
        var newPointB;
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
        var fromVertex = listEdges[0].originVertex;
        var fromFromVertex = listEdges[0].destinationVertex;
        var _g1 = 1;
        var _g2 = listEdges.length;
        while(_g1 < _g2) {
            var i1 = _g1++;
            currEdge = listEdges[i1];
            if(currEdge.originVertex == fromVertex) currVertex = currEdge.destinationVertex; 
            else if(currEdge.destinationVertex == fromVertex) currVertex = currEdge.originVertex; 
            else if(currEdge.originVertex == fromFromVertex) {
                currVertex = currEdge.destinationVertex;
                fromVertex = fromFromVertex;
            } else if(currEdge.destinationVertex == fromFromVertex) {
                currVertex = currEdge.originVertex;
                fromVertex = fromFromVertex;
            } else DDLS.Log("IMPOSSIBLE TO IDENTIFY THE VERTEX !!!");
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

        var pathPoints = [];
        var pathSides = new DDLS.Dictionary(1);
        pathPoints.push(startPoint);
        pathSides.set(startPoint,0);
        //0;
        var currPos;
        var _g11 = 0;
        var _g3 = pointsList.length;
        while(_g11 < _g3) {
            var i2 = _g11++;
            currPos = pointsList[i2];
            if(pointSides.get(currPos) == -1) {
                j = funnelLeft.length - 2;
                while(j >= 0) {
                    direction = DDLS.Geom2D.getDirection(funnelLeft[j], funnelLeft[j + 1], currPos);
                    if(direction != -1) {
                        funnelLeft.shift();
                        var _g21 = 0;
                        while(_g21 < j) {
                            var k5 = _g21++;
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
                    direction = DDLS.Geom2D.getDirection(funnelRight[j], funnelRight[j + 1], currPos);
                    if(direction == -1) break; 
                    else funnelRight.splice(j + 1,1);
                    j--;
                }
            } else {
                j = funnelRight.length - 2;
                while(j >= 0) {
                    direction = DDLS.Geom2D.getDirection(funnelRight[j], funnelRight[j + 1], currPos);
                    if(direction != 1) {
                        funnelRight.shift();
                        var _g22 = 0;
                        while(_g22 < j) {
                            var k6 = _g22++;
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
                    direction = DDLS.Geom2D.getDirection(funnelLeft[j], funnelLeft[j + 1], currPos);
                    if(direction == 1) break; 
                    else funnelLeft.splice(j + 1,1);
                    j--;
                }
            }
        }
        var blocked = false;
        j = funnelRight.length - 2;
        while(j >= 0) {
            direction = DDLS.Geom2D.getDirection(funnelRight[j], funnelRight[j + 1], p_to);
            if(direction != 1) {
                funnelRight.shift();
                var _g12 = 0;
                var _g4 = j + 1;
                while(_g12 < _g4) {
                    var k7 = _g12++;
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
                direction = DDLS.Geom2D.getDirection(funnelLeft[j], funnelLeft[j + 1], p_to);
                if(direction != -1) {
                    funnelLeft.shift();
                    var _g13 = 0;
                    var _g5 = j + 1;
                    while(_g13 < _g5) {
                        var k8 = _g13++;
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
        var adjustedPoints = [];
        if(this._radius > 0) {
            var newPath = [];
            if(pathPoints.length == 2) this.adjustWithTangents(pathPoints[0],false,pathPoints[1],false,pointSides,pointSuccessor,newPath,adjustedPoints); else if(pathPoints.length > 2) {
                this.adjustWithTangents(pathPoints[0],false,pathPoints[1],true,pointSides,pointSuccessor,newPath,adjustedPoints);
                if(pathPoints.length > 3) {
                    var _g14 = 1;
                    var _g6 = pathPoints.length - 3 + 1;
                    while(_g14 < _g6) {
                        var i3 = _g14++;
                        this.adjustWithTangents(pathPoints[i3],true,pathPoints[i3 + 1],true,pointSides,pointSuccessor,newPath,adjustedPoints);
                    }
                }
                var pathLength = pathPoints.length;
                this.adjustWithTangents(pathPoints[pathLength - 2],true,pathPoints[pathLength - 1],false,pointSides,pointSuccessor,newPath,adjustedPoints);
            }
            newPath.push(endPoint);
            this.checkAdjustedPath(newPath,adjustedPoints,pointSides);
            var smoothPoints = [];
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
            resultPath.push(DDLS.fix(adjustedPoints[i].x));
            resultPath.push(DDLS.fix(adjustedPoints[i].y));
        }
    },
    adjustWithTangents: function(p1, applyRadiusToP1, p2, applyRadiusToP2, pointSides, pointSuccessor, newPath, adjustedPoints) {
        var tangentsResult = [];
        var side1 = pointSides.get(p1);
        var side2 = pointSides.get(p2);
        var pTangent1 = null;
        var pTangent2 = null;
        if(!applyRadiusToP1 && !applyRadiusToP2) {
            pTangent1 = p1;
            pTangent2 = p2;
        } else if(!applyRadiusToP1) {
            if(DDLS.Geom2D.tangentsPointToCircle(p1, p2, this._radius, tangentsResult)) {
                if(side2 == 1) {
                    pTangent1 = p1;
                    pTangent2 = this.getPoint(tangentsResult[2],tangentsResult[3]);
                } else {
                    pTangent1 = p1;
                    pTangent2 = this.getPoint(tangentsResult[0],tangentsResult[1]);
                }
            } else {
                DDLS.Log("NO TANGENT");
                return;
            }
        } else if(!applyRadiusToP2) {
            if(DDLS.Geom2D.tangentsPointToCircle(p2, p1, this._radius, tangentsResult)) {
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
                DDLS.Log("NO TANGENT");
                return;
            }
        } else if(side1 == 1 && side2 == 1) {
            DDLS.Geom2D.tangentsParalCircleToCircle(this._radius, p1, p2, tangentsResult);
            pTangent1 = this.getPoint(tangentsResult[2],tangentsResult[3]);
            pTangent2 = this.getPoint(tangentsResult[4],tangentsResult[5]);
        } else if(side1 == -1 && side2 == -1) {
            DDLS.Geom2D.tangentsParalCircleToCircle(this._radius, p1, p2, tangentsResult);
            pTangent1 = this.getPoint(tangentsResult[0],tangentsResult[1]);
            pTangent2 = this.getPoint(tangentsResult[6],tangentsResult[7]);
        } else if(side1 == 1 && side2 == -1) {
            if(DDLS.Geom2D.tangentsCrossCircleToCircle(this._radius, p1, p2, tangentsResult)) {
                pTangent1 = this.getPoint(tangentsResult[2],tangentsResult[3]);
                pTangent2 = this.getPoint(tangentsResult[6],tangentsResult[7]);
            } else {
                DDLS.Log("NO TANGENT, points are too close for radius");
                return;
            }
        } else if(DDLS.Geom2D.tangentsCrossCircleToCircle(this._radius, p1, p2, tangentsResult)) {
            pTangent1 = this.getPoint(tangentsResult[0],tangentsResult[1]);
            pTangent2 = this.getPoint(tangentsResult[4],tangentsResult[5]);
        } else {
            DDLS.Log("NO TANGENT, points are too close for radius");
            return;
        }
        var successor = pointSuccessor.get(p1);
        var distance;
        while(successor != p2) {
            distance = DDLS.Geom2D.distanceSquaredPointToSegment(successor,pTangent1,pTangent2);
            if(distance < this._radiusSquared) {
                this.adjustWithTangents(p1,applyRadiusToP1,successor,true,pointSides,pointSuccessor,newPath,adjustedPoints);
                this.adjustWithTangents(successor,true,p2,applyRadiusToP2,pointSides,pointSuccessor,newPath,adjustedPoints);
                return;
            } else successor = pointSuccessor.get(successor);
        }
        adjustedPoints.push(pTangent1);
        adjustedPoints.push(pTangent2);
        newPath.push(p1);
    },
    checkAdjustedPath: function(newPath, adjustedPoints, pointSides) {
        var needCheck = true;
        var point0;
        var point0Side;
        var point1;
        var point1Side;
        var point2;
        var point2Side;
        var pt1;
        var pt2;
        var pt3;
        var dot;
        var tangentsResult = [];
        var pTangent1 = null;
        var pTangent2 = null;
        while(needCheck) {
            needCheck = false;
            var i = 2;
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
                            DDLS.Geom2D.tangentsPointToCircle(point0, point2, this._radius, tangentsResult);
                            if(point2Side == 1) {
                                pTangent1 = point0;
                                pTangent2 = this.getPoint(tangentsResult[2],tangentsResult[3]);
                            } else {
                                pTangent1 = point0;
                                pTangent2 = this.getPoint(tangentsResult[0],tangentsResult[1]);
                            }
                        } else if(i == newPath.length - 1) {
                            DDLS.Geom2D.tangentsPointToCircle(point2, point0, this._radius, tangentsResult);
                            if(point0Side == 1) {
                                pTangent1 = this.getPoint(tangentsResult[0],tangentsResult[1]);
                                pTangent2 = point2;
                            } else {
                                pTangent1 = this.getPoint(tangentsResult[2],tangentsResult[3]);
                                pTangent2 = point2;
                            }
                        } else if(point0Side == 1 && point2Side == -1) {
                            DDLS.Geom2D.tangentsCrossCircleToCircle(this._radius, point0, point2, tangentsResult);
                            pTangent1 = this.getPoint(tangentsResult[2],tangentsResult[3]);
                            pTangent2 = this.getPoint(tangentsResult[6],tangentsResult[7]);
                        } else if(point0Side == -1 && point2Side == 1) {
                            DDLS.Geom2D.tangentsCrossCircleToCircle(this._radius, point0, point2, tangentsResult);
                            pTangent1 = this.getPoint(tangentsResult[0],tangentsResult[1]);
                            pTangent2 = this.getPoint(tangentsResult[4],tangentsResult[5]);
                        } else if(point0Side == 1 && point2Side == 1) {
                            DDLS.Geom2D.tangentsParalCircleToCircle(this._radius, point0, point2, tangentsResult);
                            pTangent1 = this.getPoint(tangentsResult[2],tangentsResult[3]);
                            pTangent2 = this.getPoint(tangentsResult[4],tangentsResult[5]);
                        } else if(point0Side == -1 && point2Side == -1) {
                            DDLS.Geom2D.tangentsParalCircleToCircle(this._radius, point0, point2, tangentsResult);
                            pTangent1 = this.getPoint(tangentsResult[0],tangentsResult[1]);
                            pTangent2 = this.getPoint(tangentsResult[6],tangentsResult[7]);
                        }
                        adjustedPoints.splice((i-2)*2, 1, pTangent1);
                        adjustedPoints.splice(i*2-1, 1, pTangent2);
                        // delete useless point
                        newPath.splice(i-1, 1);
                        adjustedPoints.splice((i-1)*2-1, 2);
                        tangentsResult.splice(0, tangentsResult.length);
                        /*var temp = (i - 2) * 2;
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
    },
    smoothAngle: function(prevPoint,pointToSmooth,nextPoint,side,encirclePoints) {
        var angleType = DDLS.Geom2D.getDirection(prevPoint,pointToSmooth,nextPoint);
        var distanceSquared = DDLS.Squared(prevPoint.x - nextPoint.x, prevPoint.y - nextPoint.y);
        if(distanceSquared <= this._sampleCircleDistanceSquared) return;
        var index = 0;
        var side1;
        var side2;
        var pointInArea;
        var p_toCheck;
        //var xToCheck;
        //var yToCheck;
        var _g1 = 0;
        var _g = this._numSamplesCircle;
        while(_g1 < _g) {
            var i = _g1++;
            pointInArea = false;
            p_toCheck = pointToSmooth.clone().add(this._sampleCircle[i]);
            //p_toCheck = new DDLS.Point(pointToSmooth.x + this._sampleCircle[i].x, pointToSmooth.y + this._sampleCircle[i].y);
            //xToCheck = pointToSmooth.x + this._sampleCircle[i].x;
            //yToCheck = pointToSmooth.y + this._sampleCircle[i].y;
            side1 = DDLS.Geom2D.getDirection(prevPoint,pointToSmooth,p_toCheck);
            side2 = DDLS.Geom2D.getDirection(pointToSmooth,nextPoint,p_toCheck);
            if(side == 1) {
                if(angleType == -1) {
                    if(side1 == -1 && side2 == -1) pointInArea = true;
                } else if(side1 == -1 || side2 == -1) pointInArea = true;
            } else if(angleType == 1) {
                if(side1 == 1 && side2 == 1) pointInArea = true;
            } else if(side1 == 1 || side2 == 1) pointInArea = true;
            if(pointInArea) {
                encirclePoints.splice(index, 0, p_toCheck);
                //encirclePoints.splice(index, 0, new DDLS.Point(xToCheck, yToCheck));
                //encirclePoints.splice(index,0);
                //var x = new DDLS.Point(xToCheck,yToCheck);
                //encirclePoints.splice(index,0,x);
                index++;
            } else index = 0;
        }
        if(side == -1) encirclePoints.reverse();
    }
};