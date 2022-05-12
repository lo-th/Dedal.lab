import { SquaredSqrt } from '../core/Tools.js';
import { Point } from '../math/Point.js';

export class LinearPathSampler {

    constructor() {

        this.entity = null;
        this._path = null;
        this._samplingDistanceSquared = 1;
        this._samplingDistance = 1;
        this._preCompX = [];
        this._preCompY = [];
        this.pos = new Point();
        this.hasPrev = false;
        this.hasNext = false;
        this._count = 0;

        /*Object.defineProperty(this, 'x', {
            get: function() { return this.pos.x; }
        });

        Object.defineProperty(this, 'y', {
            get: function() { return this.pos.y; }
        });

        Object.defineProperty(this, 'countMax', {
            get: function() { return this._preCompX.length-1; }
        });

        Object.defineProperty(this, 'count', {
            get: function() { return this._count; },
            set: function(value) { 
                this._count = value;
                if(this._count < 0) this._count = 0;
                if(this._count > this.countMax - 1) this._count = this.countMax - 1;
                if(this._count == 0) this.hasPrev = false; else this.hasPrev = true;
                if(this._count == this.countMax - 1) this.hasNext = false; else this.hasNext = true;
                //this.pos.x = this._preCompX[this._count];
                //this.pos.y = this._preCompY[this._count];
                this.applyLast();
                this.updateEntity();
            }
        });

        Object.defineProperty(this, 'samplingDistance', {
            get: function() { return this._samplingDistance; },
            set: function(value) { 
                this._samplingDistance = value;
                this._samplingDistanceSquared = this._samplingDistance * this._samplingDistance;
            }
        });

        Object.defineProperty(this, 'path', {
            get: function() { return this._path; },
            set: function(value) { 
                this._path = value;
                this._preComputed = false;
                this.reset();
            }
        });*/
        
    }

    get x () { 
        return this.pos.x
    }

    get y () {
        return this.pos.y
    }

    get countMax () {
        return this._preCompX.length-1
    }

    get count () {
        return this._count
    }

    set count ( value ) {
        this._count = value;
        if(this._count < 0) this._count = 0;
        if(this._count > this.countMax - 1) this._count = this.countMax - 1;
        if(this._count == 0) this.hasPrev = false; else this.hasPrev = true;
        if(this._count == this.countMax - 1) this.hasNext = false; else this.hasNext = true;
        //this.pos.x = this._preCompX[this._count];
        //this.pos.y = this._preCompY[this._count];
        this.applyLast();
        this.updateEntity();
    }

    get samplingDistance () {
        return this._samplingDistance
    }

    set samplingDistance ( value ) {
        this._samplingDistance = value;
        this._samplingDistanceSquared = this._samplingDistance * this._samplingDistance;
    }

    get path () {
        return this._path
    }

    set path ( value ) {
        this._path = value
        this._preComputed = false
        this.reset()
    }

    //////

    dispose () {

        this.entity = null;
        this._path = null;
        this._preCompX = null;
        this._preCompY = null;

    }

    reset () {

        if(this._path.length > 0) {
            this.pos.x = this._path[0];
            this.pos.y = this._path[1];
            this._iPrev = 0;
            this._iNext = 2;
            this.hasPrev = false;
            this.hasNext = true;
            this._count = 0;
            this.updateEntity();
        } else {
            this.hasPrev = false;
            this.hasNext = false;
            this._count = 0;
            //this._path = [];
        }

    }

    preCompute () {

        this._preCompX.splice(0,this._preCompX.length);
        this._preCompY.splice(0,this._preCompY.length);
        this._count = 0;
        this._preCompX.push(this.pos.x);
        this._preCompY.push(this.pos.y);
        this._preComputed = false;
        while(this.next()) {
            this._preCompX.push(this.pos.x);
            this._preCompY.push(this.pos.y);
        }
        this.reset();
        this._preComputed = true;

    }

