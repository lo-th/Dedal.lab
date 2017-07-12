
function RandGenerator ( seed, min, max ) {

    this.rangeMin = min || 0;
    this.rangeMax = max || 1;
    this._originalSeed = this._currSeed = seed || 1234;
    this._numIter = 0;

    Object.defineProperty( this, 'seed', {

        get: function() { return this._originalSeed; },
        set: function( value ) { this._originalSeed = this._currSeed = value; }

    });

};

RandGenerator.prototype = {

    constructor: RandGenerator,

    reset: function() {

        this._currSeed = this._originalSeed;
        this._numIter = 0;

    },

    next: function () {

        var tmp = this._currSeed * 1;
        this._tempString = (tmp*tmp).toString();
        while( this._tempString.length < 8 ) this._tempString = "0" + this._tempString;

        this._currSeed = parseInt( this._tempString.substr( 1 , 5 ) );
        var res = Math.round( this.rangeMin + ( this._currSeed / 99999 ) * ( this.rangeMax - this.rangeMin ));
        if( this._currSeed === 0 ) this._currSeed = this._originalSeed + this._numIter;
        this._numIter++;
        if( this._numIter === 200 ) this.reset();

        return res;

    },

    nextInRange: function( min, max ) {

        this.rangeMin = min;
        this.rangeMax = max;
        return this.next();

    },

    shuffle: function( ar ) {

        var i = ar.length, n, t;

        while( i > 0 ) {

            n = this.nextInRange( 0, i - 1 );
            i--;
            t = ar[i];
            ar[i] = ar[n];
            ar[n] = t;

        }

    }

};

export { RandGenerator };