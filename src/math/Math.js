var _Math = {

    ARRAY: (typeof Float32Array !== 'undefined') ? Float32Array : Array,

    sqrt   : Math.sqrt,
    abs    : Math.abs,
    floor  : Math.floor,
    cos    : Math.cos,
    sin    : Math.sin,
    acos   : Math.acos,
    asin   : Math.asin,
    atan2  : Math.atan2,
    round  : Math.round,
    pow    : Math.pow,
    max    : Math.max,
    min    : Math.min,
    random : Math.random,

    torad : 0.0174532925199432957,
    todeg : 57.295779513082320876,
    Pi       : 3.141592653589793,
    PI       : 3.141592653589793,
    TwoPI    : 6.283185307179586,
    PI90     : 1.570796326794896,
    PI270    : 4.712388980384689,
    inv255   : 0.003921569,
    golden   : 10.166407384630519,

    INF      : Infinity,
    NINF     : -Infinity,
    EPZ      : 0.00001,
    EPZ2      : 0.000001,
    EPSILON   : 0.01,
    EPSILON_SQUARED : 0.0001,
    //NaN: Number.NaN,

    Squared: function ( a, b ) { return a * a + b * b; },
    SquaredSqrt: function ( a, b ) { return _Math.sqrt( a * a + b * b ); },

    isFinite: function ( x ) { return isFinite(x); },
    int: function(x) { return Math.floor(x); },
    fix: function(x, n) { return x.toFixed(n || 3) * 1; },
    //isNaN: function(x) { return isNaN(x); },

    lerp: function ( x, y, t ) { return ( 1 - t ) * x + t * y; },
    rand: function ( low, high ) { return low + Math.random() * ( high - low ); },
    randInt: function ( low, high ) { return low + Math.floor( Math.random() * ( high - low + 1 ) ); },

    nearEqual: function ( a, b, e ) { return Math.abs( a - b ) < e; },

    generateUUID: function () {

        // http://www.broofa.com/Tools/Math.uuid.htm

        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split( '' );
        var uuid = new Array( 36 );
        var rnd = 0, r;

        return function generateUUID() {

            for ( var i = 0; i < 36; i ++ ) {

                if ( i === 8 || i === 13 || i === 18 || i === 23 ) {

                    uuid[ i ] = '-';

                } else if ( i === 14 ) {

                    uuid[ i ] = '4';

                } else {

                    if ( rnd <= 0x02 ) rnd = 0x2000000 + ( Math.random() * 0x1000000 ) | 0;
                    r = rnd & 0xf;
                    rnd = rnd >> 4;
                    uuid[ i ] = chars[ ( i === 19 ) ? ( r & 0x3 ) | 0x8 : r ];

                }

            }

            return uuid.join( '' );

        };

    }(),

    /*int: function( x ) { 

        return _Math.floor(x); 

    },

    fix: function( x, n ) { 

        return x.toFixed(n || 3, 10); 

    },*/

    clamp: function ( value, min, max ) { 

        return _Math.max( min, _Math.min( max, value ) ); 

    },
    
    //clamp: function ( x, a, b ) { return ( x < a ) ? a : ( ( x > b ) ? b : x ); },

    

    distance: function( p1, p2 ){

        var xd = p2[0]-p1[0];
        var yd = p2[1]-p1[1];
        var zd = p2[2]-p1[2];
        return _Math.sqrt(xd*xd + yd*yd + zd*zd);

    },

    /*unwrapDegrees: function ( r ) {

        r = r % 360;
        if (r > 180) r -= 360;
        if (r < -180) r += 360;
        return r;

    },

    unwrapRadian: function( r ){

        r = r % _Math.TwoPI;
        if (r > _Math.PI) r -= _Math.TwoPI;
        if (r < -_Math.PI) r += _Math.TwoPI;
        return r;

    },*/

    acosClamp: function ( cos ) {

        if(cos>1) return 0;
        else if(cos<-1) return _Math.Pi;
        else return _Math.acos(cos);

    },

    distanceVector: function( v1, v2 ){

        var xd = v1.x - v2.x;
        var yd = v1.y - v2.y;
        var zd = v1.z - v2.z;
        return xd * xd + yd * yd + zd * zd;

    },

    dotVectors: function ( a, b ) {

        return a.x * b.x + a.y * b.y + a.z * b.z;

    },

}

export { _Math };