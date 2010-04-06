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
 * ResizeHandles that raise and lower figure to avoid interference from other node preview contents
 * @class lore.ore.ui.graph.ResizeHandle
 * @extends draw2d.ResizeHandle
 */
lore.ore.ui.graph.ResizeHandle = Ext.extend(draw2d.ResizeHandle, {
    type : "lore.ore.ui.graph.ResizeHandle",
    onDragend : function (){
        var figure = this.workflow.currentSelection;
        figure.lower();
        draw2d.ResizeHandle.prototype.onDragend.call(this);
    },
    onDragstart: function (x,y){
        var figure = this.workflow.currentSelection;
        figure.raise();
        return draw2d.ResizeHandle.prototype.onDragstart.call(this, x, y);
    }
});
/** 
 * Handle offsets and enabling mask to avoid interference from node previews during connection moving 
 * @class lore.ore.ui.graph.LineStartResizeHandle
 * @extends draw2d.LineStartResizeHandle
 * */
lore.ore.ui.graph.LineStartResizeHandle = Ext.extend(draw2d.LineStartResizeHandle, {
   type :  "lore.ore.ui.graph.LineResizeHandle",
   onDrag : function (){  
	    var wf = this.workflow;
	    var line = wf.currentSelection;
	    if (!line.isMoving){
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
   onDragend : function (){
        this.workflow.hideMask();
        draw2d.LineStartResizeHandle.prototype.onDragend.call(this);
        delete this.yoffset;
        delete this.xoffset;
    }
});
/** 
 * Handle offsets and enabling mask to avoid interference from node previews during connection moving 
 * @class lore.ore.ui.graph.LineEndResizeHandle
 * @extends draw2d.LineEndResizeHandle
 * */
lore.ore.ui.graph.LineEndResizeHandle = Ext.extend(draw2d.LineEndResizeHandle, {
   type :  "lore.ore.ui.graph.LineResizeHandle",
   onDrag : function (){  
        var wf = this.workflow;
        var line = wf.currentSelection;
        if (!line.isMoving){
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
   onDragend : function (){
        this.workflow.hideMask();
        draw2d.LineEndResizeHandle.prototype.onDragend.call(this);
        delete this.yoffset;
        delete this.xoffset;
    }
});