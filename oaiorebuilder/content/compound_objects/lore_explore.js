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
 * @class lore.ore.explore
 * @singleton
 */
Ext.namespace("lore.ore.explore");
/**
 * Display a resource map in the explore view
 * @param {} id The URI that identifies the resource map
 */
/*
 * @include  "../lib/jit.js"
 */

/**
 * Gets resource map as RDF, transforms to JSON and applies function to it
 * @param {URI} id Identifier of the compound object to be retrieved
 * @param {String} title Used as a label for the compound object
 * @param {function} f Function to apply
 */
lore.ore.explore.loadRem = function(id, title, f){
   // make json from sparql query

   var eid = id.replace(/&amp;/g,'&').replace(/&amp;/g,'&');
   lore.debug.ore("load sparql for",eid);
   var eid2 = escape(eid);
   try {
    var thequery = "PREFIX dc:<http://purl.org/dc/elements/1.1/> PREFIX ore:<http://www.openarchives.org/ore/terms/> PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns%23>"
    + "SELECT DISTINCT ?something ?somerel ?sometitle WHERE {"
    + "{?aggre ore:aggregates <" + eid2 + "> . ?something ore:describes ?aggre ."
    + " ?something a ?somerel . OPTIONAL {?something dc:title ?sometitle .}}"
    +  "UNION { ?something ?somerel <" + eid2 + "> . FILTER isURI(?something) ."
    + "FILTER (?somerel != ore:aggregates) . FILTER (?somerel != rdf:type) . OPTIONAL {?something dc:title ?sometitle.} }"
    + "UNION {<"+ eid2 + "> ?somerel ?something . FILTER isURI(?something). FILTER (?somerel != rdf:type) . FILTER (?somerel != ore:describes) . OPTIONAL {?something dc:title ?sometitle.}}"
    + "UNION {<" + eid2 + "> ore:describes ?aggre .?aggre ?somerel ?something . FILTER (?somerel != rdf:type) .OPTIONAL {?something dc:title ?sometitle . }}}";
    // should remid be escaped?
    // TODO: use repos adapter
    var queryURL = "http://austlit.edu.au/openrdf-sesame/repositories/lore"
            + "?queryLn=sparql&query=" 
            + thequery;
    var json;

        var xsltproc = new XSLTProcessor();
        // get the stylesheet - this has to be an XMLHttpRequest because Ext.Ajax.request fails on chrome urls
        var xhr = new XMLHttpRequest();
        xhr.overrideMimeType('text/xml');
        xhr.open("GET", 'chrome://lore/content/compound_objects/stylesheets/sparqlexplore.xsl', false);
        xhr.send(null);
        var stylesheetDoc = xhr.responseXML;
        xsltproc.importStylesheet(stylesheetDoc);
        xsltproc.setParameter(null,'subj',eid);
        if (title){
            xsltproc.setParameter(null,'title',title);
        }
        // get the xml
        xhr.open("GET",queryURL, false);
        xhr.send(null);
        var rdfDoc = xhr.responseXML;
        var thefrag = xsltproc.transformToFragment(rdfDoc, document);
        var serializer = new XMLSerializer();
        lore.debug.ore("response is",serializer.serializeToString(rdfDoc));
        eval ("json = " + serializer.serializeToString(thefrag));
        lore.debug.ore("got json",json);
    } catch (ex){
        lore.debug.ore("problem doing sparql transform",ex);
    } 
  if (json){
        f(json);
   }
}
/**
 * Initialises the explore view
 */
lore.ore.explore.init = function() {
  
  if (lore.ore.explore.canvas){
    // clear history
    Ext.get('history').update("");
    // clear the labels and canvas
    for(var id in lore.ore.explore.rg.fx.labels){
           lore.ore.explore.rg.fx.disposeLabel(id);
           delete lore.ore.explore.rg.fx.labels[id];
    } 
    lore.ore.explore.canvas.clear();
    delete lore.ore.explore.canvas;
  }
  var infovis = document.getElementById('infovis');
  infovis.innerHTML = "";
  var w = infovis.offsetWidth, h = infovis.offsetHeight;
  // create a new canvas
  /** The canvas used to render the explore visualization */
  lore.ore.explore.canvas = new Canvas('explorecanvas', {
        'injectInto':'infovis',
        'width': w,
        'height':h
  });
  /** The JIT RGraph that provides the explore visualization */
  lore.ore.explore.rg=new RGraph(lore.ore.explore.canvas,  {
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
    clickedNode: {},
    /*onBeforePlotNode: function(node){
      if (node.data.type == "rem"){
        node.data["$type"] = "circle";
        node.data["$color"] = "orange";
        node.data["$dim"] = 6;
      }
    },*/
    /*onBeforePlotLine: function(adj) {
       if (adj.data["relType"] == "http://www.openarchives.org/ore/terms/ResourceMap"){
           adj.data["$color"]="orange";
       } 
    },*/  
    requestGraph: function() {
        lore.ore.explore.loadRem(this.clickedNode.id, this.clickedNode.name, function(json) {
            lore.ore.explore.rg.op.sum(json, {
                'type': 'fade:con',
                duration: 1500,
                hideLabels: true,
                onAfterCompute: function(){}
            });
        });
    },
    onCreateLabel: function(domElement, node) {
       var d = Ext.get(domElement);
       d.update(node.name);
       d.setOpacity(0.8);
       d.on('mouseover', function() {d.setOpacity(1.0);});
       d.on('mouseout', function() {d.setOpacity(0.8);});
       d.on('click', function() {
        lore.ore.explore.rg.onClick(node.id);
       });
    },
    onPlaceLabel: function(domElement, node) {
        domElement.style.display = "none";
         if(node._depth <= 2){
            domElement.innerHTML = node.name;
            domElement.style.display = "";
            var left = parseInt(domElement.style.left);
            domElement.style.width = '';
            domElement.style.height = '';
            var w = domElement.offsetWidth;
            domElement.style.left = (left - w /2) + 'px';
         }
    }, 
    onAfterCompute: function() {
        var node = Graph.Util.getClosestNodeToOrigin(lore.ore.explore.rg.graph, "pos");
        this.clickedNode = node;
        var existhistory = Ext.get('history').dom.innerHTML;
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
            + "'></a>&nbsp;<a style='color:#51666b' href='#' onclick=\"lore.ore.explore.rg.onClick('" 
            + node.id + "');\">" + node.name + "</a>";
        Ext.get('history').update(nodelink + (existhistory? " &lt; " + existhistory : ""));
        this.requestGraph();
    }
  });
}

/** Initialize the explore view to display resources from the repository related to a compound object
 * @param {URI} id The URI of the compound object
 * @param {String} title Label to display for the compound object
 */
lore.ore.explore.showInExploreView = function (id, title){
    lore.ore.explore.init();
    lore.ore.explore.loadRem(id, title, function(json){
        lore.ore.explore.rg.loadJSON(json);
        lore.ore.explore.rg.refresh();
        var existhistory = Ext.get('history').dom.innerHTML;
        // TODO: check is is a comp obj- use lore icon and open in lore instead of browser link
        var action = "lore.global.util.launchTab(\"" + id + "\", window);";
        var nodelink = "<a title='Show in browser' href='#' onclick='" + action 
        + "'><img style='border:none' src='chrome://lore/skin/icons/page_go.png'>" 
        + "</a>&nbsp;<a style='color:#51666b' href='#' onclick=\"lore.ore.explore.rg.onClick('" 
        + id + "');\">" + title + "</a>";
        Ext.get('history').update(nodelink + (existhistory? " &lt; " + existhistory : ""));
    });  
}
