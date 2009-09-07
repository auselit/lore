Ext.namespace("lore.ore.explore");
/**
 * Display a resource map in the explore view
 * @param {} id The URI that identifies the resource map
 */
lore.ore.explore.showInExploreView = function (id){
    if(!lore.ore.explore.rg){lore.ore.explore.init();}
    lore.ore.explore.loadRem(id, function(json){
            lore.ore.explore.rg.loadJSON(json);
            lore.ore.explore.rg.refresh();
    });
}
/**
 * Helper: gets resource map as RDF, transforms to JSON and applies f to it
 * @param {} id Identifier of the resource map to be retrieved
 * @param {} f Function to apply
 */
lore.ore.explore.loadRem = function(remid, f){

   var json = [{"id":"node0","name":remid,"data":{'$dim': 6,'$color': 'orange', '$type': 'circle'},"adjacencies":[{"nodeTo":"node1","data":{"weight":3}},{"nodeTo":"node2","data":{"weight":3}},{"nodeTo":"node3","data":{"weight":3}},{"nodeTo":"node4","data":{"weight":1}},{"nodeTo":"node5","data":{"weight":1}}]},{"id":"node1","name":"node1 name","data":[{"key":"weight","value":13.077119090372014},{"key":"some other key","value":"some other value"}],"adjacencies":[{"nodeTo":"node0","data":{"weight":3}},{"nodeTo":"node2","data":{"weight":1}},{"nodeTo":"node3","data":{"weight":3}},{"nodeTo":"node4","data":{"weight":1}},{"nodeTo":"node5","data":{"weight":1}}]},{"id":"node2","name":"node2 name","data":[{"key":"weight","value":24.937383149648717},{"key":"some other key","value":"some other value"}],"adjacencies":[{"nodeTo":"node0","data":{"weight":3}},{"nodeTo":"node1","data":{"weight":1}},{"nodeTo":"node3","data":{"weight":3}},{"nodeTo":"node4","data":{"weight":3}},{"nodeTo":"node5","data":{"weight":1}}]},{"id":"node3","name":"node3 name","data":[{"key":"weight","value":10.53272740718869},{"key":"some other key","value":"some other value"}],"adjacencies":[{"nodeTo":"node0","data":{"weight":3}},{"nodeTo":"node1","data":{"weight":3}},{"nodeTo":"node2","data":{"weight":3}},{"nodeTo":"node4","data":{"weight":1}},{"nodeTo":"node5","data":{"weight":3}}]},{"id":"node4","name":"node4 name","data":[{"key":"weight","value":1.3754347037767345},{"key":"some other key","value":"some other value"}],"adjacencies":[{"nodeTo":"node0","data":{"weight":1}},{"nodeTo":"node1","data":{"weight":1}},{"nodeTo":"node2","data":{"weight":3}},{"nodeTo":"node3","data":{"weight":1}},{"nodeTo":"node5","data":{"weight":3}}]},{"id":"node5","name":"node5 name","data":{'type': 'rem'},"adjacencies":[{"nodeTo":"node0","data":{"weight":1}},{"nodeTo":"node1","data":{"weight":1}},{"nodeTo":"node2","data":{"weight":1}},{"nodeTo":"node3","data":{"weight":3}},{"nodeTo":"node4","data":{"weight":3}}]}];
   f(json);
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
    onBeforePlotNode: function(node){
      if (node.data.type == "rem"){
        node.data["$type"] = "circle";
        node.data["$color"] = "orange";
        node.data["$dim"] = 6;
      }
    },
    /*onBeforePlotLine: function(adj) {
       if (adj.data["rel"] == "aggregates"){
           adj.data["$color"]="#33ff00";
       } 
    },  */
    requestGraph: function() {
        lore.ore.explore.loadRem(this.clickedNode.id, function(json) {
            lore.ore.explore.rg.op.morph(json, {
                'type': 'fade:con',
                duration: 1500,
                hideLabels: true,
                onAfterCompute: $lambda()
            });
        });
    },
    onCreateLabel: function(domElement, node) {
       var d = Ext.get(domElement);
       d.update(node.name);
       d.setOpacity(0.8);
       d.on('mouseover', function() {d.setOpacity(1.0);});
       d.on('mouseout', function() {d.setOpacity(0.8);});
       d.on('click', function() {lore.ore.explore.rg.onClick(node.id);});
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
        var node = Graph.Util.getClosestNodeToOrigin(ht.graph, "pos");
        this.clickedNode = node;
        this.requestGraph();
    }
  });
}


