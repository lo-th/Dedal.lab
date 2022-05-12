export class RandGenerator {

    constructor( seed = 1234, min = 0, max = 1 ) {

        this.min = min
        this.max = max
        this.seed = this.currentSeed = seed
        this.nid = 0

    }

    getSeed() {

        return this.seed;

    } 

    setSeed( value ) {

        this.seed = this.currentSeed = value;

    }

    reset() {

        this.currentSeed = this.seed;
        this.nid = 0;

    }

    next() {

        let tmp = this.currentSeed * 1;
        let temp = ( tmp * tmp ).toString();
        while( temp.length < 8 ) temp = "0" + temp;
        this.currentSeed = parseInt( temp.substr( 1 , 5 ) );
        let res = Math.round( this.min + ( this.currentSeed / 99999 ) * ( this.max - this.min ));
        if( this.currentSeed === 0 ) this.currentSeed = this.seed + this.nid;
        this.nid++;
        if( this.nid === 200 ) this.reset();

        return res;

    }

    nextInRange( min, max ) {

        this.min = min;
        this.max = max;
        return this.next();

    }

    shuffle( ar ) {

        let i = ar.length, n, t;

        while( i -- ) {

            n = this.nextInRange( 0, i );
            t = ar[i];
            ar[i] = ar[n];
            ar[n] = t;

        }

    }

}