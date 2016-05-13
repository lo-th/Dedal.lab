DDLS.Squared = function(a,b){
    return a * a + b * b;
};
DDLS.SquaredSqrt = function(a,b){
    return DDLS.sqrt(a * a + b * b);
};

DDLS.Geom2D = {};
DDLS.Geom2D.__samples = [];
DDLS.Geom2D.__circumcenter = new DDLS.Point();

DDLS.Geom2D.locatePosition = function( p, mesh ) {

    // jump and walk algorithm

    if(DDLS.Geom2D._randGen == null) DDLS.Geom2D._randGen = new DDLS.RandGenerator();
    DDLS.Geom2D._randGen.seed = DDLS.int(p.x * 10 + 4 * p.y);
    var i;
    DDLS.Geom2D.__samples.splice(0, DDLS.Geom2D.__samples.length);
    var numSamples = DDLS.int(DDLS.pow(mesh._vertices.length,0.333333333333333315));
    //console.log(numSamples, mesh._vertices.length);
    DDLS.Geom2D._randGen.rangeMin = 0;
    DDLS.Geom2D._randGen.rangeMax = mesh._vertices.length - 1;

    i = numSamples;
    while(i--){
        DDLS.Geom2D.__samples.push(mesh._vertices[DDLS.Geom2D._randGen.next()]);
    }

    var currVertex, currVertexPos, distSquared;
    var minDistSquared = DDLS.POSITIVE_INFINITY;
    var closedVertex = null;
    i = 0;
    var n = 0
    while( n < numSamples ) {
        i = n++;
        currVertex = DDLS.Geom2D.__samples[i];
        currVertexPos = currVertex.pos;
        distSquared = DDLS.Squared(currVertexPos.x - p.x, currVertexPos.y - p.y);
        if( distSquared < minDistSquared ) {
            minDistSquared = distSquared;
            closedVertex = currVertex;
        }
    }
    var currFace;
    var iterFace = new DDLS.FromVertexToHoldingFaces();
    iterFace.fromVertex = closedVertex;
    currFace = iterFace.next();
    var faceVisited = new DDLS.Dictionary(1);
    var currEdge;
    var iterEdge = new DDLS.FromFaceToInnerEdges();
    var relativPos;
    var numIter = 0;

    var objectContainer = DDLS.Geom2D.isInFace(p,currFace);

    while(faceVisited.get(currFace) || objectContainer.type === 3 ){
        faceVisited.set(currFace, true);
        numIter++;
        if(numIter == 50) DDLS.Log("WALK TAKE MORE THAN 50 LOOP");
        if(numIter == 1000){ DDLS.Log("WALK TAKE MORE THAN 1000 LOOP -> WE ESCAPE"); objectContainer = {type:DDLS.NULL}; break; }
        iterEdge.fromFace = currFace;
        do {
            currEdge = iterEdge.next();
            if(currEdge == null) {
                DDLS.Log("KILL PATH");
                return null;
            }
            relativPos = DDLS.Geom2D.getRelativePosition(p,currEdge);
        } while(relativPos == 1 || relativPos == 0);
        currFace = currEdge.rightFace;

        objectContainer = DDLS.Geom2D.isInFace(p,currFace);
    }

    faceVisited.dispose();

    return objectContainer;
};

