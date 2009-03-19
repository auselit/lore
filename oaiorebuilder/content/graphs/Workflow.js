/**
 * Override showResizeHandles to change the appearance
 * @param {} figure
 */
draw2d.Workflow.prototype.showResizeHandles=function(/*:draw2d.Figure*/ figure)
{
  this.hideLineResizeHandles();
  this.hideResizeHandles();

  // We must reset the alpha blending of the resizeHandles if the last selected object != figure
  // Reason: We would fadeIn the ResizeHandles at the new selected object but the fast toggle from oldSeleciton => newSelection
  //         doesn't reset the alpha to 0.0. So, we do it manually.
  //
  if(this.getEnableSmoothFigureHandling()==true && this.getCurrentSelection()!=figure)
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
}
