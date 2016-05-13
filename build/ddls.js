
var DDLS = DDLS || {};

// UNIQUE ID
DDLS.SegmentID = 0;
DDLS.ShapeID = 0;
DDLS.EdgeID = 0;
DDLS.FaceID = 0;
DDLS.MeshID = 0;
DDLS.ObjectID = 0;
DDLS.VertexID = 0;
DDLS.GraphID = 0;
DDLS.GraphEdgeID = 0;
DDLS.GraphNodeID = 0;

// INTERSECTION
DDLS.VERTEX = 0;
DDLS.EDGE = 1;
DDLS.FACE = 2;
DDLS.NULL = 3;

// MATH
DDLS.sqrt = Math.sqrt;
DDLS.cos = Math.cos;
DDLS.sin = Math.sin;
DDLS.atan2 = Math.atan2;
DDLS.round = Math.round;
DDLS.floor = Math.floor;
DDLS.pow = Math.pow;
DDLS.max = Math.max;
DDLS.min = Math.min;
DDLS.random = Math.random;

DDLS.lerp = function (a, b, percent) { return a + (b - a) * percent; };
DDLS.rand = function (a, b) { return DDLS.lerp(a, b, DDLS.random()); };
DDLS.randInt = function (a, b, n) { return DDLS.lerp(a, b, DDLS.random()).toFixed(n || 0)*1;};

DDLS.EPSILON = 0.01;
DDLS.EPSILON_SQUARED = 0.0001;//1e-12;//;
DDLS.PI     = 3.141592653589793;
DDLS.TwoPI  = 6.283185307179586;
DDLS.PI90   = 1.570796326794896;
DDLS.PI270  = 4.712388980384689;

DDLS.NaN = Number.NaN;
DDLS.NEGATIVE_INFINITY = -Infinity;
DDLS.POSITIVE_INFINITY = Infinity;
DDLS.isFinite = function(x) { return isFinite(x); };
DDLS.isNaN = function(x) { return isNaN(x); };
//DDLS.int = function(x) { return x | 0; };
//DDLS.int = function(x) { return parseInt(x, 10); };
DDLS.int = function(x) { return DDLS.floor(x); };
DDLS.fix = function(x, n) { n = n || 3; return x.toFixed(n)*1; };

var DDLS_ARRAY_TYPE
if(!DDLS_ARRAY_TYPE) DDLS_ARRAY_TYPE = (typeof Float32Array !== 'undefined') ? Float32Array : Array;
//ex: v=new DDLS_ARRAY_TYPE(18);

// LOG
DDLS.Log = function(str){
    console.log(str)
};

// BIND
/*DDLS.Fid = 0;
DDLS.Bind = function (o,m) { 
    if( m == null ) return null; 
    if( m.__id__ == null ) m.__id__ = DDLS.Fid++; 
    var f; 
    if( o.hx__closures__ == null ) o.hx__closures__ = {}; 
    else f = o.hx__closures__[m.__id__]; 
    if( f == null ) { 
        f = function(){ return f.method.apply(f.scope, arguments); }; 
        f.scope = o; 
        f.method = m; 
        o.hx__closures__[m.__id__] = f; 
    } return f; 
}



// TIMER
DDLS.Timer = function(){};
DDLS.Timer.stamp = function() {
    return self.performance !== undefined && self.performance.now !== undefined ? self.performance.now() * 0.001 : Date.now() * 0.001;
};
*/

// DICTIONARY
DDLS.Dictionary = function (type, overwrite){
    this.type = type || 0;

    if(this.type==0){
        //this.overwrite = overwrite == true;
        this.k = [];
        this.v = [];
    }else{
        this.h = {};
    }
}
DDLS.Dictionary.prototype = {
    set:function(key, value){
        if(this.type==2){
            this.h[key] = value;
        }else if(this.type==1){
            this.h[key.id] = value;
        }else{
            //if(!this.overwrite || this.k.indexOf(key) == -1){
                this.k.push(key);
                this.v.push(value);
            //}
        }
    },
    get:function(key){
        if(this.type==2){
            return this.h[key];
        }else if(this.type==1){
            return this.h[key.id];
        }else{
            var i = this.k.indexOf(key);
            if(i != -1) return this.v[i];
        }
    },
    dispose:function(){
        if(this.type==0){
            while(this.k.length > 0) this.k.pop();
            while(this.v.length > 0) this.v.pop();
            this.k = null;
            this.v = null;
        }else{
            this.h = null;
        }
    }
}
DDLS.Point = function(x,y) {
    this.x = x || 0;
    this.y = y || 0;
    return this;
};
DDLS.Point.prototype = {
    constructor: DDLS.Point,
    transform: function(matrix) {
        matrix.tranform(this);
        return this;
    },
    set: function(x,y) {
        this.x = x;
        this.y = y;
        return this;
    },
    copy: function(p) {
        this.x = p.x;
        this.y = p.y;
        return this;
    },
    clone: function() {
        return new DDLS.Point(this.x,this.y);
    },
    sub: function(p) {
        this.x -= p.x;
        this.y -= p.y;
        return this;
    },
    mul : function(s) {
        this.x *= s;
        this.y *= s;
        return this;
    },
    add : function(n) {
        this.x += n.x;
        this.y += n.y;
        return this;
    },
    div : function(s) {
        var v = 1/s;
        this.x *= v;
        this.y *= v;
        return this;
    },
    negate:function(){
        return new DDLS.Point(-this.x,-this.y);
    },
    transformMat2D:function(matrix){
        var x = this.x, y = this.y, n = matrix.n;
        this.x = n[0] * x + n[2] * y + n[4];
        this.y = n[1] * x + n[3] * y + n[5];
        return this;
    },
    get_length: function() {
        return DDLS.sqrt(this.x * this.x + this.y * this.y);
    },
    normalize: function() {
        var norm = this.get_length();
        this.x /= norm;
        this.y /= norm;
        return norm;
    },
    distanceTo: function(p) {
        var diffX = this.x - p.x;
        var diffY = this.y - p.y;
        return DDLS.sqrt(diffX * diffX + diffY * diffY);
    },
    distanceSquaredTo: function(p) {
        var diffX = this.x - p.x;
        var diffY = this.y - p.y;
        return diffX*diffX + diffY*diffY;
    },
    equals : function(p) {
        return this.x === p.x && this.y === p.y;
    }
};
DDLS.Matrix2D = function(a,b,c,d,e,f) {
    this.n = new DDLS_ARRAY_TYPE(6);
    this.n[0] = a || 1;
    this.n[1] = b || 0;
    this.n[2] = c || 0;
    this.n[3] = d || 1;
    this.n[4] = e || 0;
    this.n[5] = f || 0;
};
DDLS.Matrix2D.prototype = {
    constructor: DDLS.Matrix2D,
    identity: function() {
        this.n[0] = 1;
        this.n[1] = 0;
        this.n[2] = 0;
        this.n[3] = 1;
        this.n[4] = 0;
        this.n[5] = 0;
        return this;
    },
    translate: function(p) {
        this.n[4] = this.n[4] + p.x;
        this.n[5] = this.n[5] + p.y;
        return this;
    },
    scale: function(p) {
        this.n[0] *= p.x;
        this.n[1] *= p.y;
        this.n[2] *= p.x;
        this.n[3] *= p.y;
        this.n[4] *= p.x;
        this.n[5] *= p.y;
        return this;
    },
    rotate: function(rad) {
        var aa = this.n[0], ab = this.n[1],
        ac = this.n[2], ad = this.n[3],
        atx = this.n[4], aty = this.n[5],
        st = Math.sin(rad), ct = Math.cos(rad);
        this.n[0] = aa*ct + ab*st;
        this.n[1] = -aa*st + ab*ct;
        this.n[2] = ac*ct + ad*st;
        this.n[3] = -ac*st + ct*ad;
        this.n[4] = ct*atx + st*aty;
        this.n[5] = ct*aty - st*atx;
        return this;
    },
    clone: function() {
        return new DDLS.Matrix2D(this.n[0],this.n[1],this.n[2],this.n[3],this.n[4],this.n[5]);
    },
    tranform: function(point) {
        var x = this.n[0] * point.x + this.n[2] * point.y + this.n[4];
        var y = this.n[1] * point.x + this.n[3] * point.y + this.n[5];
        point.x = x;
        point.y = y;
    },
    transformX: function(x,y) {
        return this.n[0] * x + this.n[2] * y + this.n[4];
    },
    transformY: function(x,y) {
        return this.n[1] * x + this.n[3] * y + this.n[5];
    },
    concat: function(matrix) {// multiply
        var a = this.n[0] * matrix.n[0] + this.n[1] * matrix.n[2];
        var b = this.n[0] * matrix.n[1] + this.n[1] * matrix.n[3];
        var c = this.n[2] * matrix.n[0] + this.n[3] * matrix.n[2];
        var d = this.n[2] * matrix.n[1] + this.n[3] * matrix.n[3];
        var e = this.n[4] * matrix.n[0] + this.n[5] * matrix.n[2] + matrix.n[4];
        var f = this.n[4] * matrix.n[1] + this.n[5] * matrix.n[3] + matrix.n[5];
        this.n[0] = a;
        this.n[1] = b;
        this.n[2] = c;
        this.n[3] = d;
        this.n[4] = e;
        this.n[5] = f;
        return this;
    }
};
DDLS.RandGenerator = function(seed,rangeMin,rangeMax) {
    this.rangeMin = rangeMin || 0;
    this.rangeMax = rangeMax || 1;
    this._originalSeed = this._currSeed = seed || 1234;
    this._numIter = 0;

    Object.defineProperty(this, 'seed', {
        get: function() { return this._originalSeed; },
        set: function(value) { this._originalSeed = this._currSeed = value; }
    });
};
DDLS.RandGenerator.prototype = {
    constructor: DDLS.RandGenerator,
    reset: function() {
        this._currSeed = this._originalSeed;
        this._numIter = 0;
    },
    next: function() {
        var tmp = this._currSeed * 1;
        this._tempString = (tmp*tmp).toString();//Std.string(_floatSeed * _floatSeed);
        while(this._tempString.length < 8) this._tempString = "0" + this._tempString;
        this._currSeed = parseInt(this._tempString.substr( 1 , 5 ));//Std.parseInt(HxOverrides.substr(this._tempString,1,5));
        var res = DDLS.round(this.rangeMin + (this._currSeed / 99999) * (this.rangeMax - this.rangeMin));
        if(this._currSeed == 0) this._currSeed = this._originalSeed + this._numIter;
        this._numIter++;
        if(this._numIter == 200) this.reset();
        return res;
    },
    nextInRange: function(rangeMin,rangeMax) {
        this.rangeMin = rangeMin;
        this.rangeMax = rangeMax;
        return this.next();
    },
    shuffle: function(array) {
        var currIdx = array.length;
        while(currIdx > 0) {
            var rndIdx = this.nextInRange(0,currIdx - 1);
            currIdx--;
            var tmp = array[currIdx];
            array[currIdx] = array[rndIdx];
            array[rndIdx] = tmp;
        }
    }
};
DDLS.Edge = function() {
    this.type = DDLS.EDGE;
    this.id = DDLS.EdgeID;
    DDLS.EdgeID ++;
    this.fromConstraintSegments = [];
    this.isConstrained = false;
    this.isReal = false;
    this.originVertex = null;
    this.oppositeEdge = null;
    this.nextLeftEdge = null;
    this.leftFace = null;

    Object.defineProperty(this, 'destinationVertex', {
        get: function() { return this.oppositeEdge.originVertex; }
    });

    Object.defineProperty(this, 'nextRightEdge', {
        get: function() { return this.oppositeEdge.nextLeftEdge.nextLeftEdge.oppositeEdge; }
    });

    Object.defineProperty(this, 'prevRightEdge', {
        get: function() { return this.oppositeEdge.nextLeftEdge.oppositeEdge; }
    });

    Object.defineProperty(this, 'prevLeftEdge', {
        get: function() { return this.nextLeftEdge.nextLeftEdge; }
    });

    Object.defineProperty(this, 'rotLeftEdge', {
        get: function() { return this.nextLeftEdge.nextLeftEdge.oppositeEdge; }
    });

    Object.defineProperty(this, 'rotRightEdge', {
        get: function() { return this.oppositeEdge.nextLeftEdge; }
    });

    Object.defineProperty(this, 'rightFace', {
        get: function() { return this.oppositeEdge.leftFace; }
    });


};
DDLS.Edge.prototype = {
    constructor: DDLS.Edge,
    setDatas: function(originVertex, oppositeEdge, nextLeftEdge, leftFace, isReal, isConstrained) {
        this.isConstrained = isReal !== undefined ? isConstrained : false;
        this.isReal = isReal !== undefined ? isReal : true;
        this.originVertex = originVertex;
        this.oppositeEdge = oppositeEdge;
        this.nextLeftEdge = nextLeftEdge;
        this.leftFace = leftFace;
    },
    getDatas:function(){
        return [this.originVertex.pos.x, this.originVertex.pos.y, this.destinationVertex.pos.x, this.destinationVertex.pos.y, this.isConstrained ? 1:0 ];
    },
    addFromConstraintSegment: function(segment) {
        if ( this.fromConstraintSegments.indexOf(segment) == -1 ) this.fromConstraintSegments.push(segment);
    },
    removeFromConstraintSegment: function(segment) {
        //if(this.fromConstraintSegments == null) return;
        var index = this.fromConstraintSegments.indexOf(segment);
        if ( index != -1 ) this.fromConstraintSegments.splice(index, 1);
    },
    dispose: function() {
        this.originVertex = null;
        this.oppositeEdge = null;
        this.nextLeftEdge = null;
        this.leftFace = null;
        this.fromConstraintSegments = null;
    },
    toString: function() {
        return "edge " + this.originVertex.id + " - " + this.destinationVertex.id;
    }
};
DDLS.Face = function() {
    this.type = DDLS.FACE;
    this.id = DDLS.FaceID;
    DDLS.FaceID ++;
    this.isReal = false;
    this.edge = null;
};
DDLS.Face.prototype = {
    constructor: DDLS.Face,
    setDatas: function(edge, isReal) {
        this.isReal = isReal !== undefined ? isReal : true;
        this.edge = edge;
    },
    dispose: function() {
        this.edge = null;
    }
};
DDLS.Vertex = function() {
    this.type = DDLS.VERTEX;
    //this.colorDebug = -1;
    this.id = DDLS.VertexID;
    DDLS.VertexID ++;
    this.pos = new DDLS.Point();
    this.fromConstraintSegments = [];
    this.edge = null;
    this.isReal = false;
};
DDLS.Vertex.prototype = {
    constructor: DDLS.Vertex,
    setDatas: function(edge,isReal) {
        this.isReal = isReal !== undefined ? isReal : true;
        this.edge = edge;
    },
    addFromConstraintSegment: function(segment) {
        if ( this.fromConstraintSegments.indexOf(segment) == -1 ) this.fromConstraintSegments.push(segment);
    },
    removeFromConstraintSegment: function(segment) {
        //if(this.fromConstraintSegments == null) return;
        var index = this.fromConstraintSegments.indexOf(segment);
        if ( index != -1 ) this.fromConstraintSegments.splice(index, 1);
    },
    dispose: function() {
        this.pos = null;
        this.edge = null;
        this.fromConstraintSegments = null;
    },
    toString: function() {
        return "ver_id " + this.id;
    }
};
DDLS.Object = function() {
    this.id = DDLS.ObjectID;
    DDLS.ObjectID++;
    this._pivot = new DDLS.Point();
    this._position = new DDLS.Point();
    this._scale = new DDLS.Point(1,1);
    this._matrix = new DDLS.Matrix2D();
    this._rotation = 0;
    this._constraintShape = null;
    this._coordinates = [];
    this.hasChanged = false;

    Object.defineProperty(this, 'rotation', {
        get: function() { return this._rotation; },
        set: function(value) { if(this._rotation != value) { this._rotation = value; this.hasChanged = true; } }
    });

    Object.defineProperty(this, 'matrix', {
        get: function() { return this._matrix; },
        set: function(value) { this._matrix = value; this.hasChanged = true; }
    });

    Object.defineProperty(this, 'coordinates', {
        get: function() { return this._coordinates; },
        set: function(value) { this._coordinates = value; this.hasChanged = true; }
    });

    Object.defineProperty(this, 'constraintShape', {
        get: function() { return this._constraintShape; },
        set: function(value) { this._constraintShape = value; this.hasChanged = true; }
    });

    Object.defineProperty(this, 'edges', {
        get: function() { 
            var res = [];
            var seg = this._constraintShape.segments;
            var l = seg.length, l2, n=0, n2=0, i=0, j=0;
            while(n < l) {
                i = n++;
                n2 = 0;
                l2 = seg[i].edges.length;
                while(n2 < l2) {
                    j = n2++;
                    res.push(seg[i].edges[j]);
                }
            }
            return res;
        }
    });
};
DDLS.Object.prototype = {
    constructor: DDLS.Object,
    position:function(x,y){
        this._position.set(x,y);
        this.hasChanged = true;
    },
    scale:function(w,h){
        this._scale.set(w,h);
        this.hasChanged = true;
    },
    pivot:function(x,y){
        this._pivot.set(x,y);
        this.hasChanged = true;
    },
    dispose: function() {
        this._matrix = null;
        this._coordinates = null;
        this._constraintShape = null;
    },
    updateValuesFromMatrix: function() {
    },
    updateMatrixFromValues: function() {
        this._matrix.identity().translate(this._pivot.negate()).scale(this._scale).rotate(this._rotation).translate(this._position);
    }
};
DDLS.Segment = function(x,y) {
    this.id = DDLS.SegmentID;
    DDLS.SegmentID ++;
    this.edges = [];
    this.fromShape = null;
};
DDLS.Segment.prototype = {
    constructor: DDLS.Segment,
    addEdge: function(edge) {
        if ( this.edges.indexOf(edge) == -1 && this.edges.indexOf(edge.oppositeEdge) == -1 ) this.edges.push(edge);
    },
    removeEdge: function(edge) {
        var index = this.edges.indexOf(edge);
        if ( index == -1 ) index = this.edges.indexOf(edge.oppositeEdge);
        if ( index != -1 ) this.edges.splice(index, 1);
    },
    dispose: function() {
        this.edges = null;
        this.fromShape = null;
    },
    toString: function() {
        return "seg_id " + this.id;
    }
};
DDLS.Shape = function() {
    this.id = DDLS.ShapeID;
    DDLS.ShapeID ++;
    this.segments = [];
};
DDLS.Shape.prototype = {
    constructor: DDLS.Shape,
    dispose: function() {
        while(this.segments.length > 0) this.segments.pop().dispose();
        this.segments = null;
    }
};
//-------------------------
//     EDGE
//-------------------------

