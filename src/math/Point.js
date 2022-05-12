export class Point {

    constructor( x = 0, y = 0 ) {

        this.x = x
        this.y = y

    }

    set( x, y ) {

        this.x = x
        this.y = y
        return this

    }

    transform( matrix ) {

        matrix.tranform( this )
        return this

    }
    
    copy( p ) {

        this.x = p.x
        this.y = p.y
        return this

    }

    clone() {

        return new Point( this.x, this.y )

    }

    sub( p ) {

        this.x -= p.x
        this.y -= p.y
        return this

    }

    mul( s ) {

        this.x *= s
        this.y *= s
        return this

    }

    add( n ) {

        this.x += n.x
        this.y += n.y
        return this

    }

    div( s ) {

        let v = 1/s
        this.x *= v
        this.y *= v
        return this

    }

    negate() {

        return new Point( -this.x, -this.y )
    
    }

    transformMat2D( matrix ) {

        let x = this.x, y = this.y, n = matrix.n
        this.x = n[0] * x + n[2] * y + n[4]
        this.y = n[1] * x + n[3] * y + n[5]
        return this

    }

    length() {

        return Math.sqrt( this.x * this.x + this.y * this.y )

    }

    angular( a ) {

        this.x = Math.cos( a )
        this.y = Math.sin( a )
        return this

    }

    normalize() {

        const norm = this.length()
        this.x /= norm
        this.y /= norm
        return this;

    }

    distanceTo( p ) {

        let diffX = p.x - this.x
        let diffY = p.y - this.y
        return Math.sqrt( diffX * diffX + diffY * diffY )

    }

    distanceSquaredTo( p ) {

        let diffX = p.x - this.x
        let diffY = p.y - this.y
        return diffX * diffX + diffY * diffY

    }

    equals( p ) {

        return this.x === p.x && this.y === p.y
    
    }

    /*angleTo( p ){

        return Math.atan2( p.x - this.x, p.y - this.y )
        
    }*/
    angle(){

        return Math.atan2( - this.y, - this.x ) + Math.PI;
        
    }

    angleTo( p ){

        return Math.atan2( p.y - this.y, p.x - this.x )
        
    }

}