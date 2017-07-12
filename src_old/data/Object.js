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
    position:function( x, y ){
        this._position.set(x,y);
        this.hasChanged = true;
    },
    scale:function( w, h ){
        this._scale.set(w,h);
        this.hasChanged = true;
    },
    pivot:function( x, y ){
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