
function RandGenerator ( seed, min, max ) {

    this.min = min || 0;
    this.max = max || 1;
    this.seed = this.currentSeed = seed || 1234;
    this.nid = 0;

};

RandGenerator.prototype = {

    constructor: RandGenerator,

    getSeed: function () {

        return this.seed;

    }, 

    setSeed: function ( value ) {

        this.seed = this.currentSeed = value;

    },

    reset: function() {

        this.currentSeed = this.seed;
        this.nid = 0;

    },

    next: function () {

        var tmp = this.currentSeed * 1;
        var temp = ( tmp * tmp ).toString();
        while( temp.length < 8 ) temp = "0" + temp;
        this.currentSeed = parseInt( temp.substr( 1 , 5 ) );
        var res = Math.round( this.min + ( this.currentSeed / 99999 ) * ( this.max - this.min ));
        if( this.currentSeed === 0 ) this.currentSeed = this.seed + this.nid;
        this.nid++;
        if( this.nid === 200 ) this.reset();

        return res;

    },

    nextInRange: function( min, max ) {

        this.min = min;
        this.max = max;
        return this.next();

    },

    shuffle: function( ar ) {

        var i = ar.length, n, t;

        while( i -- ) {

            n = this.nextInRange( 0, i );
            t = ar[i];
            ar[i] = ar[n];
            ar[n] = t;

        }

    }

};

export { RandGenerator };