DDLS.FromEdgeToRotatedEdges = function() {
};


//-------------------------
//     FACE
//-------------------------

//!\\ not used
DDLS.FromFaceToInnerVertices = function() {
   // this._fromFace = null;
  //  this._nextEdge = null;

    Object.defineProperty(this, 'fromFace', {
        set: function(value) { 
            this._fromFace = value;
            this._nextEdge = this._fromFace.edge;
        }
    });

};
DDLS.FromFaceToInnerVertices.prototype = {
    /*set_fromFace: function(value) {
        this._fromFace = value;
        this._nextEdge = this._fromFace.edge;
        return value;
    },*/
    next: function() {
        if(this._nextEdge != null) {
            this._resultVertex = this._nextEdge.originVertex;
            this._nextEdge = this._nextEdge.nextLeftEdge;
            if(this._nextEdge == this._fromFace.edge) this._nextEdge = null;
        } else this._resultVertex = null;
        return this._resultVertex;
    }
};

DDLS.FromFaceToInnerEdges = function() {
    //this._fromFace = null;
    //this._nextEdge = null;
    
    Object.defineProperty(this, 'fromFace', {
        set: function(value) { 
            this._fromFace = value;
            this._nextEdge = this._fromFace.edge;
        }
    });
};
DDLS.FromFaceToInnerEdges.prototype = {
    /*set_fromFace: function(value) {
        this._fromFace = value;
        this._nextEdge = this._fromFace.edge;
        return value;
    },*/
    next: function() {
        if(this._nextEdge != null) {
            this._resultEdge = this._nextEdge;
            this._nextEdge = this._nextEdge.nextLeftEdge;
            if(this._nextEdge == this._fromFace.edge) this._nextEdge = null;
        } else this._resultEdge = null;
        return this._resultEdge;
    }
};

//!\\ not used
DDLS.FromFaceToNeighbourFaces = function() {
   // this._fromFace = null;
   // this._nextEdge = null;
    Object.defineProperty(this, 'fromFace', {
        set: function(value) { 
            this._fromFace = value;
            this._nextEdge = this._fromFace.edge;
        }
    });
};
DDLS.FromFaceToNeighbourFaces.prototype = {
    /*set_fromFace: function(value) {
        this._fromFace = value;
        this._nextEdge = this._fromFace.edge;
        return value;
    },*/
    next: function() {
        if(this._nextEdge != null) {
            do{
                this._resultFace = this._nextEdge.rightFace;
                this._nextEdge = this._nextEdge.nextLeftEdge;
                if(this._nextEdge == this._fromFace.edge){
                    this._nextEdge = null;
                    if ( ! this._resultFace.isReal ) this._resultFace = null;
                    break;
                }
            } while ( ! this._resultFace.isReal )
        } else this._resultFace = null;
        return this._resultFace;
    }
};


//-------------------------
//     MESH
//-------------------------

DDLS.FromMeshToVertices = function() {
    //this._fromMesh = null;
    //this._currIndex = 0;
    Object.defineProperty(this, 'fromMesh', {
        set: function(value) { 
            this._fromMesh = value;
            this._currIndex = 0;
        }
    });
};
DDLS.FromMeshToVertices.prototype = {
    /*set_fromMesh: function(value) {
        this._fromMesh = value;
        this._currIndex = 0;
        return value;
    },*/
    next: function() {
        do if(this._currIndex < this._fromMesh._vertices.length) {
            this._resultVertex = this._fromMesh._vertices[this._currIndex];
            this._currIndex++;
        } else {
            this._resultVertex = null;
            break;
        } while(!this._resultVertex.isReal);
        return this._resultVertex;
    }
};

//!\\ not used
DDLS.FromMeshToFaces = function() {
    //this._fromMesh = null;
    //this._currIndex = 0;
    Object.defineProperty(this, 'fromMesh', {
        set: function(value) { 
            this._fromMesh = value;
            this._currIndex = 0;
        }
    });
};
DDLS.FromMeshToFaces.prototype = {
    /*set_fromMesh: function(value) {
        this._fromMesh = value;
        this._currIndex = 0;
        return value;
    },*/
    next: function() {
        do if(this._currIndex < this._fromMesh._faces.length) {
            this._resultFace = this._fromMesh._faces[this._currIndex];
            this._currIndex++;
        } else {
            this._resultFace = null;
            break;
        } while(!this._resultFace.isReal);
        return this._resultFace;
    }
};


//-------------------------
//     VERTEX
//-------------------------

DDLS.FromVertexToHoldingFaces = function() {
    //this._fromVertex = null;
    //this._nextEdge = null;
    Object.defineProperty(this, 'fromVertex', {
        set: function(value) { 
            this._fromVertex = value;
            this._nextEdge = this._fromVertex.edge;
        }
    });
};
DDLS.FromVertexToHoldingFaces.prototype = {
    /*set_fromVertex: function(value) {
        this._fromVertex = value;
        this._nextEdge = this._fromVertex.edge;
        return value;
    },*/
    next: function() {
        if(this._nextEdge != null) do {
            this._resultFace = this._nextEdge.leftFace;
            this._nextEdge = this._nextEdge.rotLeftEdge;
            if(this._nextEdge == this._fromVertex.edge) {
                this._nextEdge = null;
                if(!this._resultFace.isReal) this._resultFace = null;
                break;
            }
        } while(!this._resultFace.isReal); else this._resultFace = null;
        return this._resultFace;
    }
};


DDLS.FromVertexToIncomingEdges = function() {
    //this._fromVertex = null;
    //this._nextEdge = null;
    Object.defineProperty(this, 'fromVertex', {
        set: function(value) { 
            this._fromVertex = value;
            this._nextEdge = this._fromVertex.edge
            while(!this._nextEdge.isReal) this._nextEdge = this._nextEdge.rotLeftEdge;
        }
    });
};
DDLS.FromVertexToIncomingEdges.prototype = {
    /*set_fromVertex: function(value) {
        this._fromVertex = value;
        this._nextEdge = this._fromVertex.edge;
        while(!this._nextEdge.isReal) this._nextEdge = this._nextEdge.rotLeftEdge;
        return value;
    },*/
    next: function() {
        if(this._nextEdge != null) {
            this._resultEdge = this._nextEdge.oppositeEdge;
            do {
                this._nextEdge = this._nextEdge.rotLeftEdge;
                if(this._nextEdge == this._fromVertex.edge) {
                    this._nextEdge = null;
                    break;
                }
            } while(!this._nextEdge.isReal);
        } else this._resultEdge = null;
        return this._resultEdge;
    }
};


DDLS.FromVertexToOutgoingEdges = function() {
    this.realEdgesOnly = true;
    //this._fromVertex = null;
    //this._nextEdge = null;
    Object.defineProperty(this, 'fromVertex', {
        set: function(value) { 
            this._fromVertex = value;
            this._nextEdge = this._fromVertex.edge;
            if(this._nextEdge!=null)
            while(this.realEdgesOnly && !this._nextEdge.isReal) this._nextEdge = this._nextEdge.rotLeftEdge;
        }
    });
};
DDLS.FromVertexToOutgoingEdges.prototype = {
    /*set_fromVertex: function(value) {
        this._fromVertex = value;
        this._nextEdge = this._fromVertex.edge;
        while(this.realEdgesOnly && !this._nextEdge.isReal) this._nextEdge = this._nextEdge.rotLeftEdge;
        return value;
    },*/
    next: function() {
        if(this._nextEdge != null) {
            this._resultEdge = this._nextEdge;
            do {
                this._nextEdge = this._nextEdge.rotLeftEdge;
                if(this._nextEdge == this._fromVertex.edge) {
                    this._nextEdge = null;
                    break;
                }
            } while(this.realEdgesOnly && !this._nextEdge.isReal);
        } else this._resultEdge = null;
        return this._resultEdge;
    }
};


//!\\ not used
DDLS.FromVertexToNeighbourVertices = function() {
    //this._fromVertex = null;
    //this._nextEdge = null;
    Object.defineProperty(this, 'fromVertex', {
        set: function(value) { 
            this._fromVertex = value;
            this._nextEdge = this._fromVertex.edge
        }
    });
};
DDLS.FromVertexToNeighbourVertices.prototype = {
    /*set_fromVertex: function(value) {
        this._fromVertex = value;
        this._nextEdge = this._fromVertex.edge;
        return value;
    },*/
    next: function() {
        if(this._nextEdge != null){
            this._resultVertex = this._nextEdge.destinationVertex;
            do {
                this._nextEdge = this._nextEdge.rotLeftEdge;
            } while(!this._nextEdge.isReal);

            if(this._nextEdge == this._fromVertex.edge) {
                this._nextEdge = null;
            }
        }
        else this._resultVertex = null;
        return this._resultVertex;
    }
};
DDLS.Squared = function(a,b){
    return a * a + b * b;
};
DDLS.SquaredSqrt = function(a,b){
    return DDLS.sqrt(a * a + b * b);
};

DDLS.Geom2D = {};
DDLS.Geom2D.__samples = [];
DDLS.Geom2D.__circumcenter = new DDLS.Point();

