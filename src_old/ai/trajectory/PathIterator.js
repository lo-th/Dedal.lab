DDLS.PathIterator = function() {
    this.entity = null;
    this.hasPrev = false;
    this.hasNext = false;
    this.countMax = 0;
    this.count = 0;
    this._currentX = 0;
    this._currentY = 0;
    this._path = [];
    
    Object.defineProperty(this, 'x', {
        get: function() { return this._currentX; }
    });

    Object.defineProperty(this, 'y', {
        get: function() { return this._currentY; }
    });

    Object.defineProperty(this, 'path', {
        get: function() { return this._path; },
        set: function(value) { 
            this._path = value;
            this.countMax = this._path.length * 0.5;
            this.reset();
        }
    });
};

DDLS.PathIterator.prototype = {
    reset:function(){
        this.count = 0;
        this._currentX = this._path[this.count];
        this._currentY = this._path[this.count+1];
        this.updateEntity();
            
        this.hasPrev = false;
        if (this._path.length > 2) this.hasNext = true;
        else this.hasNext = false;
    },
    prev:function(){
        if (! this.hasPrev) return false;
        this.hasNext = true;
            
        this.count--;
        this._currentX = this._path[this.count*2];
        this._currentY = this._path[this.count*2+1];
            
        this.updateEntity();
            
        if (this.count == 0) this.hasPrev = false;
        return true;
    },
    next:function(){
        if (! this.hasNext) return false;
        this.hasPrev = true;
            
        this.count++;
        this._currentX = this._path[this.count*2];
        this._currentY = this._path[this.count*2+1];
            
        this.updateEntity();
            
        if ((this.count+1)*2 == this._path.length) this.hasNext = false;    
        return true;
    },
    updateEntity:function(){
        if (!this.entity) return;
        this.entity.x = this._currentX;
        this.entity.y = this._currentY;
    }
};