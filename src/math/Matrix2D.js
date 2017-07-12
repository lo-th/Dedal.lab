import { _Math } from '../math/Math';

function Matrix2D (a,b,c,d,e,f) {

    this.n = new _Math.ARRAY(6);
    this.n[0] = a || 1;
    this.n[1] = b || 0;
    this.n[2] = c || 0;
    this.n[3] = d || 1;
    this.n[4] = e || 0;
    this.n[5] = f || 0;

};

Matrix2D.prototype = {
    constructor: Matrix2D,

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
        st = _Math.sin(rad), ct = _Math.cos(rad);
        this.n[0] = aa*ct + ab*st;
        this.n[1] = -aa*st + ab*ct;
        this.n[2] = ac*ct + ad*st;
        this.n[3] = -ac*st + ct*ad;
        this.n[4] = ct*atx + st*aty;
        this.n[5] = ct*aty - st*atx;
        return this;
    },

    clone: function() {
        return new Matrix2D(this.n[0],this.n[1],this.n[2],this.n[3],this.n[4],this.n[5]);
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

export { Matrix2D };