    prev () {

        if(!this.hasPrev) return false;
        this.hasNext = true;
        if(this._preComputed) {
            this._count--;
            if(this._count == 0) this.hasPrev = false;
            
            //this.pos.x = this._preCompX[this._count];
            //this.pos.y = this._preCompY[this._count];
            this.applyLast();
            this.updateEntity();
            return true;
        }
        let remainingDist;
        let dist;
        remainingDist = this._samplingDistance;
        while(true) {
            let pathPrev = this._path[this._iPrev];
            let pathPrev1 = this._path[this._iPrev + 1];
            dist = SquaredSqrt(this.pos.x - pathPrev,this.pos.y - pathPrev1);
            if(dist < remainingDist) {
                remainingDist -= dist;
                this._iPrev -= 2;
                this._iNext -= 2;
                if(this._iNext == 0) break;
            } else break;
        }
        if(this._iNext == 0) {
            this.pos.x = this._path[0];
            this.pos.y = this._path[1];
            this.hasPrev = false;
            this._iNext = 2;
            this._iPrev = 0;
            this.updateEntity();
            return true;
        } else {
            this.pos.x = this.pos.x + (this._path[this._iPrev] - this.pos.x) * remainingDist / dist;
            this.pos.y = this.pos.y + (this._path[this._iPrev + 1] - this.pos.y) * remainingDist / dist;
            this.updateEntity();
            return true;
        }

    }

    next () {

        if(!this.hasNext) return false;
        this.hasPrev = true;
        if(this._preComputed) {
            this._count++;
            if(this._count == this._preCompX.length - 1) this.hasNext = false;
            //this.pos.x = this._preCompX[this._count];
            //this.pos.y = this._preCompY[this._count];
            this.applyLast();
            this.updateEntity();
            return true;
        }
        let remainingDist;
        let dist;
        remainingDist = this._samplingDistance;
        while(true) {
            let pathNext = this._path[this._iNext];
            let pathNext1 = this._path[this._iNext + 1];
            dist = SquaredSqrt(this.pos.x - pathNext,this.pos.y - pathNext1);
            if(dist < remainingDist) {
                remainingDist -= dist;
                this.pos.x = this._path[this._iNext];
                this.pos.y = this._path[this._iNext + 1];
                this._iPrev += 2;
                this._iNext += 2;
                if(this._iNext == this._path.length) break;
            } else break;
        }
        if(this._iNext == this._path.length) {
            this.pos.x = this._path[this._iPrev];
            this.pos.y = this._path[this._iPrev + 1];
            this.hasNext = false;
            this._iNext = this._path.length - 2;
            this._iPrev = this._iNext - 2;
            this.updateEntity();
            return true;
        } else {
            this.pos.x = this.pos.x + (this._path[this._iNext] - this.pos.x) * remainingDist / dist;
            this.pos.y = this.pos.y + (this._path[this._iNext + 1] - this.pos.y) * remainingDist / dist;
            this.updateEntity();
            return true;
        }

    }

    applyLast () {

        this.pos.set(this._preCompX[this._count], this._preCompY[this._count]);

    }

    updateEntity () {

        if( this.entity === null ) return;
        //this.entity.angle = Math.atan2( this.pos.y - this.entity.position.y, this.pos.x - this.entity.position.x );//*_Math.todeg;

        
        this.entity.distance = this.entity.position.distanceTo( this.pos )
        //console.log(this.entity.distance)
        if( this.entity.distance > 0.01 ) this.entity.angle = this.entity.position.angleTo( this.pos )
        this.entity.direction.angular( this.entity.angle ).mul(this.entity.distance);
        this.entity.position.copy( this.pos );
        //this.entity.angle = this.entity.position.angle()

        //console.log(this.entity.direction)

        //this.entity.x = this.pos.x;
        //this.entity.y = this.pos.y;
    }

}

//export { LinearPathSampler };