 lore.draw2d.ResizeHandle = function(_4e8d, type) {
    lore.draw2d.Rectangle.call(this, 5, 5);
    this.type = type;
    var _4e8f = this.getWidth();
    var _4e90 = _4e8f / 2;
    switch (this.type) {
        case 1 :
            this.setSnapToGridAnchor(new lore.draw2d.Point(_4e8f, _4e8f));
            break;
        case 2 :
            this.setSnapToGridAnchor(new lore.draw2d.Point(_4e90, _4e8f));
            break;
        case 3 :
            this.setSnapToGridAnchor(new lore.draw2d.Point(0, _4e8f));
            break;
        case 4 :
            this.setSnapToGridAnchor(new lore.draw2d.Point(0, _4e90));
            break;
        case 5 :
            this.setSnapToGridAnchor(new lore.draw2d.Point(0, 0));
            break;
        case 6 :
            this.setSnapToGridAnchor(new lore.draw2d.Point(_4e90, 0));
            break;
        case 7 :
            this.setSnapToGridAnchor(new lore.draw2d.Point(_4e8f, 0));
            break;
        case 8 :
            this.setSnapToGridAnchor(new lore.draw2d.Point(_4e8f, _4e90));
        case 9 :
            this.setSnapToGridAnchor(new lore.draw2d.Point(_4e90, _4e90));
            break;
    }
    this.setBackgroundColor(new lore.draw2d.Color(0, 255, 0));
    this.setWorkflow(_4e8d);
    this.setZOrder(10000);
};
lore.draw2d.ResizeHandle.prototype = new lore.draw2d.Rectangle;
lore.draw2d.ResizeHandle.prototype.getSnapToDirection = function() {
    switch (this.type) {
        case 1 :
            return lore.draw2d.SnapToHelper.NORTH_WEST;
        case 2 :
            return lore.draw2d.SnapToHelper.NORTH;
        case 3 :
            return lore.draw2d.SnapToHelper.NORTH_EAST;
        case 4 :
            return lore.draw2d.SnapToHelper.EAST;
        case 5 :
            return lore.draw2d.SnapToHelper.SOUTH_EAST;
        case 6 :
            return lore.draw2d.SnapToHelper.SOUTH;
        case 7 :
            return lore.draw2d.SnapToHelper.SOUTH_WEST;
        case 8 :
            return lore.draw2d.SnapToHelper.WEST;
        case 9 :
            return lore.draw2d.SnapToHelper.CENTER;
    }
};
lore.draw2d.ResizeHandle.prototype.onDragend = function() {
    var _4e91 = this.workflow.currentSelection;
    if (this.commandMove != null) {
        this.commandMove.setPosition(_4e91.getX(), _4e91.getY());
        this.workflow.getCommandStack().execute(this.commandMove);
        this.commandMove = null;
    }
    if (this.commandResize != null) {
        this.commandResize.setDimension(_4e91.getWidth(), _4e91.getHeight());
        this.workflow.getCommandStack().execute(this.commandResize);
        this.commandResize = null;
    }
    this.workflow.hideSnapToHelperLines();
};
lore.draw2d.ResizeHandle.prototype.setPosition = function(xPos, yPos) {
    this.x = xPos;
    this.y = yPos;
    this.html.style.left = this.x + "px";
    this.html.style.top = this.y + "px";
};
lore.draw2d.ResizeHandle.prototype.onDragstart = function(x, y) {
    if (!this.canDrag) {
        return false;
    }
    var _4e96 = this.workflow.currentSelection;
    this.commandMove = _4e96
            .createCommand(new lore.draw2d.EditPolicy(lore.draw2d.EditPolicy.MOVE));
    this.commandResize = _4e96
            .createCommand(new lore.draw2d.EditPolicy(lore.draw2d.EditPolicy.RESIZE));
    return true;
};
lore.draw2d.ResizeHandle.prototype.onDrag = function() {
    var oldX = this.getX();
    var oldY = this.getY();
    lore.draw2d.Rectangle.prototype.onDrag.call(this);
    var diffX = oldX - this.getX();
    var diffY = oldY - this.getY();
    var _4e9b = this.workflow.currentSelection.getX();
    var _4e9c = this.workflow.currentSelection.getY();
    var _4e9d = this.workflow.currentSelection.getWidth();
    var _4e9e = this.workflow.currentSelection.getHeight();
    switch (this.type) {
        case 1 :
            this.workflow.currentSelection.setPosition(_4e9b - diffX, _4e9c
                            - diffY);
            this.workflow.currentSelection.setDimension(_4e9d + diffX, _4e9e
                            + diffY);
            break;
        case 2 :
            this.workflow.currentSelection.setPosition(_4e9b, _4e9c - diffY);
            this.workflow.currentSelection.setDimension(_4e9d, _4e9e + diffY);
            break;
        case 3 :
            this.workflow.currentSelection.setPosition(_4e9b, _4e9c - diffY);
            this.workflow.currentSelection.setDimension(_4e9d - diffX, _4e9e
                            + diffY);
            break;
        case 4 :
            this.workflow.currentSelection.setPosition(_4e9b, _4e9c);
            this.workflow.currentSelection.setDimension(_4e9d - diffX, _4e9e);
            break;
        case 5 :
            this.workflow.currentSelection.setPosition(_4e9b, _4e9c);
            this.workflow.currentSelection.setDimension(_4e9d - diffX, _4e9e
                            - diffY);
            break;
        case 6 :
            this.workflow.currentSelection.setPosition(_4e9b, _4e9c);
            this.workflow.currentSelection.setDimension(_4e9d, _4e9e - diffY);
            break;
        case 7 :
            this.workflow.currentSelection.setPosition(_4e9b - diffX, _4e9c);
            this.workflow.currentSelection.setDimension(_4e9d + diffX, _4e9e
                            - diffY);
            break;
        case 8 :
            this.workflow.currentSelection.setPosition(_4e9b - diffX, _4e9c);
            this.workflow.currentSelection.setDimension(_4e9d + diffX, _4e9e);
            break;
    }
    this.workflow.moveResizeHandles(this.workflow.getCurrentSelection());
};
lore.draw2d.ResizeHandle.prototype.setCanDrag = function(flag) {
    lore.draw2d.Rectangle.prototype.setCanDrag.call(this, flag);
    if (!flag) {
        this.html.style.cursor = "";
        return;
    }
    switch (this.type) {
        case 1 :
            this.html.style.cursor = "nw-resize";
            break;
        case 2 :
            this.html.style.cursor = "s-resize";
            break;
        case 3 :
            this.html.style.cursor = "ne-resize";
            break;
        case 4 :
            this.html.style.cursor = "w-resize";
            break;
        case 5 :
            this.html.style.cursor = "se-resize";
            break;
        case 6 :
            this.html.style.cursor = "n-resize";
            break;
        case 7 :
            this.html.style.cursor = "sw-resize";
            break;
        case 8 :
            this.html.style.cursor = "e-resize";
            break;
        case 9 :
            this.html.style.cursor = "resize";
            break;
    }
};
lore.draw2d.ResizeHandle.prototype.onKeyDown = function(_4ea0, ctrl) {
    this.workflow.onKeyDown(_4ea0, ctrl);
};
lore.draw2d.ResizeHandle.prototype.fireMoveEvent = function() {
};


