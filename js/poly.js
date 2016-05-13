


var POLY = {};

POLY.PI     = 3.141592653589793;
POLY.TwoPI  = 6.283185307179586;
POLY.PI90   = 1.570796326794896;
POLY.PI135  = 2.356194490192345;

POLY.EPSILON = 1e-12;
POLY.kAlpha = 0.3;
POLY.Orientation = { "CW": 1, "CCW": -1, "COLLINEAR": 0 };


POLY.Point = function(x, y) {
    this.x = +x || 0;
    this.y = +y || 0;

    // All extra fields added to Point are prefixed with _p2t_
    // to avoid collisions if custom Point class is used.

    // The edges this point constitutes an upper ending point
    this._p2t_edge_list = null;
};
POLY.Point.prototype= {
    constructor: POLY.Point,
    toString : function() {
        return ("(" + this.x + ";" + this.y + ")");
    },
    clone : function() {
        return new POLY.Point(this.x, this.y);
    },
    set_zero : function() {
        this.x = 0.0;
        this.y = 0.0;
        return this; // for chaining
    },
    set : function(x, y) {
        this.x = +x || 0;
        this.y = +y || 0;
        return this; // for chaining
    },
    negate : function() {
        this.x = -this.x;
        this.y = -this.y;
        return this; // for chaining
    },
    add : function(n) {
        this.x += n.x;
        this.y += n.y;
        return this; // for chaining
    },
    sub : function(n) {
        this.x -= n.x;
        this.y -= n.y;
        return this; // for chaining
    },
    mul : function(s) {
        this.x *= s;
        this.y *= s;
        return this; // for chaining
    },
    length : function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },
    normalize : function() {
        var len = this.length();
        this.x /= len;
        this.y /= len;
        return len;
    },
    equals : function(p) {
        return this.x === p.x && this.y === p.y;
    }
}


// -----------------------------------------------------Point ("static" methods)

/**
 * Negate a point component-wise and return the result as a new Point object.
 * @param   p   Point object.
 * @return the resulting Point object.
 */
POLY.negate = function(p) {
    return new POLY.Point(-p.x, -p.y);
};

/**
 * Add two points component-wise and return the result as a new Point object.
 * @param   a   Point object.
 * @param   b   Point object.
 * @return the resulting Point object.
 */
POLY.add = function(a, b) {
    return new POLY.Point(a.x + b.x, a.y + b.y);
};

/**
 * Subtract two points component-wise and return the result as a new Point object.
 * @param   a   Point object.
 * @param   b   Point object.
 * @return the resulting Point object.
 */
POLY.sub = function(a, b) {
    return new POLY.Point(a.x - b.x, a.y - b.y);
};

/**
 * Multiply a point by a scalar and return the result as a new Point object.
 * @param   s   the scalar (a number).
 * @param   p   Point object.
 * @return the resulting Point object.
 */
POLY.mul = function(s, p) {
    return new POLY.Point(s * p.x, s * p.y);
};

/**
 * Perform the cross product on either two points (this produces a scalar)
 * or a point and a scalar (this produces a point).
 * This function requires two parameters, either may be a Point object or a
 * number.
 * @param   a   Point object or scalar.
 * @param   b   Point object or scalar.
 * @return  a   Point object or a number, depending on the parameters.
 */
POLY.cross = function(a, b) {
    if (typeof(a) === 'number') {
        if (typeof(b) === 'number') {
            return a * b;
        } else {
            return new POLY.Point(-a * b.y, a * b.x);
        }
    } else {
        if (typeof(b) === 'number') {
            return new POLY.Point(b * a.y, -b * a.x);
        } else {
            return a.x * b.y - a.y * b.x;
        }
    }
};

POLY.Error = function(s) {
    console.log(s)
}


// -----------------------------------------------------------------"Point-Like"
/*
 * The following functions operate on "Point" or any "Point like" object 
 * with {x,y} (duck typing).
 */


/**
 * Point pretty printing ex. <i>"(5;42)"</i>)
 * @param   p   any "Point like" object with {x,y} 
 * @returns {String}
 */
POLY.toString = function(p) {
    // Try a custom toString first, and fallback to Point.prototype.toString if none
    var s = p.toString();
    return (s === '[object Object]' ? new POLY.Point.prototype.toString.call(p) : s);
};

/**
 * Compare two points component-wise.
 * @param   a,b   any "Point like" objects with {x,y} 
 * @return <code>&lt; 0</code> if <code>a &lt; b</code>, 
 *         <code>&gt; 0</code> if <code>a &gt; b</code>, 
 *         <code>0</code> otherwise.
 */
POLY.compare = function(a, b) {
    if (a.y === b.y) {
        return a.x - b.x;
    } else {
        return a.y - b.y;
    }
};
//Point.cmp = POLY.compare; // backward compatibility

/**
 * Test two Point objects for equality.
 * @param   a,b   any "Point like" objects with {x,y} 
 * @return <code>True</code> if <code>a == b</code>, <code>false</code> otherwise.
 */
POLY.equals = function(a, b) {
    return a.x === b.x && a.y === b.y;
};

/**
 * Peform the dot product on two vectors.
 * @param   a,b   any "Point like" objects with {x,y} 
 * @return The dot product (as a number).
 */
POLY.dot = function(a, b) {
    return a.x * b.x + a.y * b.y;
};


// -------------------------------------------------------------------PointError

/**
 * Custom exception class to indicate invalid Point values
 * @param {String} message          error message
 * @param {array<Point>} points     invalid points
 */
// Class added in the JavaScript version (was not present in the c++ version)
POLY.PointError = function(message, points) {
    this.name = "PointError";
    this.points = points = points || [];
    this.message = message || "Invalid Points!";
    for (var i = 0; i < points.length; i++) {
        this.message += " " + POLY.Point.toString(points[i]);
    }
};
//POLY.PointError.prototype = new Error();
//POLY.PointError.prototype.constructor = POLY.PointError;


// -------------------------------------------------------------------------Edge
/**
 * Represents a simple polygon's edge
 * @param {Point} p1
 * @param {Point} p2
 */
POLY.Edge = function(p1, p2) {
    this.p = p1;
    this.q = p2;

    if (p1.y > p2.y) {
        this.q = p1;
        this.p = p2;
    } else if (p1.y === p2.y) {
        if (p1.x > p2.x) {
            this.q = p1;
            this.p = p2;
        } else if (p1.x === p2.x) {
            POLY.PointError('poly2tri Invalid Edge constructor: repeated points!', [p1]);
        }
    }

    if (!this.q._p2t_edge_list) {
        this.q._p2t_edge_list = [];
    }
    this.q._p2t_edge_list.push(this);
};



// ------------------------------------------------------------------------utils



// ------------------------------------------------------------------------utils


/**
 * Forumla to calculate signed area<br>
 * Positive if CCW<br>
 * Negative if CW<br>
 * 0 if collinear<br>
 * <pre>
 * A[P1,P2,P3]  =  (x1*y2 - y1*x2) + (x2*y3 - y2*x3) + (x3*y1 - y3*x1)
 *              =  (x1-x3)*(y2-y3) - (y1-y3)*(x2-x3)
 * </pre>
 */
