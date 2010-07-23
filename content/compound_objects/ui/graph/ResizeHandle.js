/*
 * Copyright (C) 2008 - 2010 School of Information Technology and Electrical
 * Engineering, University of Queensland (www.itee.uq.edu.au).
 * 
 * This file is part of LORE. LORE was developed as part of the Aus-e-Lit
 * project.
 * 
 * LORE is free software: you can redistribute it and/or modify it under the
 * terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 * 
 * LORE is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along with
 * LORE. If not, see <http://www.gnu.org/licenses/>.
 */
/** 
 * @class lore.ore.ui.graph.ResizeHandle
 * @extends draw2d.ResizeHandle
 */
lore.ore.ui.graph.ResizeHandle = Ext.extend(draw2d.ResizeHandle, {
    type : "lore.ore.ui.graph.ResizeHandle",
    /**  Lower figure */
    onDragend : function (){
        var figure = this.workflow.currentSelection;
        figure.lower();
        draw2d.ResizeHandle.prototype.onDragend.call(this);
    },
    /** Raise  figure to avoid interference from other node preview contents */
    onDragstart: function (x, y) {
        var figure = this.workflow.currentSelection;
        figure.raise();
        return draw2d.ResizeHandle.prototype.onDragstart.call(this, x, y);
    }
});
/** 
 * @class lore.ore.ui.graph.LineStartResizeHandle
 * @extends draw2d.LineStartResizeHandle
 * */
lore.ore.ui.graph.LineStartResizeHandle = Ext.extend(draw2d.LineStartResizeHandle, {
   type :  "lore.ore.ui.graph.LineStartResizeHandle",
   /** Handle offsets and enable mask to avoid interference from node previews during connection moving */
   onDrag : function () {  
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
	    line.setStartPoint(this.x,this.y);
        // setPosition forces position of this resize handle to update and fires move event
	    this.setPosition(this.x,this.y);
   },
   /** Hide mask and reset offsets when drag ends */
   onDragend : function () {
        this.workflow.hideMask();
        draw2d.LineStartResizeHandle.prototype.onDragend.call(this);
        delete this.yoffset;
        delete this.xoffset;
    },
    onDrop : function(/*: draw2d.Port*/ dropPort){
      var wf = this.workflow;
      var line = wf.currentSelection;
      var p = line.getTarget();
      line.isMoving=false;
      // don't allow reconnect to same node
      if(line instanceof draw2d.Connection && dropPort.parentNode.id != p.parentNode.id)
      {
         this.command.setNewPorts(dropPort, p);
         wf.getCommandStack().execute(this.command);
         // force relationships panel to update (remove once MVC is set up)
         wf.setCurrentSelection(wf.currentSelection);
      } else if (line instanceof draw2d.Connection) {
        lore.ore.ui.loreWarning("LORE does not currently support relating a resource to itself");
        this.command.cancel();
        
      }
      // Workaround to give focus to editor
      Ext.getCmp("drawingarea").focus();
      this.command = null;
    }
});
/** 
 * @class lore.ore.ui.graph.LineEndResizeHandle
 * @extends draw2d.LineEndResizeHandle
 * */
lore.ore.ui.graph.LineEndResizeHandle = Ext.extend(draw2d.LineEndResizeHandle, {
   type :  "lore.ore.ui.graph.LineEndResizeHandle",
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
   /** Hide mask and reset offsets when drag ends */
   onDragend : function () {
        this.workflow.hideMask();
        draw2d.LineEndResizeHandle.prototype.onDragend.call(this);
        delete this.yoffset;
        delete this.xoffset;
    },
    onDrop : function(/*: draw2d.Port*/ dropPort){
        
      var wf = this.workflow;
      var line = wf.currentSelection;
      var p = line.getSource();
      line.isMoving=false;
      // don't allow reconnect to same node
      if(line instanceof draw2d.Connection && dropPort.parentNode.id != p.parentNode.id)
      {
         this.command.setNewPorts(p,dropPort);
         wf.getCommandStack().execute(this.command);
         // force relationships panel to update (remove once MVC is set up)
        wf.setCurrentSelection(wf.currentSelection);
      } else if (line instanceof draw2d.Connection) {
        lore.ore.ui.loreWarning("LORE does not currently support relating a resource to itself");
        this.command.cancel();
        
      }
      // Workaround to give focus to editor
      Ext.getCmp("drawingarea").focus();
      this.command = null;
    }
});