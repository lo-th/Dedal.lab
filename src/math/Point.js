
function Point ( x, y ) {

    this.x = x || 0;
    this.y = y || 0;

};

Point.prototype = {

    constructor: Point,

    set: function ( x, y ) {

        this.x = x;
        this.y = y;
        return this;

    },

    transform: function ( matrix ) {

        matrix.tranform( this );
        return this;

    },
    
    copy: function ( p ) {

        this.x = p.x;
        this.y = p.y;
        return this;

    },

    clone: function () {

        return new Point( this.x, this.y );

    },

    sub: function ( p ) {

        this.x -= p.x;
        this.y -= p.y;
        return this;

    },

    mul: function ( s ) {

        this.x *= s;
        this.y *= s;
        return this;

    },

    add: function( n ) {

        this.x += n.x;
        this.y += n.y;
        return this;

    },

    div: function ( s ) {

        var v = 1/s;
        this.x *= v;
        this.y *= v;
        return this;

    },

    negate: function () {

        return new Point( -this.x, -this.y );
    
    },

    transformMat2D: function ( matrix ) {

        var x = this.x, y = this.y, n = matrix.n;
        this.x = n[0] * x + n[2] * y + n[4];
        this.y = n[1] * x + n[3] * y + n[5];
        return this;

    },

    length: function () {

        return Math.sqrt( this.x * this.x + this.y * this.y );

    },

    angular: function ( a ) {

        this.x = Math.cos( a );
        this.y = Math.sin( a );
        return this;

    },

    normalize: function () {

        var norm = this.length();
        this.x /= norm;
        this.y /= norm;
        return norm;

    },

    distanceTo: function ( p ) {

        var diffX = this.x - p.x;
        var diffY = this.y - p.y;
        return Math.sqrt( diffX * diffX + diffY * diffY );

    },

    distanceSquaredTo: function ( p ) {

        var diffX = this.x - p.x;
        var diffY = this.y - p.y;
        return diffX * diffX + diffY * diffY;

    },

    equals: function ( p ) {

        return this.x === p.x && this.y === p.y;
    
    }

};

export { Point };