POLY.orient2d = function (pa, pb, pc) {
    var detleft = (pa.x - pc.x) * (pb.y - pc.y);
    var detright = (pa.y - pc.y) * (pb.x - pc.x);
    var val = detleft - detright;
    if (val > -(POLY.EPSILON) && val < (POLY.EPSILON)) {
        return POLY.Orientation.COLLINEAR;
    } else if (val > 0) {
        return POLY.Orientation.CCW;
    } else {
        return POLY.Orientation.CW;
    }
}

POLY.inScanArea = function (pa, pb, pc, pd) {
    var pdx = pd.x;
    var pdy = pd.y;
    var adx = pa.x - pdx;
    var ady = pa.y - pdy;
    var bdx = pb.x - pdx;
    var bdy = pb.y - pdy;

    var adxbdy = adx * bdy;
    var bdxady = bdx * ady;
    var oabd = adxbdy - bdxady;

    if (oabd <= (POLY.EPSILON)) {
        return false;
    }

    var cdx = pc.x - pdx;
    var cdy = pc.y - pdy;

    var cdxady = cdx * ady;
    var adxcdy = adx * cdy;
    var ocad = cdxady - adxcdy;

    if (ocad <= (POLY.EPSILON)) {
        return false;
    }

    return true;
}

// ---------------------------------------------------------------AdvancingFront
/**
 * Advancing front node
 * @param {Point} p any "Point like" object with {x,y} (duck typing)
 * @param {Triangle} t triangle (optionnal)
 */
POLY.Node = function(p, t) {
    this.point = p;
    this.triangle = t || null;

    this.next = null; // Node
    this.prev = null; // Node

    this.value = p.x;
};

POLY.AdvancingFront = function(head, tail) {
    this.head_ = head; // Node
    this.tail_ = tail; // Node
    this.search_node_ = head; // Node
};
POLY.AdvancingFront.prototype= {
    constructor: POLY.AdvancingFront,
    head : function() {
        return this.head_;
    },
    setHead : function(node) {
        this.head_ = node;
    },
    tail : function() {
        return this.tail_;
    },
    setTail : function(node) {
        this.tail_ = node;
    },
    search : function() {
        return this.search_node_;
    },
    setSearch : function(node) {
        this.search_node_ = node;
    },
    findSearchNode : function(/*x*/) {
        // TODO: implement BST index
        return this.search_node_;
    },
    locateNode : function(x) {
        var node = this.search_node_;

        /* jshint boss:true */
        if (x < node.value) {
            while (node = node.prev) {
                if (x >= node.value) {
                    this.search_node_ = node;
                    return node;
                }
            }
        } else {
            while (node = node.next) {
                if (x < node.value) {
                    this.search_node_ = node.prev;
                    return node.prev;
                }
            }
        }
        return null;
    },
    locatePoint : function(point) {
        var px = point.x;
        var node = this.findSearchNode(px);
        var nx = node.point.x;

        if (px === nx) {
            // Here we are comparing point references, not values
            if (point !== node.point) {
                // We might have two nodes with same x value for a short time
                if (point === node.prev.point) {
                    node = node.prev;
                } else if (point === node.next.point) {
                    node = node.next;
                } else {
                    POLY.Error('poly2tri Invalid AdvancingFront.locatePoint() call');
                }
            }
        } else if (px < nx) {
            /* jshint boss:true */
            while (node = node.prev) {
                if (point === node.point) {
                    break;
                }
            }
        } else {
            while (node = node.next) {
                if (point === node.point) {
                    break;
                }
            }
        }

        if (node) {
            this.search_node_ = node;
        }
        return node;
    }
}

// ------------------------------------------------------------------------Basin
POLY.Basin = function() {
    this.left_node = null; // Node
    this.bottom_node = null; // Node
    this.right_node = null; // Node
    this.width = 0.0; // number
    this.left_highest = false;
};

POLY.Basin.prototype.clear = function() {
    this.left_node = null;
    this.bottom_node = null;
    this.right_node = null;
    this.width = 0.0;
    this.left_highest = false;
};

// --------------------------------------------------------------------EdgeEvent
POLY.EdgeEvent = function() {
    this.constrained_edge = null; // Edge
    this.right = false;
};


// ------------------------------------------------------------------------POLY

/**
 * The 'POLY' object is present in order to keep this JavaScript version 
 * as close as possible to the reference C++ version, even though almost
 * all POLY methods could be declared as members of the POLYContext object.
 */
//var POLY = {};


/**
 * Triangulate the polygon with holes and Steiner points.
 * @param   tcx POLYContext object.
 */
POLY.triangulate = function(tcx) {
    tcx.initTriangulation();
    tcx.createAdvancingFront();
    // POLY points; build mesh
    POLY.sweepPoints(tcx);
    // Clean up
    POLY.finalizationPolygon(tcx);
};

POLY.sweepPoints = function(tcx) {
    var i, len = tcx.pointCount();
    for (i = 1; i < len; ++i) {
        var point = tcx.getPoint(i);
        var node = POLY.pointEvent(tcx, point);
        var edges = point._p2t_edge_list;
        for (var j = 0; edges && j < edges.length; ++j) {
            POLY.edgeEventByEdge(tcx, edges[j], node);
        }
    }
};

POLY.finalizationPolygon = function(tcx) {
    // Get an Internal triangle to start with
    var t = tcx.front().head().next.triangle;
    var p = tcx.front().head().next.point;
    while (!t.getConstrainedEdgeCW(p)) {
        t = t.neighborCCW(p);
    }

    // Collect interior triangles constrained by edges
    tcx.meshClean(t);
};

/**
 * Find closes node to the left of the new point and
 * create a new triangle. If needed new holes and basins
 * will be filled to.
 */
POLY.pointEvent = function(tcx, point) {
    var node = tcx.locateNode(point);
    var new_node = POLY.newFrontTriangle(tcx, point, node);

    // Only need to check +epsilon since point never have smaller
    // x value than node due to how we fetch nodes from the front
    if (point.x <= node.point.x + (POLY.EPSILON)) {
        POLY.fill(tcx, node);
    }

    //tcx.AddNode(new_node);

    POLY.fillAdvancingFront(tcx, new_node);
    return new_node;
};

POLY.edgeEventByEdge = function(tcx, edge, node) {
    tcx.edge_event.constrained_edge = edge;
    tcx.edge_event.right = (edge.p.x > edge.q.x);

    if (POLY.isEdgeSideOfTriangle(node.triangle, edge.p, edge.q)) {
        return;
    }

    // For now we will do all needed filling
    // TODO: integrate with flip process might give some better performance
    //       but for now this avoid the issue with cases that needs both flips and fills
    POLY.fillEdgeEvent(tcx, edge, node);
    POLY.edgeEventByPoints(tcx, edge.p, edge.q, node.triangle, edge.q);
};

