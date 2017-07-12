DDLS.Shape = function() {
    this.id = DDLS.ShapeID;
    DDLS.ShapeID ++;
    this.segments = [];
};
DDLS.Shape.prototype = {
    constructor: DDLS.Shape,
    dispose: function() {
        while(this.segments.length > 0) this.segments.pop().dispose();
        this.segments = null;
    }
};