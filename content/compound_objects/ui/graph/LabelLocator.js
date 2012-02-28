/** 
 * @class lore.draw2d.LabelLocator Locates labels on connections
 * @param {lore.draw2d.Connection} connection
 */

lore.draw2d.LabelLocator = function(connection) {
    this.connection = connection;
};
Ext.apply(lore.draw2d.LabelLocator.prototype,{
    /**
     * Relocate a label to be centered on a connection
     * @param {lore.draw2d.Label} label
     */
    relocate : function (label) {
        try{
           var conn = this.getConnection();
    	   var p = new lore.draw2d.Point();
    	   var points = conn.getPoints();
    	   var index = Math.floor((points.getSize() - 2) / 2);
    	   var p1 = points.get(index);
    	   var p2 = points.get(index + 1);
    	   p.x = (p2.x - p1.x) / 2 + p1.x + 5;
    	   p.y = (p2.y - p1.y) / 2 + p1.y + 5;
    	   var offsetX = label.getWidth();
           if (offsetX != 0) {
              offsetX = offsetX / 2;
           }
           var offsetY = label.getHeight();
           if (offsetY != 0) {
              offsetY = offsetY / 2;
           }
    	   label.setPosition(p.x - offsetX, p.y - offsetY);
        } catch (e){
            lore.debug.ore("Error in relocate",e);
        }
    },
    getConnection: function() {
        return this.connection;
    }
});