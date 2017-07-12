DDLS.Face = function() {
    this.type = DDLS.FACE;
    this.id = DDLS.FaceID;
    DDLS.FaceID ++;
    this.isReal = false;
    this.edge = null;
};
DDLS.Face.prototype = {
    constructor: DDLS.Face,
    setDatas: function(edge, isReal) {
        this.isReal = isReal !== undefined ? isReal : true;
        this.edge = edge;
    },
    dispose: function() {
        this.edge = null;
    }
};