POLY.edgeEventByPoints = function(tcx, ep, eq, triangle, point) {
    if (POLY.isEdgeSideOfTriangle(triangle, ep, eq)) {
        return;
    }

    var p1 = triangle.pointCCW(point);
    var o1 = POLY.orient2d(eq, p1, ep);
    if (o1 === POLY.Orientation.COLLINEAR) {
        // TODO integrate here changes from C++ version
        POLY.PointError('poly2tri EdgeEvent: Collinear not supported!', [eq, p1, ep]);
    }

    var p2 = triangle.pointCW(point);
    var o2 = POLY.orient2d(eq, p2, ep);
    if (o2 === POLY.Orientation.COLLINEAR) {
        // TODO integrate here changes from C++ version
        POLY.PointError('poly2tri EdgeEvent: Collinear not supported!', [eq, p2, ep]);
    }

    if (o1 === o2) {
        // Need to decide if we are rotating CW or CCW to get to a triangle
        // that will cross edge
        if (o1 === POLY.Orientation.CW) {
            triangle = triangle.neighborCCW(point);
        } else {
            triangle = triangle.neighborCW(point);
        }
        POLY.edgeEventByPoints(tcx, ep, eq, triangle, point);
    } else {
        // This triangle crosses constraint so lets flippin start!
        POLY.flipEdgeEvent(tcx, ep, eq, triangle, point);
    }
};

POLY.isEdgeSideOfTriangle = function(triangle, ep, eq) {
    var index = triangle.edgeIndex(ep, eq);
    if (index !== -1) {
        triangle.markConstrainedEdgeByIndex(index);
        var t = triangle.getNeighbor(index);
        if (t) {
            t.markConstrainedEdgeByPoints(ep, eq);
        }
        return true;
    }
    return false;
};

POLY.newFrontTriangle = function(tcx, point, node) {
    var triangle = new POLY.Triangle(point, node.point, node.next.point);

    triangle.markNeighbor(node.triangle);
    tcx.addToMap(triangle);

    var new_node = new POLY.Node(point);
    new_node.next = node.next;
    new_node.prev = node;
    node.next.prev = new_node;
    node.next = new_node;

    if (!POLY.legalize(tcx, triangle)) {
        tcx.mapTriangleToNodes(triangle);
    }

    return new_node;
};

/**
 * Adds a triangle to the advancing front to fill a hole.
 * @param tcx
 * @param node - middle node, that is the bottom of the hole
 */
POLY.fill = function(tcx, node) {
    var triangle = new POLY.Triangle(node.prev.point, node.point, node.next.point);

    // TODO: should copy the constrained_edge value from neighbor triangles
    //       for now constrained_edge values are copied during the legalize
    triangle.markNeighbor(node.prev.triangle);
    triangle.markNeighbor(node.triangle);

    tcx.addToMap(triangle);

    // Update the advancing front
    node.prev.next = node.next;
    node.next.prev = node.prev;


    // If it was legalized the triangle has already been mapped
    if (!POLY.legalize(tcx, triangle)) {
        tcx.mapTriangleToNodes(triangle);
    }

    //tcx.removeNode(node);
};

/**
 * Fills holes in the Advancing Front
 */
POLY.fillAdvancingFront = function(tcx, n) {
    // Fill right holes
    var node = n.next;
    var angle;
    while (node.next) {
        angle = POLY.holeAngle(node);
        if (angle > POLY.PI90 || angle < -(POLY.PI90)) {
            break;
        }
        POLY.fill(tcx, node);
        node = node.next;
    }

    // Fill left holes
    node = n.prev;
    while (node.prev) {
        angle = POLY.holeAngle(node);
        if (angle > POLY.PI90 || angle < -(POLY.PI90)) {
            break;
        }
        POLY.fill(tcx, node);
        node = node.prev;
    }

    // Fill right basins
    if (n.next && n.next.next) {
        angle = POLY.basinAngle(n);
        if (angle < POLY.PI135) {
            POLY.fillBasin(tcx, n);
        }
    }
};

POLY.basinAngle = function(node) {
    var ax = node.point.x - node.next.next.point.x;
    var ay = node.point.y - node.next.next.point.y;
    return Math.atan2(ay, ax);
};

/**
 *
 * @param node - middle node
 * @return the angle between 3 front nodes
 */
POLY.holeAngle = function(node) {
    /* Complex plane
     * ab = cosA +i*sinA
     * ab = (ax + ay*i)(bx + by*i) = (ax*bx + ay*by) + i(ax*by-ay*bx)
     * atan2(y,x) computes the principal value of the argument function
     * applied to the complex number x+iy
     * Where x = ax*bx + ay*by
     *       y = ax*by - ay*bx
     */
    var ax = node.next.point.x - node.point.x;
    var ay = node.next.point.y - node.point.y;
    var bx = node.prev.point.x - node.point.x;
    var by = node.prev.point.y - node.point.y;
    return Math.atan2(ax * by - ay * bx, ax * bx + ay * by);
};

/**
 * Returns true if triangle was legalized
 */
POLY.legalize = function(tcx, t) {
    // To legalize a triangle we start by finding if any of the three edges
    // violate the Delaunay condition
    for (var i = 0; i < 3; ++i) {
        if (t.delaunay_edge[i]) {
            continue;
        }
        var ot = t.getNeighbor(i);
        if (ot) {
            var p = t.getPoint(i);
            var op = ot.oppositePoint(t, p);
            var oi = ot.index(op);

            // If this is a Constrained Edge or a Delaunay Edge(only during recursive legalization)
            // then we should not try to legalize
            if (ot.constrained_edge[oi] || ot.delaunay_edge[oi]) {
                t.constrained_edge[i] = ot.constrained_edge[oi];
                continue;
            }

            var inside = POLY.inCircle(p, t.pointCCW(p), t.pointCW(p), op);
            if (inside) {
                // Lets mark this shared edge as Delaunay
                t.delaunay_edge[i] = true;
                ot.delaunay_edge[oi] = true;

                // Lets rotate shared edge one vertex CW to legalize it
                POLY.rotateTrianglePair(t, p, ot, op);

                // We now got one valid Delaunay Edge shared by two triangles
                // This gives us 4 new edges to check for Delaunay

                // Make sure that triangle to node mapping is done only one time for a specific triangle
                var not_legalized = !POLY.legalize(tcx, t);
                if (not_legalized) {
                    tcx.mapTriangleToNodes(t);
                }

                not_legalized = !POLY.legalize(tcx, ot);
                if (not_legalized) {
                    tcx.mapTriangleToNodes(ot);
                }
                // Reset the Delaunay edges, since they only are valid Delaunay edges
                // until we add a new triangle or point.
                // XXX: need to think about this. Can these edges be tried after we
                //      return to previous recursive level?
                t.delaunay_edge[i] = false;
                ot.delaunay_edge[oi] = false;

                // If triangle have been legalized no need to check the other edges since
                // the recursive legalization will handles those so we can end here.
                return true;
            }
        }
    }
    return false;
};

