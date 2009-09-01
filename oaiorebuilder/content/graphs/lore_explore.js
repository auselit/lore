Ext.namespace("lore.ore.explore");
/**
 * Display a resource map in the explore view
 * @param {} id The URI that identifies the resource map
 */
lore.ore.explore.showInExploreView = function (id, title){
    if(!lore.ore.explore.rg){
        lore.ore.explore.init();
    } 
    lore.ore.explore.loadRem(id, title, function(json){
            lore.ore.explore.rg.loadJSON(json);
            lore.ore.explore.rg.refresh();
    });
}
/**
 * Helper: gets resource map as RDF, transforms to JSON and applies f to it
 * @param {} id Identifier of the resource map to be retrieved
 * @param {} f Function to apply
 */
lore.ore.explore.loadRem = function(id, title, f){
   // make json from sparql query

   //var eid = Ext.util.Format.htmlEncode(id);
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
    var queryURL = "http://austlit.edu.au/openrdf-sesame/repositories/lore"
            + "?queryLn=sparql&query=" 
            + thequery;
    var json;

        var xsltproc = new XSLTProcessor();
        // get the stylesheet - this has to be an XMLHttpRequest because Ext.Ajax.request fails on chrome urls
        var xhr = new XMLHttpRequest();
        xhr.overrideMimeType('text/xml');
        xhr.open("GET", 'chrome://lore/content/stylesheets/sparqlexplore.xsl', false);
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
        /*var xhr = new XMLHttpRequest();
        xhr.open("GET",'chrome://lore/content/testexplore.js',false);
        xhr.send(null);
        eval ("json = " + xhr.responseText);*/
        lore.debug.ore("got json",json);
    } catch (ex){
        lore.debug.ore("problem doing sparql transform",ex);
    } 
   //json = [{"id":"node0","name":remid,"data":{'$dim': 6,'$color': 'orange', '$type': 'circle'},"adjacencies":[{"nodeTo":"node1","data":{"weight":3}},{"nodeTo":"node2","data":{"weight":3}},{"nodeTo":"node3","data":{"weight":3}},{"nodeTo":"node4","data":{"weight":1}},{"nodeTo":"node5","data":{"weight":1}}]},{"id":"node1","name":"node1 name","data":[{"key":"weight","value":13.077119090372014},{"key":"some other key","value":"some other value"}],"adjacencies":[{"nodeTo":"node0","data":{"weight":3}},{"nodeTo":"node2","data":{"weight":1}},{"nodeTo":"node3","data":{"weight":3}},{"nodeTo":"node4","data":{"weight":1}},{"nodeTo":"node5","data":{"weight":1}}]},{"id":"node2","name":"node2 name","data":[{"key":"weight","value":24.937383149648717},{"key":"some other key","value":"some other value"}],"adjacencies":[{"nodeTo":"node0","data":{"weight":3}},{"nodeTo":"node1","data":{"weight":1}},{"nodeTo":"node3","data":{"weight":3}},{"nodeTo":"node4","data":{"weight":3}},{"nodeTo":"node5","data":{"weight":1}}]},{"id":"node3","name":"node3 name","data":[{"key":"weight","value":10.53272740718869},{"key":"some other key","value":"some other value"}],"adjacencies":[{"nodeTo":"node0","data":{"weight":3}},{"nodeTo":"node1","data":{"weight":3}},{"nodeTo":"node2","data":{"weight":3}},{"nodeTo":"node4","data":{"weight":1}},{"nodeTo":"node5","data":{"weight":3}}]},{"id":"node4","name":"node4 name","data":[{"key":"weight","value":1.3754347037767345},{"key":"some other key","value":"some other value"}],"adjacencies":[{"nodeTo":"node0","data":{"weight":1}},{"nodeTo":"node1","data":{"weight":1}},{"nodeTo":"node2","data":{"weight":3}},{"nodeTo":"node3","data":{"weight":1}},{"nodeTo":"node5","data":{"weight":3}}]},{"id":"node5","name":"node5 name","data":{'type': 'rem'},"adjacencies":[{"nodeTo":"node0","data":{"weight":1}},{"nodeTo":"node1","data":{"weight":1}},{"nodeTo":"node2","data":{"weight":1}},{"nodeTo":"node3","data":{"weight":3}},{"nodeTo":"node4","data":{"weight":3}}]}];
   if (json){
        f(json);
   }
}
/**
 * Initialises the explore view
 */
lore.ore.explore.init = function() {
  var infovis = document.getElementById('infovis');
  var w = infovis.offsetWidth, h = infovis.offsetHeight;
  lore.ore.explore.canvas = new Canvas('explorecanvas', {
    'injectInto':'infovis',
    'width': w,
    'height':h
  });
  lore.ore.explore.rg= new RGraph(lore.ore.explore.canvas,  {
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
        // TODO: check is is a comp obj- use lore icon and open in lore instead of browser link
        var nodelink = "<a target='_blank' title='Show in browser' href='" + node.id + "'><img style='border:none' src='chrome://lore/skin/icons/page_go.png'></a>&nbsp;<a style='color:#51666b' href='#' onclick=\"lore.ore.explore.rg.onClick('" + node.id + "');\">" + node.name + "</a>";
        Ext.get('history').update(nodelink + (existhistory? " &lt; " + existhistory : ""));
        this.requestGraph();
    }
  });
}


