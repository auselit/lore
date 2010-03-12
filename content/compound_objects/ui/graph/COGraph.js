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
lore.ore.ui.graph.COGraph = function(id){
    draw2d.Workflow.call(this, id);
    try{
	    this.layouter = new lore.ore.ui.graph.autolayout.Layouter(this);
	    this.layouter.setPreferredEdgeLength(180);
        //this.layouter.setIterations(50);
        //this.layouter.setSprings(uwm.diagram.autolayout.Layouter.spring.LINEAR);
        //this.layouter.setVertexVertexRepulsion(uwm.diagram.autolayout.Layouter.vvRepulsion.INVERSE);
        this.showEmptyMessage();
        
        /* The mask element covers figures to allow mouse to move over figures during moves
         * without interference from figure contents
         **/
	    this.mask = document.createElement("div");
        this.mask.style.position="absolute";
        this.mask.style.top = "0px";
        this.mask.style.left = "0px";
	    this.mask.style.backgroundColor="transparent";
        this.mask.style.opacity="0.5";
	    this.mask.style.width="100%";
	    this.mask.style.height="100%";
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

        // default colour for line that is displayed for creating connections
        this.connectionLine.setColor(new draw2d.Color(174, 174, 174));
    } catch (ex){
        lore.debug.ore("error setting up COGraph",ex);
    }
}
Ext.extend(lore.ore.ui.graph.COGraph, draw2d.Workflow, {
    type : "lore.ore.ui.graph.COGraph",

    /** 
     * Trigger automatic layout of figures
     */
	doLayout : function(){
	    try {
	        //if (this.getDocument().getLines().getSize() > 0){
	            this.layouter.doLayout();
	        //}
	    } catch (e){
	        lore.debug.ore("failed to do layout",e);
	    }
	},
    showEmptyMessage : function(){
        this.setBackgroundImage("chrome://lore/skin/icons/emptyco.png",false);
    },
    clearEmptyMessage : function(){
        this.setBackgroundImage();  
    },
    showMask : function (){
        this.mask.style.display="block";  
    },
    hideMask : function (){
        this.mask.style.display="none";
    },
    clear : function(){
        draw2d.Workflow.prototype.clear.call(this);
        this.showEmptyMessage();
    },
    setDocumentDirty: function(){
      draw2d.Workflow.prototype.setDocumentDirty.call(this);
      if (this.figures.getSize() == 0){
        this.showEmptyMessage();
      } else {
        this.clearEmptyMessage();
      }
    },
	/**
	 * Overrides the method from the superclass to change the colour of the handles
	 * @param {draw2d.Figure} figure The figure on which the resize handles are to be displayed
	 */
	showResizeHandles: function(/*:draw2d.Figure*/ figure)
	{
	  this.hideLineResizeHandles();
	  this.hideResizeHandles();
	
	  if(this.getEnableSmoothFigureHandling() && this.getCurrentSelection()!=figure)
	  {
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
	  if(figure.isResizeable())
	  {
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
	  }
	  else
	  {
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
	
	  if(figure.isStrechable() && figure.isResizeable())
	  {
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
	 * @param {draw2d.Line} line The line for the resize handles.
	 * @private
	 **/
	showLineResizeHandles:function(/*:draw2d.Line*/ figure )
	{
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
	  if(figure.isResizeable())
	  {
	    this.resizeHandleStart.setBackgroundColor(blue);
	    this.resizeHandleStart.setColor(brightblue);
	    this.resizeHandleEnd.setBackgroundColor(blue);
	    this.resizeHandleEnd.setColor(brightblue);
	    // required for reconnect of connections
	   this.resizeHandleStart.draggable.targets= this.dropTargets;
	   this.resizeHandleEnd.draggable.targets= this.dropTargets;
	
	  }
	  else
	  {
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
	  if((keyCode==46 || keyCode==8) && this.currentSelection!=null)
	     this.commandStack.execute(this.currentSelection.createCommand(new draw2d.EditPolicy(draw2d.EditPolicy.DELETE)));
	  else if(keyCode==90 && ctrl)
	     this.commandStack.undo();
	  else if(keyCode==89 && ctrl)
	     this.commandStack.redo();
	
	},
    /** Construct the context menu displayed for the graph
     * @return {draw2d.Menu} The contextmenu
     */
	getContextMenu: function(){
		var menu=new draw2d.Menu();
	    menu.appendMenuItem(new draw2d.MenuItem("Add current URL",
	        "chrome://lore/skin/icons/add.png",
	        function(x,y){
	            lore.ore.addFigure(lore.ore.ui.currentURL);  
	        })
	    );
		menu.appendMenuItem(new draw2d.MenuItem("Auto layout",
	        "chrome://lore/skin/icons/layout.png",
	        function(x,y){
		       lore.ore.doLayout();  
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