/**
 * <b>Requirement</b>:<br>
 * 1. a,b and c form a triangle.<br>
 * 2. a and d is know to be on opposite side of bc<br>
 * <pre>
 *                a
 *                +
 *               / \
 *              /   \
 *            b/     \c
 *            +-------+
 *           /    d    \
 *          /           \
 * </pre>
 * <b>Fact</b>: d has to be in area B to have a chance to be inside the circle formed by
 *  a,b and c<br>
 *  d is outside B if orient2d(a,b,d) or orient2d(c,a,d) is CW<br>
 *  This preknowledge gives us a way to optimize the incircle test
 * @param pa - triangle point, opposite d
 * @param pb - triangle point
 * @param pc - triangle point
 * @param pd - point opposite a
 * @return true if d is inside circle, false if on circle edge
 */
POLY.inCircle = function(pa, pb, pc, pd) {
    var adx = pa.x - pd.x;
    var ady = pa.y - pd.y;
    var bdx = pb.x - pd.x;
    var bdy = pb.y - pd.y;

    var adxbdy = adx * bdy;
    var bdxady = bdx * ady;
    var oabd = adxbdy - bdxady;
    if (oabd <= 0) {
        return false;
    }

    var cdx = pc.x - pd.x;
    var cdy = pc.y - pd.y;

    var cdxady = cdx * ady;
    var adxcdy = adx * cdy;
    var ocad = cdxady - adxcdy;
    if (ocad <= 0) {
        return false;
    }

    var bdxcdy = bdx * cdy;
    var cdxbdy = cdx * bdy;

    var alift = adx * adx + ady * ady;
    var blift = bdx * bdx + bdy * bdy;
    var clift = cdx * cdx + cdy * cdy;

    var det = alift * (bdxcdy - cdxbdy) + blift * ocad + clift * oabd;
    return det > 0;
};

/**
 * Rotates a triangle pair one vertex CW
 *<pre>
 *       n2                    n2
 *  P +-----+             P +-----+
 *    | t  /|               |\  t |
 *    |   / |               | \   |
 *  n1|  /  |n3           n1|  \  |n3
 *    | /   |    after CW   |   \ |
 *    |/ oT |               | oT \|
 *    +-----+ oP            +-----+
 *       n4                    n4
 * </pre>
 */
POLY.rotateTrianglePair = function(t, p, ot, op) {
    var n1, n2, n3, n4;
    n1 = t.neighborCCW(p);
    n2 = t.neighborCW(p);
    n3 = ot.neighborCCW(op);
    n4 = ot.neighborCW(op);

    var ce1, ce2, ce3, ce4;
    ce1 = t.getConstrainedEdgeCCW(p);
    ce2 = t.getConstrainedEdgeCW(p);
    ce3 = ot.getConstrainedEdgeCCW(op);
    ce4 = ot.getConstrainedEdgeCW(op);

    var de1, de2, de3, de4;
    de1 = t.getDelaunayEdgeCCW(p);
    de2 = t.getDelaunayEdgeCW(p);
    de3 = ot.getDelaunayEdgeCCW(op);
    de4 = ot.getDelaunayEdgeCW(op);

    t.legalize(p, op);
    ot.legalize(op, p);

    // Remap delaunay_edge
    ot.setDelaunayEdgeCCW(p, de1);
    t.setDelaunayEdgeCW(p, de2);
    t.setDelaunayEdgeCCW(op, de3);
    ot.setDelaunayEdgeCW(op, de4);

    // Remap constrained_edge
    ot.setConstrainedEdgeCCW(p, ce1);
    t.setConstrainedEdgeCW(p, ce2);
    t.setConstrainedEdgeCCW(op, ce3);
    ot.setConstrainedEdgeCW(op, ce4);

    // Remap neighbors
    // XXX: might optimize the markNeighbor by keeping track of
    //      what side should be assigned to what neighbor after the
    //      rotation. Now mark neighbor does lots of testing to find
    //      the right side.
    t.clearNeigbors();
    ot.clearNeigbors();
    if (n1) {
        ot.markNeighbor(n1);
    }
    if (n2) {
        t.markNeighbor(n2);
    }
    if (n3) {
        t.markNeighbor(n3);
    }
    if (n4) {
        ot.markNeighbor(n4);
    }
    t.markNeighbor(ot);
};

/**
 * Fills a basin that has formed on the Advancing Front to the right
 * of given node.<br>
 * First we decide a left,bottom and right node that forms the
 * boundaries of the basin. Then we do a reqursive fill.
 *
 * @param tcx
 * @param node - starting node, this or next node will be left node
 */
POLY.fillBasin = function(tcx, node) {
    if (POLY.orient2d(node.point, node.next.point, node.next.next.point) === POLY.Orientation.CCW) {
        tcx.basin.left_node = node.next.next;
    } else {
        tcx.basin.left_node = node.next;
    }

    // Find the bottom and right node
    tcx.basin.bottom_node = tcx.basin.left_node;
    while (tcx.basin.bottom_node.next && tcx.basin.bottom_node.point.y >= tcx.basin.bottom_node.next.point.y) {
        tcx.basin.bottom_node = tcx.basin.bottom_node.next;
    }
    if (tcx.basin.bottom_node === tcx.basin.left_node) {
        // No valid basin
        return;
    }

    tcx.basin.right_node = tcx.basin.bottom_node;
    while (tcx.basin.right_node.next && tcx.basin.right_node.point.y < tcx.basin.right_node.next.point.y) {
        tcx.basin.right_node = tcx.basin.right_node.next;
    }
    if (tcx.basin.right_node === tcx.basin.bottom_node) {
        // No valid basins
        return;
    }

    tcx.basin.width = tcx.basin.right_node.point.x - tcx.basin.left_node.point.x;
    tcx.basin.left_highest = tcx.basin.left_node.point.y > tcx.basin.right_node.point.y;

    POLY.fillBasinReq(tcx, tcx.basin.bottom_node);
};

/**
 * Recursive algorithm to fill a Basin with triangles
 *
 * @param tcx
 * @param node - bottom_node
 */
POLY.fillBasinReq = function(tcx, node) {
    // if shallow stop filling
    if (POLY.isShallow(tcx, node)) {
        return;
    }

    POLY.fill(tcx, node);

    var o;
    if (node.prev === tcx.basin.left_node && node.next === tcx.basin.right_node) {
        return;
    } else if (node.prev === tcx.basin.left_node) {
        o = POLY.orient2d(node.point, node.next.point, node.next.next.point);
        if (o === POLY.Orientation.CW) {
            return;
        }
        node = node.next;
    } else if (node.next === tcx.basin.right_node) {
        o = POLY.orient2d(node.point, node.prev.point, node.prev.prev.point);
        if (o === POLY.Orientation.CCW) {
            return;
        }
        node = node.prev;
    } else {
        // Continue with the neighbor node with lowest Y value
        if (node.prev.point.y < node.next.point.y) {
            node = node.prev;
        } else {
            node = node.next;
        }
    }

    POLY.fillBasinReq(tcx, node);
};

POLY.isShallow = function(tcx, node) {
    var height;
    if (tcx.basin.left_highest) {
        height = tcx.basin.left_node.point.y - node.point.y;
    } else {
        height = tcx.basin.right_node.point.y - node.point.y;
    }

    // if shallow stop filling
    if (tcx.basin.width > height) {
        return true;
    }
    return false;
};

