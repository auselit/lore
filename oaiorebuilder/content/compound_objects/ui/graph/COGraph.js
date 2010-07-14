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
 * The Graphical compound object editing view
 * @class lore.ore.ui.graph.COGraph
 * @extends draw2d.Workflow
 * @param {} id
 */
lore.ore.ui.graph.COGraph = function(id) {
    draw2d.Workflow.call(this, id);
    try {
	    this.layouter = new lore.ore.ui.graph.autolayout.Layouter(this);
	    this.layouter.setPreferredEdgeLength(180);
        this.showEmptyMessage();
        
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
        this.readOnly = false;
    } catch (ex){
        lore.debug.ore("error setting up COGraph",ex);
    }
}
Ext.extend(lore.ore.ui.graph.COGraph, draw2d.Workflow, {
    type : "lore.ore.ui.graph.COGraph",

    /** 
     * Trigger automatic layout of figures
     */
	doLayout : function() {
	    try {
	        //if (this.getDocument().getLines().getSize() > 0){
	            this.layouter.doLayout();
	        //}
	    } catch (e){
	        lore.debug.ore("failed to do layout",e);
	    }
	},
    setReadOnly : function(readonly) {
        this.readOnly = readonly;
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
	onKeyDown: function(keyCode, ctrl) {
        if (!this.readOnly){
    	  if((keyCode==46 || keyCode==8) && this.currentSelection!=null) {
    	     this.commandStack.execute(this.currentSelection.createCommand(new draw2d.EditPolicy(draw2d.EditPolicy.DELETE)));
          } else if(keyCode==90 && ctrl) {
    	     this.commandStack.undo();
          } else if(keyCode==89 && ctrl) {
    	     this.commandStack.redo();
          }
        }
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
        var vp = lore.ore.ui.main_window;
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
    doCommand : function(action) {
        if(!oThis.readOnly){
            action();
        } else {
             lore.ore.ui.loreWarning("Editor is read-only");
        }
    },
    addResourceFigure: function(fig, x, y) {
        if (!this.readOnly){
            this.commandStack.execute(new draw2d.CommandAdd(this, fig, x, y));
        }
    },
    /** 
     * Construct the context menu displayed for the graph
     * @return {draw2d.Menu} The contextmenu
     */
	getContextMenu: function() {
		var menu=new draw2d.Menu();
        var oThis = this;
	    menu.appendMenuItem(new draw2d.MenuItem("Add current URL",
	        "chrome://lore/skin/icons/add.png",
	        function(x,y) {
                // TODO: change to a local method
	            lore.ore.addResource(lore.ore.ui.currentURL);  
	        })
	    );
        menu.appendMenuItem(new draw2d.MenuItem("Undo",
            "chrome://lore/skin/icons/arrow_undo.png",
            function(x,y){
                    oThis.doCommand(oThis.commandStack.undo());
            })
        );
        menu.appendMenuItem(new draw2d.MenuItem("Redo",
            "chrome://lore/skin/icons/arrow_redo.png",
            function(x,y){
                    oThis.doCommand(oThis.commandStack.redo());
            })
        );
        menu.appendMenuItem(new draw2d.MenuItem("Auto layout",
            "chrome://lore/skin/icons/layout.png",
            function(x,y) {
               oThis.doCommand(oThis.doLayout());  
            })
        );
        menu.appendMenuItem(new draw2d.MenuItem("Save diagram as image (PNG)",
            "chrome://lore/skin/icons/image.png",
            function(x,y){
                var imgData = oThis.getAsImage();
                if (imgData) {
                    lore.global.util.writeURIWithSaveAs("diagram", "png", window, imgData);
                } else {
                    lore.ore.ui.loreError("Unable to generate diagram image");
                }
            })
        );
	    menu.appendMenuItem(new draw2d.MenuItem("New Compound Object",
	        "chrome://lore/skin/icons/database_add.png",
	        function(x,y){
	            lore.ore.createCompoundObject();
	        })
	    );
		menu.appendMenuItem(new draw2d.MenuItem("Save Compound Object",
	        "chrome://lore/skin/icons/database_save.png",
	        function(x,y){
		       lore.ore.saveRDFToRepository();
		    })
	    );
	    menu.appendMenuItem(new draw2d.MenuItem("Delete Compound Object",
	        "chrome://lore/skin/icons/database_delete.png",
	        function(x,y){
	            lore.ore.deleteFromRepository();
	        })
	    );
	    menu.appendMenuItem(new draw2d.MenuItem("Open LORE preferences",
	        "chrome://lore/skin/icons/cog.png",
	        function(x,y){
	            window.open("chrome://lore/content/options.xul", "", "chrome,centerscreen,modal,toolbar");
	        })
	    );
		return menu;
	}
});