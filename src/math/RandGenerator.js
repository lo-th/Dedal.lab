import { _Math } from '../math/Math';

function RandGenerator ( seed, rangeMin, rangeMax ) {

    this.rangeMin = rangeMin || 0;
    this.rangeMax = rangeMax || 1;
    this._originalSeed = this._currSeed = seed || 1234;
    this._numIter = 0;

    Object.defineProperty(this, 'seed', {
        get: function() { return this._originalSeed; },
        set: function(value) { this._originalSeed = this._currSeed = value; }
    });

};

RandGenerator.prototype = {

    constructor: RandGenerator,
    reset: function() {
        this._currSeed = this._originalSeed;
        this._numIter = 0;
    },
    next: function() {
        var tmp = this._currSeed * 1;
        this._tempString = (tmp*tmp).toString();//Std.string(_floatSeed * _floatSeed);
        while(this._tempString.length < 8) this._tempString = "0" + this._tempString;
        this._currSeed = parseInt(this._tempString.substr( 1 , 5 ));//Std.parseInt(HxOverrides.substr(this._tempString,1,5));
        var res = _Math.round(this.rangeMin + (this._currSeed / 99999) * (this.rangeMax - this.rangeMin));
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

export { RandGenerator };