DDLS.Geom2D.isCircleIntersectingAnyConstraint = function(p,radius,mesh) {
    if(p.x <= 0 || p.x >= mesh.width || p.y <= 0 || p.y >= mesh.height) return true;
    var loc = DDLS.Geom2D.locatePosition(p,mesh);
    var face;
    switch(loc.type) {
        case 0: face = loc.edge.leftFace; break;
        case 1: face = loc.leftFace; break;
        case 2: face = loc; break;
        case 3: face = null; break;
    }
    var radiusSquared = radius * radius;
    var pos;
    var distSquared;
    pos = face.edge.originVertex.pos;
    distSquared = DDLS.Squared(pos.x - p.x, pos.y - p.y);
    if(distSquared <= radiusSquared) return true;
    pos = face.edge.nextLeftEdge.originVertex.pos;
    distSquared = DDLS.Squared(pos.x - p.x, pos.y - p.y);
    if(distSquared <= radiusSquared) return true;
    pos = face.edge.nextLeftEdge.nextLeftEdge.originVertex.pos;
    distSquared = DDLS.Squared(pos.x - p.x, pos.y - p.y);
    if(distSquared <= radiusSquared) return true;
    var edgesToCheck = [];
    edgesToCheck.push(face.edge);
    edgesToCheck.push(face.edge.nextLeftEdge);
    edgesToCheck.push(face.edge.nextLeftEdge.nextLeftEdge);
    var edge, pos1, pos2;
    var checkedEdges = new DDLS.Dictionary(0);
    var intersecting;
    while(edgesToCheck.length > 0) {
        edge = edgesToCheck.pop();
        checkedEdges.set(edge,true);
        //true;
        pos1 = edge.originVertex.pos;
        pos2 = edge.destinationVertex.pos;
        intersecting = DDLS.Geom2D.intersectionsSegmentCircle(pos1, pos2, p, radius);
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
};

DDLS.Geom2D.getDirection = function(p1,p2,p3) {
    var dot = (p3.x - p1.x) * (p2.y - p1.y) + (p3.y - p1.y) * (-p2.x + p1.x);
    return (dot == 0) ? 0 : ((dot > 0) ? 1 : -1);
    /*if(dot == 0) return 0; 
    else if(dot > 0) return 1; 
    else return -1;*/
};

DDLS.Geom2D.Orient2d = function (p1, p2, p3) {
    var val = (p1.x - p3.x) * (p2.y - p3.y) - (p1.y - p3.y) * (p2.x - p3.x);
    if (val > -DDLS.EPSILON_SQUARED && val < DDLS.EPSILON_SQUARED) return 0;// collinear
    else if (val > 0) return -1;// ccw
    else return 1;// cw
}

DDLS.Geom2D.getRelativePosition = function(p, eUp) {
    return DDLS.Geom2D.getDirection( eUp.originVertex.pos, eUp.destinationVertex.pos, p );
};

DDLS.Geom2D.getRelativePosition2 = function(p, eUp) {
    return DDLS.Geom2D.Orient2d( eUp.originVertex.pos, eUp.destinationVertex.pos, p );
};

DDLS.Geom2D.isInFace = function( p, polygon ) {
    var result = {type:DDLS.NULL};
    var e1_2 = polygon.edge;
    var e2_3 = e1_2.nextLeftEdge;
    var e3_1 = e2_3.nextLeftEdge;
    if(DDLS.Geom2D.getRelativePosition(p, e1_2) >= 0 && DDLS.Geom2D.getRelativePosition(p, e2_3) >= 0 && DDLS.Geom2D.getRelativePosition(p, e3_1) >= 0) {
        var v1 = e1_2.originVertex;
        var v2 = e2_3.originVertex;
        var v3 = e3_1.originVertex;
        var x1 = v1.pos.x;
        var y1 = v1.pos.y;
        var x2 = v2.pos.x;
        var y2 = v2.pos.y;
        var x3 = v3.pos.x;
        var y3 = v3.pos.y;
        var v_v1squared = DDLS.Squared(x1 - p.x, y1 - p.y);
        var v_v2squared = DDLS.Squared(x2 - p.x, y2 - p.y);
        var v_v3squared = DDLS.Squared(x3 - p.x, y3 - p.y);
        var inv_v1_v2 = 1 / DDLS.Squared(x2 - x1, y2 - y1);
        var inv_v2_v3 = 1 / DDLS.Squared(x3 - x2, y3 - y2);
        var inv_v3_v1 = 1 / DDLS.Squared(x1 - x3, y1 - y3);
        var dot_v_v1v2 = (p.x - x1) * (x2 - x1) + (p.y - y1) * (y2 - y1);
        var dot_v_v2v3 = (p.x - x2) * (x3 - x2) + (p.y - y2) * (y3 - y2);
        var dot_v_v3v1 = (p.x - x3) * (x1 - x3) + (p.y - y3) * (y1 - y3);
        var v_e1_2squared = v_v1squared - dot_v_v1v2 * dot_v_v1v2 * inv_v1_v2;
        var v_e2_3squared = v_v2squared - dot_v_v2v3 * dot_v_v2v3 * inv_v2_v3;
        var v_e3_1squared = v_v3squared - dot_v_v3v1 * dot_v_v3v1 * inv_v3_v1;
        var closeTo_e1_2 = v_e1_2squared <= DDLS.EPSILON_SQUARED ? true:false;
        var closeTo_e2_3 = v_e2_3squared <= DDLS.EPSILON_SQUARED ? true:false;
        var closeTo_e3_1 = v_e3_1squared <= DDLS.EPSILON_SQUARED ? true:false;
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
};

DDLS.Geom2D.clipSegmentByTriangle = function(s1, s2, t1, t2, t3, pResult1, pResult2) {
    var side1_1 = DDLS.Geom2D.getDirection(t1, t2, s1);
    var side1_2 = DDLS.Geom2D.getDirection(t1, t2, s2);
    if(side1_1 <= 0 && side1_2 <= 0) return false;
    var side2_1 = DDLS.Geom2D.getDirection(t2, t3, s1);
    var side2_2 = DDLS.Geom2D.getDirection(t2, t3, s2);
    if(side2_1 <= 0 && side2_2 <= 0) return false;
    var side3_1 = DDLS.Geom2D.getDirection(t3, t1, s1);
    var side3_2 = DDLS.Geom2D.getDirection(t3, t1, s2);
    if(side3_1 <= 0 && side3_2 <= 0) return false;
    if(side1_1 >= 0 && side2_1 >= 0 && side3_1 >= 0 && (side1_2 >= 0 && side2_2 >= 0 && side3_2 >= 0)) {
        pResult1 = s1.clone();
        pResult2 = s2.clone();
        return true;
    }
    var n = 0;
    if(DDLS.Geom2D.intersections2segments(s1, s2, t1, t2, pResult1, null)) n++;
    if(n == 0) {
        if(DDLS.Geom2D.intersections2segments(s1, s2, t2, t3, pResult1, null)) n++;
    } else if(DDLS.Geom2D.intersections2segments(s1, s2, t2, t3, pResult2, null)) {
        if(-0.01 > pResult1.x - pResult2.x || pResult1.x - pResult2.x > DDLS.EPSILON || -DDLS.EPSILON > pResult1.y - pResult2.y || pResult1.y - pResult2.y > DDLS.EPSILON) n++;
    }
    if(n == 0) {
        if(DDLS.Geom2D.intersections2segments(s1, s2, t3, t1, pResult1, null)) n++;
    } else if(n == 1) {
        if(DDLS.Geom2D.intersections2segments(s1, s2, t3, t1, pResult2, null)) {
            if(-DDLS.EPSILON > pResult1.x - pResult2.x || pResult1.x - pResult2.x > DDLS.EPSILON || -DDLS.EPSILON > pResult1.y - pResult2.y || pResult1.y - pResult2.y > DDLS.EPSILON) n++;
        }
    }
    if(n == 1) {
        if(side1_1 >= 0 && side2_1 >= 0 && side3_1 >= 0) pResult2 = s1.clone();
        else if(side1_2 >= 0 && side2_2 >= 0 && side3_2 >= 0) pResult2 = s2.clone();
        else n = 0;
    }
    if(n > 0) return true; 
    else return false;
};

/*DDLS.Geom2D.isSegmentIntersectingTriangle = function(s1, s2, t1, t2, t3) {
    var side1_1 = DDLS.Geom2D.getDirection(t1, t2, s1);
    var side1_2 = DDLS.Geom2D.getDirection(t1, t2, s2);
    if(side1_1 <= 0 && side1_2 <= 0) return false;
    var side2_1 = DDLS.Geom2D.getDirection(t2, t3, s1);
    var side2_2 = DDLS.Geom2D.getDirection(t2, t3, s2);
    if(side2_1 <= 0 && side2_2 <= 0) return false;
    var side3_1 = DDLS.Geom2D.getDirection(t3, t1, s1);
    var side3_2 = DDLS.Geom2D.getDirection(t3, t1, s2);
    if(side3_1 <= 0 && side3_2 <= 0) return false;
    if(side1_1 == 1 && side2_1 == 1 && side3_1 == 1) return true;
    if(side1_1 == 1 && side2_1 == 1 && side3_1 == 1) return true;
    var side1, side2;
    if(side1_1 == 1 && side1_2 <= 0 || side1_1 <= 0 && side1_2 == 1) {
        side1 = DDLS.Geom2D.getDirection(s1, s2, t1);
        side2 = DDLS.Geom2D.getDirection(s1, s2, t2);
        if(side1 == 1 && side2 <= 0 || side1 <= 0 && side2 == 1) return true;
    }
    if(side2_1 == 1 && side2_2 <= 0 || side2_1 <= 0 && side2_2 == 1) {
        side1 = DDLS.Geom2D.getDirection(s1, s2, t2);
        side2 = DDLS.Geom2D.getDirection(s1, s2, t3);
        if(side1 == 1 && side2 <= 0 || side1 <= 0 && side2 == 1) return true;
    }
    if(side3_1 == 1 && side3_2 <= 0 || side3_1 <= 0 && side3_2 == 1) {
        side1 = DDLS.Geom2D.getDirection(s1, s2, t3);
        side2 = DDLS.Geom2D.getDirection(s1, s2, t1);
        if(side1 == 1 && side2 <= 0 || side1 <= 0 && side2 == 1) return true;
    }
    return false;
};*/

DDLS.Geom2D.isDelaunay = function(edge) {
    var vLeft = edge.originVertex;
    var vRight = edge.destinationVertex;
    var vCorner = edge.nextLeftEdge.destinationVertex;
    var vOpposite = edge.nextRightEdge.destinationVertex;
    //DDLS.Geom2D.getCircumcenter(vCorner.pos.x,vCorner.pos.y,vLeft.pos.x,vLeft.pos.y,vRight.pos.x,vRight.pos.y,DDLS.Geom2D.__circumcenter);
    DDLS.Geom2D.getCircumcenter(vCorner.pos, vLeft.pos, vRight.pos, DDLS.Geom2D.__circumcenter);
    var squaredRadius = (vCorner.pos.x - DDLS.Geom2D.__circumcenter.x) * (vCorner.pos.x - DDLS.Geom2D.__circumcenter.x) + (vCorner.pos.y - DDLS.Geom2D.__circumcenter.y) * (vCorner.pos.y - DDLS.Geom2D.__circumcenter.y);
    var squaredDistance = (vOpposite.pos.x - DDLS.Geom2D.__circumcenter.x) * (vOpposite.pos.x - DDLS.Geom2D.__circumcenter.x) + (vOpposite.pos.y - DDLS.Geom2D.__circumcenter.y) * (vOpposite.pos.y - DDLS.Geom2D.__circumcenter.y);
    return squaredDistance >= squaredRadius ? true : false;
};

/*DDLS.Geom2D.getCircumcenterOld = function(x1,y1,x2,y2,x3,y3,result) {
    if(result == null) result = new DDLS.Point();
    var m1 = (x1 + x2) * 0.5;
    var m2 = (y1 + y2) * 0.5;
    var m3 = (x1 + x3) * 0.5;
    var m4 = (y1 + y3) * 0.5;
    var t1 = (m1 * (x1 - x3) + (m2 - m4) * (y1 - y3) + m3 * (x3 - x1)) / (x1 * (y3 - y2) + x2 * (y1 - y3) + x3 * (y2 - y1));
    result.x = m1 + t1 * (y2 - y1);
    result.y = m2 - t1 * (x2 - x1);
    return result;
};*/

DDLS.Geom2D.getCircumcenter = function(p1, p2, p3, result) {
    if(result == null) result = new DDLS.Point();
    var m1 = (p1.x + p2.x) * 0.5;
    var m2 = (p1.y + p2.y) * 0.5;
    var m3 = (p1.x + p3.x) * 0.5;
    var m4 = (p1.y + p3.y) * 0.5;
    var t1 = (m1 * (p1.x - p3.x) + (m2 - m4) * (p1.y - p3.y) + m3 * (p3.x - p1.x)) / (p1.x * (p3.y - p2.y) + p2.x * (p1.y - p3.y) + p3.x * (p2.y - p1.y));
    result.x = m1 + t1 * (p2.y - p1.y);
    result.y = m2 - t1 * (p2.x - p1.x);
    return result;
};

DDLS.Geom2D.intersections2segments = function(s1p1, s1p2, s2p1, s2p2, posIntersection, paramIntersection, infiniteLineMode) {
    if(infiniteLineMode == null) infiniteLineMode = false;
    var t1 = 0;
    var t2 = 0;
    var result;
    var divisor = (s1p1.x - s1p2.x) * (s2p1.y - s2p2.y) + (s1p2.y - s1p1.y) * (s2p1.x - s2p2.x);
    if(divisor == 0) result = false; 
    else {
        result = true;
        var invDivisor = 1 / divisor;
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
};

DDLS.Geom2D.intersections2edges = function(edge1,edge2,posIntersection,paramIntersection,infiniteLineMode) {
    if(infiniteLineMode == null) infiniteLineMode = false;
    return DDLS.Geom2D.intersections2segments(edge1.originVertex.pos, edge1.destinationVertex.pos, edge2.originVertex.pos, edge2.destinationVertex.pos, posIntersection,paramIntersection,infiniteLineMode);
};

DDLS.Geom2D.isConvex = function(edge) {
    var result = true;
    var eLeft;
    var vRight;
    eLeft = edge.nextLeftEdge.oppositeEdge;
    vRight = edge.nextRightEdge.destinationVertex;
    if(DDLS.Geom2D.getRelativePosition(vRight.pos, eLeft) != -1) result = false; else {
        eLeft = edge.prevRightEdge;
        vRight = edge.prevLeftEdge.originVertex;
        if(DDLS.Geom2D.getRelativePosition(vRight.pos, eLeft) != -1) result = false;
    }
    return result;
};

DDLS.Geom2D.projectOrthogonaly = function(vertexPos,edge) {
    var a = edge.originVertex.pos.x;
    var b = edge.originVertex.pos.y;
    var c = edge.destinationVertex.pos.x;
    var d = edge.destinationVertex.pos.y;
    var e = vertexPos.x;
    var f = vertexPos.y;
    var t1 = (a * a - a * c - a * e + b * b - b * d - b * f + c * e + d * f) / (a * a - 2 * a * c + b * b - 2 * b * d + c * c + d * d);
    vertexPos.x = a + t1 * (c - a);
    vertexPos.y = b + t1 * (d - b);
};

/*DDLS.Geom2D.projectOrthogonalyOnSegment = function(px, py, sp1x, sp1y, sp2x, sp2y, result) {
    var a = sp1x;
    var b = sp1y;
    var c = sp2x;
    var d = sp2y;
    var e = px;
    var f = py;       
    var t1 = (a*a - a*c - a*e + b*b - b*d - b*f + c*e + d*f) / (a*a - 2*a*c + b*b - 2*b*d + c*c + d*d);
    result.x = a + t1*(c - a);
    result.y = b + t1*(d - b);
};*/

DDLS.Geom2D.intersections2Circles = function(c1, r1, c2, r2, result){
    var factor, a, b, first, dist, invd, trans;
    dist = DDLS.Squared(c2.x - c1.x, c2.y - c1.y);
    invd = 1 / (2 * dist);
    if((c1.x != c2.x || c1.y != c2.y) && dist <= (r1 + r2) * (r1 + r2) && dist >= (r1 - r2) * (r1 - r2)) {
        trans = DDLS.sqrt(((r1 + r2) * (r1 + r2) - dist) * (dist - (r2 - r1) * (r2 - r1)));
        factor = c2.clone().sub(c1).mul(invd);
        a = c1.clone().add(c2).mul(0.5);
        b = factor.clone().mul(r1 * r1 - r2 * r2);
        //b = c2.clone().sub(c1).mul(r1 * r1 - r2 * r2).mul(invd);
        first = a.clone().add(b);

        

        /*var xFirstPart = (c1.x + c2.x) * 0.5 + (c2.x - c1.x) * (r1 * r1 - r2 * r2) * invd;
        var yFirstPart = (c1.y + c2.y) * 0.5 + (c2.y - c1.y) * (r1 * r1 - r2 * r2) * invd;
        var xFactor = (c2.y - c1.y) * invd;
        var yFactor = (c2.x - c1.x) * invd;*/
        if(result != null) {
            //result.push(  xFirstPart + xFactor * trans , yFirstPart - yFactor * trans  , xFirstPart - xFactor * trans , yFirstPart + yFactor * trans );
            //result.push(  xFirstPart + factor.y * trans , yFirstPart - factor.x * trans  , xFirstPart - factor.y * trans , yFirstPart + factor.x * trans );
            result.push(  first.x + factor.y * trans , first.y - factor.x * trans  , first.x - factor.y * trans , first.y + factor.x * trans );
        }
        return true;
    } else return false;
};

DDLS.Geom2D.intersectionsSegmentCircle = function(p0, p1, c, r, result) {
    var p0xSQD = p0.x * p0.x;
    var p0ySQD = p0.y * p0.y;
    var a = p1.y * p1.y - 2 * p1.y * p0.y + p0ySQD + p1.x * p1.x - 2 * p1.x * p0.x + p0xSQD;
    var b = 2 * p0.y * c.y - 2 * p0xSQD + 2 * p1.y * p0.y - 2 * p0ySQD + 2 * p1.x * p0.x - 2 * p1.x * c.x + 2 * p0.x * c.x - 2 * p1.y * c.y;
    var cc = p0ySQD + c.y * c.y + c.x * c.x - 2 * p0.y * c.y - 2 * p0.x * c.x + p0xSQD - r * r;
    var delta = b * b - 4 * a * cc;
    var deltaSQRT;
    var t0;
    var t1;
    if(delta < 0) return false; 
    else if(delta == 0) {
        t0 = -b / (2 * a);
        if(t0 < 0 || t0 > 1) return false;
        if(result != null) {
            result.push( p0.x + t0*(p1.x - p0.x), p0.y + t0*(p1.y - p0.y),  t0 );
        }
        return true;
    } else {
        deltaSQRT = DDLS.sqrt(delta);
        t0 = (-b + deltaSQRT) / (2 * a);
        t1 = (-b - deltaSQRT) / (2 * a);
        var intersecting = false;
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
};

/*DDLS.Geom2D.intersectionsLineCircle = function(p0x,p0y,p1x,p1y,cx,cy,r,result) {
    var p0xSQD = p0x * p0x;
    var p0ySQD = p0y * p0y;
    var a = p1y * p1y - 2 * p1y * p0y + p0ySQD + p1x * p1x - 2 * p1x * p0x + p0xSQD;
    var b = 2 * p0y * cy - 2 * p0xSQD + 2 * p1y * p0y - 2 * p0ySQD + 2 * p1x * p0x - 2 * p1x * cx + 2 * p0x * cx - 2 * p1y * cy;
    var c = p0ySQD + cy * cy + cx * cx - 2 * p0y * cy - 2 * p0x * cx + p0xSQD - r * r;
    var delta = b * b - 4 * a * c;
    var deltaSQRT, t0, t1;
    if(delta < 0) return false; 
    else if(delta == 0) {
        t0 = -b / (2 * a);
        result.push( p0x + t0*(p1x - p0x), p0y + t0*(p1y - p0y),  t0 );
    } else if(delta > 0) {
        deltaSQRT = DDLS.sqrt(delta);
        t0 = (-b + deltaSQRT) / (2 * a);
        t1 = (-b - deltaSQRT) / (2 * a);
        result.push( p0x + t0*(p1x - p0x), p0y + t0*(p1y - p0y), t0, p0x + t1*(p1x - p0x), p0y + t1*(p1y - p0y), t1 );
    }
    return true;
};*/

DDLS.Geom2D.tangentsPointToCircle = function(p, c, r, result) {
    var c2 = p.clone().add(c).mul(0.5);
    var r2 = 0.5 * DDLS.SquaredSqrt(p.x - c.x, p.y - c.y);
    return DDLS.Geom2D.intersections2Circles(c2, r2, c, r, result);
};

DDLS.Geom2D.tangentsCrossCircleToCircle = function(r, c1, c2, result) {
    var distance = DDLS.SquaredSqrt(c1.x - c2.x, c1.y - c2.y);
    var radius = distance * 0.25;
    var center = c2.clone().sub(c1).mul(0.25).add(c1);
    //var center = new DDLS.Point();
    //center.x = c1.x + (c2.x - c1.x) * 0.25;
    //center.y = c1.y + (c2.y - c1.y) * 0.25;
    if(DDLS.Geom2D.intersections2Circles(c1, r, center, radius, result)) {
        var t1x = result[0];
        var t1y = result[1];
        var t2x = result[2];
        var t2y = result[3];
        var mid = c1.clone().add(c2).mul(0.5);
        //var midX = (c1.x + c2.x) * 0.5;
        //var midY = (c1.y + c2.y) * 0.5;
        var dotProd = (t1x - mid.x) * (c2.y - c1.y) + (t1y - mid.y) * (-c2.x + c1.x);
        var tproj = dotProd / (distance * distance);
        var projx = mid.x + tproj * (c2.y - c1.y);
        var projy = mid.y - tproj * (c2.x - c1.x);
        var t4x = 2 * projx - t1x;
        var t4y = 2 * projy - t1y;
        var t3x = t4x + t2x - t1x;
        var t3y = t2y + t4y - t1y;
        result.push( t3x, t3y, t4x, t4y );
        return true;
    } else return false;
};

DDLS.Geom2D.tangentsParalCircleToCircle = function(r, c1, c2, result) {
    var distance = DDLS.SquaredSqrt(c1.x - c2.x, c1.y - c2.y);
    var invD = 1 / distance;
    var t1x = c1.x + r * (c2.y - c1.y) * invD;
    var t1y = c1.y + r * (-c2.x + c1.x) * invD;
    var t2x = 2 * c1.x - t1x;
    var t2y = 2 * c1.y - t1y;
    var t3x = t2x + c2.x - c1.x;
    var t3y = t2y + c2.y - c1.y;
    var t4x = t1x + c2.x - c1.x;
    var t4y = t1y + c2.y - c1.y;
    result.push( t1x, t1y, t2x, t2y, t3x, t3y, t4x, t4y );
};

/*DDLS.Geom2D.distanceSquaredPointToLine = function(p,a,b) {
    var a_b_squared = DDLS.Squared(b.x - a.x, b.y - a.y);
    var dotProduct = (p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y);
    var p_a_squared = DDLS.Squared(a.x - p.x, a.y - p.y);
    return p_a_squared - dotProduct * dotProduct / a_b_squared;
};*/

DDLS.Geom2D.distanceSquaredPointToSegment = function(p, a, b) {
    var a_b_squared = DDLS.Squared(b.x - a.x, b.y - a.y);
    var dotProduct = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / a_b_squared;
    if(dotProduct < 0) return DDLS.Squared(p.x - a.x, p.y - a.y); 
    else if(dotProduct <= 1) {
        var p_a_squared = DDLS.Squared(a.x - p.x, a.y - p.y);
        return p_a_squared - dotProduct * dotProduct * a_b_squared;
    } else return DDLS.Squared(p.x - b.x, p.y - b.y);
};

DDLS.Geom2D.distanceSquaredVertexToEdge = function(vertex,edge) {
    return DDLS.Geom2D.distanceSquaredPointToSegment(vertex.pos, edge.originVertex.pos, edge.destinationVertex.pos);
};

DDLS.Geom2D.pathLength = function(path) {
    var sumDistance = 0.;
    var fromX = path[0];
    var fromY = path[1];
    var nextX;
    var nextY;
    var x;
    var y;
    var distance;
    var i = 2;
    while(i < path.length) {
        nextX = path[i];
        nextY = path[i + 1];
        x = nextX - fromX;
        y = nextY - fromY;
        distance = DDLS.SquaredSqrt(x, y);
        sumDistance += distance;
        fromX = nextX;
        fromY = nextY;
        i += 2;
    }
    return sumDistance;
};