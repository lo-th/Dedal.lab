import { _Math } from '../math/Math';
import { Point } from '../math/Point';

function EntityAI ( x, y, r, d ) {

    this.path = [];
    this.position = new Point(x || 0, y || 0);
    this.direction = new Point(1,0);
    this.radius = r || 10;
    //this.radiusSquared = 10*10;
    //this.x = this.y = 0;
    //this.dirNormX = 1;
    //this.dirNormY = 0;
    this.angle = 0;
    this.angleFOV = 120 * _Math.torad;
    this.radiusFOV = d || 200;

    this.isSee = false;
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

EntityAI.prototype = {
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

export { EntityAI };

//DDLS.EntityAI.NUM_SEGMENTS = 6;