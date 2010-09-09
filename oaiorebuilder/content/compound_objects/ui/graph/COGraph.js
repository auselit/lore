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
 * @class lore.ore.ui.graph.COGraph The Graphical compound object editing view
 * @extends draw2d.Workflow
 * @param {} id
 */
lore.ore.ui.graph.COGraph = function(id) {
    draw2d.Workflow.call(this, id);
    try {
    	this.commandStack = new lore.ore.ui.graph.CommandStack();
	    this.layouter = new lore.ore.ui.graph.autolayout.Layouter(this);
	    this.layouter.setPreferredEdgeLength(160);
        /* The mask element covers figures to allow mouse to move over figures during moves
         * without interference from figure contents
         **/
	    this.mask = document.createElement("div");
        this.mask.style.position="absolute";
        this.mask.style.top = "0px";
        this.mask.style.left = "0px";
	    this.mask.style.backgroundColor="transparent";
	    this.mask.style.display="none";
        this.mask.style.zIndex="6000";
        this.html.appendChild(this.mask);
        this.showEmptyMessage();
        /* Override resizeHandles to use handles that raise/lower figures when resizing */
        this.resizeHandle1 = new lore.ore.ui.graph.ResizeHandle(this,1); // 1 = LEFT TOP
		this.resizeHandle2 = new lore.ore.ui.graph.ResizeHandle(this,2); // 2 = CENTER_TOP
		this.resizeHandle3 = new lore.ore.ui.graph.ResizeHandle(this,3); // 3 = RIGHT_TOP
		this.resizeHandle4 = new lore.ore.ui.graph.ResizeHandle(this,4); // 4 = RIGHT_MIDDLE
		this.resizeHandle5 = new lore.ore.ui.graph.ResizeHandle(this,5); // 5 = RIGHT_BOTTOM
		this.resizeHandle6 = new lore.ore.ui.graph.ResizeHandle(this,6); // 6 = CENTER_BOTTOM
		this.resizeHandle7 = new lore.ore.ui.graph.ResizeHandle(this,7); // 7 = LEFT_BOTTOM
		this.resizeHandle8 = new lore.ore.ui.graph.ResizeHandle(this,8); // 8 = LEFT_MIDDLE
        this.resizeHandleStart = new lore.ore.ui.graph.LineStartResizeHandle(this); 
        this.resizeHandleEnd = new lore.ore.ui.graph.LineEndResizeHandle(this); 
        // default colour for line that is displayed for creating connections
        this.connectionLine.setColor(new draw2d.Color(174, 174, 174));
        this.previewCanvas = document.createElement("canvas");
        this.setSnapToGeometry(true);
        this.setPanning(true);
        // don't use move cursor for panning
        this.html.style.cursor="default";
        
        
        // allow multiple selection
        this.multiSelection = [];
        this.selecting = false;
        this.selectionFigure = new draw2d.Rectangle(10,10);
        this.selectionFigure.setColor(new draw2d.Color(170,204,246));
        
        // detect other key modifiers eg meta, shift
        var oThis = this;
        this.html.removeEventListener("keydown",this.keyDown,false);
        this.keyDown = function(event){
                oThis.onKeyDown(event.keyCode, event.ctrlKey, event.metaKey, event.shiftKey);
        };
        this.html.addEventListener("keydown", this.keyDown, false);
        
    } catch (ex){
        lore.debug.ore("error setting up COGraph",ex);
    }
};
Ext.extend(lore.ore.ui.graph.COGraph, draw2d.Workflow, {
    type : "lore.ore.ui.graph.COGraph",

    /** 
     * Trigger automatic layout of figures. 
     * 
     */
	doLayout : function(useConnections) {
			this.commandStack.startCommandGroup();
	        if (useConnections && this.getDocument().getLines().getSize() > 0){
	        	// If there are connections, use the layouter
	            this.layouter.doLayout();
	            lore.ore.ui.vp.info("Auto layout using connections complete");
	        } else {
	        	try{
		        // otherwise move resource figures closer to each other in grid pattern based on current order
		        var ge = lore.ore.ui.graphicalEditor;
	        	var x = ge.NODE_SPACING;
		        var y = x;
		        var lineHeight = 0;
		        var allfigures = this.getFiguresSorted();
		        for (var i = 0; i < allfigures.length; i++) {
		            var fig = allfigures[i];
		            if (fig && fig instanceof lore.ore.ui.graph.ResourceFigure){
			            var command = new draw2d.CommandMove(fig);
			            command.setPosition(x, y);
			            this.getCommandStack().execute(command);
			            lineHeight = Math.max(lineHeight, fig.height);
			            if (x > ge.ROW_WIDTH) {   	
			                x = ge.NODE_SPACING;
			                y = y + lineHeight + ge.NODE_SPACING;
			                lineHeight = 0;
			            } else {
			                x = x + fig.width + ge.NODE_SPACING;
			            }
		            }
		            
		        }
		        lore.ore.ui.vp.info("Auto layout complete");
	        	} catch (e){
	        		lore.debug.ore("problem with auto layout",e);
	        	}
	        }
	        this.commandStack.endCommandGroup();
	            
	},
    
    /**
     * Show a message indicating the compound object is empty
     * @private
     */
    showEmptyMessage : function() {
        this.setBackgroundImage("chrome://lore/skin/icons/emptyco.png",false);
    },
    /** 
     * Remove the message indicating the compound object is empty
     * @private
     */
    clearEmptyMessage : function() {
        this.setBackgroundImage();  
    },
    /** Override getHeight because html element height is incorrect on initial load */
    getHeight : function() {
        return this.scrollArea.scrollHeight;
    },
    /** Override getWidth because html element width is incorrect on initial load */
    getWidth : function () {
        return this.scrollArea.scrollWidth;
    },
    /** Set the scroll area */
    setScrollArea : function(scrollarea){
        this.scrollArea = scrollarea;
        this.resizeMask();
    },
    /**
     * Show the mask to prevent other figures previews interfering with mouse 
     * during move, resize and connection operations
     */
    showMask : function () {
        // ensure mask is the correct size before enabling it (mask area may need to grow
        // if figures have been added, resized or moved)
        this.resizeMask();
        this.mask.style.display="block";  
    },
    /** 
     * Hide the mask
     */
    hideMask : function () {
        this.mask.style.display="none";
    },
    /** 
     * Resizes the drawing area and mask
     * @private */
    resizeMask : function () {
        // set drawing area back to 100% before getting scroll values - 
        // allowing scroll area to shrink to content
        this.html.style.width = "100%";
        this.html.style.height = "100%";
        var newx = this.scrollArea.scrollWidth - 1;
        var newy = this.scrollArea.scrollHeight - 1;
        this.html.style.height = newy + "px";
        this.mask.style.height = newy + "px";
        this.html.style.width = newx + "px";
        this.mask.style.width = newx + "px";
    },
    /** 
     * Remove all figures and reset mask and empty message
     */
    clear : function() {
        draw2d.Workflow.prototype.clear.call(this);
        this.commandStack = new lore.ore.ui.graph.CommandStack();
        this.resizeMask();
        this.showEmptyMessage();
    },
    /**
     * Override to hide/show empty message when figures are added or removed
     */
    setDocumentDirty: function() {
      draw2d.Workflow.prototype.setDocumentDirty.call(this);
      if (this.figures.getSize() == 0) {
        this.showEmptyMessage();
      } else {
        this.clearEmptyMessage();
      }
    },
    showSelectionFigure: function(x, y, w, h) {
      this.selectionFigure.setPosition(x,y);
      this.selectionFigure.setDimension(w,h);
      
      if(this.selectionFigure.canvas==null) {
        draw2d.Canvas.prototype.addFigure.call(this,this.selectionFigure);
      }
    },
    hideSelectionFigure: function() {
        if(this.selectionFigure.canvas!=null) {
            draw2d.Canvas.prototype.removeFigure.call(this,this.selectionFigure);
        }
    },
    // TODO: move resizeHandles to be owned by Figure so that we can support multi-selection
	/**
	 * Overrides the method from the superclass to change the colour of the handles
	 * @param {draw2d.Figure} figure The figure on which the resize handles are to be displayed
	 */
	showResizeHandles: function(figure) {
	  this.hideLineResizeHandles();
	  this.hideResizeHandles();
	
	  if(this.getEnableSmoothFigureHandling() && this.getCurrentSelection() != figure) {
	     this.resizeHandle1.setAlpha(0.01);
	     this.resizeHandle2.setAlpha(0.01);
	     this.resizeHandle3.setAlpha(0.01);
	     this.resizeHandle4.setAlpha(0.01);
	     this.resizeHandle5.setAlpha(0.01);
	     this.resizeHandle6.setAlpha(0.01);
	     this.resizeHandle7.setAlpha(0.01);
	     this.resizeHandle8.setAlpha(0.01);
	  }
	
	  var resizeWidth = this.resizeHandle1.getWidth();
	  var resizeHeight= this.resizeHandle1.getHeight();
	  var objHeight   = figure.getHeight();
	  var objWidth    = figure.getWidth();
	  var xPos = figure.getX();
	  var yPos = figure.getY();
	  draw2d.Canvas.prototype.addFigure.call(this,this.resizeHandle1,xPos-resizeWidth,yPos-resizeHeight);
	  draw2d.Canvas.prototype.addFigure.call(this,this.resizeHandle3,xPos+objWidth,yPos-resizeHeight);
	  draw2d.Canvas.prototype.addFigure.call(this,this.resizeHandle5,xPos+objWidth,yPos+objHeight);
	  draw2d.Canvas.prototype.addFigure.call(this,this.resizeHandle7,xPos-resizeWidth,yPos+objHeight);
	
	  this.moveFront(this.resizeHandle1);
	  this.moveFront(this.resizeHandle3);
	  this.moveFront(this.resizeHandle5);
	  this.moveFront(this.resizeHandle7);
	
	  this.resizeHandle1.setCanDrag(figure.isResizeable());
	  this.resizeHandle3.setCanDrag(figure.isResizeable());
	  this.resizeHandle5.setCanDrag(figure.isResizeable());
	  this.resizeHandle7.setCanDrag(figure.isResizeable());
	  if (figure.isResizeable()) {
	    var blue = new draw2d.Color(217,232,251);
	    var brightblue = new draw2d.Color(170,204,246);
	    this.resizeHandle1.setBackgroundColor(blue);
	    this.resizeHandle2.setBackgroundColor(blue);
	    this.resizeHandle3.setBackgroundColor(blue);
	    this.resizeHandle4.setBackgroundColor(blue);
	    this.resizeHandle5.setBackgroundColor(blue);
	    this.resizeHandle6.setBackgroundColor(blue);
	    this.resizeHandle7.setBackgroundColor(blue);
	    this.resizeHandle8.setBackgroundColor(blue);
	    this.resizeHandle1.setColor(brightblue);
	    this.resizeHandle2.setColor(brightblue);
	    this.resizeHandle3.setColor(brightblue);
	    this.resizeHandle4.setColor(brightblue);
	    this.resizeHandle5.setColor(brightblue);
	    this.resizeHandle6.setColor(brightblue);
	    this.resizeHandle7.setColor(brightblue);
	    this.resizeHandle8.setColor(brightblue);
	  } else {
	  	var grey = new draw2d.Color(174,174,174);
	    this.resizeHandle1.setBackgroundColor(null);
	    this.resizeHandle2.setBackgroundColor(null);
	    this.resizeHandle3.setBackgroundColor(null);
	    this.resizeHandle4.setBackgroundColor(null);
	    this.resizeHandle5.setBackgroundColor(null);
	    this.resizeHandle6.setBackgroundColor(null);
	    this.resizeHandle7.setBackgroundColor(null);
	    this.resizeHandle8.setBackgroundColor(null);
	    this.resizeHandle1.setColor(grey);
	    this.resizeHandle2.setColor(grey);
	    this.resizeHandle3.setColor(grey);
	    this.resizeHandle4.setColor(grey);
	    this.resizeHandle5.setColor(grey);
	    this.resizeHandle6.setColor(grey);
	    this.resizeHandle7.setColor(grey);
	    this.resizeHandle8.setColor(grey);
	  }
	
	  if(figure.isStrechable() && figure.isResizeable()) {
	    this.resizeHandle2.setCanDrag(figure.isResizeable());
	    this.resizeHandle4.setCanDrag(figure.isResizeable());
	    this.resizeHandle6.setCanDrag(figure.isResizeable());
	    this.resizeHandle8.setCanDrag(figure.isResizeable());
	    draw2d.Canvas.prototype.addFigure.call(this,this.resizeHandle2,xPos+(objWidth/2)-this.resizeHandleHalfWidth,yPos-resizeHeight);
	    draw2d.Canvas.prototype.addFigure.call(this,this.resizeHandle4,xPos+objWidth,yPos+(objHeight/2)-(resizeHeight/2));
	    draw2d.Canvas.prototype.addFigure.call(this,this.resizeHandle6,xPos+(objWidth/2)-this.resizeHandleHalfWidth,yPos+objHeight);
	    draw2d.Canvas.prototype.addFigure.call(this,this.resizeHandle8,xPos-resizeWidth,yPos+(objHeight/2)-(resizeHeight/2));
	    this.moveFront(this.resizeHandle2);
	    this.moveFront(this.resizeHandle4);
	    this.moveFront(this.resizeHandle6);
	    this.moveFront(this.resizeHandle8);
	  }
	},
	/**
	 * Customize the resize handles
	 * @param {draw2d.Line} figure The line for the resize handles.
	 * @private
	 **/
	showLineResizeHandles:function(figure) {
	  var blue = new draw2d.Color(217,232,251);
	  var brightblue = new draw2d.Color(170,204,246);
	  var resizeWidthHalf = this.resizeHandleStart.getWidth()/2;
	  var resizeHeightHalf= this.resizeHandleStart.getHeight()/2;
	  var startPoint = figure.getStartPoint();
	  var endPoint   = figure.getEndPoint();
	  draw2d.Canvas.prototype.addFigure.call(this,this.resizeHandleStart,startPoint.x-resizeWidthHalf,startPoint.y-resizeWidthHalf);
	  draw2d.Canvas.prototype.addFigure.call(this,this.resizeHandleEnd,endPoint.x-resizeWidthHalf,endPoint.y-resizeWidthHalf);
	  this.resizeHandleStart.setCanDrag(figure.isResizeable());
	  this.resizeHandleEnd.setCanDrag(figure.isResizeable());
	  if(figure.isResizeable()) {
	    this.resizeHandleStart.setBackgroundColor(blue);
	    this.resizeHandleStart.setColor(brightblue);
	    this.resizeHandleEnd.setBackgroundColor(blue);
	    this.resizeHandleEnd.setColor(brightblue);
	    // required for reconnect of connections
	   this.resizeHandleStart.draggable.targets= this.dropTargets;
	   this.resizeHandleEnd.draggable.targets= this.dropTargets;
	
	  } else {
	    this.resizeHandleStart.setBackgroundColor(null);
	    this.resizeHandleEnd.setBackgroundColor(null);
	  }
	},
	/**
	 * Allow Delete/backspace key to trigger node deletion (including on Mac)
	 * @param {int} keyCode
	 * @param {boolean} ctrl
	 */
	onKeyDown: function(keyCode, ctrl, meta, shift) {
        var sel = this.currentSelection;
        var msel = this.multiSelection;
        try{
        
          
          if (shift) {
            this.selecting = true;
          } else if (!this.dragging) {
            this.selecting = false;
          } 
    	  if((keyCode==46 || keyCode==8)) {
    		  // delete selected figure(s)
    		  if (sel){
    			  this.commandStack.execute(sel.createCommand(new draw2d.EditPolicy(draw2d.EditPolicy.DELETE)));
    		  } else if (msel){
    			  this.commandStack.startCommandGroup();
    			  for (var i = 0; i < msel.length; i++){
    				  this.commandStack.execute(msel[i].createCommand(new draw2d.EditPolicy(draw2d.EditPolicy.DELETE)));
    			  }
    			  this.commandStack.endCommandGroup();
    		  }
          } else if(keyCode==90 && (ctrl || meta)) {
    	     this.commandStack.undo();
          } else if(keyCode==89 && (ctrl || meta)) {
    	     this.commandStack.redo();
          } else if (ctrl && (keyCode==37 || keyCode == 38 || keyCode == 39 || keyCode == 40) && this.multiSelection.length > 0){ 
            // move selected figures
        	this.commandStack.startCommandGroup();
            for (var i = 0; i < this.multiSelection.length; i++) {
                var fig = this.multiSelection[i];
                if (fig) {
                    var x = fig.getX();
                    var y = fig.getY();
                    var newX, newY;
                    if (keyCode == 37) { // left
                        newX = x - 10;
                        newY = y;
                    } else if (keyCode == 38) { // up
                        newX = x;
                        newY = y - 10;
                    } else if (keyCode == 39) { // right
                        newX = x + 10;
                        newY = y;
                    } else { // down
                        newX = x;
                        newY = y + 10;
                    }
                    
                    if (newX >= 0 && newY >= 0) {
                        var comm = fig.createCommand(new draw2d.EditPolicy(draw2d.EditPolicy.MOVE));
                        comm.setPosition(newX, newY);
                        this.commandStack.execute(comm);
                    }
                }
            }
            this.commandStack.endCommandGroup();
          } 
        
        } catch (e){
            lore.debug.ore("COGraph: onKeyDown",e);
        }
	},
    /** Override to prevent panning when hovering over a figure */
    onMouseMove: function(x , y) {
      // DragDrop of a connection/Line
      var diffX = x-this.mouseDownPosX;
      var diffY = y-this.mouseDownPosY;
     /* if(this.dragging && this.draggingLine) {
       this.draggingLine.startX= this.draggingLine.getStartX()+diffX;
       this.draggingLine.startY= this.draggingLine.getStartY()+diffY;
       this.draggingLine.setEndPoint(this.draggingLine.getEndX()+diffX, this.draggingLine.getEndY()+diffY);
       this.mouseDownPosX = x;
       this.mouseDownPosY = y;

      } else */
      if (this.dragging && this.selecting) {
        // show selection figure if making multiselection
        //lore.debug.ore("selecting");
        var newX = diffX < 0? x : this.mouseDownPosX;
        var newY = diffY < 0? y : this.mouseDownPosY;
        this.showSelectionFigure(newX, newY, Math.abs(diffX), Math.abs(diffY));
      } else if(this.dragging && this.panning && !this.currentSelection) {
        // Panning:  set the new viewpoint
       this.scrollTo(this.getScrollLeft()-diffX,  this.getScrollTop()-diffY,true);
       // adjust all palletes and toolbars
       this.onScroll();
      }
    },
    /** Override onMouseUp to deal with multi-selection */
    onMouseUp: function(x, y){
        if (this.selecting) {
            this.selecting = false;
            this.hideSelectionFigure();
            var diffX = x-this.mouseDownPosX;
            var diffY = y-this.mouseDownPosY;
            var x1, x2, y1, y2;
            if (x < this.mouseDownPosX) {
                x1 = x; x2 = this.mouseDownPosX;
            } else {
                x1 = this.mouseDownPosX; x2 = x;
            }
            if (y < this.mouseDownPosY) {
                y1 = x; y2 = this.mouseDownPosY;
            } else {
                y1 = this.mouseDownPosY; y2 = y;
            }
            var selectedFigures = this.multiSelectFigures(x1, y1, x2, y2);
            lore.debug.ore("selected multiple figures",selectedFigures);
        }
        
      this.dragging = false;
      /*if(this.draggingLineCommand!=null)
      {
        lore.debug.ore("draggingLine command",this.currentSelection);
        this.getCommandStack().execute(this.draggingLineCommand);
        // force relationships panel to update (workaround until MVC)
        this.setCurrentSelection(this.currentSelection);
        this.draggingLine = null;
        this.draggingLineCommand=null;
      }*/
    },
    /** Override to prevent two selection events being fired in succession */
    onMouseDown: function(/*:int*/ x, /*:int*/ y)
    {
      this.dragging = true;
      this.mouseDownPosX = x;
      this.mouseDownPosY = y;

      if(this.toolPalette!=null && this.toolPalette.getActiveTool()!=null)
      {
        this.toolPalette.getActiveTool().execute(x,y);
      }

      this.showMenu(null);
      // check if a line has been hit
      var line = this.getBestLine(x,y);
      if(line!=null && line.isSelectable())
      {
        this.hideResizeHandles();
        this.setCurrentSelection(line);
      } else {
        this.setCurrentSelection(null);
      }
    },
    setCurrentSelection: function(sel,multi){
    	try{
      var oldSingleSelection = this.currentSelection;
      var oldMultiSelection = this.multiSelection;
      if (multi){
    	  this.multiSelection = sel;
    	  draw2d.Workflow.prototype.setCurrentSelection.call(this,null);
      } else {
    	   draw2d.Workflow.prototype.setCurrentSelection.call(this,sel);
	       if (sel) {
	            this.multiSelection = [sel];
	       } else {
	            this.multiSelection = [];
	       }
      }
      // remove highlighting from previous selection
      for (var i = 0; i < oldMultiSelection.length; i++) {
    	  var fig = oldMultiSelection[i];
    	  if (fig instanceof lore.ore.ui.graph.ResourceFigure){
           oldMultiSelection[i].setHighlight(false);
      	  }
      }
      
      // Always show line resize handles and highlighting when connection is selected
      if (sel && sel instanceof draw2d.Line) {
        this.showLineResizeHandles(sel);
      } else if (sel instanceof lore.ore.ui.graph.ResourceFigure) {
        this.showResizeHandles(sel);
        sel.setHighlight(true); 
      } 
    	} catch (e){
    		lore.debug.ore("problem",e);
    	}
    },
    /** select figures within a rectangular selecton */
    multiSelectFigures: function(x,y, x2, y2){
        var result = [];
        for(var i=0;i <this.figures.getSize();i++){
            var figure = this.figures.get(i);
            var figx = figure.getAbsoluteX();
            var figy = figure.getAbsoluteY();
            var figx2 = figx + figure.width;
            var figy2 = figy + figure.height;
            if (x <= figx && y <= figy && x2 >= figx2 && y2 >= figy2){
                result.push(figure); 
                figure.setHighlight(true);
            } 
        }
        this.setCurrentSelection(result,true);
    },
    /** 
     * Render the contents as an image. Renders the current window into a canvas (resizing so that
     * the entire drawing area is visible), and then uses the toDataURL method on the canvas to
     * produce a PNG image
     * @return Data URL to the image  **/
    getAsImage : function() {
     try {
        var imageW = this.getWidth();
        var imageH = this.getHeight();
        var canvas = this.previewCanvas;
        var context = canvas.getContext("2d");
        var offsetX = this.getAbsoluteX() + 1;
        var offsetY = this.getAbsoluteY() + 1;
        // resize the viewport so that entire drawing area is shown in image
        var vp = lore.ore.ui.vp;
        var vpsize = vp.getSize();
        vp.setSize(imageW + offsetX + 50, imageH + offsetY + 50);
        canvas.setAttribute("width", imageW + "px");
        canvas.setAttribute("height", imageH + "px");
        context.clearRect(0,0, imageW, imageH);
        
        // Draw the window, cropping to display just the drawing area
        context.drawWindow(window, offsetX, offsetY, imageW, imageH, "rgb(255,255,255)");
        var imgData = canvas.toDataURL();
        
        // restore viewport original size
        vp.setSize(vpsize);
        vp.syncSize();

        //lore.global.util.launchTab(imgData);
        return imgData;
     } catch (e) {
        lore.debug.ore("getAsImage: ",e);
     }
        
    },
   
    addResourceFigure: function(fig, x, y) {
        
        this.commandStack.execute(new draw2d.CommandAdd(this, fig, x, y));
        
        this.setCurrentSelection(fig);
        // FIXME: workaround to ensure keyboard events work immediately
        Ext.getCmp('drawingarea').focus();
    },
    /** 
     * Construct the context menu displayed for the graphical editor
     */
	onContextMenu: function(x,y) {
		// prevent context menu click triggering pan
		this.dragging = false;
		
		if (!this.contextmenu) {
            this.contextmenu = new Ext.menu.Menu({
                showSeparator: false
            });
            this.contextmenu.add({
                text: "Undo",
                icon: "chrome://lore/skin/icons/arrow_undo.png",
                scope: this,
                handler: function(b){ 
                	try{
                	this.commandStack.undo();
                	} catch (e){
                		lore.debug.ore("problem",e);
                	}
                }
            });
            this.contextmenu.add({
                text: "Redo",
                icon: "chrome://lore/skin/icons/arrow_redo.png",
                scope: this,
                handler: function(b){ 
                	 this.commandStack.redo();    	 
                }
            });
            this.contextmenu.add("-");
            this.contextmenu.add({
                text: "Save diagram as image (PNG)",
                icon: "chrome://lore/skin/icons/image.png",
                scope: this,
                handler: function(b,e){  
                	try{
                	b.parentMenu.hide();
                	var imgData = this.getAsImage();
                    if (imgData) {
                        lore.global.util.writeURIWithSaveAs("diagram", "png", window, imgData);
                    } else {
                        lore.ore.ui.vp.error("Unable to generate diagram image");
                    }
                	} catch(e){
                		lore.debug.ore("problem",e);
                	}
                }
            });
            this.contextmenu.add({
                text: "Auto layout",
                icon: "chrome://lore/skin/icons/layout.png",
                scope: this,
                handler: function(evt){              	
                	 this.doLayout(false);   
                }
            });
            this.contextmenu.add({
                text: "Auto layout (using connections only)",
                icon: "chrome://lore/skin/icons/layout.png",
                scope: this,
                handler: function(evt){              	
                	 this.doLayout(true);   
                }
            });
            
            this.contextmenu.add("-");
            this.contextmenu.add({
                text: "Add current URL",
                icon: "chrome://lore/skin/icons/add.png",
                scope: this,
                handler: function(evt){              	
    	            lore.ore.controller.addResource(lore.ore.controller.currentURL);  
                }
             });
            this.contextmenu.add("-");
            this.contextmenu.add({
                text: "New Compound Object",
                icon: "chrome://lore/skin/icons/database_add.png",
                scope: this,
                handler: function(evt){              	
                	lore.ore.controller.createCompoundObject();
                }
             });
            this.contextmenu.add({
                text: "Save Compound Object",
                icon: "chrome://lore/skin/icons/database_save.png",
                scope: this,
                handler: function(evt){              	
                	lore.ore.controller.saveCompoundObjectToRepository();
                }
             });
            this.contextmenu.add({
                text: "Delete Compound Object",
                icon: "chrome://lore/skin/icons/database_delete.png",
                scope: this,
                handler: function(evt){              	
                	lore.ore.controller.deleteCompoundObjectFromRepository();
                }
             });
            this.contextmenu.add("-");
            this.contextmenu.add({
                text: "Open LORE preferences",
                icon: "chrome://lore/skin/icons/cog.png",
                scope: this,
                handler: function(evt){              	
                	window.open("chrome://lore/content/options.xul", "", "chrome,centerscreen,modal,toolbar");
                }
             });
            
		}
		var absx = this.getAbsoluteX() +  x - this.getScrollLeft();
		var absy = this.getAbsoluteY() +  y - this.getScrollTop();
		this.contextmenu.showAt([absx, absy]);

	},
    /**  Don't show snap to lines when making a connection */
    snapToHelper: function(figure,  pos){
        if (figure instanceof lore.ore.ui.graph.Port){
            var result = new draw2d.Dimension(pos.x,pos.y, figure.getWidth(), figure.getHeight());
            return result.getTopLeft();
        }
        return draw2d.Workflow.prototype.snapToHelper.call(this,figure,pos);
    },
    /** Return the figures in the graph, sorted left-right, top-bottom by x, y coordinates */
    getFiguresSorted : function(){
    	var allfigures = this.getDocument().getFigures().data;
        return allfigures.sort(this.figSortingFunction);
    },
    /**
     *  Sort figures according to their x and y coordinates 
     **/
    figSortingFunction : function(figa,figb){        
        if (figa.y == figb.y)
            return figa.x > figb.x;
        else
            return figa.y > figb.y;
    }
});