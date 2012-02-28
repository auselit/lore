/**
 * Fans multiple connections between the same resources so they are not drawn on top of each other
 * @class lore.ore.ui.graph.FanConnectionRouter
 * @extends lore.draw2d.BezierConnectionRouter
 */
lore.ore.ui.graph.FanConnectionRouter = Ext.extend(lore.draw2d.BezierConnectionRouter, {
    FAN_AMOUNT: 30,
    constructor: function() {
        lore.draw2d.BezierConnectionRouter.call(this);
        
    },
    route: function(conn){
       if(this.cheapRouter!=null && (conn.getSource().getParent().isMoving==true || conn.getTarget().getParent().isMoving==true ))
       {
         this.cheapRouter.route(conn);
         return;
       }
    
       var pointList = new Array();
       var fromPt  = conn.getStartPoint();
       var toPt    = conn.getEndPoint();
    
       // create the Manhattan line stroke
       //
       this._route(pointList, conn, toPt, this.getEndDirection(conn), fromPt, this.getStartDirection(conn));
       var resultList = new Array();
       
       var connections = conn.getSiblings();
      
       if (connections.size > 1){
          var point, newPoint;
          var pointIndex = 0;
          var dir = this.getStartDirection(conn);
          var connIndex = connections.indexOf(conn);
          
          var diffX = 0;
          var diffY = 0;
          if (dir == 0 || dir == 2){
            // up or down
            diffX = connIndex * this.FAN_AMOUNT;
            if (connIndex % 2 == 0) {
                diffX = 0 - diffX;
                
            }
          } else if (dir == 1 || dir == 3){
            // left or right
            diffY = connIndex * this.FAN_AMOUNT;
            if (connIndex % 2 == 0){
                diffY = 0 - diffY;
            }
          }
           // add a point in the middle to fan the connections out
           if (pointList.length > 0){
              pointIndex =  Math.min(pointList.length, Math.floor(pointList.length/2));
              point = pointList[pointIndex]; 
              newPoint = new lore.draw2d.Point(point.getX() + diffX, point.getY() + diffY)
              pointList.splice(pointIndex, 0, newPoint );
           } else {
              newPoint = new lore.draw2d.Point(diffX, diffY);
              pointList.push(newPoint);
           }
       }
       
       // create the Bezier spline from the ManhattanLineStroke
       //
       this.drawBezier(pointList,resultList, 0.5, this.iteration);
       for(var i=0;i<resultList.length;i++)
       {
         conn.addPoint(resultList[i]);
       }
       conn.addPoint(toPt);
    }
});