POLY.fillEdgeEvent = function(tcx, edge, node) {
    if (tcx.edge_event.right) {
        POLY.fillRightAboveEdgeEvent(tcx, edge, node);
    } else {
        POLY.fillLeftAboveEdgeEvent(tcx, edge, node);
    }
};

POLY.fillRightAboveEdgeEvent = function(tcx, edge, node) {
    while (node.next.point.x < edge.p.x) {
        // Check if next node is below the edge
        if (POLY.orient2d(edge.q, node.next.point, edge.p) === POLY.Orientation.CCW) {
            POLY.fillRightBelowEdgeEvent(tcx, edge, node);
        } else {
            node = node.next;
        }
    }
};

POLY.fillRightBelowEdgeEvent = function(tcx, edge, node) {
    if (node.point.x < edge.p.x) {
        if (POLY.orient2d(node.point, node.next.point, node.next.next.point) === POLY.Orientation.CCW) {
            // Concave
            POLY.fillRightConcaveEdgeEvent(tcx, edge, node);
        } else {
            // Convex
            POLY.fillRightConvexEdgeEvent(tcx, edge, node);
            // Retry this one
            POLY.fillRightBelowEdgeEvent(tcx, edge, node);
        }
    }
};

POLY.fillRightConcaveEdgeEvent = function(tcx, edge, node) {
    POLY.fill(tcx, node.next);
    if (node.next.point !== edge.p) {
        // Next above or below edge?
        if (POLY.orient2d(edge.q, node.next.point, edge.p) === POLY.Orientation.CCW) {
            // Below
            if (POLY.orient2d(node.point, node.next.point, node.next.next.point) === POLY.Orientation.CCW) {
                // Next is concave
                POLY.fillRightConcaveEdgeEvent(tcx, edge, node);
            } else {
                // Next is convex
                /* jshint noempty:false */
            }
        }
    }
};

POLY.fillRightConvexEdgeEvent = function(tcx, edge, node) {
    // Next concave or convex?
    if (POLY.orient2d(node.next.point, node.next.next.point, node.next.next.next.point) === POLY.Orientation.CCW) {
        // Concave
        POLY.fillRightConcaveEdgeEvent(tcx, edge, node.next);
    } else {
        // Convex
        // Next above or below edge?
        if (POLY.orient2d(edge.q, node.next.next.point, edge.p) === POLY.Orientation.CCW) {
            // Below
            POLY.fillRightConvexEdgeEvent(tcx, edge, node.next);
        } else {
            // Above
            /* jshint noempty:false */
        }
    }
};

POLY.fillLeftAboveEdgeEvent = function(tcx, edge, node) {
    while (node.prev.point.x > edge.p.x) {
        // Check if next node is below the edge
        if (POLY.orient2d(edge.q, node.prev.point, edge.p) === POLY.Orientation.CW) {
            POLY.fillLeftBelowEdgeEvent(tcx, edge, node);
        } else {
            node = node.prev;
        }
    }
};

POLY.fillLeftBelowEdgeEvent = function(tcx, edge, node) {
    if (node.point.x > edge.p.x) {
        if (POLY.orient2d(node.point, node.prev.point, node.prev.prev.point) === POLY.Orientation.CW) {
            // Concave
            POLY.fillLeftConcaveEdgeEvent(tcx, edge, node);
        } else {
            // Convex
            POLY.fillLeftConvexEdgeEvent(tcx, edge, node);
            // Retry this one
            POLY.fillLeftBelowEdgeEvent(tcx, edge, node);
        }
    }
};

POLY.fillLeftConvexEdgeEvent = function(tcx, edge, node) {
    // Next concave or convex?
    if (POLY.orient2d(node.prev.point, node.prev.prev.point, node.prev.prev.prev.point) === POLY.Orientation.CW) {
        // Concave
        POLY.fillLeftConcaveEdgeEvent(tcx, edge, node.prev);
    } else {
        // Convex
        // Next above or below edge?
        if (POLY.orient2d(edge.q, node.prev.prev.point, edge.p) === POLY.Orientation.CW) {
            // Below
            POLY.fillLeftConvexEdgeEvent(tcx, edge, node.prev);
        } else {
            // Above
            /* jshint noempty:false */
        }
    }
};

POLY.fillLeftConcaveEdgeEvent = function(tcx, edge, node) {
    POLY.fill(tcx, node.prev);
    if (node.prev.point !== edge.p) {
        // Next above or below edge?
        if (POLY.orient2d(edge.q, node.prev.point, edge.p) === POLY.Orientation.CW) {
            // Below
            if (POLY.orient2d(node.point, node.prev.point, node.prev.prev.point) === POLY.Orientation.CW) {
                // Next is concave
                POLY.fillLeftConcaveEdgeEvent(tcx, edge, node);
            } else {
                // Next is convex
                /* jshint noempty:false */
            }
        }
    }
};

POLY.flipEdgeEvent = function(tcx, ep, eq, t, p) {
    var ot = t.neighborAcross(p);
    if (!ot) {
        // If we want to integrate the fillEdgeEvent do it here
        // With current implementation we should never get here
        POLY.Error('poly2tri [BUG:FIXME] FLIP failed due to missing triangle!');
    }
    var op = ot.oppositePoint(t, p);

    // Additional check from Java version (see issue #88)
    if (t.getConstrainedEdgeAcross(p)) {
        var index = t.index(p);
        POLY.PointError("poly2tri Intersecting Constraints", [p, op, t.getPoint((index + 1) % 3), t.getPoint((index + 2) % 3)]);
    }

    if (POLY.inScanArea(p, t.pointCCW(p), t.pointCW(p), op)) {
        // Lets rotate shared edge one vertex CW
        POLY.rotateTrianglePair(t, p, ot, op);
        tcx.mapTriangleToNodes(t);
        tcx.mapTriangleToNodes(ot);

        // XXX: in the original C++ code for the next 2 lines, we are
        // comparing point values (and not pointers). In this JavaScript
        // code, we are comparing point references (pointers). This works
        // because we can't have 2 different points with the same values.
        // But to be really equivalent, we should use "Point.equals" here.
        if (p === eq && op === ep) {
            if (eq === tcx.edge_event.constrained_edge.q && ep === tcx.edge_event.constrained_edge.p) {
                t.markConstrainedEdgeByPoints(ep, eq);
                ot.markConstrainedEdgeByPoints(ep, eq);
                POLY.legalize(tcx, t);
                POLY.legalize(tcx, ot);
            } else {
                // XXX: I think one of the triangles should be legalized here?
                /* jshint noempty:false */
            }
        } else {
            var o = POLY.orient2d(eq, op, ep);
            t = POLY.nextFlipTriangle(tcx, o, t, ot, p, op);
            POLY.flipEdgeEvent(tcx, ep, eq, t, p);
        }
    } else {
        var newP = POLY.nextFlipPoint(ep, eq, ot, op);
        POLY.flipScanEdgeEvent(tcx, ep, eq, t, ot, newP);
        POLY.edgeEventByPoints(tcx, ep, eq, t, p);
    }
};