/** 
 * @class lore.ore.ui.graph.ResizeHandle
 * @extends lore.draw2d.ResizeHandle
 */
lore.ore.ui.graph.ResizeHandle = Ext.extend(lore.draw2d.ResizeHandle, {
    type : "lore.ore.ui.graph.ResizeHandle",
    /**  Lower figure */
    onDragend : function (){
        var figure = this.workflow.currentSelection;
        figure.lower();
        lore.draw2d.ResizeHandle.prototype.onDragend.call(this);
    },
    /** Raise  figure to avoid interference from other node preview contents */
    onDragstart: function (x, y) {
        var figure = this.workflow.currentSelection;
        figure.raise();
        return lore.draw2d.ResizeHandle.prototype.onDragstart.call(this, x, y);
    }
});



/** 
 * @class lore.draw2d.LineStartResizeHandle
 * @extends lore.draw2d.ResizeHandle
 * */
lore.draw2d.LineStartResizeHandle = Ext.extend(lore.draw2d.ResizeHandle, {
    constructor: function(wf){
        lore.draw2d.ResizeHandle.call(this, wf, 9);
        this.setDimension(10, 10);
        this.setBackgroundColor(new lore.draw2d.Color(100, 255, 0));
        this.setZOrder(10000);  
    },
   /** Handle offsets and enable mask to avoid interference from node previews during connection moving */
   onDrag : function () {
    try{
	    var wf = this.workflow;
	    var line = wf.currentSelection;
	    if (!line.isMoving) {
	        line.isMoving = true;
	        wf.showMask(); 
	        this.yoffset = wf.getScrollTop();
	        this.xoffset = wf.getScrollLeft();
	    }
	    this.x = this.draggable.getLeft() - (this.xoffset - wf.getScrollLeft());
	    this.y = this.draggable.getTop() - (this.yoffset - wf.getScrollTop());
        //lore.debug.ore("drag " + this.x + " " + this.y,line)
	    line.setStartPoint(this.x,this.y);
        // setPosition forces position of this resize handle to update and fires move event
	    this.setPosition(this.x,this.y);
    } catch (ex){
        lore.debug.ore("Problem",ex);
    }
   },
   onDragstart : function(x, y) {
        if (!this.canDrag) {
            return false;
        }
        this.command = this.workflow.currentSelection
                .createCommand(new lore.draw2d.EditPolicy(lore.draw2d.EditPolicy.MOVE));
        return true;
    },

   /** Hide mask and reset offsets when drag ends */
   onDragend : function () {
        this.workflow.hideMask();
       
        if (this.workflow.currentSelection instanceof lore.draw2d.Connection) {
            if (this.command != null) {
                this.command.cancel();
                //this.workflow.currentSelection.paint();
            }
            //lore.debug.ore("foo");
            
        } else {
            if (this.command != null) {
                this.getWorkflow().getCommandStack().execute(this.command);
            }
        }
        this.command = null;

        delete this.yoffset;
        delete this.xoffset;
    },
    onDrop : function(dropPort){
      
      var wf = this.workflow;
      var line = wf.currentSelection;
      var p = line.getTarget();
      line.isMoving=false;
      
      // don't allow reconnect to same node
      if(dropPort.parentNode.id != p.parentNode.id)
      {
         this.command.setNewPorts(dropPort, p);
         wf.getCommandStack().execute(this.command);
         // force relationships panel to update (remove once MVC is set up)
         wf.setCurrentSelection(wf.currentSelection);
      } else {
        lore.ore.ui.vp.warning("LORE does not currently support relating a resource to itself");
        this.command.cancel();
        
      }
      // Workaround to give focus to editor
      Ext.getCmp("drawingarea").focus();
      this.command = null;
    }
});
/** 
 * @class lore.draw2d.LineEndResizeHandle
 * @extends lore.draw2d.ResizeHandle
 * */
