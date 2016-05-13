DDLS.Vertex = function() {
    this.type = DDLS.VERTEX;
    //this.colorDebug = -1;
    this.id = DDLS.VertexID;
    DDLS.VertexID ++;
    this.pos = new DDLS.Point();
    this.fromConstraintSegments = [];
    this.edge = null;
    this.isReal = false;
};
DDLS.Vertex.prototype = {
    constructor: DDLS.Vertex,
    setDatas: function(edge,isReal) {
        this.isReal = isReal !== undefined ? isReal : true;
        this.edge = edge;
    },
    addFromConstraintSegment: function(segment) {
        if ( this.fromConstraintSegments.indexOf(segment) == -1 ) this.fromConstraintSegments.push(segment);
    },
    removeFromConstraintSegment: function(segment) {
        //if(this.fromConstraintSegments == null) return;
        var index = this.fromConstraintSegments.indexOf(segment);
        if ( index != -1 ) this.fromConstraintSegments.splice(index, 1);
    },
    dispose: function() {
        this.pos = null;
        this.edge = null;
        this.fromConstraintSegments = null;
    },
    toString: function() {
        return "ver_id " + this.id;
    }
};