POLY.nextFlipTriangle = function(tcx, o, t, ot, p, op) {
    var edge_index;
    if (o === POLY.Orientation.CCW) {
        // ot is not crossing edge after flip
        edge_index = ot.edgeIndex(p, op);
        ot.delaunay_edge[edge_index] = true;
        POLY.legalize(tcx, ot);
        ot.clearDelunayEdges();
        return t;
    }

    // t is not crossing edge after flip
    edge_index = t.edgeIndex(p, op);

    t.delaunay_edge[edge_index] = true;
    POLY.legalize(tcx, t);
    t.clearDelunayEdges();
    return ot;
};

POLY.nextFlipPoint = function(ep, eq, ot, op) {
    var o2d = POLY.orient2d(eq, op, ep);
    if (o2d === POLY.Orientation.CW) {
        // Right
        return ot.pointCCW(op);
    } else if (o2d === POLY.Orientation.CCW) {
        // Left
        return ot.pointCW(op);
    } else {
        POLY.PointError("poly2tri [Unsupported] nextFlipPoint: opposing point on constrained edge!", [eq, op, ep]);
    }
};

POLY.flipScanEdgeEvent = function(tcx, ep, eq, flip_triangle, t, p) {
    var ot = t.neighborAcross(p);
    if (!ot) {
        // If we want to integrate the fillEdgeEvent do it here
        // With current implementation we should never get here
        POLY.Error('poly2tri [BUG:FIXME] FLIP failed due to missing triangle');
    }
    var op = ot.oppositePoint(t, p);

    if (POLY.inScanArea(eq, flip_triangle.pointCCW(eq), flip_triangle.pointCW(eq), op)) {
        // flip with new edge op.eq
        POLY.flipEdgeEvent(tcx, eq, op, ot, op);
        // TODO: Actually I just figured out that it should be possible to
        //       improve this by getting the next ot and op before the the above
        //       flip and continue the flipScanEdgeEvent here
        // set new ot and op here and loop back to inScanArea test
        // also need to set a new flip_triangle first
        // Turns out at first glance that this is somewhat complicated
        // so it will have to wait.
    } else {
        var newP = POLY.nextFlipPoint(ep, eq, ot, op);
        POLY.flipScanEdgeEvent(tcx, ep, eq, flip_triangle, ot, newP);
    }
};


// ----------------------------------------------------POLYContext (public API)
/**
 * Constructor for the triangulation context.
 * It accepts a simple polyline, which defines the constrained edges.
 * Possible options are:
 *    cloneArrays:  if true, do a shallow copy of the Array parameters 
 *                  (contour, holes). Points inside arrays are never copied.
 *                  Default is false : keep a reference to the array arguments,
 *                  who will be modified in place.
 * @param {Array} contour  array of "Point like" objects with {x,y} (duck typing)
 * @param {Object} options  constructor options
 */
POLY.Context = function(contour, options) {
    options = options || {};
    this.triangles_ = [];
    this.map_ = [];
    this.points_ = (options.cloneArrays ? contour.slice(0) : contour);
    this.edge_list = [];

    // Bounding box of all points. Computed at the start of the triangulation, 
    // it is stored in case it is needed by the caller.
    this.pmin_ = this.pmax_ = null;

    // Advancing front
    this.front_ = null; // AdvancingFront
    // head point used with advancing front
    this.head_ = null; // Point
    // tail point used with advancing front
    this.tail_ = null; // Point

    this.af_head_ = null; // Node
    this.af_middle_ = null; // Node
    this.af_tail_ = null; // Node

    this.basin = new POLY.Basin();
    this.edge_event = new POLY.EdgeEvent();

    this.initEdges(this.points_);
};
POLY.Context.prototype= {
    constructor: POLY.Context,

    /**
     * Add a hole to the constraints
     * @param {Array} polyline  array of "Point like" objects with {x,y} (duck typing)
     */
    addHole : function(polyline) {
        this.initEdges(polyline);
        var i, len = polyline.length;
        for (i = 0; i < len; i++) {
            this.points_.push(polyline[i]);
        }
        return this; // for chaining
    },
    addHoles : function(holes) {
        var i, len = holes.length;
        for (i = 0; i < len; i++) {
            this.initEdges(holes[i]);
        }
        this.points_ = this.points_.concat.apply(this.points_, holes);
        return this; // for chaining
    },

    /**
     * Add a Steiner point to the constraints
     * @param {Point} point     any "Point like" object with {x,y} (duck typing)
     */
    addPoint : function(point) {
        this.points_.push(point);
        return this; // for chaining
    },


    /**
     * Add several Steiner points to the constraints
     * @param {array<Point>} points     array of "Point like" object with {x,y} 
     */
    // Method added in the JavaScript version (was not present in the c++ version)
    addPoints : function(points) {
        this.points_ = this.points_.concat(points);
        return this; // for chaining
    },


    /**
     * Triangulate the polygon with holes and Steiner points.
     */
    // Shortcut method for POLY.triangulate(POLYContext).
    // Method added in the JavaScript version (was not present in the c++ version)
    triangulate : function() {
        POLY.triangulate(this);
        return this; // for chaining
    },


    /**
     * Get the bounding box of the provided constraints (contour, holes and 
     * Steinter points). Warning : these values are not available if the triangulation 
     * has not been done yet.
     * @returns {Object} object with 'min' and 'max' Point
     */
    // Method added in the JavaScript version (was not present in the c++ version)
    getBoundingBox : function() {
        return {min: this.pmin_, max: this.pmax_};
    },

    /**
     * Get result of triangulation
     * @returns {array<Triangle>}   array of triangles
     */
    getTriangles : function() {
        return this.triangles_;
    },

    // ---------------------------------------------------POLYContext (private API)

    front : function() {
        return this.front_;
    },
    pointCount : function() {
        return this.points_.length;
    },
    head : function() {
        return this.head_;
    },
    setHead : function(p1) {
        this.head_ = p1;
    },
    tail : function() {
        return this.tail_;
    },
    setTail : function(p1) {
        this.tail_ = p1;
    },
    getMap : function() {
        return this.map_;
    },

    initTriangulation : function() {
        var xmax = this.points_[0].x;
        var xmin = this.points_[0].x;
        var ymax = this.points_[0].y;
        var ymin = this.points_[0].y;

        // Calculate bounds
        var i, len = this.points_.length;
        for (i = 1; i < len; i++) {
            var p = this.points_[i];
            /* jshint expr:true */
            (p.x > xmax) && (xmax = p.x);
            (p.x < xmin) && (xmin = p.x);
            (p.y > ymax) && (ymax = p.y);
            (p.y < ymin) && (ymin = p.y);
        }
        this.pmin_ = new POLY.Point(xmin, ymin);
        this.pmax_ = new POLY.Point(xmax, ymax);

        var dx = POLY.kAlpha * (xmax - xmin);
        var dy = POLY.kAlpha * (ymax - ymin);
        this.head_ = new POLY.Point(xmax + dx, ymin - dy);
        this.tail_ = new POLY.Point(xmin - dx, ymin - dy);

        // Sort points along y-axis
        this.points_.sort(POLY.compare);
    },

    initEdges : function(polyline) {
        var i, len = polyline.length;
        for (i = 0; i < len; ++i) {
            this.edge_list.push(new POLY.Edge(polyline[i], polyline[(i + 1) % len]));
        }
    },

    getPoint : function(index) {
        return this.points_[index];
    },

    addToMap : function(triangle) {
        this.map_.push(triangle);
    },

    locateNode : function(point) {
        return this.front_.locateNode(point.x);
    },

    createAdvancingFront : function() {
        var head;
        var middle;
        var tail;
        // Initial triangle
        var triangle = new POLY.Triangle(this.points_[0], this.tail_, this.head_);

        this.map_.push(triangle);

        head = new POLY.Node(triangle.getPoint(1), triangle);
        middle = new POLY.Node(triangle.getPoint(0), triangle);
        tail = new POLY.Node(triangle.getPoint(2));

        this.front_ = new POLY.AdvancingFront(head, tail);

        head.next = middle;
        middle.next = tail;
        middle.prev = head;
        tail.prev = middle;
    },

    removeNode : function(node) {
        // do nothing
        /* jshint unused:false */
    },

    mapTriangleToNodes : function(t) {
        for (var i = 0; i < 3; ++i) {
            if (!t.getNeighbor(i)) {
                var n = this.front_.locatePoint(t.pointCW(t.getPoint(i)));
                if (n) {
                    n.triangle = t;
                }
            }
        }
    },

    removeFromMap : function(triangle) {
        var i, map = this.map_, len = map.length;
        for (i = 0; i < len; i++) {
            if (map[i] === triangle) {
                map.splice(i, 1);
                break;
            }
        }
    },

    /**
     * Do a depth first traversal to collect triangles
     * @param {Triangle} triangle start
     */
    meshClean : function(triangle) {
        // New implementation avoids recursive calls and use a loop instead.
        // Cf. issues # 57, 65 and 69.
        var triangles = [triangle], t, i;
        /* jshint boss:true */
        while (t = triangles.pop()) {
            if (!t.isInterior()) {
                t.setInterior(true);
                this.triangles_.push(t);
                for (i = 0; i < 3; i++) {
                    if (!t.constrained_edge[i]) {
                        triangles.push(t.getNeighbor(i));
                    }
                }
            }
        }
    }
}