DDLS.Geom2D.locatePosition = function(p,mesh) {

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
    while(n < numSamples) {
        i = n++;
        currVertex = DDLS.Geom2D.__samples[i];
        currVertexPos = currVertex.pos;
        distSquared = DDLS.Squared(currVertexPos.x - p.x, currVertexPos.y - p.y);
        if(distSquared < minDistSquared) {
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

DDLS.Geom2D.isInFace = function(p,polygon) {
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
DDLS.Mesh = function(width,height) {
    this.id = DDLS.MeshID;
    DDLS.MeshID++;
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
};

DDLS.Mesh.prototype = {
    constructor: DDLS.Mesh,
    clear: function(notObjects) {
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
    },
    dispose: function() {
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
    },
    get___constraintShapes: function() {
        return this._constraintShapes;
    },
    buildFromRecord: function(rec) {
        var positions = rec.split(";");
        var l = positions.length, i = 0;
        while(i < l) {
        //for (i = 0; i<l; i+=4){
            this.insertConstraintSegment(parseFloat(positions[i]),parseFloat(positions[i + 1]),parseFloat(positions[i + 2]),parseFloat(positions[i + 3]));
            i += 4;
        }
    },
    insertObject: function(object) {
        if(object.constraintShape != null) this.deleteObject(object);
        var shape = new DDLS.Shape();
        var segment;
        var coordinates = object.coordinates;
        
        object.updateMatrixFromValues();
        var m = object.matrix;
        var p1 = new DDLS.Point();
        var p2 = new DDLS.Point();

        var l = coordinates.length, i = 0;
        while(i < l) {
        //for (i=0; i<l; i+=4){
            p1.set(coordinates[i], coordinates[i+1]).transformMat2D(m);
            p2.set(coordinates[i+2], coordinates[i+3]).transformMat2D(m);
            segment = this.insertConstraintSegment(p1.x,p1.y,p2.x,p2.y);
            if(segment != null) {
                segment.fromShape = shape;
                shape.segments.push(segment);
            }
            i += 4;
        }
        this._constraintShapes.push(shape);
        object.constraintShape = shape;
        if(!this.__objectsUpdateInProgress) this._objects.push(object);
    },
    deleteObject: function(object) {
        if(object.constraintShape == null) return;
        this.deleteConstraintShape(object.constraintShape);
        object.constraintShape = null;
        if(!this.__objectsUpdateInProgress) {
            var index = this._objects.indexOf(object);
            this._objects.splice(index,1);
        }
    },

    updateObjects: function() {
        //var isRedraw = force || false;
        //console.log("mmmm", isRedraw)
        this.__objectsUpdateInProgress = true;
        var l = this._objects.length, n = 0, i = 0, o;
        while(n<l) {
            i = n++;
            o = this._objects[i];
            if(o.hasChanged) {
                this.deleteObject(o);
                this.insertObject(o);
                o.hasChanged = false;
                this.isRedraw = true;
            }
        }
        this.__objectsUpdateInProgress = false;
        //return isRedraw;
    },

    // insert a new collection of constrained edges.
    // Coordinates parameter is a list with form [x0, y0, x1, y1, x2, y2, x3, y3, x4, y4, ....]
    // where each 4-uple sequence (xi, yi, xi+1, yi+1) is a constraint segment (with i % 4 == 0)
    // and where each couple sequence (xi, yi) is a point.
    // Segments are not necessary connected.
    // Segments can overlap (then they will be automaticaly subdivided).
    insertConstraintShape: function(coordinates) {
        var shape = new DDLS.Shape();
        var segment = null;
        var l = coordinates.length, i = 0;
        //for (i=0; i<l; i+=4){
        while(i < l) {
            segment = this.insertConstraintSegment(coordinates[i],coordinates[i + 1],coordinates[i + 2],coordinates[i + 3]);
            if(segment != null) {
                segment.fromShape = shape;
                shape.segments.push(segment);
            }
            i += 4;
        }
        this._constraintShapes.push(shape);
        return shape;
    },
    deleteConstraintShape: function(shape) {
        var n = 0, i = 0;
        var l = shape.segments.length;
        while(n < l) {
            i = n++;
        //for (var i=0 ; i<shape.segments.length ; i++){
            this.deleteConstraintSegment(shape.segments[i]);
        }
        
        //console.log('yoch', this._constraintShapes.indexOf(shape))
        this._constraintShapes.splice(this._constraintShapes.indexOf(shape),1);
        shape.dispose();
    },
    insertConstraintSegment: function(x1,y1,x2,y2) {
        var newX1 = x1;
        var newY1 = y1;
        var newX2 = x2;
        var newY2 = y2;

        if ( (x1 > this.width && x2 > this.width) || (x1 < 0 && x2 < 0) || (y1 > this.height && y2 > this.height) || (y1 < 0 && y2 < 0)  ) return null;
        else{
            var nx = x2 - x1;
            var ny = y2 - y1;
            var tmin = DDLS.NEGATIVE_INFINITY;
            var tmax = DDLS.POSITIVE_INFINITY;
            
            if (nx != 0.0){
                var tx1 = (0 - x1)/nx;
                var tx2 = (this.width - x1)/nx;
                
                tmin = DDLS.max(tmin, DDLS.min(tx1, tx2));
                tmax = DDLS.min(tmax, DDLS.max(tx1, tx2));
            }
            if (ny != 0.0){
                var ty1 = (0 - y1)/ny;
                var ty2 = (this.height - y1)/ny;
                
                tmin = DDLS.max(tmin, DDLS.min(ty1, ty2));
                tmax = DDLS.min(tmax, DDLS.max(ty1, ty2));
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
        var vertexDown = this.insertVertex(newX1,newY1);
        if(vertexDown == null) return null;
        var vertexUp = this.insertVertex(newX2,newY2);
        if(vertexUp == null) return null;
        if(vertexDown.id == vertexUp.id) return null;
        //if(vertexDown === vertexUp) return null;

        // useful
        var iterVertexToOutEdges = new DDLS.FromVertexToOutgoingEdges();
        var currVertex;
        var currEdge;
        var i;

        // the new constraint segment
        var segment = new DDLS.Segment();
        var tempEdgeDownUp = new DDLS.Edge();
        var tempSdgeUpDown = new DDLS.Edge();
        tempEdgeDownUp.setDatas(vertexDown,tempSdgeUpDown,null,null,true,true);
        tempSdgeUpDown.setDatas(vertexUp,tempEdgeDownUp,null,null,true,true);

        var intersectedEdges = [];
        var leftBoundingEdges = [];
        var rightBoundingEdges = [];

        var currObjet = {type:3};
        var pIntersect = new DDLS.Point();
        var edgeLeft;
        var newEdgeDownUp;
        var newEdgeUpDown;
        var done = false;
        currVertex = vertexDown;

        currObjet = currVertex;
        currObjet = currVertex;
        while(true) {
            done = false;
            if ( currObjet.type === 0 ){
                currVertex = currObjet;
                iterVertexToOutEdges.fromVertex = currVertex;
                while((currEdge = iterVertexToOutEdges.next()) != null) {
                    //if(currEdge.destinationVertex == vertexUp) {
                    if(currEdge.destinationVertex.id == vertexUp.id) {
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
                    if(DDLS.Geom2D.distanceSquaredVertexToEdge(currEdge.destinationVertex,tempEdgeDownUp) <= DDLS.EPSILON_SQUARED) {
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
                if(done) continue;

                iterVertexToOutEdges.fromVertex = currVertex;
                while((currEdge = iterVertexToOutEdges.next()) != null) {
                    currEdge = currEdge.nextLeftEdge;
                    if(DDLS.Geom2D.intersections2edges(currEdge,tempEdgeDownUp,pIntersect)) {
                        if(currEdge.isConstrained) {
                            vertexDown = this.splitEdge(currEdge,pIntersect.x,pIntersect.y);
                            iterVertexToOutEdges.fromVertex = currVertex;
                            while((currEdge = iterVertexToOutEdges.next()) != null){
                                //if(currEdge.destinationVertex == vertexDown) {
                                if(currEdge.destinationVertex.id == vertexDown.id) {
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
            } else if ( currObjet.type === 1 ){
                currEdge = currObjet;
                edgeLeft = currEdge.nextLeftEdge;
                if ( edgeLeft.destinationVertex.id == vertexUp.id ){
                //if ( edgeLeft.destinationVertex == vertexUp ){
                    //trace("end point reached");
                    leftBoundingEdges.unshift(edgeLeft.nextLeftEdge);
                    rightBoundingEdges.push(edgeLeft);
                    
                    newEdgeDownUp = new DDLS.Edge();
                    newEdgeUpDown = new DDLS.Edge();
                    newEdgeDownUp.setDatas(vertexDown, newEdgeUpDown, null, null, true, true);
                    newEdgeUpDown.setDatas(vertexUp, newEdgeDownUp, null, null, true, true);
                    leftBoundingEdges.push(newEdgeDownUp);
                    rightBoundingEdges.push(newEdgeUpDown);
                    this.insertNewConstrainedEdge(segment, newEdgeDownUp, intersectedEdges, leftBoundingEdges, rightBoundingEdges);
                    
                    return segment;
                } else if ( DDLS.Geom2D.distanceSquaredVertexToEdge( edgeLeft.destinationVertex, tempEdgeDownUp) <= DDLS.EPSILON_SQUARED ){
                    //trace("we met a vertex");
                    leftBoundingEdges.unshift(edgeLeft.nextLeftEdge);
                    rightBoundingEdges.push(edgeLeft);
                    
                    newEdgeDownUp = new DDLS.Edge();
                    newEdgeUpDown = new DDLS.Edge();
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
                    if ( DDLS.Geom2D.intersections2edges(edgeLeft, tempEdgeDownUp, pIntersect) ){
                        //trace("1st left edge intersected");
                        if (edgeLeft.isConstrained){
                            //trace("edge is constrained");
                            currVertex = this.splitEdge(edgeLeft, pIntersect.x, pIntersect.y);
                            
                            iterVertexToOutEdges.fromVertex = currVertex;
                            while ( (currEdge = iterVertexToOutEdges.next()) != null){
                                if (currEdge.destinationVertex == leftBoundingEdges[0].originVertex) leftBoundingEdges.unshift(currEdge);
                                if (currEdge.destinationVertex == rightBoundingEdges[rightBoundingEdges.length-1].destinationVertex) rightBoundingEdges.push(currEdge.oppositeEdge);
                            }
                            
                            newEdgeDownUp = new DDLS.Edge();
                            newEdgeUpDown = new DDLS.Edge();
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
                        DDLS.Geom2D.intersections2edges(edgeLeft, tempEdgeDownUp, pIntersect);
                        if (edgeLeft.isConstrained){
                            //trace("edge is constrained");
                            currVertex = this.splitEdge(edgeLeft, pIntersect.x, pIntersect.y);
                            
                            iterVertexToOutEdges.fromVertex = currVertex;
                            /*while ( (currEdge = iterVertexToOutEdges.next()) != null ){
                                if (currEdge.destinationVertex == leftBoundingEdges[0].originVertex) leftBoundingEdges.unshift(currEdge);
                                if (currEdge.destinationVertex == rightBoundingEdges[rightBoundingEdges.length-1].destinationVertex) rightBoundingEdges.push(currEdge.oppositeEdge);
                            }*/

                            while ( (currEdge = iterVertexToOutEdges.next()) != null ){
                                if (currEdge.destinationVertex.id == leftBoundingEdges[0].originVertex.id) leftBoundingEdges.unshift(currEdge);
                                if (currEdge.destinationVertex.id == rightBoundingEdges[rightBoundingEdges.length-1].destinationVertex.id) rightBoundingEdges.push(currEdge.oppositeEdge);
                            }
                            
                            newEdgeDownUp = new DDLS.Edge();
                            newEdgeUpDown = new DDLS.Edge();
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
                            rightBoundingEdges.push(edgeLeft.prevLeftEdge);
                            currEdge = edgeLeft.oppositeEdge; // we keep the edge from left to right
                            currObjet = currEdge;
                        }
                    }
                }
            }
        }
        //return segment;
    },
    insertNewConstrainedEdge: function(fromSegment,edgeDownUp,intersectedEdges,leftBoundingEdges,rightBoundingEdges) {
        this._edges.push(edgeDownUp);
        this._edges.push(edgeDownUp.oppositeEdge);
        edgeDownUp.addFromConstraintSegment(fromSegment);
        edgeDownUp.oppositeEdge.fromConstraintSegments = edgeDownUp.fromConstraintSegments;
        fromSegment.addEdge(edgeDownUp);
        edgeDownUp.originVertex.addFromConstraintSegment(fromSegment);
        edgeDownUp.destinationVertex.addFromConstraintSegment(fromSegment);
        this.untriangulate(intersectedEdges);
        this.triangulate(leftBoundingEdges,true);
        this.triangulate(rightBoundingEdges,true);
    },
    deleteConstraintSegment: function(segment) {
        var vertexToDelete = [];
        var edge = null;
        var vertex;
        var fromConstraintSegment;
        var l = segment.edges.length, n=0, i;
        while(n<l) {
        //for (i=0 ; i<segment.edges.length ; i++){
        //while(i--) {
            i = n++;
            edge = segment.edges[i];
            //edge = segment.edges[i];
            edge.removeFromConstraintSegment(segment);
            if(edge.fromConstraintSegments.length == 0) {
                edge.isConstrained = false;
                edge.oppositeEdge.isConstrained = false;
            }
            vertex = edge.originVertex;
            vertex.removeFromConstraintSegment(segment);
            vertexToDelete.push(vertex);
        }
        vertex = edge.destinationVertex;
        vertex.removeFromConstraintSegment(segment);
        vertexToDelete.push(vertex);
        //var _g11 = 0;
        //var _g2 = vertexToDelete.length;
        //i = vertexToDelete.length;
        l = vertexToDelete.length;
        n = 0;
        //while(i--) {
        //while(_g11 < _g2) {
        while(n<l) {
        //for (i=0 ; i<vertexToDelete.length; i++){
            i = n++;
            this.deleteVertex(vertexToDelete[i]);
            //this.deleteVertex(vertexToDelete[i]);
        }

        segment.dispose();
    },
    check: function() {
        var l = this._edges.length, n=0, i;
        //var _g1 = 0;
        //var _g = this._edges.length;
        while(n<l) {
        //for (var i = 0; i < this._edges.length; i++){
            i = n++;
            if(this._edges[i].nextLeftEdge == null) {
                DDLS.Log("!!! missing nextLeftEdge");
                return;
            }
        }
        DDLS.Log("check OK");
    },
    insertVertex: function(x,y) {
        if(x < 0 || y < 0 || x > this.width || y > this.height) return null;
        this.__edgesToCheck.splice(0,this.__edgesToCheck.length);
        var inObject = DDLS.Geom2D.locatePosition( new DDLS.Point(x,y), this);
        var newVertex = null;
        switch(inObject.type) {
        case 0:
            var vertex = inObject;
            newVertex = vertex;
            break;
        case 1:
            var edge = inObject;
            newVertex = this.splitEdge(edge,x,y);
            break;
        case 2:
            var face = inObject;
            newVertex = this.splitFace(face,x,y);
            break;
        case 3:
            break;
        }
        this.restoreAsDelaunay();
        return newVertex;
    },
    flipEdge: function(edge) {
        var eBot_Top = edge;
        var eTop_Bot = edge.oppositeEdge;
        var eLeft_Right = new DDLS.Edge();
        var eRight_Left = new DDLS.Edge();
        var eTop_Left = eBot_Top.nextLeftEdge;
        var eLeft_Bot = eTop_Left.nextLeftEdge;
        var eBot_Right = eTop_Bot.nextLeftEdge;
        var eRight_Top = eBot_Right.nextLeftEdge;

        var vBot = eBot_Top.originVertex;
        var vTop = eTop_Bot.originVertex;
        var vLeft = eLeft_Bot.originVertex;
        var vRight = eRight_Top.originVertex;

        var fLeft = eBot_Top.leftFace;
        var fRight = eTop_Bot.leftFace;
        var fBot = new DDLS.Face();
        var fTop = new DDLS.Face();

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
        if(vTop.edge.id == eTop_Bot.id) vTop.setDatas(eTop_Left);
        if(vBot.edge.id == eBot_Top.id) vBot.setDatas(eBot_Right);
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
    },
    splitEdge: function(edge,x,y) {
        this.__edgesToCheck.splice(0,this.__edgesToCheck.length);

        var eLeft_Right = edge;
        var eRight_Left = eLeft_Right.oppositeEdge;
        var eRight_Top = eLeft_Right.nextLeftEdge;
        var eTop_Left = eRight_Top.nextLeftEdge;
        var eLeft_Bot = eRight_Left.nextLeftEdge;
        var eBot_Right = eLeft_Bot.nextLeftEdge;

        var vTop = eTop_Left.originVertex;
        var vLeft = eLeft_Right.originVertex;
        var vBot = eBot_Right.originVertex;
        var vRight = eRight_Left.originVertex;

        var fTop = eLeft_Right.leftFace;
        var fBot = eRight_Left.leftFace;

        // check distance from the position to edge end points
        if((vLeft.pos.x - x) * (vLeft.pos.x - x) + (vLeft.pos.y - y) * (vLeft.pos.y - y) <= DDLS.EPSILON_SQUARED) return vLeft;
        if((vRight.pos.x - x) * (vRight.pos.x - x) + (vRight.pos.y - y) * (vRight.pos.y - y) <= DDLS.EPSILON_SQUARED) return vRight;
        // create new objects
        var vCenter = new DDLS.Vertex();
        var eTop_Center = new DDLS.Edge();
        var eCenter_Top = new DDLS.Edge();
        var eBot_Center = new DDLS.Edge();
        var eCenter_Bot = new DDLS.Edge();

        var eLeft_Center = new DDLS.Edge();
        var eCenter_Left = new DDLS.Edge();
        var eRight_Center = new DDLS.Edge();
        var eCenter_Right = new DDLS.Edge();

        var fTopLeft = new DDLS.Face();
        var fBotLeft = new DDLS.Face();
        var fBotRight = new DDLS.Face();
        var fTopRight = new DDLS.Face();
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
        vCenter.setDatas(fTop.isReal ? eCenter_Top : eCenter_Bot );
        vCenter.pos.x = x;
        vCenter.pos.y = y;
        DDLS.Geom2D.projectOrthogonaly(vCenter.pos,eLeft_Right);

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
        if(vLeft.edge.id == eLeft_Right.id) vLeft.setDatas(eLeft_Center);
        if(vRight.edge.id == eRight_Left.id) vRight.setDatas(eRight_Center);
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
            var fromSegments = eLeft_Right.fromConstraintSegments;
            eLeft_Center.fromConstraintSegments = fromSegments.slice(0);
            eCenter_Left.fromConstraintSegments = eLeft_Center.fromConstraintSegments;
            eCenter_Right.fromConstraintSegments = fromSegments.slice(0);
            eRight_Center.fromConstraintSegments = eCenter_Right.fromConstraintSegments;
            var edges;
            var index;
            var n = 0;
            var l = eLeft_Right.fromConstraintSegments.length;
            while(n < l) {
                var i = n++;
                edges = eLeft_Right.fromConstraintSegments[i].edges;
                index = edges.indexOf(eLeft_Right);
                if(index != -1) {
                    edges.splice(index, 1, eLeft_Center, eCenter_Right);
                    /*edges.splice(index,1);
                    edges.splice(index,0,eLeft_Center);
                    edges.splice(index + 1,0,eCenter_Right);*/
                } else {
                    edges.splice(edges.indexOf(eRight_Left), 1, eRight_Center, eCenter_Left);
                    /*index = edges.indexOf(eRight_Left );
                    edges.splice( index, 1);
                    edges.splice( index, eRight_Center );
                    edges.splice( index+1, eCenter_Left )*/
                    /*var index2 = edges.indexOf(eRight_Left);
                    edges.splice(index2,1);
                    edges.splice(index2,0,eRight_Center);
                    edges.splice(index2,0,eCenter_Left);*/
                }
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
    },
    splitFace: function(face,x,y) {
        this.__edgesToCheck.splice(0,this.__edgesToCheck.length);
        var eTop_Left = face.edge;
        var eLeft_Right = eTop_Left.nextLeftEdge;
        var eRight_Top = eLeft_Right.nextLeftEdge;
        var vTop = eTop_Left.originVertex;
        var vLeft = eLeft_Right.originVertex;
        var vRight = eRight_Top.originVertex;
        var vCenter = new DDLS.Vertex();
        var eTop_Center = new DDLS.Edge();
        var eCenter_Top = new DDLS.Edge();
        var eLeft_Center = new DDLS.Edge();
        var eCenter_Left = new DDLS.Edge();
        var eRight_Center = new DDLS.Edge();
        var eCenter_Right = new DDLS.Edge();
        var fTopLeft = new DDLS.Face();
        var fBot = new DDLS.Face();
        var fTopRight = new DDLS.Face();
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
    },
    restoreAsDelaunay: function() {
        var edge;
        while(this.__edgesToCheck.length > 0) {
            edge = this.__edgesToCheck.shift();
            if(edge.isReal && !edge.isConstrained && !DDLS.Geom2D.isDelaunay(edge)) {
                //if(edge.nextLeftEdge.destinationVertex == this.__centerVertex) {
                if(edge.nextLeftEdge.destinationVertex.id == this.__centerVertex.id) {
                    this.__edgesToCheck.push(edge.nextRightEdge);
                    this.__edgesToCheck.push(edge.prevRightEdge);
                } else {
                    this.__edgesToCheck.push(edge.nextLeftEdge);
                    this.__edgesToCheck.push(edge.prevLeftEdge);
                }
                this.flipEdge(edge);
            }
        }
    },
    // Delete a vertex IF POSSIBLE and then fill the hole with a new triangulation.
    // A vertex can be deleted if:
    // - it is free of constraint segment (no adjacency to any constrained edge)
    // - it is adjacent to exactly 2 contrained edges and is not an end point of any constraint segment
    deleteVertex: function(vertex) {
        var i;
        var freeOfConstraint;
        var iterEdges = new DDLS.FromVertexToOutgoingEdges();
        iterEdges.fromVertex = vertex;
        iterEdges.realEdgesOnly = false;
        var edge;
        var outgoingEdges = [];
        freeOfConstraint = (vertex.fromConstraintSegments.length == 0)? true : false;

        var bound = [];
        var realA = false;
        var realB = false;
        var boundA = [];
        var boundB = [];
        if(freeOfConstraint){ 
            //while(edge = iterEdges.next()) {
            while((edge = iterEdges.next()) != null) {
                outgoingEdges.push(edge);
                bound.push(edge.nextLeftEdge);
            }
        } else {
            // we check if the vertex is an end point of a constraint segment
            var edges;
            var _g1 = 0;
            var _g = vertex.fromConstraintSegments.length;
            while(_g1 < _g) {
                var i1 = _g1++;
                edges = vertex.fromConstraintSegments[i1].edges;
                //if(edges[0].originVertex == vertex || edges[edges.length - 1].destinationVertex == vertex) return false;
                if(edges[0].originVertex.id == vertex.id || edges[edges.length - 1].destinationVertex.id == vertex.id) return false;
            }
            // we check the count of adjacent constrained edges
            var count = 0;
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
            var constrainedEdgeA = null;
            var constrainedEdgeB = null;
            var edgeA = new DDLS.Edge();
            var edgeB = new DDLS.Edge();
            this._edges.push(edgeA);
            this._edges.push(edgeB);
            var _g11 = 0;
            var _g2 = outgoingEdges.length;
            while(_g11 < _g2) {
                var i2 = _g11++;
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
            var index;
            var _g12 = 0;
            var _g3 = vertex.fromConstraintSegments.length;
            while(_g12 < _g3) {
                var i3 = _g12++;
                edges = vertex.fromConstraintSegments[i3].edges;
                index = edges.indexOf(constrainedEdgeA);
                if(index != -1) {
                    edges.splice(index-1, 2, edgeA);
                    //edges.splice(index - 1,2);
                    //edges.splice(index - 1,0,edgeA);
                } else {
                    edges.splice(edges.indexOf(constrainedEdgeB)-1, 2, edgeB);
                    //var index2 = edges.indexOf(constrainedEdgeB) - 1;
                    //edges.splice(index2,2);
                    //edges.splice(index2,0,edgeB);
                }
            }
        }
        // Deletion of old faces and edges
        var faceToDelete;
        var _g13 = 0;
        var _g4 = outgoingEdges.length;
        while(_g13 < _g4) {
            var i4 = _g13++;
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
    },
    // untriangulate is usually used while a new edge insertion in order to delete the intersected edges
    // edgesList is a list of chained edges oriented from right to left
    untriangulate: function(edgesList) {
        // we clean useless faces and adjacent vertices
        var i;
        var verticesCleaned = new DDLS.Dictionary(1);
        var currEdge;
        var outEdge;
        var _g1 = 0;
        var _g = edgesList.length;
        while(_g1 < _g) {
            var i1 = _g1++;
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
        var _g11 = 0;
        var _g2 = edgesList.length;
        while(_g11 < _g2) {
            var i2 = _g11++;
            currEdge = edgesList[i2];
            this._edges.splice(this._edges.indexOf(currEdge.oppositeEdge),1);
            this._edges.splice(this._edges.indexOf(currEdge),1);
            currEdge.oppositeEdge.dispose();
            currEdge.dispose();
        }
    },

    // triangulate is usually used to fill the hole after deletion of a vertex from mesh or after untriangulation
    // - bounds is the list of edges in CCW bounding the surface to retriangulate,
    triangulate: function(bound,isReal) {
        if(bound.length < 2) {
            DDLS.Log("BREAK ! the hole has less than 2 edges");
            return;
        // if the hole is a 2 edges polygon, we have a big problem
        } else if(bound.length == 2) {
            DDLS.Log("BREAK ! the hole has only 2 edges");
           // DDLS.Debug.trace("  - edge0: " + bound[0].originVertex.id + " -> " + bound[0].destinationVertex.id,{ fileName : "Mesh.hx", lineNumber : 1404, className : "DDLS.Mesh", methodName : "triangulate"});
           // DDLS.Debug.trace("  - edge1: " + bound[1].originVertex.id + " -> " + bound[1].destinationVertex.id,{ fileName : "Mesh.hx", lineNumber : 1405, className : "DDLS.Mesh", methodName : "triangulate"});
            return;
        // if the hole is a 3 edges polygon:
        } else if(bound.length == 3) {
            var f = new DDLS.Face();
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
            var baseEdge = bound[0];
            var vertexA = baseEdge.originVertex;
            var vertexB = baseEdge.destinationVertex;
            var vertexC;
            var vertexCheck;
            var circumcenter = new DDLS.Point();
            var radiusSquared = 0;
            var distanceSquared = 0;
            var isDelaunay = false;
            var index = 0;
            var i;
            var _g1 = 2;
            var _g = bound.length;
            while(_g1 < _g) {
                var i1 = _g1++;
                vertexC = bound[i1].originVertex;
                if(DDLS.Geom2D.getRelativePosition2(vertexC.pos,baseEdge) == 1) {
                    index = i1;
                    isDelaunay = true;
                    //DDLS.Geom2D.getCircumcenter(vertexA.pos.x,vertexA.pos.y,vertexB.pos.x,vertexB.pos.y,vertexC.pos.x,vertexC.pos.y,circumcenter);
                    DDLS.Geom2D.getCircumcenter(vertexA.pos, vertexB.pos, vertexC.pos, circumcenter);
                    radiusSquared = DDLS.Squared(vertexA.pos.x - circumcenter.x, vertexA.pos.y - circumcenter.y);
                    // for perfect regular n-sides polygons, checking strict delaunay circumcircle condition is not possible, so we substract EPSILON to circumcircle radius:
                    radiusSquared -= DDLS.EPSILON_SQUARED;
                    var _g3 = 2;
                    var _g2 = bound.length;
                    while(_g3 < _g2) {
                        var j = _g3++;
                        if(j != i1) {
                            vertexCheck = bound[j].originVertex;
                            distanceSquared = DDLS.Squared(vertexCheck.pos.x - circumcenter.x, vertexCheck.pos.y - circumcenter.y);
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
                DDLS.Log("NO DELAUNAY FOUND");
                /*var s = "";
                var _g11 = 0;
                var _g4 = bound.length;
                while(_g11 < _g4) {
                    var i2 = _g11++;
                    s += bound[i2].originVertex.pos.x + " , ";
                    s += bound[i2].originVertex.pos.y + " , ";
                    s += bound[i2].destinationVertex.pos.x + " , ";
                    s += bound[i2].destinationVertex.pos.y + " , ";
                }*/
                index = 2;
            }
            var edgeA = null;
            var edgeAopp = null;
            var edgeB = null;
            var edgeBopp;
            var boundA;
            
            var boundB;
            if(index < (bound.length - 1)) {
                edgeA = new DDLS.Edge();
                edgeAopp = new DDLS.Edge();
                this._edges.push(edgeA, edgeAopp);
                //this._edges.push(edgeAopp);
                edgeA.setDatas(vertexA,edgeAopp,null,null,isReal,false);
                edgeAopp.setDatas(bound[index].originVertex,edgeA,null,null,isReal,false);
                boundA = bound.slice(index);
                boundA.push(edgeA);
                this.triangulate(boundA,isReal);
            }
            if(index > 2) {
                edgeB = new DDLS.Edge();
                edgeBopp = new DDLS.Edge();
                this._edges.push(edgeB, edgeBopp);
                //this._edges.push(edgeBopp);
                edgeB.setDatas(bound[1].originVertex,edgeBopp,null,null,isReal,false);
                edgeBopp.setDatas(bound[index].originVertex,edgeB,null,null,isReal,false);
                boundB = bound.slice(1,index);
                boundB.push(edgeBopp);
                this.triangulate(boundB,isReal);
            }
            var boundM = [];
            if(index == 2) boundM.push(baseEdge, bound[1], edgeAopp);//boundM = [baseEdge,bound[1],edgeAopp]; 
            else if(index == (bound.length - 1)) boundM.push(baseEdge, edgeB, bound[index]);//boundM = [baseEdge,edgeB,bound[index]]; 
            else boundM.push(baseEdge, edgeB, edgeAopp );//boundM = [baseEdge,edgeB,edgeAopp];
            this.triangulate(boundM,isReal);
        }
    },
    findPositionFromBounds: function(x,y) {
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
    },
    /*debug: function() {
        var i;
        var _g1 = 0;
        var _g = this._vertices.length;
        while(_g1 < _g) {
            var i1 = _g1++;
            DDLS.Debug.trace("-- vertex " + this._vertices[i1].id,{ fileName : "Mesh.hx", lineNumber : 1568, className : "DDLS.Mesh", methodName : "debug"});
            DDLS.Debug.trace("  edge " + this._vertices[i1].edge.id + " - " + (this._vertices[i1].edge).toString(),{ fileName : "Mesh.hx", lineNumber : 1569, className : "DDLS.Mesh", methodName : "debug"});
            DDLS.Debug.trace("  edge isReal: " + (this._vertices[i1].edge.isReal).toString(),{ fileName : "Mesh.hx", lineNumber : 1570, className : "DDLS.Mesh", methodName : "debug"});
        }
        var _g11 = 0;
        var _g2 = this._edges.length;
        while(_g11 < _g2) {
            var i2 = _g11++;
            DDLS.Debug.trace("-- edge " + (this._edges[i2]).toString(),{ fileName : "Mesh.hx", lineNumber : 1573, className : "DDLS.Mesh", methodName : "debug"});
            DDLS.Debug.trace("  isReal " + this._edges[i2].id + " - " + (this._edges[i2].isReal).toString(),{ fileName : "Mesh.hx", lineNumber : 1574, className : "DDLS.Mesh", methodName : "debug"});
            DDLS.Debug.trace("  nextLeftEdge " + (this._edges[i2].nextLeftEdge).toString(),{ fileName : "Mesh.hx", lineNumber : 1575, className : "DDLS.Mesh", methodName : "debug"});
            DDLS.Debug.trace("  oppositeEdge " + (this._edges[i2].oppositeEdge).toString(),{ fileName : "Mesh.hx", lineNumber : 1576, className : "DDLS.Mesh", methodName : "debug"});
        }
    },*/
    compute_Data : function(){
        var data_vertex = [];
        var data_edges = [];
        var vertex;
        var edge;
        var holdingFace;
        var iterVertices;
        iterVertices = new DDLS.FromMeshToVertices();
        iterVertices.fromMesh = this;
        var iterEdges;
        iterEdges = new DDLS.FromVertexToIncomingEdges();
        var dictVerticesDone = new DDLS.Dictionary(1);
        while((vertex = iterVertices.next()) != null) {
            dictVerticesDone.set(vertex,true);
            if(!this.vertexIsInsideAABB(vertex,this)) continue;
            data_vertex.push(vertex.pos.x, vertex.pos.y);
            iterEdges.fromVertex = vertex;
            while((edge = iterEdges.next()) != null){ 
                if(!dictVerticesDone.get(edge.originVertex)){  
                    data_edges = data_edges.concat(edge.getDatas());
                }
            }
        }

        dictVerticesDone.dispose();

        this.AR_vertex = new DDLS_ARRAY_TYPE(data_vertex);
        this.AR_edge = new DDLS_ARRAY_TYPE(data_edges);

        this.data_vertex = null;
        this.data_edges = null;

        
    },
    vertexIsInsideAABB: function(vertex,mesh) {
        if(vertex.pos.x < 0 || vertex.pos.x > mesh.width || vertex.pos.y < 0 || vertex.pos.y > mesh.height) return false; 
        else return true;
    }
};
DDLS.Graph = function() {
    this.id = DDLS.GraphID;
    DDLS.GraphID++;
    this.edge = null;
    this.node = null;
};

DDLS.Graph.prototype = {
    dispose: function() {
        while(this.node != null) this.deleteNode(this.node);
    },
    insertNode: function() {
        var node = new DDLS.GraphNode();
        if(this.node != null) {
            node.next = this.node;
            this.node.prev = node;
        }
        this.node = node;
        return node;
    },
    deleteNode: function(node) {
        while(node.outgoingEdge != null) {
            if(node.outgoingEdge.oppositeEdge != null) this.deleteEdge(node.outgoingEdge.oppositeEdge);
            this.deleteEdge(node.outgoingEdge);
        }
        var otherNode = this.node;
        var incomingEdge;
        while(otherNode != null) {
            incomingEdge = otherNode.successorNodes.get(node);
            if(incomingEdge != null) this.deleteEdge(incomingEdge);
            otherNode = otherNode.next;
        }
        if(this.node == node) {
            if(node.next != null) {
                node.next.prev = null;
                this.node = node.next;
            } else this.node = null;
        } else if(node.next != null) {
            node.prev.next = node.next;
            node.next.prev = node.prev;
        } else node.prev.next = null;
        node.dispose();
    },
    insertEdge: function(fromNode,toNode) {
        if(fromNode.successorNodes.get(toNode) != null) return null;
        var edge = new DDLS.GraphEdge();
        if(this.edge != null) {
            this.edge.prev = edge;
            edge.next = this.edge;
        }
        this.edge = edge;
        edge.sourceNode = fromNode;
        edge.destinationNode = toNode;
       
        fromNode.successorNodes.set(toNode,edge);
        if(fromNode.outgoingEdge != null) {
            fromNode.outgoingEdge.rotPrevEdge = edge;
            edge.rotNextEdge = fromNode.outgoingEdge;
            fromNode.outgoingEdge = edge;
        } else fromNode.outgoingEdge = edge;
        var oppositeEdge = toNode.successorNodes.get(fromNode);
        if(oppositeEdge != null) {
            edge.oppositeEdge = oppositeEdge;
            oppositeEdge.oppositeEdge = edge;
        }
        return edge;
    },
    deleteEdge: function(edge) {
        if(this.edge == edge) {
            if(edge.next != null) {
                edge.next.prev = null;
                this.edge = edge.next;
            } else this.edge = null;
        } else if(edge.next != null) {
            edge.prev.next = edge.next;
            edge.next.prev = edge.prev;
        } else edge.prev.next = null;
        if(edge.sourceNode.outgoingEdge == edge) {
            if(edge.rotNextEdge != null) {
                edge.rotNextEdge.rotPrevEdge = null;
                edge.sourceNode.outgoingEdge = edge.rotNextEdge;
            } else edge.sourceNode.outgoingEdge = null;
        } else if(edge.rotNextEdge != null) {
            edge.rotPrevEdge.rotNextEdge = edge.rotNextEdge;
            edge.rotNextEdge.rotPrevEdge = edge.rotPrevEdge;
        } else edge.rotPrevEdge.rotNextEdge = null;
        edge.dispose();
    }
};

// EDGE

DDLS.GraphEdge = function() {
    this.id = DDLS.GraphEdgeID;
    DDLS.GraphEdgeID++;
    this.next = null;
    this.prev = null;
    this.rotPrevEdge = null;
    this.rotNextEdge = null;
    this.oppositeEdge = null;
    this.sourceNode = null;
    this.destinationNode = null;
    this.data = null;
};
DDLS.GraphEdge.prototype = {
    dispose: function() {
    }
};

// NODE

DDLS.GraphNode = function() {
    this.id = DDLS.GraphNodeID;
    DDLS.GraphNodeID++;
    this.successorNodes = new DDLS.Dictionary(1);
    this.prev = null;
    this.next = null;
    this.outgoingEdge = null;
    this.data = null;
};
DDLS.GraphNode.prototype = {
    dispose: function() {
        this.successorNodes.dispose();
        this.prev = null;
        this.next = null;
        this.outgoingEdge = null;
        this.successorNodes = null;
        this.data = null;
    }
};

// IMAGE DATA

DDLS.fromImageData = function(image) {
    var pixels = new DDLS.PixelsData(image.width,image.height);
    var data = image.data;
    var l = data.byteLength, n=0, i=0;
    while(n < l) {
        i = n++;
        pixels.bytes[i] = data[i] & 255;
    }
    return pixels;
};

// PIXEL DATA

DDLS.PixelsData = function(w,h) {
    this.length = w * h;
    this.bytes = new DDLS_ARRAY_TYPE(this.length << 2);
    this.width = w;
    this.height = h;
};

// IMG LOADER

DDLS.ImageLoader = function(imageNames,loaded_) {
    this.images = new DDLS.Dictionary(2);
    this.loaded = loaded_;
    this.count = imageNames.length;
    var _g = 0;
    while(_g < imageNames.length) {
        var name = imageNames[_g];
        ++_g;
        this.load(name);
    }
};

DDLS.ImageLoader.prototype = {
    load: function(img) {
        var image;
        var _this = window.document;
        image = _this.createElement("img");
        image.style.cssText = 'position:absolute;';
        image.onload = function(){
            this.store( image, img.split("/").pop() );
        }.bind(this);
        image.src = img;
    },
    store: function(image,name) {
        this.count--;
        DDLS.Log("store " + name + " " + this.count);
        this.images.set(name,image);
        if(this.count == 0) this.loaded();
    }
};

DDLS.EdgeData = function() {};
DDLS.NodeData = function() {};

DDLS.Potrace = {};

//DDLS.Potrace.MAX_INT = 2147483647;
DDLS.Potrace.maxDistance = 1;

DDLS.getWhite = function( bmpData, col, row ){
    //col = col | 0;
    //row = row | 0;
    if(col>bmpData.width || col<0) return false;
    if(row>bmpData.height || row<0) return false;
    //var p = row * bmpData.width + col << 2;
    var p = row * (bmpData.width*4) + (col*4);
    //var p = (row-1) * (bmpData.width*4) + ((col-1)*4);
    //var p = row * (bmpData.width) + (col*4);
    var r = bmpData.bytes[p+0];
    var g = bmpData.bytes[p+1];
    var b = bmpData.bytes[p+2];
    var a = bmpData.bytes[p+3];

    if( a === 0 ) return true;
    if( r === 255 && g === 255 && b === 255 ) return true;

    return false;
};

/*DDLS.getPixel = function( bmpData, col, row ){
    //col = col | 0;
    //row = row | 0;
    if(col>bmpData.width || col<0) return 0x000000;
    if(row>bmpData.height || row<0) return 0x000000;
    //var p = row * bmpData.width + col << 2;
    var p = row * (bmpData.width*4) + (col*4);
    //var p = (row-1) * (bmpData.width*4) + ((col-1)*4);
    //var p = row * (bmpData.width) + (col*4);
    var r = bmpData.bytes[p+0];// << 16;
    var g = bmpData.bytes[p+1];// << 8;
    var b = bmpData.bytes[p+2];
    var a = bmpData.bytes[p+3];

   // console.log(bmpData.bytes[p+0])
   // var hex = '0x'+('000000'+ (r|g|b).toString(16) ).substr(-6);
    if( a === 0 ) return hex = 0xFFFFFF;
    //return '0x' + ( '000000' + ( ( r ) << 16 ^ ( g ) << 8 ^ ( b ) << 0 ).toString( 16 ) ).slice( - 6 );

    return  r << 16 ^ g << 8 ^ b << 0; //).toString( 16 ) ).slice( - 6 );
    
   // return hex;
};*/

DDLS.Potrace.buildShapes = function( bmpData, debugBmp, debugShape ) {

    var shapes = [];
    //var dictPixelsDone = new DDLS.StringMap();
    var dictPixelsDone = new DDLS.Dictionary(2);

    var r = bmpData.height-1;
    var c = bmpData.width-1;

    for (var row = 1; row < r; row++){
        for (var col = 0 ; col < c; col++){
            //console.log( DDLS.getPixel(bmpData, col, row) )
            if ( DDLS.getWhite(bmpData, col, row) && !DDLS.getWhite( bmpData, col+1, row ) ){
            //if ( DDLS.getPixel(bmpData, col, row) === 0xFFFFFF && DDLS.getPixel( bmpData, col+1, row ) < 0xFFFFFF ){
                if (!dictPixelsDone.get( (col+1) + "_" + row) )//[(col+1) + "_" + row])
                    shapes.push( DDLS.Potrace.buildShape( bmpData, row, col + 1 , dictPixelsDone, debugBmp, debugShape ));
                    //shapes.push( buildShape(bmpData, row, col+1, dictPixelsDone, debugBmp, debugShape) );
            }
        }
    }





   /* var _g1 = 1;
    var _g = bmpData.height - 1;
    while(_g1 < _g) {
        var row = _g1++;
        var _g3 = 0;
        var _g2 = bmpData.width - 1;
        while(_g3 < _g2) {
            var col = _g3++;
            if( DDLS.getPixel(bmpData, col, row) == 0xFFFFFF && DDLS.getPixel(bmpData, col+1, row) < 0xFFFFFF){
            //if( DDLS.getPixel(bmpData, col, row) == 0xFFFFFF && DDLS.getPixel(bmpData, col, row) < 0xFFFFFF){
                if( !dictPixelsDone.get( (col+1) + "_" + row) ) shapes.push( DDLS.Potrace.buildShape( bmpData, row, col + 1 , dictPixelsDone, debugBmp, debugShape ));

                //if( !dictPixelsDone.get( (col) + "_" + row) ) shapes.push( DDLS.Potrace.buildShape( bmpData, row, col , dictPixelsDone, debugBmp, debugShape ));
            }



            /*if((function(_this) {
                var _r;
                var pos = row * bmpData.width + col << 2;
                var r = bmpData.bytes[pos + 1] << 16;
                var g = bmpData.bytes[pos + 2] << 8;
                var b = bmpData.bytes[pos + 3];
                _r = r | g | b;
                return _r;
            }(this)) == 16777215 && (function(_this) {
                var _r;
                var pos1 = row * bmpData.width + (col + 1) << 2;
                var r1 = bmpData.bytes[pos1 + 1] << 16;
                var g1 = bmpData.bytes[pos1 + 2] << 8;
                var b1 = bmpData.bytes[pos1 + 3];
                _r = r1 | g1 | b1;
                return _r;
            }(this)) < 16777215) {
                if(!dictPixelsDone.get(col + 1 + "_" + row)) shapes.push(DDLS.Potrace.buildShape(bmpData,row,col + 1,dictPixelsDone,debugBmp,debugShape));
            }*/
     //   }
    //}

    dictPixelsDone.dispose();
    //console.log('shapes done');
    return shapes;
};



DDLS.Potrace.buildShape = function( bmpData, fromPixelRow, fromPixelCol, dictPixelsDone, debugBmp, debugShape ) {
    var newX = fromPixelCol;
    var newY = fromPixelRow;
    var path = [newX,newY];
    dictPixelsDone.set(newX + "_" + newY, true);

    var w = bmpData.width;
    var h = bmpData.height;
    //true;
    var curDir = new DDLS.Point(0,1);
    var newDir = new DDLS.Point();
    var newPixelRow;
    var newPixelCol;
    var count = -1;
    while(true) {
        /*if(debugBmp != null) {
            var pos = fromPixelRow * debugBmp.width + fromPixelCol << 2;
            var a = 255;
            var r = 255;
            var g = 0;
            var b = 0;
            debugBmp.bytes[pos] = a & 255;
            debugBmp.bytes[pos + 1] = r & 255;
            debugBmp.bytes[pos + 2] = g & 255;
            debugBmp.bytes[pos + 3] = b & 255;
        }*/

        // take the pixel at right
        newPixelRow = fromPixelRow + curDir.x + curDir.y;// | 0;
        newPixelCol = fromPixelCol + curDir.x - curDir.y;// | 0;

        //if(newPixelCol<0) break

       // newPixelCol = newPixelCol > w ? w : newPixelCol;
       // newPixelRow = newPixelRow > h ? h : newPixelRow;

      //  newPixelCol = newPixelCol < 0 ? 1 : newPixelCol;
       // newPixelRow = newPixelRow < 0 ? 1 : newPixelRow;

        //console.log(w, h, newPixelRow, newPixelCol)

  

        // if the pixel is not white
        if( !DDLS.getWhite( bmpData, newPixelCol, newPixelRow ) ){
        //if( DDLS.getPixel( bmpData, newPixelCol, newPixelRow ) < 0xFFFFFF ){

            // turn the direction right
            newDir.x = -curDir.y;
            newDir.y = curDir.x;

        } else {// if the pixel is white

            // take the pixel straight
            newPixelRow = fromPixelRow + curDir.y;// | 0;
            newPixelCol = fromPixelCol + curDir.x;// | 0;

            //if(newPixelCol<0) break

            //newPixelCol = newPixelCol < 0 ? 1 : newPixelCol;
            //newPixelRow = newPixelRow < 0 ? 1 : newPixelRow;

         //   newPixelCol = newPixelCol > w ? w : newPixelCol;
          //  newPixelRow = newPixelRow > h ? h : newPixelRow;

            // if the pixel is not white
            if( !DDLS.getWhite( bmpData, newPixelCol, newPixelRow ) ){
            //if( DDLS.getPixel( bmpData, newPixelCol, newPixelRow ) < 0xFFFFFF ){
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



        /*if((function(_this) {
            var _r;
            var pos1 = newPixelRow * bmpData.width + newPixelCol << 2;
            var r1 = bmpData.bytes[pos1 + 1] << 16;
            var g1 = bmpData.bytes[pos1 + 2] << 8;
            var b1 = bmpData.bytes[pos1 + 3];
            _r = r1 | g1 | b1;
            return _r;
        }(this)) < 16777215) {
            newDir.x = -curDir.y;
            newDir.y = curDir.x;
        } else {
            newPixelRow = fromPixelRow + curDir.y | 0;
            newPixelCol = fromPixelCol + curDir.x | 0;
            if((function(_this) {
                var _r;
                var pos2 = newPixelRow * bmpData.width + newPixelCol << 2;
                var r2 = bmpData.bytes[pos2 + 1] << 16;
                var g2 = bmpData.bytes[pos2 + 2] << 8;
                var b2 = bmpData.bytes[pos2 + 3];
                _r = r2 | g2 | b2;
                return _r;
            }(this)) < 16777215) {
                newDir.x = curDir.x;
                newDir.y = curDir.y;
            } else {
                newPixelRow = fromPixelRow;
                newPixelCol = fromPixelCol;
                newDir.x = curDir.y;
                newDir.y = -curDir.x;
            }
        }
        newX = newX + curDir.x;
        newY = newY + curDir.y;

        if(newX == path[0] && newY == path[1]) break; 
        else {
            path.push(newX);
            path.push(newY);
            dictPixelsDone.set(newX + "_" + newY, true);
            //true;
            fromPixelRow = newPixelRow;
            fromPixelCol = newPixelCol;
            curDir.x = newDir.x;
            curDir.y = newDir.y;
        }
        count--;
        if(count == 0) break;*/
    }
    /*if(debugShape != null) {
        debugShape.graphics.lineStyle(0.5,65280,1);
        debugShape.graphics.moveTo(path[0],path[1]);
        var i = 2;
        while(i < path.length) {
            debugShape.graphics.lineTo(path[i],path[i + 1]);
            i += 2;
        }
        debugShape.graphics.lineTo(path[0],path[1]);
    }*/
    //console.log('shape done');
    return path;
};

DDLS.Potrace.buildGraph = function( shape ) {

    var i;
    var graph = new DDLS.Graph();
    var node;
    i = 0;
    while(i < shape.length) {
        node = graph.insertNode();
        node.data = new DDLS.NodeData();
        node.data.index = i;
        node.data.point = new DDLS.Point(shape[i],shape[i + 1]);
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
                distSqrd = DDLS.Geom2D.distanceSquaredPointToSegment(subNode.data.point,node1.data.point,node2.data.point);
                if(distSqrd < 0) distSqrd = 0;
                if(distSqrd >= DDLS.Potrace.maxDistance) {
                    isValid = false;
                    break;
                }
                count++;
                sumDistSqrd += distSqrd;
                if(subNode.next != null) subNode = subNode.next; else subNode = graph.node;
            }
            if(!isValid) break;
            edge = graph.insertEdge(node1,node2);
            edgeData = new DDLS.EdgeData();
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
};

DDLS.Potrace.buildPolygon = function(graph,debugShape) {
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
            score = edge.data.nodesCount - edge.data.length * DDLS.sqrt(edge.data.sumDistancesSquared / edge.data.nodesCount);
            if(score > higherScore) {
                higherScore = score;
                lowerScoreEdge = edge;
            }
            edge = edge.rotNextEdge;
        }
        currNode = lowerScoreEdge.destinationNode;
    }


    p1 = new DDLS.Point(polygon[polygon.length - 2],polygon[polygon.length - 1]);
    p2 = new DDLS.Point(polygon[0],polygon[1]);
    p3 = new DDLS.Point(polygon[2],polygon[3]);

    if(DDLS.Geom2D.getDirection(p1,p2,p3) == 0) {
        polygon.shift();
        polygon.shift();
    }

    /*if(debugShape != null) {
        debugShape.graphics.lineStyle(0.5,255);
        debugShape.graphics.moveTo(polygon[0],polygon[1]);
        var i = 2;
        while(i < polygon.length) {
            debugShape.graphics.lineTo(polygon[i],polygon[i + 1]);
            i += 2;
        }
        debugShape.graphics.lineTo(polygon[0],polygon[1]);
    }*/
    //console.log('polygone done');
    return polygon;
};
DDLS.ShapeSimplifier = function(coords,epsilon) {
    epsilon = epsilon || 1;
    var len = coords.length;
    //DDLS.Debug.assertFalse((len & 1) != 0,"Wrong size",{ fileName : "ShapeSimplifier.hx", lineNumber : 18, className : "DDLS.ShapeSimplifier", methodName : "simplify"});
    if(len <= 4) return [].concat(coords);
    var firstPointX = coords[0];
    var firstPointY = coords[1];
    var lastPointX = coords[len - 2];
    var lastPointY = coords[len - 1];
    var index = -1;
    var dist = 0.;
    var _g1 = 1;
    var _g = len >> 1;
    while(_g1 < _g) {
        var i = _g1++;
        var currDist = DDLS.Geom2D.distanceSquaredPointToSegment(new DDLS.Point(coords[i << 1],coords[(i << 1) + 1]),new DDLS.Point(firstPointX,firstPointY),new DDLS.Point(lastPointX,lastPointY));
        //var currDist = DDLS.Geom2D.distanceSquaredPointToSegment(coords[i << 1],coords[(i << 1) + 1],firstPointX,firstPointY,lastPointX,lastPointY);
        if(currDist > dist) {
            dist = currDist;
            index = i;
        }
    }
    if(dist > epsilon * epsilon) {
        var l1 = coords.slice(0,(index << 1) + 2);
        var l2 = coords.slice(index << 1);
        var r1 = DDLS.ShapeSimplifier(l1,epsilon);
        var r2 = DDLS.ShapeSimplifier(l2,epsilon);
        var rs = r1.slice(0,r1.length - 2).concat(r2);
        return rs;
    } else return [firstPointX,firstPointY,lastPointX,lastPointY];
};
DDLS.AStar = function() {
    this.iterEdge = new DDLS.FromFaceToInnerEdges();
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

DDLS.AStar.prototype = {
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
    findPath: function(from, target, resultListFaces, resultListEdges) {
        this.sortedOpenedFaces = [];
        this.closedFaces = new DDLS.Dictionary(1);
        this.openedFaces = new DDLS.Dictionary(1);
        this.entryEdges = new DDLS.Dictionary(1);
        this.predecessor = new DDLS.Dictionary(1);
        this.entryX = new DDLS.Dictionary(1);
        this.entryY = new DDLS.Dictionary(1);
        this.scoreF = new DDLS.Dictionary(1);
        this.scoreG = new DDLS.Dictionary(1);
        this.scoreH = new DDLS.Dictionary(1);
        

        var loc, locEdge, locVertex, distance, p1, p2, p3;

        loc = DDLS.Geom2D.locatePosition(from, this.mesh);
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
        loc = DDLS.Geom2D.locatePosition(target, this.mesh);
        if ( loc.type == 0 ){
            locVertex = loc;
            this.toFace = locVertex.edge.leftFace;
        }else if ( loc.type == 1 ){
            locEdge = loc;
            this.toFace = locEdge.leftFace;
        }else{
            this.toFace = loc;
        }


        /*loc = DDLS.Geom2D.locatePosition(fromX,fromY,this.mesh);
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
        loc = DDLS.Geom2D.locatePosition(toX,toY,this.mesh);
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

        var dist = DDLS.SquaredSqrt(target.x - from.x, target.y - from.y);

        this.scoreH.set(this.fromFace,dist);
        this.scoreF.set(this.fromFace,dist);

        var innerEdge, neighbourFace, f, g, h;
        var fromPoint = new DDLS.Point();
        var entryPoint = new DDLS.Point();
        var distancePoint = new DDLS.Point();
        var fillDatas = false;
        while(true) {
            if(this.sortedOpenedFaces.length == 0) {
                DDLS.Log("AStar no path found");
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
                    h = distancePoint.get_length();
                    distancePoint.x = fromPoint.x - entryPoint.x;
                    distancePoint.y = fromPoint.y - entryPoint.y;
                    g = this.scoreG.get(this.curFace) + distancePoint.get_length();
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
    isWalkableByRadius: function(fromEdge,throughFace,toEdge) {
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
            distSquared = DDLS.Squared(vC.pos.x - vA.pos.x, vC.pos.y - vA.pos.y);
            if(distSquared >= this.diameterSquared) return true;
            else return false;
        }

        // if we have a right or obtuse angle on CBA
        dot = (vC.pos.x - vB.pos.x) * (vA.pos.x - vB.pos.x) + (vC.pos.y - vB.pos.y) * (vA.pos.y - vB.pos.y);
        if(dot <= 0) {
            // we compare length of BC with radius
            distSquared = DDLS.Squared(vC.pos.x - vB.pos.x, vC.pos.y - vB.pos.y);
            if(distSquared >= this.diameterSquared) return true;
            else return false;
        }
        // we identify the adjacent edge (facing pivot vertex)
        if(throughFace.edge != fromEdge && throughFace.edge.oppositeEdge != fromEdge && throughFace.edge != toEdge && throughFace.edge.oppositeEdge != toEdge) adjEdge = throughFace.edge; 
        else if(throughFace.edge.nextLeftEdge != fromEdge && throughFace.edge.nextLeftEdge.oppositeEdge != fromEdge && throughFace.edge.nextLeftEdge != toEdge && throughFace.edge.nextLeftEdge.oppositeEdge != toEdge) adjEdge = throughFace.edge.nextLeftEdge; 
        else adjEdge = throughFace.edge.prevLeftEdge;

        // if the adjacent edge is constrained, we check the distance of orthognaly projected
        if(adjEdge.isConstrained) {
            var proj = new DDLS.Point(vC.pos.x,vC.pos.y);
            DDLS.Geom2D.projectOrthogonaly(proj,adjEdge);
            distSquared = DDLS.Squared(proj.x - vC.pos.x, proj.y - vC.pos.y);
            if(distSquared >= this.diameterSquared) return true; 
            else return false;
        } else {// if the adjacent is not constrained
            var distSquaredA = DDLS.Squared(vC.pos.x - vA.pos.x, vC.pos.y - vA.pos.y);
            var distSquaredB = DDLS.Squared(vC.pos.x - vB.pos.x, vC.pos.y - vB.pos.y);
            if(distSquaredA < this.diameterSquared || distSquaredB < this.diameterSquared) return false; 
            else {
                var vFaceToCheck = [];
                var vFaceIsFromEdge = [];
                var facesDone = new DDLS.Dictionary(1);
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
                    if(!facesDone.get(nextFaceA) && DDLS.Geom2D.distanceSquaredVertexToEdge(vC,currEdgeA) < this.diameterSquared) {
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
                    if(!facesDone.get(nextFaceB) && DDLS.Geom2D.distanceSquaredVertexToEdge(vC,currEdgeB) < this.diameterSquared) {
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
DDLS.EntityAI = function(x, y, r) {
    this.path = [];
    this.position = new DDLS.Point(x || 0, y || 0);
    this.direction = new DDLS.Point(1,0);
    this.radius = r || 10;
    //this.radiusSquared = 10*10;
    //this.x = this.y = 0;
    //this.dirNormX = 1;
    //this.dirNormY = 0;
    this.angle = 0;
    this.angleFOV = 60;
    this.radiusFOV = 0;
    //this._radiusSquaredFOV = 0;

    /*Object.defineProperty(this, 'radiusFOV', {
        get: function() { return this._radiusFOV; },
        set: function(value) { 
            this._radiusFOV = value;
            this._radiusSquaredFOV = this._radiusFOV*this._radiusFOV; 
        }
    });

    Object.defineProperty(this, 'radius', {
        get: function() { return this._radius; },
        set: function(value) { 
            this._radius = value;
            this.radiusSquared = this._radius*this._radius; 
        }
    });*/

    /*Object.defineProperty(this, 'approximateObject', {
        get: function() {
            this._approximateObject.matrix.identity().translate(this.x,this.y);
            return this._approximateObject; 
        }
    });*/
};

DDLS.EntityAI.prototype = {
    /*get_position:function(){
        return new DDLS.Point(this.x, this.y);
    },
    position:function(x, y){
        this.x = x || 0;
        this.y = y || 0;
        this.path = [];
    },*/
    /*buildApproximation: function() {
        this._approximateObject = new DDLS.Object();
        this._approximateObject.matrix.translate(this.x,this.y);
        var coordinates = [];
        this._approximateObject.coordinates = coordinates;
        if(this._radius == 0) return;
        var n = DDLS.EntityAI.NUM_SEGMENTS;
        var ndiv = 1/n;
        var _g = 0;
        while(_g < n) {
            var i = _g++;
            coordinates.push(this._radius * DDLS.cos(DDLS.TwoPI * i * ndiv));
            coordinates.push(this._radius * DDLS.sin(DDLS.TwoPI * i * ndiv));
            coordinates.push(this._radius * DDLS.cos(DDLS.TwoPI * (i + 1) * ndiv));
            coordinates.push(this._radius * DDLS.sin(DDLS.TwoPI * (i + 1) * ndiv));
        }
    },
    get_approximateObject: function() {
        this._approximateObject.matrix.identity().translate(this.x,this.y);
        return this._approximateObject;
    }*/
};

//DDLS.EntityAI.NUM_SEGMENTS = 6;
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
DDLS.PathFinder = function() {
    this.astar = new DDLS.AStar();
    this.funnel = new DDLS.Funnel();
    this.listFaces = [];
    this.listEdges = [];
    this._mesh = null;
    this.entity = null;

    Object.defineProperty(this, 'mesh', {
        get: function() { return this._mesh; },
        set: function(value) { this._mesh = value; this.astar.mesh = value; }
    });
};

DDLS.PathFinder.prototype = {
    dispose: function() {
        this._mesh = null;
        this.astar.dispose();
        this.astar = null;
        this.funnel.dispose();
        this.funnel = null;
        this.listEdges = null;
        this.listFaces = null;
    },
    findPath: function(target,resultPath) {
        //resultPath = [];
        resultPath.splice(0,resultPath.length);
        //DDLS.Debug.assertFalse(this._mesh == null,"Mesh missing",{ fileName : "PathFinder.hx", lineNumber : 51, className : "DDLS.PathFinder", methodName : "findPath"});
        //DDLS.Debug.assertFalse(this.entity == null,"Entity missing",{ fileName : "PathFinder.hx", lineNumber : 52, className : "DDLS.PathFinder", methodName : "findPath"});
        if(DDLS.Geom2D.isCircleIntersectingAnyConstraint(target,this.entity.radius,this._mesh)) return;
        this.astar.radius = this.entity.radius;
        this.funnel.radius = this.entity.radius;
        this.listFaces.splice(0,this.listFaces.length);
        this.listEdges.splice(0,this.listEdges.length);
        var start = this.entity.position;
        this.astar.findPath(start,target,this.listFaces,this.listEdges);
        if(this.listFaces.length == 0) {
            DDLS.Log("PathFinder listFaces.length == 0");
            return;
        }
        this.funnel.findPath(start,target,this.listFaces,this.listEdges,resultPath);
    }
};
DDLS.FieldOfView = function(entity, mesh) {
    this.entity = entity || null;
    this.mesh = mesh || null;
    //this._debug = false;

   
};

DDLS.FieldOfView.prototype = {
    isInField:function(targetEntity){
        if (!this.mesh) return;//throw new Error("Mesh missing");
        if (!this.entity) return;//throw new Error("From entity missing");

        var pos = this.entity.position;
        var direction = this.entity.direction;
        var target = targetEntity.position;
        
        var radius = this.entity.radiusFOV;
        var angle = this.entity.angleFOV;
        
        //var targetX = targetEntity.x;
        //var targetY = targetEntity.y;
        var targetRadius = targetEntity.radius
        
        var distSquared = DDLS.Squared(pos.x-target.x, pos.y-target.y);//(posX-targetX)*(posX-targetX) + (posY-targetY)*(posY-targetY);
        
        // if target is completely outside field radius
        if ( distSquared >= (radius + targetRadius)*(radius + targetRadius) ){
            //trace("target is completely outside field radius");
            return false;
        }
        
        if (distSquared < targetRadius*targetRadius){
            //trace("degenerate case if the field center is inside the target");
            return true;
        }
        
        //var leftTargetX, leftTargetY, rightTargetX, rightTargetY, leftTargetInField, rightTargetInField;

        var leftTarget = new DDLS.Point();
        var rightTarget = new DDLS.Point();
        var leftTargetInField, rightTargetInField;
        
        // we consider the 2 cicrles intersections
        var  result = [];
        if ( DDLS.Geom2D.intersections2Circles(pos, radius, target, targetRadius, result) ){
            leftTarget.set(result[0], result[1]);
            rightTarget.set(result[2], result[3]);
        }

        var mid = pos.clone().add(target).mul(0.5);
        
        if( result.length == 0 || DDLS.Squared(mid.x-target.x, mid.y-target.y) < DDLS.Squared(mid.x-leftTarget.x, mid.y-leftTarget.y) ){
            // we consider the 2 tangents from field center to target
            result.splice(0, result.length);
            DDLS.Geom2D.tangentsPointToCircle(pos, target, targetRadius, result);
            leftTarget.set(result[0], result[1]);
            rightTarget.set(result[2], result[3]);
        }
        
        /*if (this._debug){
            this._debug.graphics.lineStyle(1, 0x0000FF);
            this._debug.graphics.drawCircle(leftTargetX, leftTargetY, 2);
            this._debug.graphics.lineStyle(1, 0xFF0000);
            this._debug.graphics.drawCircle(rightTargetX, rightTargetY, 2);
        }*/
        
        var dotProdMin = DDLS.cos(this.entity.angleFOV*0.5);

        // we compare the dots for the left point
        var left = leftTarget.clone().sub(pos);
        var lengthLeft = DDLS.sqrt( left.x*left.x + left.y*left.y );
        var dotLeft = (left.x/lengthLeft)*direction.x + (left.y/lengthLeft)*direction.y;
        // if the left point is in field
        if (dotLeft > dotProdMin) leftTargetInField = true;
        else leftTargetInField = false;
        
        
        // we compare the dots for the right point
        var right = rightTarget.clone().sub(pos);
        var lengthRight = DDLS.sqrt( right.x*right.x + right.y*right.y );
        var dotRight = (right.x/lengthRight)*direction.x + (right.y/lengthRight)*direction.y;
        // if the right point is in field
        if (dotRight > dotProdMin) rightTargetInField = true;
        else rightTargetInField = false;
        
        
        // if the left and right points are outside field
        if (!leftTargetInField && !rightTargetInField){
            var pdir = pos.clone().add(direction);
            // we must check if the Left/right points are on 2 different sides
            if ( DDLS.Geom2D.getDirection(pos, pdir, leftTarget) == 1 && DDLS.Geom2D.getDirection(pos, pdir, rightTarget) == -1 ){
                //trace("the Left/right points are on 2 different sides"); 
            }else{
                // we abort : target is not in field
                return false;
            }
        }
        
        // we init the window
        if (!leftTargetInField || !rightTargetInField){
            var p = new DDLS.Point();
            var dirAngle;
            dirAngle = DDLS.atan2(direction.y, direction.x);
            if ( !leftTargetInField ){
                var leftField = new DDLS.Point(DDLS.cos(dirAngle - angle*0.5), DDLS.sin(dirAngle - angle*0.5)).add(pos);
                DDLS.Geom2D.intersections2segments(pos, leftField , leftTarget, rightTarget, p, null, true);
                /*if (this._debug){
                    this._debug.graphics.lineStyle(1, 0x0000FF);
                    this._debug.graphics.drawCircle(p.x, p.y, 2);
                }*/
                leftTarget = p.clone();
            }
            if ( !rightTargetInField ){
                var rightField = new DDLS.Point(DDLS.cos(dirAngle + angle*0.5), DDLS.sin(dirAngle + angle*0.5)).add(pos);
                DDLS.Geom2D.intersections2segments(pos, rightField , leftTarget, rightTarget, p, null, true);
                /*if (this._debug){
                    this._debug.graphics.lineStyle(1, 0xFF0000);
                    this._debug.graphics.drawCircle(p.x, p.y, 2);
                }*/
                rightTarget = p.clone();
            }
        }
        
        /*if (this._debug){
            this._debug.graphics.lineStyle(1, 0x000000);
            this._debug.graphics.moveTo(posX, posY);
            this._debug.graphics.lineTo(leftTargetX, leftTargetY);
            this._debug.graphics.lineTo(rightTargetX, rightTargetY);
            this._debug.graphics.lineTo(posX, posY);
        }*/
        // now we have a triangle called the window defined by: posX, posY, rightTargetX, rightTargetY, leftTargetX, leftTargetY
        
        // we set a dictionnary of faces done
        var facesDone = new DDLS.Dictionary();
        // we set a dictionnary of edges done
        var edgesDone = new DDLS.Dictionary();
        // we set the window wall
        var wall = [];
        // we localize the field center
        var startObj = DDLS.Geom2D.locatePosition(pos, this.mesh);
        var startFace;

        if ( startObj.type == 2 ) startFace = startObj;
        else if ( startObj.type == 1  ) startFace = startObj.leftFace;
        else if ( startObj.type == 0  ) startFace = startObj.edge.leftFace;
        
        
        // we put the face where the field center is lying in open list
        var openFacesList = [];
        var openFaces = new DDLS.Dictionary();
        openFacesList.push(startFace);
        openFaces[startFace] = true;
        
        var currentFace, currentEdge, s1, s2;
        var p1 = new DDLS.Point();
        var p2 = new DDLS.Point();
        var param1, param2, i, index1, index2;
        var params = [];
        var edges = [];
        // we iterate as long as we have new open facess
        while ( openFacesList.length > 0 ){
            // we pop the 1st open face: current face
            currentFace = openFacesList.shift();
            openFaces.set(currentFace, null);
            facesDone.set(currentFace, true);
            
            // for each non-done edges from the current face
            currentEdge = currentFace.edge;
            if ( !edgesDone.get(currentEdge) && !edgesDone.get(currentEdge.oppositeEdge) ){
                edges.push(currentEdge);
                edgesDone.set(currentEdge, true);
            }
            currentEdge = currentEdge.nextLeftEdge;
            if ( !edgesDone.get(currentEdge) && !edgesDone.get(currentEdge.oppositeEdge) ){
                edges.push(currentEdge);
                edgesDone.set(currentEdge, true);
            }
            currentEdge = currentEdge.nextLeftEdge;
            if ( !edgesDone.get(currentEdge) && !edgesDone.get(currentEdge.oppositeEdge) ){
                edges.push(currentEdge);
                edgesDone.set(currentEdge, true);
            }
            
            while (edges.length > 0){
                currentEdge = edges.pop();
                
                // if the edge overlap (interects or lies inside) the window
                s1 = currentEdge.originVertex.pos;
                s2 = currentEdge.destinationVertex.pos;
                if ( DDLS.Geom2D.clipSegmentByTriangle(s1.x, s1.y, s2.x, s2.y, pos.x, pos.y, rightTarget.x, rightTarget.y, leftTarget.x, leftTarget.y, p1, p2) ){
                    // if the edge if constrained
                    if ( currentEdge.isConstrained ){
                        /*if (this._debug){
                            this._debug.graphics.lineStyle(6, 0xFFFF00);
                            this._debug.graphics.moveTo(p1.x, p1.y);
                            this._debug.graphics.lineTo(p2.x, p2.y);
                        }*/
                        
                        // we project the constrained edge on the wall
                        params.splice(0, params.length);
                        DDLS.Geom2D.intersections2segments(pos, p1, leftTarget, rightTarget, null, params, true);
                        DDLS.Geom2D.intersections2segments(pos, p2, leftTarget, rightTarget, null, params, true);
                        param1 = params[1];
                        param2 = params[3];
                        if ( param2 < param1 ){
                            param1 = param2;
                            param2 = params[1];
                        }
                        /*if (_debug)
                        {
                            _debug.graphics.lineStyle(3, 0x00FFFF);
                            _debug.graphics.moveTo(leftTargetX + param1*(rightTargetX-leftTargetX), leftTargetY + param1*(rightTargetY-leftTargetY));
                            _debug.graphics.lineTo(leftTargetX + param2*(rightTargetX-leftTargetX), leftTargetY + param2*(rightTargetY-leftTargetY));
                        }*/
                        
                        // we sum it to the window wall
                        for (i=wall.length-1 ; i>=0 ; i--){
                            if ( param2 >= wall[i] ) break;
                        }
                        index2 = i+1;
                        if (index2 % 2 == 0)
                            wall.splice(index2, 0, param2);
                        
                        for (i=0 ; i<wall.length ; i++){
                            if ( param1 <= wall[i] ) break;
                        }
                        index1 = i;
                        if (index1 % 2 == 0){
                            wall.splice(index1, 0, param1);
                            index2++;
                        }
                        else{
                            index1--;
                        }
                        
                        wall.splice( index1+1, index2-index1-1);
                        
                        // if the window is totally covered, we stop and return false
                        if ( wall.length == 2 && -DDLS.EPSILON < wall[0] && wall[0] < DDLS.EPSILON && 1-DDLS.EPSILON < wall[1] && wall[1] < 1+DDLS.EPSILON ) return false;
                        
                    }
                    
                    // if the adjacent face is neither in open list nor in faces done dictionnary
                    currentFace = currentEdge.rightFace;
                    if (!openFaces.get(currentFace) && !facesDone.get(currentFace)){
                        // we add it in open list
                        openFacesList.push(currentFace);
                        openFaces.set(currentFace, true);
                    }
                }
            }
        }
        
        /*if (this._debug){
            this._debug.graphics.lineStyle(3, 0x00FFFF);

            for (i=0 ; i<wall.length ; i+=2){
                this._debug.graphics.moveTo(leftTargetX + wall[i]*(rightTargetX-leftTargetX), leftTargetY + wall[i]*(rightTargetY-leftTargetY));
                this._debug.graphics.lineTo(leftTargetX + wall[i+1]*(rightTargetX-leftTargetX), leftTargetY + wall[i+1]*(rightTargetY-leftTargetY));
            }
        }*/
        // if the window is totally covered, we stop and return false
        /*if ( wall.length == 2
            && -QEConstants.EPSILON < wall[0] && wall[0] < QEConstants.EPSILON
            && 1-QEConstants.EPSILON < wall[1] && wall[1] < 1+QEConstants.EPSILON )
        {
            return false;
        }
        trace(wall);*/
        
        return true;
    }

}
DDLS.LinearPathSampler = function() {
    this.entity = null;
    this._path = null;
    this._samplingDistanceSquared = 1;
    this._samplingDistance = 1;
    this._preCompX = [];
    this._preCompY = [];
    this.pos = new DDLS.Point();
    this.hasPrev = false;
    this.hasNext = false;
    this._count = 0;

    Object.defineProperty(this, 'x', {
        get: function() { return this.pos.x; }
    });

    Object.defineProperty(this, 'y', {
        get: function() { return this.pos.y; }
    });

    Object.defineProperty(this, 'countMax', {
        get: function() { return this._preCompX.length-1; }
    });

    Object.defineProperty(this, 'count', {
        get: function() { return this._count; },
        set: function(value) { 
            this._count = value;
            if(this._count < 0) this._count = 0;
            if(this._count > this.countMax - 1) this._count = this.countMax - 1;
            if(this._count == 0) this.hasPrev = false; else this.hasPrev = true;
            if(this._count == this.countMax - 1) this.hasNext = false; else this.hasNext = true;
            //this.pos.x = this._preCompX[this._count];
            //this.pos.y = this._preCompY[this._count];
            this.applyLast();
            this.updateEntity();
        }
    });

    Object.defineProperty(this, 'samplingDistance', {
        get: function() { return this._samplingDistance; },
        set: function(value) { 
            this._samplingDistance = value;
            this._samplingDistanceSquared = this._samplingDistance * this._samplingDistance;
        }
    });

    Object.defineProperty(this, 'path', {
        get: function() { return this._path; },
        set: function(value) { 
            this._path = value;
            this._preComputed = false;
            this.reset();
        }
    });

    
};

DDLS.LinearPathSampler.prototype = {
    dispose: function() {
        this.entity = null;
        this._path = null;
        this._preCompX = null;
        this._preCompY = null;
    },

    reset: function() {
        if(this._path.length > 0) {
            this.pos.x = this._path[0];
            this.pos.y = this._path[1];
            this._iPrev = 0;
            this._iNext = 2;
            this.hasPrev = false;
            this.hasNext = true;
            this._count = 0;
            this.updateEntity();
        } else {
            this.hasPrev = false;
            this.hasNext = false;
            this._count = 0;
            //this._path = [];
        }
    },
    preCompute: function() {
        this._preCompX.splice(0,this._preCompX.length);
        this._preCompY.splice(0,this._preCompY.length);
        this._count = 0;
        this._preCompX.push(this.pos.x);
        this._preCompY.push(this.pos.y);
        this._preComputed = false;
        while(this.next()) {
            this._preCompX.push(this.pos.x);
            this._preCompY.push(this.pos.y);
        }
        this.reset();
        this._preComputed = true;
    },
    prev: function() {
        if(!this.hasPrev) return false;
        this.hasNext = true;
        if(this._preComputed) {
            this._count--;
            if(this._count == 0) this.hasPrev = false;
            
            //this.pos.x = this._preCompX[this._count];
            //this.pos.y = this._preCompY[this._count];
            this.applyLast();
            this.updateEntity();
            return true;
        }
        var remainingDist;
        var dist;
        remainingDist = this._samplingDistance;
        while(true) {
            var pathPrev = this._path[this._iPrev];
            var pathPrev1 = this._path[this._iPrev + 1];
            dist = DDLS.SquaredSqrt(this.pos.x - pathPrev,this.pos.y - pathPrev1);
            if(dist < remainingDist) {
                remainingDist -= dist;
                this._iPrev -= 2;
                this._iNext -= 2;
                if(this._iNext == 0) break;
            } else break;
        }
        if(this._iNext == 0) {
            this.pos.x = this._path[0];
            this.pos.y = this._path[1];
            this.hasPrev = false;
            this._iNext = 2;
            this._iPrev = 0;
            this.updateEntity();
            return true;
        } else {
            this.pos.x = this.pos.x + (this._path[this._iPrev] - this.pos.x) * remainingDist / dist;
            this.pos.y = this.pos.y + (this._path[this._iPrev + 1] - this.pos.y) * remainingDist / dist;
            this.updateEntity();
            return true;
        }
    },
    next: function() {
        if(!this.hasNext) return false;
        this.hasPrev = true;
        if(this._preComputed) {
            this._count++;
            if(this._count == this._preCompX.length - 1) this.hasNext = false;
            //this.pos.x = this._preCompX[this._count];
            //this.pos.y = this._preCompY[this._count];
            this.applyLast();
            this.updateEntity();
            return true;
        }
        var remainingDist;
        var dist;
        remainingDist = this._samplingDistance;
        while(true) {
            var pathNext = this._path[this._iNext];
            var pathNext1 = this._path[this._iNext + 1];
            dist = DDLS.SquaredSqrt(this.pos.x - pathNext,this.pos.y - pathNext1);
            if(dist < remainingDist) {
                remainingDist -= dist;
                this.pos.x = this._path[this._iNext];
                this.pos.y = this._path[this._iNext + 1];
                this._iPrev += 2;
                this._iNext += 2;
                if(this._iNext == this._path.length) break;
            } else break;
        }
        if(this._iNext == this._path.length) {
            this.pos.x = this._path[this._iPrev];
            this.pos.y = this._path[this._iPrev + 1];
            this.hasNext = false;
            this._iNext = this._path.length - 2;
            this._iPrev = this._iNext - 2;
            this.updateEntity();
            return true;
        } else {
            this.pos.x = this.pos.x + (this._path[this._iNext] - this.pos.x) * remainingDist / dist;
            this.pos.y = this.pos.y + (this._path[this._iNext + 1] - this.pos.y) * remainingDist / dist;
            this.updateEntity();
            return true;
        }
    },
    applyLast:function(){
        this.pos.set(this._preCompX[this._count], this._preCompY[this._count]);
    },
    updateEntity: function() {
        if(this.entity == null) return;
        this.entity.position.copy(this.pos);
        //this.entity.x = this.pos.x;
        //this.entity.y = this.pos.y;
    }
};
DDLS.PathIterator = function() {
    this.entity = null;
    this.hasPrev = false;
    this.hasNext = false;
    this.countMax = 0;
    this.count = 0;
    this._currentX = 0;
    this._currentY = 0;
    this._path = [];
    
    Object.defineProperty(this, 'x', {
        get: function() { return this._currentX; }
    });

    Object.defineProperty(this, 'y', {
        get: function() { return this._currentY; }
    });

    Object.defineProperty(this, 'path', {
        get: function() { return this._path; },
        set: function(value) { 
            this._path = value;
            this.countMax = this._path.length * 0.5;
            this.reset();
        }
    });
};

DDLS.PathIterator.prototype = {
    reset:function(){
        this.count = 0;
        this._currentX = this._path[this.count];
        this._currentY = this._path[this.count+1];
        this.updateEntity();
            
        this.hasPrev = false;
        if (this._path.length > 2) this.hasNext = true;
        else this.hasNext = false;
    },
    prev:function(){
        if (! this.hasPrev) return false;
        this.hasNext = true;
            
        this.count--;
        this._currentX = this._path[this.count*2];
        this._currentY = this._path[this.count*2+1];
            
        this.updateEntity();
            
        if (this.count == 0) this.hasPrev = false;
        return true;
    },
    next:function(){
        if (! this.hasNext) return false;
        this.hasPrev = true;
            
        this.count++;
        this._currentX = this._path[this.count*2];
        this._currentY = this._path[this.count*2+1];
            
        this.updateEntity();
            
        if ((this.count+1)*2 == this._path.length) this.hasNext = false;    
        return true;
    },
    updateEntity:function(){
        if (!this.entity) return;
        this.entity.x = this._currentX;
        this.entity.y = this._currentY;
    }
};
DDLS.RectMesh = function(w,h) {

    //  v0 +-----+ v1
    //     |    /|
    //     |   / |
    //     |  /  |
    //     | /   |
    //     |/    |
    //  v3 +-----+ v2


    var v = [];
    var e = [];
    var f = [];
    var s = [];
    var i = 4;
    while(i--){
        f.push(new DDLS.Face());
        v.push(new DDLS.Vertex());
        s.push(new DDLS.Segment());
        e.push(new DDLS.Edge(), new DDLS.Edge(), new DDLS.Edge());
    }
    //i = 4*3;
    //while(i--) e.push(new DDLS.Edge());

    var boundShape = new DDLS.Shape();    
    var offset = 10;

    v[0].pos.set(0 - offset, 0 - offset);
    v[1].pos.set(w + offset, 0 - offset);
    v[2].pos.set(w + offset, h + offset);
    v[3].pos.set(0 - offset, h + offset);

    v[0].setDatas(e[0]);
    v[1].setDatas(e[2]);
    v[2].setDatas(e[4]);
    v[3].setDatas(e[6]);

    e[0].setDatas(v[0],e[1],e[2],f[3], true, true);   // v0--v1
    e[1].setDatas(v[1],e[0],e[7],f[0], true, true);   // v1--v0
    e[2].setDatas(v[1],e[3],e[11],f[3],true, true);   // v1--v2
    e[3].setDatas(v[2],e[2],e[8],f[1], true, true);   // v2--v1
    e[4].setDatas(v[2],e[5],e[6],f[2], true, true);   // v2--v3
    e[5].setDatas(v[3],e[4],e[3],f[1], true, true);   // v3--v2
    e[6].setDatas(v[3],e[7],e[10],f[2],true, true);   // v3--v0
    e[7].setDatas(v[0],e[6],e[9],f[0], true, true);   // v0--v3
    e[8].setDatas(v[1],e[9],e[5],f[1], true, false);  // v1--v3 diagonal edge
    e[9].setDatas(v[3],e[8],e[1],f[0], true, false);  // v3--v1 diagonal edge
    e[10].setDatas(v[0],e[11],e[4],f[2],false,false); // v0--v2 imaginary edge
    e[11].setDatas(v[2],e[10],e[0],f[3],false,false); // v2--v0 imaginary edge

    f[0].setDatas(e[9], true); // v0-v3-v1
    f[1].setDatas(e[8], true); // v1-v3-v2
    f[2].setDatas(e[4],false); // v0-v2-v3
    f[3].setDatas(e[2],false); // v0-v1-v2

    // constraint relations datas
    v[0].fromConstraintSegments = [s[0],s[3]];
    v[1].fromConstraintSegments = [s[0],s[1]];
    v[2].fromConstraintSegments = [s[1],s[2]];
    v[3].fromConstraintSegments = [s[2],s[3]];

    e[0].fromConstraintSegments.push(s[0]);
    e[1].fromConstraintSegments.push(s[0]);
    e[2].fromConstraintSegments.push(s[1]);
    e[3].fromConstraintSegments.push(s[1]);
    e[4].fromConstraintSegments.push(s[2]);
    e[5].fromConstraintSegments.push(s[2]);
    e[6].fromConstraintSegments.push(s[3]);
    e[7].fromConstraintSegments.push(s[3]);

    s[0].edges.push(e[0]); // top
    s[1].edges.push(e[2]); // right
    s[2].edges.push(e[4]); // bottom
    s[3].edges.push(e[6]); // left
    s[0].fromShape = boundShape;
    s[1].fromShape = boundShape;
    s[2].fromShape = boundShape;
    s[3].fromShape = boundShape;
    boundShape.segments.push(s[0], s[1], s[2], s[3]);

    var mesh = new DDLS.Mesh(w,h);
    mesh._vertices = v;
    mesh._edges = e;
    mesh._faces = f;
    mesh._constraintShapes.push(boundShape);

    mesh.clipping = false;
    mesh.insertConstraintShape( [ 0,0,w,0,  w,0,w,h,  w,h,0,h,  0,h,0,0 ] );
    mesh.clipping = true;
    return mesh;
};
DDLS.BitmapObject = {};

DDLS.BitmapObject.buildFromBmpData = function(bmpData,simpleEpsilon,debugBmp,debugShape) {
    if(simpleEpsilon == null) simpleEpsilon = 1;
    var i, j;
    //DDLS.Debug.assertTrue(bmpData.width > 0 && bmpData.height > 0,"Invalid `bmpData` size (" + bmpData.width + ", " + bmpData.height + ")",{ fileName : "BitmapObject.js", lineNumber : 24, className : "DDLS.BitmapObject", methodName : "buildFromBmpData"});
    var shapes = DDLS.Potrace.buildShapes(bmpData,debugBmp,debugShape);
    if(simpleEpsilon >= 1) {
        var _g1 = 0;
        var _g = shapes.length;
        while(_g1 < _g) {
            var i1 = _g1++;
            shapes[i1] = DDLS.ShapeSimplifier(shapes[i1],simpleEpsilon);
        }
    }
    var graphs = [];
    var _g11 = 0;
    var _g2 = shapes.length;
    while(_g11 < _g2) {
        var i2 = _g11++;
        graphs.push(DDLS.Potrace.buildGraph(shapes[i2]));
    }
    var polygons = [];
    var _g12 = 0;
    var _g3 = graphs.length;
    while(_g12 < _g3) {
        var i3 = _g12++;
        polygons.push(DDLS.Potrace.buildPolygon(graphs[i3],debugShape));
    }
    var obj = new DDLS.Object();
    var _g13 = 0;
    var _g4 = polygons.length;
    while(_g13 < _g4) {
        var i4 = _g13++;
        j = 0;
        while(j < polygons[i4].length - 2) {
            obj.coordinates.push(polygons[i4][j]);
            obj.coordinates.push(polygons[i4][j + 1]);
            obj.coordinates.push(polygons[i4][j + 2]);
            obj.coordinates.push(polygons[i4][j + 3]);
            j += 2;
        }
        obj.coordinates.push(polygons[i4][0]);
        obj.coordinates.push(polygons[i4][1]);
        obj.coordinates.push(polygons[i4][j]);
        obj.coordinates.push(polygons[i4][j + 1]);
    }
    console.log('build');
    return obj;
};
DDLS.BitmapMesh = {};

DDLS.BitmapMesh.buildFromBmpData = function( bmpData, simpleEpsilon, debugBmp, debugShape ) {
    simpleEpsilon = simpleEpsilon || 1;
    //if(simpleEpsilon == null) simpleEpsilon = 1;
    var i, j;
    //DDLS.Debug.assertTrue(bmpData.width > 0 && bmpData.height > 0,"Invalid `bmpData` size (" + bmpData.width + ", " + bmpData.height + ")",{ fileName : "BitmapMesh.js", lineNumber : 24, className : "DDLS.BitmapMesh", methodName : "buildFromBmpData"});
    var shapes = DDLS.Potrace.buildShapes(bmpData,debugBmp,debugShape);
    if( simpleEpsilon >= 1 ) {
        var _g1 = 0;
        var _g = shapes.length;
        while(_g1 < _g) {
            var i1 = _g1++;
            shapes[i1] = DDLS.ShapeSimplifier( shapes[i1], simpleEpsilon );
        }
    }
    var graphs = [];
    var _g11 = 0;
    var _g2 = shapes.length;
    while(_g11 < _g2) {
        var i2 = _g11++;
        graphs.push( DDLS.Potrace.buildGraph( shapes[i2] ) );
    }
    var polygons = [];
    var _g12 = 0;
    var _g3 = graphs.length;
    while(_g12 < _g3) {
        var i3 = _g12++;
        polygons.push( DDLS.Potrace.buildPolygon( graphs[i3], debugShape ));
    }
    var mesh = DDLS.RectMesh( bmpData.width, bmpData.height );
    var _g13 = 0;
    var _g4 = polygons.length;
    while(_g13 < _g4) {
        var i4 = _g13++;
        j = 0;
        while(j < polygons[i4].length - 2) {
            mesh.insertConstraintSegment( polygons[i4][j], polygons[i4][j+1], polygons[i4][j+2], polygons[i4][j+3] );
            j += 2;
        }
        mesh.insertConstraintSegment( polygons[i4][j], polygons[i4][j+1], polygons[i4][j+2], polygons[i4][j+3] );
    }
    return mesh;
};
DDLS.Heroe = function(s, world) {
    s = s || {};
    
    this.world = world;

    this.path = [];
    this.tmppath = [];

    this.target = new DDLS.Point();
    this.move = false;
    this.newPath = false;

    this.mesh = null;
    this.isSelected = false;

    this.entity = new DDLS.EntityAI(s.x || 0, s.y || 0, s.r || 4);

    this.fov = new DDLS.FieldOfView(this.entity, this.world.mesh);

    this.pathSampler = new DDLS.LinearPathSampler();
    this.pathSampler.entity = this.entity;
    this.pathSampler.path = this.path;
    this.pathSampler.samplingDistance = s.speed || 10;
};

DDLS.Heroe.prototype = {
    setTarget:function(x, y){
        this.target.set(x,y);
        this.world.pathFinder.entity = this.entity;
        this.world.pathFinder.findPath(this.target, this.path);
        this.testPath();
    },
    testPath:function(){
        if(this.path.length > 0){
            this.tmppath = [];
            var i = this.path.length;
            while(i--) this.tmppath[i] = this.path[i];
            //this.tmppath = this.path;
            this.newPath = true;
        }
    },
    update:function(){
        if(this.mesh != null) this.mesh.position.set(this.entity.position.x, 0, this.entity.position.y);
        if(this.newPath){
            //console.log(this.path);
            //this.newPath = false;
            this.pathSampler.reset();
        }
      

        if(this.pathSampler.hasNext){ 
            this.newPath = false;
            this.move = true;
            this.pathSampler.next();
        }
        else this.move = false;
    }
};
DDLS.World = function(w, h) {
    this.w = w || 512;
    this.h = h || 512;
    this.mesh = DDLS.RectMesh(this.w,this.h);

    this.pathFinder = new DDLS.PathFinder();
    this.pathFinder.mesh = this.mesh;

    this.heroes = [];

    this.shapes = [];
    this.segments = [];
    this.objects = [];
};

DDLS.World.prototype = {
    update:function(){
        var i = this.heroes.length;
        while(i--){
            this.heroes[i].update();
        }
    },
    add:function(o){
        this.mesh.insertObject(o);
        this.objects.push(o);
    },
    addObject:function(s){
        s = s || {};
        var o = new DDLS.Object();
        o.coordinates = s.coord || [-1,-1,1,-1,  1,-1,1,1,  1,1,-1,1,  -1,1,-1,-1];
        o.position(s.x || 1,s.y || 1);
        o.scale(s.w || 1, s.h || 1);
        o.pivot( s.px || 0, s.py || 0);
        o.rotation = s.r || 0;

        this.mesh.insertObject(o);
        this.objects.push(o);
        return o;
    },
    reset:function(w,h){
        this.mesh.dispose();
        if(w) this.w = w;
        if(h) this.h = h;
        this.mesh = DDLS.RectMesh(this.w,this.h);
        this.pathFinder.mesh = this.mesh;
    },
    rebuild:function(){
        this.mesh.clear(true);
        this.mesh = DDLS.RectMesh(this.w,this.h);
        this.pathFinder.mesh = this.mesh;
        //this.mesh._objects = [];
        var i = this.objects.length;
        while(i--){
            this.objects[i]._constraintShape = null;
            this.mesh.insertObject(this.objects[i]);
        }
    },
    /*updateObjects : function(){
       return this.mesh.updateObjects();
    },*/
    addHeroe:function(s){
        var h = new DDLS.Heroe(s, this);
        //h.setMesh(this.mesh);
        this.heroes.push(h);
        return h;
    }

};
