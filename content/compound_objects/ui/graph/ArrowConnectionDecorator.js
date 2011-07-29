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
Ext.namespace("lore.ore.ui.graph");
/**
 * @class lore.ore.ui.graph.ArrowConnectionDecorator Arrows used on ends of connections
 * @extends draw2d.ConnectionDecorator
 */
lore.ore.ui.graph.ArrowConnectionDecorator = Ext.extend(draw2d.ConnectionDecorator,{
    type: "lore.ore.ui.graph.ArrowConnectionDecorator",
    /**
     * Draw a filled arrow decoration.
     * Slightly smaller arrow dimension than draw2d.ArrowConnectionDecorator
     * @param {draw2d.Graphics} g 
     **/
    paint: function(g) {
      if (this.backgroundColor!=null) {
         g.setColor(this.backgroundColor);
         g.fillPolygon([1,14,14,1],[0,4,-4,0]);
      }
      // draw the border
      g.setColor(this.color);
      g.setStroke(1);
      g.drawPolygon([1,14,14,1],[0,4,-4,0]);
    }
});
