export class Matrix2D {

    constructor( a = 1, b = 0, c = 0, d = 1, e = 0, f = 0 ) {

        this.n = [ a || 1, b || 0, c || 0, d || 1, e || 0, f || 0 ]

    }

    identity() {

        this.n = [ 1, 0, 0, 1, 0, 0 ]
        return this

    }

    translate( p ) {

        let n = this.n
        n[4] += p.x
        n[5] += p.y
        return this

    }

    scale( p ) {

        let n = this.n
        n[0] *= p.x
        n[1] *= p.y
        n[2] *= p.x
        n[3] *= p.y
        n[4] *= p.x
        n[5] *= p.y
        return this

    }

    rotate( rad ) {

        let n = this.n;
        let aa = n[0], ab = n[1],
        ac = n[2], ad = n[3],
        atx = n[4], aty = n[5],
        st = Math.sin( rad ), ct = Math.cos( rad )
        n[0] = aa*ct + ab*st
        n[1] = -aa*st + ab*ct
        n[2] = ac*ct + ad*st
        n[3] = -ac*st + ct*ad
        n[4] = ct*atx + st*aty
        n[5] = ct*aty - st*atx
        return this

    }

    tranform( p ) {

        let n = this.n;
        let x = n[0] * p.x + n[2] * p.y + n[4]
        let y = n[1] * p.x + n[3] * p.y + n[5]
        p.x = x
        p.y = y

    }

    transformX( x, y ) {

        let n = this.n
        return n[0] * x + n[2] * y + n[4]

    }

    transformY( x, y ) {

        let n = this.n
        return n[1] * x + n[3] * y + n[5]

    }

    concat( matrix ) { // multiply

        let n = this.n
        let m = matrix.n
        let a = n[0] * m[0] + n[1] * m[2]
        let b = n[0] * m[1] + n[1] * m[3]
        let c = n[2] * m[0] + n[3] * m[2]
        let d = n[2] * m[1] + n[3] * m[3]
        let e = n[4] * m[0] + n[5] * m[2] + m[4]
        let f = n[4] * m[1] + n[5] * m[3] + m[5]
        n[0] = a
        n[1] = b
        n[2] = c
        n[3] = d
        n[4] = e
        n[5] = f
        return this

    }

    clone() {

        let n = this.n
        return new Matrix2D( n[0], n[1], n[2], n[3], n[4], n[5] )

    }

}