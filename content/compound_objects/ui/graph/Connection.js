/*
 * Copyright (C) 2008 - 2011 School of Information Technology and Electrical
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

 * Connection figure that provides a context menu to set the connection type
 * The types are sourced from theOntRelationships, which is populated from an ontology (see uifunctions.js)
 * @class lore.draw2d.Connection
 * @extends lore.draw2d.Line
 */

lore.draw2d.Connection = Ext.extend(lore.draw2d.Line, {
    constructor: function() {
        lore.draw2d.Line.call(this);
        this.children = new lore.draw2d.ArrayList();
        this.sourcePort=null;
        this.targetPort=null;
        this.model=null;
        this.lineColor = new lore.draw2d.Color(174,174,174); // light grey
        this.labelColor = new lore.draw2d.Color(51,51,51); // dark grey
        this.label = new lore.draw2d.Label();
        this.label.setColor(this.labelColor);
        this.addFigure(this.label, new lore.draw2d.LabelLocator(this), true);
        this.router = new lore.ore.ui.graph.FanConnectionRouter();
        this.lineSegments = new lore.draw2d.ArrayList();
        this.setRelationshipType("http://purl.org/dc/elements/1.1/","relation",false);
        this.setColor(this.lineColor);
        this.stroke = 2.5;
        this.sourceDecorator = false;
        this.targetDecorator = true; 
        this.sourceAnchor = new lore.draw2d.ChopboxConnectionAnchor();
        this.targetAnchor = new lore.draw2d.ChopboxConnectionAnchor();
    },
    disconnect: function() {
      if(this.sourcePort!=null)
      {
        this.sourcePort.detachMoveListener(this);
        this.fireSourcePortRouteEvent();
      }
    
      if(this.targetPort!=null)
      {
        this.targetPort.detachMoveListener(this);
        this.fireTargetPortRouteEvent();
      }
      if (this.model && this.targetPort){
        var props = this.model.get('properties');
        var prop = this.edgens + this.edgetype;
        var propIndex = props.findProperty(prop,this.targetPort.getParent().url);
        if (propIndex != -1){
            props.removeProperty(prop,propIndex);
        }
      }
    },
    reconnect: function() {
      if(this.sourcePort!=null)
      {
        this.sourcePort.attachMoveListener(this);
        this.fireSourcePortRouteEvent();
      }
      if(this.targetPort!=null)
      {
        this.targetPort.attachMoveListener(this);
        this.fireTargetPortRouteEvent();
      }
      if (this.model && this.targetPort){
        var props = this.model.get('properties');
        var propData = {
            id: this.edgens + this.edgetype, 
            ns: this.edgens, 
            name: this.edgetype, 
            value: this.targetPort.getParent().url, 
            prefix: lore.constants.nsprefix(this.edgens)
        };
        props.setProperty(propData);
      }
    },
    /**
     * Find all other connections between the same resources
     * @return {}
     */
    getSiblings : function(){
      var result = new lore.draw2d.ArrayList();
      var ports = this.sourcePort.getParent().getPorts(); 
      for (var p = 0; p < ports.getSize(); p++){
        var outgoingconnections = ports.get(p).getConnections();
        for (var j = 0; j < outgoingconnections.getSize(); j++) {
            var theconnector = outgoingconnections.get(j);
            if (theconnector.targetPort.getParent() == this.targetPort.getParent()){
                result.add(theconnector);
            }
        }
      }
      return result;
    },
    /**
     * Return the id
     * @return {}
     */
    getId : function(){
        return this.id;
    },
    /** Set relationship with undo support */
    setRelationship : function(enamespace, etype, symmetric) {
        this.workflow.getCommandStack().execute(new lore.draw2d.CommandSetRelationship(this, enamespace, etype, symmetric));
    },
    /**
     * Update the type of relationship that the connection represents
     * @param {} enamespace
     * @param {} etype
     * @param {} symmetric
     */
    setRelationshipType : function(enamespace, etype, symmetric) {
        this.edgetype=etype;
        this.edgens=enamespace;
        this.symmetric = symmetric;
        this.label.setStyledText(etype);
        this.setSourceDecorator(symmetric);
    },
    isResizeable: function(){
      return true;
    },
    setSourceDecorator: function(d){
      this.sourceDecorator = d;
      /*if (this.graphics) {
        this.graphics.setArrow('source',d);
      }*/
    },
    setTargetDecorator: function(d) {
      this.targetDecorator = d;
      /*if (this.graphics){
        this.graphics.setArrow('target',d);
      }*/
    },
    setSourceAnchor: function(anchor) {
      this.sourceAnchor = anchor;
      this.sourceAnchor.setOwner(this.sourcePort);
      if(this.graphics !=null)
        this.paint();
    },
    setTargetAnchor: function(anchor) {
      this.targetAnchor = anchor;
      this.targetAnchor.setOwner(this.targetPort);
      if(this.graphics !=null)
        this.paint();
    },
    // TODO: remove this method
    setRouter: function(router) {
      if(router !=null)
       this.router = router;
      else
       this.router = new lore.draw2d.NullConnectionRouter();
    
      // repaint the connection with the new router
      if(this.graphics !=null)
         this.paint();
    },
    getRouter: function(){
        return this.router;
    },
    startStroke: function(){
     this.oldPoint=null;
     this.lineSegments = new lore.draw2d.ArrayList();
    },
    finishStroke:function(){
      this.oldPoint=null;
    },
    setWorkflow: function(/*:lore.draw2d.Workflow*/ workflow){
      lore.draw2d.Line.prototype.setWorkflow.call(this,workflow);
      for(var i=0; i<this.children.getSize();i++)
      {
         this.children.get(i).isAppended=false;
      }
    },
    createHTMLElement : function() {
        var item = lore.draw2d.Line.prototype.createHTMLElement.call(this);
        item.className = "ctxtConn";
        return item;
    },
    handleShowContextMenu : function(ev){
        var pos = ev.xy;
        var wf = this.getWorkflow();
        wf.setCurrentSelection(this);
        wf.showLineResizeHandles(this);
        this.onContextMenu(pos[0], pos[1], true);
    },
    /**
     * Construct the context menu for selecting the connection type
     * @param {int} x X position to show menu
     * @param {int} y Y position to show menu
     * @param {boolean} external Whether this is being called by draw2d or externally (eg from rel editor)
     * @return {}
     */
    onContextMenu : function(x,y,external) { 
        try {
            this.setColor(new lore.draw2d.Color(170,204,246)); 
            if (!(lore.draw2d.Connection.contextMenu && (
                    lore.draw2d.Connection.loadedOntology == lore.ore.ontologyManager.relOntologyURL))) {
                lore.draw2d.Connection.contextmenu = new Ext.menu.Menu({
                    showSeparator: false
                });
                var cm = lore.draw2d.Connection.contextmenu;
                // Temporary toolbar to allow filtering of rels in menu, to be replaced with direct manipulation
                cm.add(new Ext.Toolbar({
                    items: [
                           {   id: 'tfilter',
                               enableKeyEvents: true,
                               xtype: 'textfield', 
                               name: 'filter', 
                               emptyText: 'Type here to filter...'} 
                    ]
                }));
                Ext.getCmp('tfilter').on('keyup',function(tf, e){
                    try{        
                    var filtertext = Ext.getCmp('tfilter').getRawValue();
                    lore.draw2d.Connection.contextmenu.items.each(function(item, index, len){
                        if (item.initialConfig.text){
                             if (item.initialConfig.text.match(filtertext)){
                                item.show();
                             } else {
                                item.hide();
                             }
                        }
                    });
                    lore.draw2d.Connection.contextmenu.doLayout();
                    } catch (ex){
                        lore.debug.ore("problem filtering rel menu",ex);
                    }
                });
                // sort the menu entries alphabetically
                var om = lore.ore.ontologyManager;
                var keys = [];
                for (var rel in om.theOntRelationships) {
                    keys.push(rel);
                }
                keys.sort();
                
                for (var i =0; i< keys.length; i++) {
                    rel = keys[i];
                    
                    var relnamespace=om.theOntRelationships[rel];
                    //lore.debug.ore("looking up " + relnamespace, lore.constants.NAMESPACES);
                    var nspfx = lore.constants.nsprefix(relnamespace);
                    var symmquery = om.relOntology.prefix('rdf',lore.constants.NAMESPACES["rdf"])
                        .where('<' + relnamespace + rel +'> rdf:type <' + lore.constants.OWL_SPROP + '>');
                    var symm = symmquery.length > 0;        
                    cm.add({
                        text: (nspfx? nspfx + " : " : "") + rel,          
                        scope: {ns: relnamespace, rel:rel, symm: symm, external: external},
                        handler: function(evt){
                            var selfig = lore.ore.ui.graphicalEditor.getSelectedFigure();
                            selfig.setRelationship(this.ns, this.rel, this.symm);
                            if (external) {
                                var srcfig =  selfig.sourcePort.getParent();
                                if (srcfig){
                                    lore.ore.ui.graphicalEditor.coGraph.setCurrentSelection(srcfig);
                                }
                            }
                        }
                     });
                }
                lore.draw2d.Connection.loadedOntology = om.relOntologyURL;
                
            }
            var w = this.workflow;
            var absx, absy;
            if (!external){
                absx = w.getAbsoluteX() +  x - w.getScrollLeft();
                absy = w.getAbsoluteY() +  y - w.getScrollTop();
            } else {
                absx = x;
                absy = y;
            }
            lore.draw2d.Connection.contextmenu.showAt([absx, absy]);
            lore.draw2d.Connection.contextmenu.on("beforehide",function(){
                this.setColor(new lore.draw2d.Color(174,174,174));
            },this);
        } catch (ex){ 
            lore.debug.ore("problem generating context menu for connection",ex);
            return null;
        }
    },
    /** override addFigure to allow child figures to have associated events */
    addFigure: function(figure, locator, enableMouseEvents){
      var entry = new Object();
      entry.figure  = figure;
      entry.locator = locator;
      entry.figure.parent = this;
      this.children.add(entry);
      if(this.graphics != null) {
        this.paint();
      }
      var oThis = this;
      var mouseDown = function() {
        var oEvent = arguments[0] || window.event;
        oEvent.returnValue = false;
        oThis.getWorkflow().setCurrentSelection(oThis);
        oThis.getWorkflow().showLineResizeHandles(oThis);
      }
      // select connection when child figure is selected
      
      figure.getHTMLElement().addEventListener("mousedown", mouseDown, (enableMouseEvents || false)); 
    },
    onOtherFigureMoved: function(/*:lore.draw2d.Figure*/ figure) {
      if(figure==this.sourcePort)
        this.setStartPoint(this.sourcePort.getAbsoluteX(), this.sourcePort.getAbsoluteY());
      else
        this.setEndPoint(this.targetPort.getAbsoluteX(), this.targetPort.getAbsoluteY());
    },
    setSource: function(/*:lore.draw2d.Port*/ port) {
      if(this.sourcePort!=null) {
        this.sourcePort.detachMoveListener(this);
        this.model = null;
      }
    
      this.sourcePort = port;
      if(this.sourcePort==null){
        return;
      }
      this.model = this.sourcePort.getParent().model;
      this.sourceAnchor.setOwner(this.sourcePort);
      this.fireSourcePortRouteEvent();
      this.sourcePort.attachMoveListener(this);
      this.setStartPoint(port.getAbsoluteX(), port.getAbsoluteY());
    },
    getSource: function(){
      return this.sourcePort;
    },
    setTarget: function(port){
      if(this.targetPort!=null)
        this.targetPort.detachMoveListener(this);
    
      this.targetPort = port;
      if(this.targetPort==null)
        return;
      this.targetAnchor.setOwner(this.targetPort);
      this.fireTargetPortRouteEvent();
      this.targetPort.attachMoveListener(this);
      this.setEndPoint(port.getAbsoluteX(), port.getAbsoluteY());
    },
    getTarget: function(){
      return this.targetPort;
    },
    containsPoint: function(/*:int*/ px, /*:int*/ py) {
      for(var i = 0; i< this.lineSegments.getSize();i++)
      {
         var line = this.lineSegments.get(i);
         if(lore.draw2d.Line.hit(this.corona, line.start.x,line.start.y,line.end.x, line.end.y, px,py))
           return true;
      }
      return false;
    },
    
    fireSourcePortRouteEvent: function() {
        // enforce a repaint of all connections which are related to this port
        // this is required for a "FanConnectionRouter" or "ShortesPathConnectionRouter"
        //
       var connections = this.sourcePort.getConnections();
       for(var i=0; i<connections.getSize();i++)
       {
          connections.get(i).paint();
       }
    },
    fireTargetPortRouteEvent: function() {
        // enforce a repaint of all connections which are related to this port
        // this is required for a "FanConnectionRouter" or "ShortesPathConnectionRouter"
        //
       var connections = this.targetPort.getConnections();
       for(var i=0; i<connections.getSize();i++)
       {
          connections.get(i).paint();
       }
    },
    createCommand: function(/*:lore.draw2d.EditPolicy*/ request) {
      if(request.getPolicy() == lore.draw2d.EditPolicy.MOVE)
      {
        // DragDrop of a connection doesn't create a undo command at this point. This will be done in
        // the onDrop method
        return new lore.draw2d.CommandReconnect(this);
      }
      if(request.getPolicy() == lore.draw2d.EditPolicy.DELETE)
      {
        if(this.isDeleteable()==true)
          return new lore.draw2d.CommandDelete(this);
        return null;
      }
    
      return null;
    },
    addPoint : function(p) {
        p = new lore.draw2d.Point(parseInt(p.x), parseInt(p.y));
        if (this.oldPoint != null) {
            this.graphics.drawLine(this.oldPoint.x, this.oldPoint.y, p.x, p.y);
            var line = new Object();
            line.start = this.oldPoint;
            line.end = p;
            this.lineSegments.add(line);
        }
        this.oldPoint = new Object();
        this.oldPoint.x = p.x;
        this.oldPoint.y = p.y;
    },
    getPoints: function() {
      var result = new lore.draw2d.ArrayList();
      /*var line;
      for(var i = 0; i< this.lineSegments.getSize();i++)
      {
         line = this.lineSegments.get(i);
         result.add(line.start);
      }
      // add the last point
      result.add(line.end);*/
      result.add(this.getStartPoint());
      result.add(this.getEndPoint());
      return result;
    },
    /** 
     * Override paint to use Raphael lines rather than wz_jsGraphics, for performance reasons
     * 
     */
    paint: function() {
      // hide label
      for(var i=0; i<this.children.getSize();i++) {
         var entry = this.children.get(i);
         if(entry.isAppended==true){
            this.html.removeChild(entry.figure.getHTMLElement());
         }
         entry.isAppended=false;
      }
    
      if(this.graphics ==null)
        this.graphics = {
            fig: this,
            canvElem: this.getWorkflow().canvElem,
            clear: function(){
                if (this.ln) {
                    Ext.get(this.ln.node).un("contextmenu",this.fig.handleShowContextMenu);
                    Ext.get(this.ln.node).un("dblclick",this.fig.handleShowContextMenu);
                    this.ln.remove();
                }
            },
            
            drawLine : function(bb1, bb2){
                var path;
                var selectedFig = this.fig;
                
                var 
                p = [{x: bb1.x + bb1.width / 2, y: bb1.y - 1},
                {x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1},
                {x: bb1.x - 1, y: bb1.y + bb1.height / 2},
                {x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2},
                {x: bb2.x + bb2.width / 2, y: bb2.y - 1},
                {x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height + 1},
                {x: bb2.x - 1, y: bb2.y + bb2.height / 2},
                {x: bb2.x + bb2.width + 1, y: bb2.y + bb2.height / 2}],
                d = {}, dis = [];
                for (var i = 0; i < 4; i++) {
                    for (var j = 4; j < 8; j++) {
                        var dx = Math.abs(p[i].x - p[j].x),
                            dy = Math.abs(p[i].y - p[j].y);
                        if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
                            dis.push(dx + dy);
                            d[dis[dis.length - 1]] = [i, j];
                        }
                    }
                }
                if (dis.length == 0) {
                    var res = [0, 4];
                } else {
                    res = d[Math.min.apply(Math, dis)];
                }
                var x1 = p[res[0]].x,
                    y1 = p[res[0]].y,
                    x4 = p[res[1]].x,
                    y4 = p[res[1]].y;
                dx = Math.max(Math.abs(x1 - x4) / 2, 10);
                dy = Math.max(Math.abs(y1 - y4) / 2, 10);
                var x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3),
                    y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3),
                    x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3),
                    y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);
                    
                // TODO: adjust start and end to account for port width     
                // curved path from nearest ports on source and target figures
                this.x1 = x1.toFixed(3);
                this.y1 = y1.toFixed(3);
                this.x2 = x4.toFixed(3);
                this.y2 = y4.toFixed(3);
                var linePath = ["M", x1.toFixed(3), y1.toFixed(3), "C", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(",");
                if (selectedFig.isMoving){
                    // during reconnection, draw a straight path from mouse to other end of line
                    linePath = "M " + (selectedFig.startX || x1.toFixed(3)) + " " + (selectedFig.startY || y1.toFixed(3)) + "L" + (selectedFig.endX ||  x4.toFixed(3)) + " " + (selectedFig.endY || y4.toFixed(3));
                }  
                
               
                var wf = selectedFig.getWorkflow();
                selectedFig.startX = x1;
                selectedFig.startY = y1;
                selectedFig.endX = x4;
                selectedFig.endY = y4;
                
                this.ln = this.canvElem.path(linePath);
                
                this.ln.attr("cursor","move");
                
                this.ln.click(function(){
                    wf.setCurrentSelection(selectedFig);
                    wf.showLineResizeHandles(selectedFig);
                });

                Ext.get(this.ln.node).on("contextmenu", 
                    this.fig.handleShowContextMenu,
                    this.fig,
                    {
                        stopPropagation: true, 
                        preventDefault: true
                    }
                );
                Ext.get(this.ln.node).on("dblclick", 
                    this.fig.handleShowContextMenu,
                    this.fig
                );
            },
            setStroke: function(s){
                this.ln.attr("stroke-width",s);
            },
            setColor: function(c){
                this.ln.attr("stroke",c)
            },
            setArrow: function(end, d){
                if (end == "target"){
                    
                    if (d){
                       this.ln.attr('arrow-end', 'block-wide-long');
                        
                    } else {
                       this.ln.attr('arrow-end','none')
                    }
                } else {
                    if (d){
                        this.ln.attr('arrow-start','block-wide-long');
                    } else {
                        this.ln.attr('arrow-start','none');
                    }
                }
            }
        };
      
      else {
        this.graphics.clear();
      }
      
        
      this.graphics.drawLine(this.sourcePort.getParent(),this.targetPort.getParent())
      
      this.graphics.setStroke(this.stroke);
      this.graphics.setColor(this.lineColor.getHTMLStyle());
    
      this.startStroke();
      //this.router.route(this);
      this.graphics.setArrow('target',this.targetDecorator);
      this.graphics.setArrow('source',this.sourceDecorator);
      this.finishStroke();
    
      // Display label
      for(var i=0; i<this.children.getSize();i++)
      {
         var entry = this.children.get(i);
         this.html.appendChild(entry.figure.getHTMLElement());
         entry.isAppended=true;
         entry.locator.relocate(entry.figure);
      }

    }
});
