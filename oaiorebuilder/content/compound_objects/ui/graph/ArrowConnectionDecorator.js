lore.ore.ui.graph.ArrowConnectionDecorator=function() {
}

lore.ore.ui.graph.ArrowConnectionDecorator.prototype = new draw2d.ConnectionDecorator;
lore.ore.ui.graph.ArrowConnectionDecorator.prototype.type="lore.ore.ui.graph.ArrowConnectionDecorator";

/**
 * Draw a filled arrow decoration.
 * Slightly smaller arrow dimension to draw2d.ArrowConnectionDecorator
 *
 **/
lore.ore.ui.graph.ArrowConnectionDecorator.prototype.paint=function(/*:draw2d.Graphics*/ g)
{
  if(this.backgroundColor!=null)
  {
     g.setColor(this.backgroundColor);
     g.fillPolygon([1,14,14,1],[0,4,-4,0]);
  }

  // draw the border
  g.setColor(this.color);
  g.setStroke(1);
  g.drawPolygon([1,14,14,1],[0,4,-4,0]);
}