// ---------------------------------------------------------------------Triangle
/**
 * Triangle class.<br>
 * Triangle-based data structures are known to have better performance than
 * quad-edge structures.
 * See: J. Shewchuk, "Triangle: Engineering a 2D Quality Mesh Generator and
 * Delaunay Triangulator", "Triangulations in CGAL"
 * 
 * @param   a,b,c   any "Point like" objects with {x,y} (duck typing)
 */
POLY.Triangle = function(a, b, c) {
    // Triangle points
    this.points_ = [a, b, c];
    // Neighbor list
    this.neighbors_ = [null, null, null];
    // Has this triangle been marked as an interior triangle?
    this.interior_ = false;
    // Flags to determine if an edge is a Constrained edge
    this.constrained_edge = [false, false, false];
    // Flags to determine if an edge is a Delauney edge
    this.delaunay_edge = [false, false, false];
};

POLY.Triangle.prototype= {
    constructor: POLY.Triangle,
    toString : function() {
        var p2s = POLY.Point.toString;
        return ("[" + p2s(this.points_[0]) + p2s(this.points_[1]) + p2s(this.points_[2]) + "]");
    },
    getPoint : function(index) {
        return this.points_[index];
    },
    getPoints: function() {
        return this.points_;
    },
    getNeighbor : function(index) {
        return this.neighbors_[index];
    },

    /**
     * Test if this Triangle contains the Point object given as parameters as its
     * vertices. Only point references are compared, not values.
     * @return <code>True</code> if the Point object is of the Triangle's vertices,
     *         <code>false</code> otherwise.
     */
    containsPoint : function(point) {
        var points = this.points_;
        // Here we are comparing point references, not values
        return (point === points[0] || point === points[1] || point === points[2]);
    },

    /**
     * Test if this Triangle contains the Edge object given as parameter as its
     * bounding edges. Only point references are compared, not values.
     * @return <code>True</code> if the Edge object is of the Triangle's bounding
     *         edges, <code>false</code> otherwise.
     */
    containsEdge : function(edge) {
        return this.containsPoint(edge.p) && this.containsPoint(edge.q);
    },
    containsPoints : function(p1, p2) {
        return this.containsPoint(p1) && this.containsPoint(p2);
    },


    isInterior : function() {
        return this.interior_;
    },
    setInterior : function(interior) {
        this.interior_ = interior;
        return this;
    },

    /**
     * Update neighbor pointers.
     * @param {Point} p1 Point object.
     * @param {Point} p2 Point object.
     * @param {Triangle} t Triangle object.
     */
    markNeighborPointers : function(p1, p2, t) {
        var points = this.points_;
        // Here we are comparing point references, not values
        if ((p1 === points[2] && p2 === points[1]) || (p1 === points[1] && p2 === points[2])) {
            this.neighbors_[0] = t;
        } else if ((p1 === points[0] && p2 === points[2]) || (p1 === points[2] && p2 === points[0])) {
            this.neighbors_[1] = t;
        } else if ((p1 === points[0] && p2 === points[1]) || (p1 === points[1] && p2 === points[0])) {
            this.neighbors_[2] = t;
        } else {
            POLY.Error('poly2tri Invalid Triangle.markNeighborPointers() call');
        }
    },

    /**
     * Exhaustive search to update neighbor pointers
     * @param {Triangle} t
     */
    markNeighbor : function(t) {
        var points = this.points_;
        if (t.containsPoints(points[1], points[2])) {
            this.neighbors_[0] = t;
            t.markNeighborPointers(points[1], points[2], this);
        } else if (t.containsPoints(points[0], points[2])) {
            this.neighbors_[1] = t;
            t.markNeighborPointers(points[0], points[2], this);
        } else if (t.containsPoints(points[0], points[1])) {
            this.neighbors_[2] = t;
            t.markNeighborPointers(points[0], points[1], this);
        }
    },


    clearNeigbors : function() {
        this.neighbors_[0] = null;
        this.neighbors_[1] = null;
        this.neighbors_[2] = null;
    },

    clearDelunayEdges : function() {
        this.delaunay_edge[0] = false;
        this.delaunay_edge[1] = false;
        this.delaunay_edge[2] = false;
    },

    /**
     * Returns the point clockwise to the given point.
     */
    pointCW : function(p) {
        var points = this.points_;
        // Here we are comparing point references, not values
        if (p === points[0]) {
            return points[2];
        } else if (p === points[1]) {
            return points[0];
        } else if (p === points[2]) {
            return points[1];
        } else {
            return null;
        }
    },

    /**
     * Returns the point counter-clockwise to the given point.
     */
    pointCCW : function(p) {
        var points = this.points_;
        // Here we are comparing point references, not values
        if (p === points[0]) {
            return points[1];
        } else if (p === points[1]) {
            return points[2];
        } else if (p === points[2]) {
            return points[0];
        } else {
            return null;
        }
    },

    /**
     * Returns the neighbor clockwise to given point.
     */
    neighborCW : function(p) {
        // Here we are comparing point references, not values
        if (p === this.points_[0]) {
            return this.neighbors_[1];
        } else if (p === this.points_[1]) {
            return this.neighbors_[2];
        } else {
            return this.neighbors_[0];
        }
    },

    /**
     * Returns the neighbor counter-clockwise to given point.
     */
    neighborCCW : function(p) {
        // Here we are comparing point references, not values
        if (p === this.points_[0]) {
            return this.neighbors_[2];
        } else if (p === this.points_[1]) {
            return this.neighbors_[0];
        } else {
            return this.neighbors_[1];
        }
    },

    getConstrainedEdgeCW : function(p) {
        // Here we are comparing point references, not values
        if (p === this.points_[0]) {
            return this.constrained_edge[1];
        } else if (p === this.points_[1]) {
            return this.constrained_edge[2];
        } else {
            return this.constrained_edge[0];
        }
    },
    getConstrainedEdgeCCW : function(p) {
        // Here we are comparing point references, not values
        if (p === this.points_[0]) {
            return this.constrained_edge[2];
        } else if (p === this.points_[1]) {
            return this.constrained_edge[0];
        } else {
            return this.constrained_edge[1];
        }
    },

    // Additional check from Java version (see issue #88)
    getConstrainedEdgeAcross : function(p) {
        // Here we are comparing point references, not values
        if (p === this.points_[0]) {
            return this.constrained_edge[0];
        } else if (p === this.points_[1]) {
            return this.constrained_edge[1];
        } else {
            return this.constrained_edge[2];
        }
    },
    setConstrainedEdgeCW : function(p, ce) {
        // Here we are comparing point references, not values
        if (p === this.points_[0]) {
            this.constrained_edge[1] = ce;
        } else if (p === this.points_[1]) {
            this.constrained_edge[2] = ce;
        } else {
            this.constrained_edge[0] = ce;
        }
    },
    setConstrainedEdgeCCW : function(p, ce) {
        // Here we are comparing point references, not values
        if (p === this.points_[0]) {
            this.constrained_edge[2] = ce;
        } else if (p === this.points_[1]) {
            this.constrained_edge[0] = ce;
        } else {
            this.constrained_edge[1] = ce;
        }
    },
    getDelaunayEdgeCW : function(p) {
        // Here we are comparing point references, not values
        if (p === this.points_[0]) {
            return this.delaunay_edge[1];
        } else if (p === this.points_[1]) {
            return this.delaunay_edge[2];
        } else {
            return this.delaunay_edge[0];
        }
    },
    getDelaunayEdgeCCW : function(p) {
        // Here we are comparing point references, not values
        if (p === this.points_[0]) {
            return this.delaunay_edge[2];
        } else if (p === this.points_[1]) {
            return this.delaunay_edge[0];
        } else {
            return this.delaunay_edge[1];
        }
    },
    setDelaunayEdgeCW : function(p, e) {
        // Here we are comparing point references, not values
        if (p === this.points_[0]) {
            this.delaunay_edge[1] = e;
        } else if (p === this.points_[1]) {
            this.delaunay_edge[2] = e;
        } else {
            this.delaunay_edge[0] = e;
        }
    },

    setDelaunayEdgeCCW : function(p, e) {
        // Here we are comparing point references, not values
        if (p === this.points_[0]) {
            this.delaunay_edge[2] = e;
        } else if (p === this.points_[1]) {
            this.delaunay_edge[0] = e;
        } else {
            this.delaunay_edge[1] = e;
        }
    },

    /**
     * The neighbor across to given point.
     */
    
    neighborAcross : function(p) {
        // Here we are comparing point references, not values
        if (p === this.points_[0]) {
            return this.neighbors_[0];
        } else if (p === this.points_[1]) {
            return this.neighbors_[1];
        } else {
            return this.neighbors_[2];
        }
    },

    oppositePoint : function(t, p) {
        var cw = t.pointCW(p);
        return this.pointCW(cw);
    },

    /**
     * Legalize triangle by rotating clockwise around oPoint
     * @param {Point} opoint
     * @param {Point} npoint
     */
    legalize : function(opoint, npoint) {
        var points = this.points_;
        // Here we are comparing point references, not values
        if (opoint === points[0]) {
            points[1] = points[0];
            points[0] = points[2];
            points[2] = npoint;
        } else if (opoint === points[1]) {
            points[2] = points[1];
            points[1] = points[0];
            points[0] = npoint;
        } else if (opoint === points[2]) {
            points[0] = points[2];
            points[2] = points[1];
            points[1] = npoint;
        } else {
            POLY.Error('poly2tri Invalid Triangle.legalize() call');
        }
    },

    /**
     * Returns the index of a point in the triangle. 
     * The point *must* be a reference to one of the triangle's vertices.
     * @param {Point} p Point object
     * @returns {Number} index 0, 1 or 2
     */
    index : function(p) {
        var points = this.points_;
        // Here we are comparing point references, not values
        if (p === points[0]) {
            return 0;
        } else if (p === points[1]) {
            return 1;
        } else if (p === points[2]) {
            return 2;
        } else {
            POLY.Error('poly2tri Invalid Triangle.index() call');
        }
    },
    edgeIndex : function(p1, p2) {
        var points = this.points_;
        // Here we are comparing point references, not values
        if (p1 === points[0]) {
            if (p2 === points[1]) {
                return 2;
            } else if (p2 === points[2]) {
                return 1;
            }
        } else if (p1 === points[1]) {
            if (p2 === points[2]) {
                return 0;
            } else if (p2 === points[0]) {
                return 2;
            }
        } else if (p1 === points[2]) {
            if (p2 === points[0]) {
                return 1;
            } else if (p2 === points[1]) {
                return 0;
            }
        }
        return -1;
    },

    /**
     * Mark an edge of this triangle as constrained.<br>
     * This method takes either 1 parameter (an edge index or an Edge instance) or
     * 2 parameters (two Point instances defining the edge of the triangle).
     */
    markConstrainedEdgeByIndex : function(index) {
        this.constrained_edge[index] = true;
    },
    markConstrainedEdgeByEdge : function(edge) {
        this.markConstrainedEdgeByPoints(edge.p, edge.q);
    },
    markConstrainedEdgeByPoints : function(p, q) {
        var points = this.points_;
        // Here we are comparing point references, not values        
        if ((q === points[0] && p === points[1]) || (q === points[1] && p === points[0])) {
            this.constrained_edge[2] = true;
        } else if ((q === points[0] && p === points[2]) || (q === points[2] && p === points[0])) {
            this.constrained_edge[1] = true;
        } else if ((q === points[1] && p === points[2]) || (q === points[2] && p === points[1])) {
            this.constrained_edge[0] = true;
        }
    }
}
