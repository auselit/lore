/** 
 * @class lore.draw2d.Port Port that accepts connections from Connections 
 * @extends lore.draw2d.Rectangle
 */
lore.draw2d.Port = function(uirep) {
    try{
    lore.draw2d.Rectangle.call(this);
    this.parentNode = null;
    this.originX = 0;
    this.originY = 0;
    this.corona = null;
    this.setDimension(16, 16);
    lore.draw2d.Rectangle.prototype.setColor.call(this,null);
    this.dropable = new lore.draw2d.DropTarget(this.html);
    this.dropable.node = this;
    this.dropable.addEventListener("dragenter", function(_5196) {
                _5196.target.node.onDragEnter(_5196.relatedTarget.node);
            });
    this.dropable.addEventListener("dragleave", function(_5197) {
        _5197.target.node.onDragLeave(_5197.relatedTarget.node);
    });
    this.dropable.addEventListener("drop", function(_5198) {
        _5198.relatedTarget.node.onDrop(_5198.target.node);
    });
    this.coronaWidth = 35;
    
    this.fillColor = new lore.draw2d.Color(255, 252, 182);
    this.highlightFillColor = new lore.draw2d.Color(170,204,246);
    this.setBackgroundColor(this.fillColor);
    var grey = new lore.draw2d.Color(174, 174, 174);
    this.setColor(grey);
    } catch (e){
        lore.debug.ore("Problem",e);
    }
};
lore.draw2d.Port.ZOrderBaseIndex = 5000;
lore.draw2d.Port.setZOrderBaseIndex = function(index) {
    lore.draw2d.Port.ZOrderBaseIndex = index;
};
Ext.extend(lore.draw2d.Port, lore.draw2d.Rectangle, {
    setName : function(name) {
        this.name = name;
    },
    getName : function() {
        return this.name;
    },
    getConnections: function() {
        var arr = new lore.draw2d.ArrayList();
        var size = this.moveListener.getSize();
        for (var i = 0; i < size; i++) {
            var f = this.moveListener.get(i);
            if (f instanceof lore.draw2d.Connection) {
                arr.add(f);
            }
        }
        return arr;
    },
    /** Override onDrag: don't show port and account for scroll offsets */
    onDrag : function(){
      try{
      //this.x = this.draggable.getLeft();
      //this.y = this.draggable.getTop();
      var dcenter = this.draggable.getCenter();
      var pn = this.parentNode;
      var wf = pn.workflow;
      
      if (!(this.isMoving)){
        this.isMoving = true;
        wf.showMask(); 
        wf.connectionLine.setAlpha(0.8);
        this.yoffset = wf.getScrollTop();
        this.xoffset = wf.getScrollLeft();
      }
      wf.showConnectionLine(
        pn.x + dcenter[0] - (this.xoffset - wf.getScrollLeft()),
        pn.y + dcenter[1] - (this.yoffset - wf.getScrollTop()),
        pn.x+this.originX,
        pn.y+this.originY
      );
      this.fireMoveEvent();
        } catch (ex){
            lore.debug.ore("problem in port onDrag",ex);
        }
    },
    /** Reset state back to that before drag */
    onDragend : function(){
        this.setPosition(this.originX, this.originY);
        this.workflow.hideConnectionLine();
        this.workflow.hideMask();
        this.isMoving = false;
        delete this.yoffset;
        delete this.xoffset;
    },
    setCanvas: function(c){
      if (this.uirep){
        this.uirep.remove();
      }
      this.canvas = c;
      if (c){
        this.paint();
      }
    },
    onOtherFigureMoved : function(_51b6) {
        this.fireMoveEvent();
        this.paint();
    },
    /**
     * @private Override to add css class for ports
     * @param {} port
     */
    createHTMLElement : function(){
        var item = lore.draw2d.Rectangle.prototype.createHTMLElement.call(this);
        item.style.zIndex = lore.draw2d.Port.ZOrderBaseIndex;
        item.className = "port";
        return item;
    },
    showCorona : function(flag, _51bf) {
        try{
        if (flag == true) {
            this.corona = this.workflow.canvElem.circle(this.getAbsoluteX(),
                this.getAbsoluteY(), 40);
            this.corona.attr("opacity",0.3);
            //this.corona.attr("fill",new lore.draw2d.Color(0, 125, 125).getHTMLStyle());
            this.corona.attr("fill","r#FF9900:10-#FFFF33");//"r(0.5, 0.5)#007d7d-#ffffff");
            this.corona.attr("stroke-width",0);
        } else {
            if (flag == false && this.corona != null) {
                //this.workflow.removeFigure(this.corona);
                this.corona.remove();
                this.corona = null;
            }
        }
        } catch (e){
            lore.debug.ore("Problem",e);
        }
    },
    /** Show a corona when dragging near a port
     * @param {} port
     */
    onDragEnter : function(/*:lore.draw2d.Port*/ port){
      this.workflow.connectionLine.setAlpha(1.0);
      this.showCorona(true);
      this.setBackgroundColor(this.highlightFillColor);
    },
    /** Hide corona 
     * @param {} port
     */
    onDragLeave : function(/*:lore.draw2d.Port*/ port)
    {
      this.workflow.connectionLine.setAlpha(0.8);
      this.showCorona(false);
      this.setBackgroundColor(this.fillColor);
    },
    /**
     * Create a connection between nodes if a port from another node is dropped on this port
     * @param {} port
     */
    onDrop : function(port) {
    	if (this.parentNode.id != port.parentNode.id) {
    		var commConn = new lore.draw2d.CommandConnect(this.workflow, this, port);
            var conn = new lore.draw2d.Connection();
    		commConn.setConnection(conn);
            this.workflow.getCommandStack().execute(commConn);
            this.workflow.setCurrentSelection(conn);
            // FIXME: workaround: graphical editor not focused after drag
            Ext.getCmp('drawingarea').focus();
    	} else {
            lore.ore.ui.vp.warning("LORE does not currently support relating a resource to itself");
        }
    },
    setLineWidth: function(w) {
      this.lineStroke = w;
      if (this.uirep) {
        this.uirep.attr("stroke-width",w);
      }
    },
    setColor: function(color){
        this.lineColor = color;
        if (this.uirep) {
            this.uirep.attr("stroke","#eeeeee");//color.getHTMLStyle());
        }
    },
    setBackgroundColor : function(color) {
        this.bgColor = color;
        if (this.uirep) {
            this.uirep.attr("fill",color.getHTMLStyle());
        }
    },
    setAlpha : function(a){
        this.alpha = a;
        if (this.uirep){
            this.uirep.attr("opacity",a);
        }
    },
    getAbsolutePosition : function() {
        return new lore.draw2d.Point(this.getAbsoluteX(), this.getAbsoluteY());
    },
    getAbsoluteBounds : function() {
        return new lore.draw2d.Dimension(this.getAbsoluteX(), this.getAbsoluteY(), this
                        .getWidth(), this.getHeight());
    },
    getAbsoluteY : function() {
        return this.originY + this.parentNode.getY();
    },
    getAbsoluteX : function() {
        return this.originX + this.parentNode.getX();
    },
    setDimension : function(width, _51a1) {
        lore.draw2d.Rectangle.prototype.setDimension.call(this, width, _51a1);
        this.setPosition(this.x, this.y);
    },
    setPosition : function(xPos, yPos) {
        this.originX = xPos;
        this.originY = yPos;
        lore.draw2d.Rectangle.prototype.setPosition.call(this, xPos, yPos);
        if (this.html == null) {
            return;
        }
        this.html.style.left = (this.x - this.getWidth() / 2) + "px";
        this.html.style.top = (this.y - this.getHeight() / 2) + "px";
    },
    setOrigin : function(x, y) {
        this.originX = x;
        this.originY = y;
    },
    isOver : function(iX, iY) {
        var x = this.getAbsoluteX() - this.coronaWidth - this.getWidth() / 2;
        var y = this.getAbsoluteY() - this.coronaWidth - this.getHeight() / 2;
        var iX2 = x + this.width + (this.coronaWidth * 2) + this.getWidth() / 2;
        var iY2 = y + this.height + (this.coronaWidth * 2) + this.getHeight() / 2;
        return (iX >= x && iX <= iX2 && iY >= y && iY <= iY2);
    },
    paint : function() {
       if (this.uirep) {
            this.uirep.remove();
       }
       this.uirep = this.workflow.canvElem.circle(this.getAbsoluteX(), this.getAbsoluteY(),5);
       if (this.bgColor){
        this.uirep.attr("fill",this.bgColor.getHTMLStyle());
       }
       if (this.lineColor) {
        this.uirep.attr("stroke",this.lineColor.getHTMLStyle());
       }
       if(this.lineStroke){
        this.uirep.attr("stroke-width",this.lineStroke);
       }
       if(this.alpha){
        this.uirep.attr("opacity",this.alpha);
       }
    },
    getParent : function() {
        return this.parentNode;
    },
    setParent : function(_51ab) {
        if (this.parentNode != null) {
            this.parentNode.detachMoveListener(this);
        }
        this.parentNode = _51ab;
        if (this.parentNode != null) {
            this.parentNode.attachMoveListener(this);
        }
        this.workflow = this.parentNode.workflow;
    },
    createCommand : function(_51c0) {
        if (_51c0.getPolicy() == lore.draw2d.EditPolicy.MOVE) {
            return new lore.draw2d.CommandMovePort(this);
        }
        if (_51c0.getPolicy() == lore.draw2d.EditPolicy.CONNECT) {
            if (_51c0.source.parentNode.id == _51c0.target.parentNode.id) {
                return null;
            } else {
                return new lore.draw2d.CommandConnect(_51c0.canvas, _51c0.source,
                        _51c0.target);
            }
        }
        return null;
    },
    dispose : function() {
        if (this.uirep){
            this.uirep.remove();
        }
        var size = this.moveListener.getSize();
        for (var i = 0; i < size; i++) {
            var _519d = this.moveListener.get(i);
            this.parentNode.workflow.removeFigure(_519d);
            _519d.dispose();
        }
        lore.draw2d.Rectangle.prototype.dispose.call(this);
        this.parentNode = null;
        this.dropable.node = null;
        this.dropable = null;

    }
});