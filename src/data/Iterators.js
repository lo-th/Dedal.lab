//-------------------------
//     EDGE
//-------------------------

DDLS.FromEdgeToRotatedEdges = function() {
};


//-------------------------
//     FACE
//-------------------------

//!\\ not used
DDLS.FromFaceToInnerVertices = function() {
   // this._fromFace = null;
  //  this._nextEdge = null;

    Object.defineProperty(this, 'fromFace', {
        set: function(value) { 
            this._fromFace = value;
            this._nextEdge = this._fromFace.edge;
        }
    });

};
DDLS.FromFaceToInnerVertices.prototype = {
    /*set_fromFace: function(value) {
        this._fromFace = value;
        this._nextEdge = this._fromFace.edge;
        return value;
    },*/
    next: function() {
        if(this._nextEdge != null) {
            this._resultVertex = this._nextEdge.originVertex;
            this._nextEdge = this._nextEdge.nextLeftEdge;
            if(this._nextEdge == this._fromFace.edge) this._nextEdge = null;
        } else this._resultVertex = null;
        return this._resultVertex;
    }
};

DDLS.FromFaceToInnerEdges = function() {
    //this._fromFace = null;
    //this._nextEdge = null;
    
    Object.defineProperty(this, 'fromFace', {
        set: function(value) { 
            this._fromFace = value;
            this._nextEdge = this._fromFace.edge;
        }
    });
};
DDLS.FromFaceToInnerEdges.prototype = {
    /*set_fromFace: function(value) {
        this._fromFace = value;
        this._nextEdge = this._fromFace.edge;
        return value;
    },*/
    next: function() {
        if(this._nextEdge != null) {
            this._resultEdge = this._nextEdge;
            this._nextEdge = this._nextEdge.nextLeftEdge;
            if(this._nextEdge == this._fromFace.edge) this._nextEdge = null;
        } else this._resultEdge = null;
        return this._resultEdge;
    }
};

//!\\ not used
DDLS.FromFaceToNeighbourFaces = function() {
   // this._fromFace = null;
   // this._nextEdge = null;
    Object.defineProperty(this, 'fromFace', {
        set: function(value) { 
            this._fromFace = value;
            this._nextEdge = this._fromFace.edge;
        }
    });
};
DDLS.FromFaceToNeighbourFaces.prototype = {
    /*set_fromFace: function(value) {
        this._fromFace = value;
        this._nextEdge = this._fromFace.edge;
        return value;
    },*/
    next: function() {
        if(this._nextEdge != null) {
            do{
                this._resultFace = this._nextEdge.rightFace;
                this._nextEdge = this._nextEdge.nextLeftEdge;
                if(this._nextEdge == this._fromFace.edge){
                    this._nextEdge = null;
                    if ( ! this._resultFace.isReal ) this._resultFace = null;
                    break;
                }
            } while ( ! this._resultFace.isReal )
        } else this._resultFace = null;
        return this._resultFace;
    }
};


//-------------------------
//     MESH
//-------------------------

DDLS.FromMeshToVertices = function() {
    //this._fromMesh = null;
    //this._currIndex = 0;
    Object.defineProperty(this, 'fromMesh', {
        set: function(value) { 
            this._fromMesh = value;
            this._currIndex = 0;
        }
    });
};
DDLS.FromMeshToVertices.prototype = {
    /*set_fromMesh: function(value) {
        this._fromMesh = value;
        this._currIndex = 0;
        return value;
    },*/
    next: function() {
        do if(this._currIndex < this._fromMesh._vertices.length) {
            this._resultVertex = this._fromMesh._vertices[this._currIndex];
            this._currIndex++;
        } else {
            this._resultVertex = null;
            break;
        } while(!this._resultVertex.isReal);
        return this._resultVertex;
    }
};

//!\\ not used
DDLS.FromMeshToFaces = function() {
    //this._fromMesh = null;
    //this._currIndex = 0;
    Object.defineProperty(this, 'fromMesh', {
        set: function(value) { 
            this._fromMesh = value;
            this._currIndex = 0;
        }
    });
};
DDLS.FromMeshToFaces.prototype = {
    /*set_fromMesh: function(value) {
        this._fromMesh = value;
        this._currIndex = 0;
        return value;
    },*/
    next: function() {
        do if(this._currIndex < this._fromMesh._faces.length) {
            this._resultFace = this._fromMesh._faces[this._currIndex];
            this._currIndex++;
        } else {
            this._resultFace = null;
            break;
        } while(!this._resultFace.isReal);
        return this._resultFace;
    }
};