lore.draw2d.LineEndResizeHandle = Ext.extend(lore.draw2d.ResizeHandle, {
   constructor: function(wf){
      lore.draw2d.ResizeHandle.call(this, wf, 9);
      this.setDimension(10, 10);
      this.setBackgroundColor(new lore.draw2d.Color(0, 255, 0));
      this.setZOrder(10000);  
   },
   /** Handle offsets and enabling mask to avoid interference from node previews during connection moving  */
   onDrag : function (){  
        var wf = this.workflow;
        var line = wf.currentSelection;
        if (!line.isMoving) {
            line.isMoving = true;
            wf.showMask(); 
            this.yoffset = wf.getScrollTop();
            this.xoffset = wf.getScrollLeft();
        }
        this.x = this.draggable.getLeft() - (this.xoffset - wf.getScrollLeft());
        this.y = this.draggable.getTop() - (this.yoffset - wf.getScrollTop());
        line.setEndPoint(this.x,this.y);
        // setPosition forces position of this resize handle to update and fires move event
        this.setPosition(this.x,this.y);
   },
   onDragstart : function(x, y) {
        if (!this.canDrag) {
            return false;
        }
        this.command = this.workflow.currentSelection
                .createCommand(new lore.draw2d.EditPolicy(lore.draw2d.EditPolicy.MOVE));
        return true;
    },
   /** Hide mask and reset offsets when drag ends */
   onDragend : function () {
        this.workflow.hideMask();
        if (this.workflow.currentSelection instanceof lore.ore.ui.graph.ConextmenuConnection) {
            if (this.command != null) {
                this.command.cancel();
                //this.workflow.currentSelection.paint();
            }
            
        } else {
            if (this.command != null) {
                this.workflow.getCommandStack().execute(this.command);
            }
        }
        this.command = null;
        delete this.yoffset;
        delete this.xoffset;
    },
    onDrop : function(dropPort){
        
      var wf = this.workflow;
      var line = wf.currentSelection;
      var p = line.getSource();
      line.isMoving=false;
      // don't allow reconnect to same node
      if(dropPort.parentNode.id != p.parentNode.id)
      {
         this.command.setNewPorts(p,dropPort);
         wf.getCommandStack().execute(this.command);
         // force relationships panel to update (remove once MVC is set up)
        wf.setCurrentSelection(wf.currentSelection);
      } else {
        lore.ore.ui.vp.warning("LORE does not currently support relating a resource to itself");
        this.command.cancel();
        
      }
      // Workaround to give focus to editor
      Ext.getCmp("drawingarea").focus();
      this.command = null;
    }
});

