export class PathIterator {

    constructor () {

        this.entity = null;
        this.hasPrev = false;
        this.hasNext = false;
        this.countMax = 0;
        this.count = 0;
        this._currentX = 0;
        this._currentY = 0;
        this._path = [];

    }

    get x () {
        return this._currentX
    }

    get y () {
        return this._currentY
    }

    get path () {
        return this._path
    }

    set path ( value ) {
        this._path = value
        this.countMax = this._path.length * 0.5
        this.reset()
    }

    reset () {

        this.count = 0;
        this._currentX = this._path[this.count];
        this._currentY = this._path[this.count+1];
        this.updateEntity();
            
        this.hasPrev = false;
        if (this._path.length > 2) this.hasNext = true;
        else this.hasNext = false;

    }

    prev () {

        if (! this.hasPrev) return false;
        this.hasNext = true;
            
        this.count--;
        this._currentX = this._path[this.count*2];
        this._currentY = this._path[this.count*2+1];
            
        this.updateEntity();
            
        if (this.count == 0) this.hasPrev = false;
        return true;

    }

    next () {

        if ( !this.hasNext ) return false;
        this.hasPrev = true;
            
        this.count++;
        this._currentX = this._path[this.count*2];
        this._currentY = this._path[this.count*2+1];
            
        this.updateEntity();
            
        if ((this.count+1)*2 == this._path.length) this.hasNext = false;    
        return true;

    }

    updateEntity () {

        if ( !this.entity ) return;
        this.entity.x = this._currentX;
        this.entity.y = this._currentY;

    }

}