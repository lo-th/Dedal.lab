DDLS.LinearPathSampler = function() {
    this.entity = null;
    this._path = null;
    this._samplingDistanceSquared = 1;
    this._samplingDistance = 1;
    this._preCompX = [];
    this._preCompY = [];
    this.pos = new DDLS.Point();
    this.hasPrev = false;
    this.hasNext = false;
    this._count = 0;

    Object.defineProperty(this, 'x', {
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
    });

    
};

DDLS.LinearPathSampler.prototype = {
    dispose: function() {
        this.entity = null;
        this._path = null;
        this._preCompX = null;
        this._preCompY = null;
    },

    reset: function() {
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
    },
    preCompute: function() {
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
    },
    prev: function() {
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
        var remainingDist;
        var dist;
        remainingDist = this._samplingDistance;
        while(true) {
            var pathPrev = this._path[this._iPrev];
            var pathPrev1 = this._path[this._iPrev + 1];
            dist = DDLS.SquaredSqrt(this.pos.x - pathPrev,this.pos.y - pathPrev1);
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
    },
    next: function() {
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
        var remainingDist;
        var dist;
        remainingDist = this._samplingDistance;
        while(true) {
            var pathNext = this._path[this._iNext];
            var pathNext1 = this._path[this._iNext + 1];
            dist = DDLS.SquaredSqrt(this.pos.x - pathNext,this.pos.y - pathNext1);
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
    },
    applyLast:function(){
        this.pos.set(this._preCompX[this._count], this._preCompY[this._count]);
    },
    updateEntity: function() {
        if(this.entity == null) return;
        this.entity.angle = DDLS.atan2( this.pos.y - this.entity.position.y, this.pos.x - this.entity.position.x );//*DDLS.todeg;
        this.entity.direction.angular( this.entity.angle );
        this.entity.position.copy(this.pos);

        //console.log(this.entity.direction)

        //this.entity.x = this.pos.x;
        //this.entity.y = this.pos.y;
    }
};