//-------------------------
//     VERTEX
//-------------------------

DDLS.FromVertexToHoldingFaces = function() {
    this._fromVertex = null;
    this._nextEdge = null;
    Object.defineProperty(this, 'fromVertex', {
        set: function( value ) { 
            this._fromVertex = value;
            if(this._fromVertex) this._nextEdge = this._fromVertex.edge;// || null;
            else DDLS.Log('!! null vertex')
        }
    });
};
DDLS.FromVertexToHoldingFaces.prototype = {
    /*set_fromVertex: function(value) {
        this._fromVertex = value;
        this._nextEdge = this._fromVertex.edge;
        return value;
    },*/
    next: function() {
        if(this._nextEdge != null) do {
            this._resultFace = this._nextEdge.leftFace;
            this._nextEdge = this._nextEdge.rotLeftEdge;
            if(this._nextEdge == this._fromVertex.edge) {
                this._nextEdge = null;
                if(!this._resultFace.isReal) this._resultFace = null;
                break;
            }
        } while(!this._resultFace.isReal); else this._resultFace = null;
        return this._resultFace;
    }
};


DDLS.FromVertexToIncomingEdges = function() {
    //this._fromVertex = null;
    //this._nextEdge = null;
    Object.defineProperty(this, 'fromVertex', {
        set: function(value) { 
            this._fromVertex = value;
            this._nextEdge = this._fromVertex.edge
            while(!this._nextEdge.isReal) this._nextEdge = this._nextEdge.rotLeftEdge;
        }
    });
};
DDLS.FromVertexToIncomingEdges.prototype = {
    /*set_fromVertex: function(value) {
        this._fromVertex = value;
        this._nextEdge = this._fromVertex.edge;
        while(!this._nextEdge.isReal) this._nextEdge = this._nextEdge.rotLeftEdge;
        return value;
    },*/
    next: function() {
        if(this._nextEdge != null) {
            this._resultEdge = this._nextEdge.oppositeEdge;
            do {
                this._nextEdge = this._nextEdge.rotLeftEdge;
                if(this._nextEdge == this._fromVertex.edge) {
                    this._nextEdge = null;
                    break;
                }
            } while(!this._nextEdge.isReal);
        } else this._resultEdge = null;
        return this._resultEdge;
    }
};


DDLS.FromVertexToOutgoingEdges = function() {
    this.realEdgesOnly = true;
    //this._fromVertex = null;
    //this._nextEdge = null;
    Object.defineProperty(this, 'fromVertex', {
        set: function(value) { 
            this._fromVertex = value;
            this._nextEdge = this._fromVertex.edge;
            if(this._nextEdge!=null)
            while(this.realEdgesOnly && !this._nextEdge.isReal) this._nextEdge = this._nextEdge.rotLeftEdge;
        }
    });
};
DDLS.FromVertexToOutgoingEdges.prototype = {
    /*set_fromVertex: function(value) {
        this._fromVertex = value;
        this._nextEdge = this._fromVertex.edge;
        while(this.realEdgesOnly && !this._nextEdge.isReal) this._nextEdge = this._nextEdge.rotLeftEdge;
        return value;
    },*/
    next: function() {
        if(this._nextEdge != null) {
            this._resultEdge = this._nextEdge;
            do {
                this._nextEdge = this._nextEdge.rotLeftEdge;
                if(this._nextEdge == this._fromVertex.edge) {
                    this._nextEdge = null;
                    break;
                }
            } while(this.realEdgesOnly && !this._nextEdge.isReal);
        } else this._resultEdge = null;
        return this._resultEdge;
    }
};


//!\\ not used
DDLS.FromVertexToNeighbourVertices = function() {
    //this._fromVertex = null;
    //this._nextEdge = null;
    Object.defineProperty(this, 'fromVertex', {
        set: function(value) { 
            this._fromVertex = value;
            this._nextEdge = this._fromVertex.edge
        }
    });
};
DDLS.FromVertexToNeighbourVertices.prototype = {
    /*set_fromVertex: function(value) {
        this._fromVertex = value;
        this._nextEdge = this._fromVertex.edge;
        return value;
    },*/
    next: function() {
        if(this._nextEdge != null){
            this._resultVertex = this._nextEdge.destinationVertex;
            do {
                this._nextEdge = this._nextEdge.rotLeftEdge;
            } while(!this._nextEdge.isReal);

            if(this._nextEdge == this._fromVertex.edge) {
                this._nextEdge = null;
            }
        }
        else this._resultVertex = null;
        return this._resultVertex;
    }
};