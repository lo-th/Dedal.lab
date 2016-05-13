DDLS.Graph = function() {
    this.id = DDLS.GraphID;
    DDLS.GraphID++;
    this.edge = null;
    this.node = null;
};

DDLS.Graph.prototype = {
    dispose: function() {
        while(this.node != null) this.deleteNode(this.node);
    },
    insertNode: function() {
        var node = new DDLS.GraphNode();
        if(this.node != null) {
            node.next = this.node;
            this.node.prev = node;
        }
        this.node = node;
        return node;
    },
    deleteNode: function(node) {
        while(node.outgoingEdge != null) {
            if(node.outgoingEdge.oppositeEdge != null) this.deleteEdge(node.outgoingEdge.oppositeEdge);
            this.deleteEdge(node.outgoingEdge);
        }
        var otherNode = this.node;
        var incomingEdge;
        while(otherNode != null) {
            incomingEdge = otherNode.successorNodes.get(node);
            if(incomingEdge != null) this.deleteEdge(incomingEdge);
            otherNode = otherNode.next;
        }
        if(this.node == node) {
            if(node.next != null) {
                node.next.prev = null;
                this.node = node.next;
            } else this.node = null;
        } else if(node.next != null) {
            node.prev.next = node.next;
            node.next.prev = node.prev;
        } else node.prev.next = null;
        node.dispose();
    },
    insertEdge: function(fromNode,toNode) {
        if(fromNode.successorNodes.get(toNode) != null) return null;
        var edge = new DDLS.GraphEdge();
        if(this.edge != null) {
            this.edge.prev = edge;
            edge.next = this.edge;
        }
        this.edge = edge;
        edge.sourceNode = fromNode;
        edge.destinationNode = toNode;
       
        fromNode.successorNodes.set(toNode,edge);
        if(fromNode.outgoingEdge != null) {
            fromNode.outgoingEdge.rotPrevEdge = edge;
            edge.rotNextEdge = fromNode.outgoingEdge;
            fromNode.outgoingEdge = edge;
        } else fromNode.outgoingEdge = edge;
        var oppositeEdge = toNode.successorNodes.get(fromNode);
        if(oppositeEdge != null) {
            edge.oppositeEdge = oppositeEdge;
            oppositeEdge.oppositeEdge = edge;
        }
        return edge;
    },
    deleteEdge: function(edge) {
        if(this.edge == edge) {
            if(edge.next != null) {
                edge.next.prev = null;
                this.edge = edge.next;
            } else this.edge = null;
        } else if(edge.next != null) {
            edge.prev.next = edge.next;
            edge.next.prev = edge.prev;
        } else edge.prev.next = null;
        if(edge.sourceNode.outgoingEdge == edge) {
            if(edge.rotNextEdge != null) {
                edge.rotNextEdge.rotPrevEdge = null;
                edge.sourceNode.outgoingEdge = edge.rotNextEdge;
            } else edge.sourceNode.outgoingEdge = null;
        } else if(edge.rotNextEdge != null) {
            edge.rotPrevEdge.rotNextEdge = edge.rotNextEdge;
            edge.rotNextEdge.rotPrevEdge = edge.rotPrevEdge;
        } else edge.rotPrevEdge.rotNextEdge = null;
        edge.dispose();
    }
};

// EDGE

DDLS.GraphEdge = function() {
    this.id = DDLS.GraphEdgeID;
    DDLS.GraphEdgeID++;
    this.next = null;
    this.prev = null;
    this.rotPrevEdge = null;
    this.rotNextEdge = null;
    this.oppositeEdge = null;
    this.sourceNode = null;
    this.destinationNode = null;
    this.data = null;
};
DDLS.GraphEdge.prototype = {
    dispose: function() {
    }
};

// NODE

DDLS.GraphNode = function() {
    this.id = DDLS.GraphNodeID;
    DDLS.GraphNodeID++;
    this.successorNodes = new DDLS.Dictionary(1);
    this.prev = null;
    this.next = null;
    this.outgoingEdge = null;
    this.data = null;
};
DDLS.GraphNode.prototype = {
    dispose: function() {
        this.successorNodes.dispose();
        this.prev = null;
        this.next = null;
        this.outgoingEdge = null;
        this.successorNodes = null;
        this.data = null;
    }
};

// IMAGE DATA

DDLS.fromImageData = function(image) {
    var pixels = new DDLS.PixelsData(image.width,image.height);
    var data = image.data;
    var l = data.byteLength, n=0, i=0;
    while(n < l) {
        i = n++;
        pixels.bytes[i] = data[i] & 255;
    }
    return pixels;
};

// PIXEL DATA

DDLS.PixelsData = function(w,h) {
    this.length = w * h;
    this.bytes = new DDLS_ARRAY_TYPE(this.length << 2);
    this.width = w;
    this.height = h;
};

// IMG LOADER

DDLS.ImageLoader = function(imageNames,loaded_) {
    this.images = new DDLS.Dictionary(2);
    this.loaded = loaded_;
    this.count = imageNames.length;
    var _g = 0;
    while(_g < imageNames.length) {
        var name = imageNames[_g];
        ++_g;
        this.load(name);
    }
};

DDLS.ImageLoader.prototype = {
    load: function(img) {
        var image;
        var _this = window.document;
        image = _this.createElement("img");
        image.style.cssText = 'position:absolute;';
        image.onload = function(){
            this.store( image, img.split("/").pop() );
        }.bind(this);
        image.src = img;
    },
    store: function(image,name) {
        this.count--;
        DDLS.Log("store " + name + " " + this.count);
        this.images.set(name,image);
        if(this.count == 0) this.loaded();
    }
};