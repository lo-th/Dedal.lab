
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

DDLS.torad = 0.0174532925199432957;
DDLS.todeg = 57.295779513082320876;

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
    console.log( str );
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