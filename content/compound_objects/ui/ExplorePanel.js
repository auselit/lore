lore.ore.ui.ExplorePanel = Ext.extend(Ext.Panel,{ 
   constructor: function (config){
        config = config || {};
        config.autoScroll = true;
        config.forceLayout = true;
        this.html = "<a id='exploreReset' href='#' onclick='try{lore.ore.explorePanel.showInExploreView(lore.ore.cache.getLoadedCompoundObjectUri(),\"Current Compound Object\",true);}catch(e){lore.debug.ore(\"problem in reset\",e);}'>RESET VISUALISATION</a>"
            + "<div id='exploreHistory'></div>"
            + "<div id='infovis'></div>";
        lore.ore.ui.ExplorePanel.superclass.constructor.call(this, config);
        this.on("activate", this.updateContent);
        lore.ore.explorePanel = this;
        this.previewCanvas = document.createElement("canvas");
        this.colorKey = {
                    /*"usesPseudoAgent" : "#33ff00",
                    "usedAsPseudoAgentBy" : "#33ff00",
                    "influencedByAgent": "#0099cc",
                    "influenceOnAgent": "#0099cc",
                    "coauthorWith": "#660099",
                    "relatedTo": "#ff9900",*/
                    "http://purl.org/dc/elements/1.1/relation": "#E3E851"
        },
        this.ckTemplate = new Ext.Template("<li style='line-height:1.3em; padding:3px;'>&nbsp;<span style='border:1px solid black;background-color:{color};'>&nbsp;&nbsp;&nbsp;</span>&nbsp;&nbsp;{rel}</li>",
            {compiled: true}
        );
        this.colorKeyWin = new Ext.Window({ 
                closable: true,
                closeAction: 'hide',
                animateTarget: 'remexploreview',
                width: 400,
                height: 200,
                autoScroll: true,
                title: "Explore View Color Key",
                html: "Color Key"
        });
   },
   initGraph : function(){
    Ext.get('exploreHistory').update("");
      var infovis = document.getElementById('infovis');
      infovis.innerHTML = "";
      var w = infovis.offsetWidth, h = infovis.offsetHeight;
      /** The JIT RGraph that provides the explore visualization */
        this.fd = new $jit.ForceDirected({
            injectInto: 'infovis',
            Navigation: {
              enable: true,
              panning: 'avoid nodes',
              zooming: 10 
            },
            Node: {
               overridable: true,
               type: "square",
               color: "#ddd"
            },
            Edge: {
                overridable: true,
                lineWidth: 2,
                color: "#ddd"
            },
            /*Tips: {
              enable: true,
              onShow: function(tip, node) {
                //count connections
                var count = 0;
                node.eachAdjacency(function() { count++; });
                //display node info in tooltip
                tip.innerHTML = "<div class=\"exploretip-title\">" + node.name + "</div>"
                  + "<div class=\"exploretip-text\"><b>connections:</b> " + count + "</div>";
              }
            },*/
            Events: {
              enable: true,
              type: 'Native',
              //Change cursor style when hovering a node
              onMouseEnter: function() {
                lore.ore.explorePanel.fd.canvas.getElement().style.cursor = 'move';
              },
              onMouseLeave: function() {
                lore.ore.explorePanel.fd.canvas.getElement().style.cursor = '';
              },
              //Update node positions when dragged
              onDragMove: function(node, eventInfo, e) {
                var pos = eventInfo.getPos();
                node.pos.setc(pos.x, pos.y);
                lore.ore.explorePanel.fd.plot();
              },
              //Implement the same handler for touchscreens
              onTouchMove: function(node, eventInfo, e) {
                $jit.util.event.stop(e); //stop default touchmove event
                this.onDragMove(node, eventInfo, e);
              }
            },
            //Number of iterations for the FD algorithm
            iterations: 200,
            //Edge length
            levelDistance: 130,
            clickedNode: {},
            requestGraph: function(node) {
                if (!node.id || !node.id.match ("http")) {
                    lore.debug.ore("requestGraph not http", node);
                    return;
                }
                //lore.debug.ore("requestGraph",node);
                lore.ore.ui.loreProgress("Retrieving data for explore view");
                try{
                var existhistory = Ext.get('exploreHistory').dom.innerHTML;
                var action = "lore.global.util.launchTab(\"" + node.id + "\", window);";
                var icon = "chrome://lore/skin/icons/page_go.png";
                var tooltip = "Show in browser";
                // stylesheet sets type to circle for compound objects
                if (node.data["$type"] == "circle"){
                    action = "lore.ore.readRDF(\"" + node.id + "\");";
                    icon = "chrome://lore/skin/oaioreicon-sm.png";
                    tooltip = "Load in LORE";
                }
                var nodelink = "<a title='" + tooltip + "' href='#' onclick='" + action 
                    + "'><img style='border:none' src='" + icon 
                    + "'></a>&nbsp;<a href='#' onclick=\"try{lore.ore.explorePanel.rg.onClick('" 
                    + node.id + "');}catch(e){lore.debug.ore('problem with history onClick',e);}\">" + node.name + "</a>";
                Ext.get('exploreHistory').update(nodelink + (existhistory? " &lt; " + existhistory : ""));
                
                
                
              
                lore.ore.explorePanel.loadRem(node.id, node.name, (node.data["$type"]=='circle'), function(json) {
                    try{
                    lore.ore.explorePanel.fd.op.sum(json, {
                        'type': 'fade:con',
                        duration: 1500,
                        hideLabels: true,
                        onAfterCompute: function(){
                            lore.ore.ui.loreInfo("Explore view updated");
                        }
                    });
                    } catch (e){
                        lore.debug.ore("Problem in requestGraph",e);
                    }
                });
                } catch (e){
                    lore.debug.ore("problem in requestGraph",e);
                }
            },
            onCreateLabel: function(domElement, node) {
              var nameContainer = document.createElement('span'),
                  closeButton = document.createElement('span'),
                  style = nameContainer.style;
              nameContainer.className = 'x-unselectable explorename';
              if (!node.name){
                node.name = "Untitled";
              } else {
                node.name = node.name.replace(/&amp;/g, '&');
              }
              nameContainer.innerHTML = node.name;
              nameContainer.setAttribute("title","Show connections for \"" + node.name + "\"");
              closeButton.className = 'x-unselectable exploreclose';
              closeButton.innerHTML = 'x';
              closeButton.setAttribute("title","Remove \"" + node.name + "\" from explore view");
              
              domElement.appendChild(nameContainer);
              domElement.appendChild(closeButton);
              //domElement.appendChild(expandButton);
              style.fontSize = "1.1em";
              style.color = "#51666b";
              closeButton.onclick = function() {
                node.setData('alpha', 0, 'end');
                node.eachAdjacency(function(adj) {
                  adj.setData('alpha', 0, 'end');
                });
                lore.ore.explorePanel.fd.fx.animate({
                  modes: ['node-property:alpha',
                          'edge-property:alpha'],
                  duration: 500
                });
              };
              nameContainer.onclick = function () {
                lore.ore.explorePanel.fd.controller.requestGraph(node);
              };
            },
            
            onPlaceLabel: function(domElement, node) {
                 var style = domElement.style;
                  var left = parseInt(style.left);
                  var w = domElement.offsetWidth;
                  style.left = (left - w / 2) + 'px';
                  style.display = '';
              }, 
               
               onBeforePlotLine: function(adj) {
       
                   var rel = adj.data["rel"];
                   var newColor = "";
                   if (rel){
                        if (lore.ore.explorePanel.colorKey[rel]){
                            newColor = lore.ore.explorePanel.colorKey[rel];
                        } else {
                            // generate a random color to represent this type of relationship
                            newColor = "#" + Math.round(0xffffff * Math.random()).toString(16);
                            lore.ore.explorePanel.colorKey[rel] = newColor;                       
                        }
                       adj.data["$color"] = newColor;
                   }
            }
            
        });
        //lore.debug.ore("added contextmenu to infovis");
        
        if (this.body){
            this.mon(this.body, {
                scope: this,
                contextmenu: this.onContextMenu
            });
        }
    },
    onContextMenu : function (e){
        //lore.debug.ore("ExplorePanel.onContextMenu: ",e);
        
        if (!this.contextmenu) {
            this.contextmenu = new Ext.menu.Menu({
                id : this.id + "-context-menu",
                showSeparator: false
            });
            
            this.contextmenu.add({
                    text : "Save diagram as image",
                    icon: "chrome://lore/skin/icons/image.png",
                    scope: this,
                    handler : function(evt) {
                        this.contextmenu.hide();
                        var imgData = this.getAsImage();
                        if (imgData) {
                            lore.global.util.writeURIWithSaveAs("explore", "png", window, imgData);
                        } else {
                            lore.ore.ui.loreError("Unable to generate explore image");
                        }

                    }
             });
             this.contextmenu.add({
                text: "Reset visualisation",
                scope: this,
                handler: function(evt){
                    this.showInExploreView(lore.ore.cache.getLoadedCompoundObjectUri(),"Current Compound Object",true);
                }
             });
             this.contextmenu.add({
                text: "Show color key",
                scope: this,
                handler: function(evt){
                    try{
                    var colorKeyHTML = "";
                    for (c in this.colorKey) { 
                        colorKeyHTML += this.ckTemplate.apply({rel: c, color: this.colorKey[c]});
                    }
                    
                    this.colorKeyWin.show();
                    this.colorKeyWin.body.update("<ul>" + colorKeyHTML + "</ul>");
                    } catch (e) {
                        lore.debug.ore("Problem showing color key",e);
                    }
                }
             });
             this.contextmenu.add({
                // TODO: tooltips for when labels are hidden, provide another option to expand graph
                    text: "Hide Labels",
                    scope: this,
                    handler: function (){
                       this.fd.labels.hideLabels(true);     
                    }
             });
             this.contextmenu.add({
                    text: "Show Labels",
                    scope: this,
                    handler: function (){
                        this.fd.labels.hideLabels(false);
                    }
             });
        }
        this.contextmenu.showAt(e.xy);
        e.stopEvent();
        return false;
    },
    getAsImage : function() {
     try {
        var imageW = this.getInnerWidth() + 50;
        var imageH = this.getInnerHeight() + 50;
        var canvas = this.previewCanvas;
        var context = canvas.getContext("2d");
        var pos = this.getPosition();
        var offsetX = pos[0] + 1;
        var offsetY = pos[1] + 1;
        // resize the viewport so that entire
        var vp = lore.ore.ui.main_window;
        var vpsize = vp.getSize();
        vp.setSize(imageW + offsetX + 50, imageH + offsetY + 50);
        canvas.setAttribute("width", imageW + "px");
        canvas.setAttribute("height", imageH + "px");
        context.clearRect(0,0, imageW, imageH);
        
        // Draw the window, cropping to display just the visualisation
        context.drawWindow(window, offsetX, offsetY, imageW, imageH, "rgb(255,255,255)");
        var imgData = canvas.toDataURL();
        // restore viewport original size
        vp.setSize(vpsize);
        vp.syncSize();
        return imgData;
     } catch (e) {
        lore.debug.ore("ExplorePanel.getAsImage: ",e);
     }
        
    },
    /** Temporary function to regenerate content each time the panel is activated 
     * @param {} p The panel
     */
    updateContent : function (p) {
        var currentREM = lore.ore.cache.getLoadedCompoundObjectUri();
        if (this.exploreLoaded !== currentREM) {
            //lore.debug.ore("updateContent: show in explore view", currentREM);
            this.exploreLoaded = currentREM;
            this.showInExploreView(currentREM, lore.ore.getPropertyValue("dc:title",lore.ore.ui.grid), true);
        } else {
            //lore.debug.ore("refresh explore view");
            this.fd.refresh();
        }
        lore.ore.ui.loreInfo("Click on the nodes to explore connections between compound objects.");
    },
    /**
     * Gets resource map as RDF, transforms to JSON and applies function to it
     * @param {URI} id Identifier of the compound object to be retrieved
     * @param {String} title Used as a label for the compound object
     * @param {function} f Function to apply
     */
    loadRem : function(id, title, isCompoundObject, f){
        //lore.debug.ore("loadRem " + title + " " + id);
        // get json from sparql query
        var json = lore.ore.reposAdapter.getExploreData(id,title,isCompoundObject);
        if (json){
                f(json);
        }
    },
    /** Initialize the explore view to display resources from the repository related to a compound object
     * @param {URI} id The URI of the compound object
     * @param {String} title Label to display for the compound object
     */
        showInExploreView : function (id, title, isCompoundObject){
            //lore.debug.ore("show in explore view " + title);
            lore.ore.ui.loreProgress("Retrieving data for explore view");
            try{
        this.initGraph();
        this.loadRem(id, title, isCompoundObject, function(json){
            lore.ore.explorePanel.fd.loadJSON(json);
            lore.ore.explorePanel.fd.computeIncremental({
                iter: 40,
                property: 'end',
                onStep: function(perc){
                  //Log.write(perc + '% loaded...');
                },
                onComplete: function(){
                  lore.ore.ui.loreInfo("Explore data loaded");
                  lore.ore.explorePanel.fd.animate({
                    modes: ['linear'],
                    duration: 1000
                  });
                }
              });
            //lore.ore.explorePanel.fd.refresh();
            var existhistory = Ext.get('exploreHistory').dom.innerHTML;
            
            var action = "lore.global.util.launchTab(\"" + id + "\", window);";
            var icon = "chrome://lore/skin/icons/page_go.png";
            var tooltip = "Show in browser";
            // if it is a compound object use lore icon and open in lore instead of browser link
            if (isCompoundObject){
                action = "lore.ore.readRDF(\"" + id + "\");";
                icon = "chrome://lore/skin/oaioreicon-sm.png";
                tooltip = "Load in LORE";
            }
            var nodelink = "<a title='" + tooltip + "' href='#' onclick='" + action 
            + "'><img style='border:none' src='" + icon +"'>" 
            + "</a>&nbsp;<a href='#' onclick=\"try{lore.ore.explorePanel.rg.onClick('" 
            + id + "');}catch(e){lore.ore.debug('problem',e);}\">" + title + "</a>";
            Ext.get('exploreHistory').update(nodelink + (existhistory? " &lt; " + existhistory : ""));
        });  
            } catch (e){
                lore.debug.ore("problem in show in explore view",e);
            }
    }
});
Ext.reg('explorepanel',lore.ore.ui.ExplorePanel);