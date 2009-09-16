/*
 * Copyright (C) 2008 - 2009 School of Information Technology and Electrical
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

lore.ui.loreError = function(message){
	lore.ui.lorestatus.setStatus({
			text: message,
			iconCls: 'error-icon',
			clear: {
				wait: 3000
			}
		});
	lore.ui.global.loreError(message);
}

lore.ui.loreInfo = function(message) {
	lore.ui.lorestatus.setStatus({
				text: message,
				iconCls: 'info-icon',
				clear: {
					wait: 3000
				}
	});
	lore.ui.global.loreInfo(message);
}
	
lore.ui.loreWarning = function(message){

	lore.ui.lorestatus.setStatus({
		text: message,
		iconCls: 'warning-icon',
		clear: {
			wait: 3000
		}
	});
	lore.ui.global.loreWarning(message);
}
/**
 * Set the global variables for the repository access URLs
 *
 * @param {}
 *            rdfrepos The repository access URL
 * @param {}
 *            rdfrepostype The type of the repository (eg sesame, fedora)
 * @param {}
 *            annoserver The annotation server access URL
 */
lore.ore.setRepos = function(rdfrepos, rdfrepostype){
	lore.ore.reposURL = rdfrepos; // compound object repository
	lore.ore.reposType = rdfrepostype; // type of compound object repository
}
	
	
lore.ore.setdccreator = function(creator){
	var remprops = lore.ui.grid.getSource();
	remprops["dc:creator"] = creator;
	lore.ui.grid.setSource(remprops);
	lore.defaultCreator = creator;
}

lore.ore.show = function () {
	lore.ui.lorevisible = true;
		
	if (lore.ui.currentURL && lore.ui.currentURL != 'about:blank' &&
		lore.ui.currentURL != '' &&
		(!lore.ui.loadedURL || lore.ui.currentURL != lore.ui.loadedURL)) {
			lore.ore.updateCompoundObjectsSourceList(lore.ui.currentURL);
			lore.ui.loadedURL = lore.ui.currentURL;
		}
}

lore.ore.hide = function () {
	lore.ui.lorevisible = false;
}

// alias used by uiglobal
lore.ore.addFigure = function (theURL) {
	lore.ore.graph.addFigure(theURL);
}

/**
 * Render the current resource map as RDF/XML in the RDF view
 */
lore.ore.updateRDFHTML = function() {
    Ext.getCmp("remrdfview").body.update(lore.ore.createRDF(true));
}
lore.ore.updateFOXML = function (){
    Ext.getCmp("remfoxmlview").body.update(Ext.util.Format.htmlEncode(lore.ore.createFOXML()));
}
lore.ore.updateTriG = function (){
    Ext.getCmp("remtrigview").body.update("<pre>" + Ext.util.Format.htmlEncode(lore.ore.serializeREM('trig')) + "</pre>");
}
/**
 * Remove listeners and reference to RDF View if it is closed
 * 
 * @param {Object} tabpanel
 * @param {Object} panel
 */
lore.ore.closeView = function(tabpanel, panel) {
    lore.debug.ore("close view " + panel.id,panel);
    // remove listeners
    var tab = Ext.getCmp(panel.id);
    if (panel.id == 'remrdfview') {
        tab.un("activate", lore.ore.updateRDFHTML);     
    }
    else if (panel.id == 'remsmilview') {
        tab.un("activate", lore.ore.showSMIL);   
    }
    else if (panel.id == 'remfoxmlview') {
        tab.un("activate",lore.ore.updateFOXML);
    }
    else if (panel.id == 'remtrigview') {
        tab.un("activate",lore.ore.updateTriG);
    }
    return true;
}

/**
 * Create or show the RDF View
 */
lore.ore.openRDFView = function() { 
    lore.debug.ore("open rdf view");
    lore.ore.openView("remrdfview","RDF/XML",lore.ore.updateRDFHTML);
}
lore.ore.openSMILView = function() {
    lore.debug.ore("open smil view");
    lore.ore.openView("remsmilview", "SMIL", lore.ore.showSMIL);
}
lore.ore.openTriGView = function(){
    lore.debug.ore("open TriG view");
    lore.ore.openView("remtrigview","TriG",lore.ore.updateTriG);
}
lore.ore.openFOXMLView = function(){
    lore.debug.ore("open foxml view");
    lore.ore.openView("remfoxmlview","FOXML",lore.ore.updateFOXML);
}

lore.ore.openView = function (panelid,paneltitle,activationhandler){
    var tab = Ext.getCmp(panelid);
    if (!tab) {
        lore.ui.loreviews.add({
            title : paneltitle,
            id : panelid,
            autoScroll : true,
            closable : true
        }).show();
        tab = Ext.getCmp(panelid);
        tab.on("activate", activationhandler);
        activationhandler();
    }
    else {
        lore.ui.loreviews.activate(panelid);
    }
}

/**
 * Displays a summary of the resource URIs contained in the compound object
 */
lore.ore.showCompoundObjectSummary = function() {
    var remprops = lore.ui.grid.getSource();

    var newsummary = "<table style='font-size:smaller;border:none'>"
            + "<tr valign='top'><td width='20%'><b>Compound object:</b></td><td>"
            + remprops["rdf:about"] + "</td></tr>";
    if (remprops["dc:title"]) {
        newsummary += "<tr valign='top'><td width='20%'><b>Title:</b></td><td>"
                + remprops["dc:title"] + "</td></tr>";
    }
    if (remprops["dc:description"]) {
        newsummary += "<tr valign='top'><td><b>Description:</b></td><td width='80%'>"
                + remprops["dc:description"] + "</td></tr>";
    }
    newsummary += "</table>";
    newsummary += "<div style='padding-top:1em'><p><b>List of contents:</b></p><ul>";
    var allfigures = lore.ore.graph.Graph.getDocument().getFigures();
    for (var i = 0; i < allfigures.getSize(); i++) {
        var fig = allfigures.get(i);
        var figurl = fig.url.escapeHTML();
        var title = fig.metadataproperties["dc:title"];
        newsummary += "<li>" + (title? title + ": " : "") + "<a target='_blank' href='" 
            + figurl + "'>&lt;" + figurl + "&gt;</a></li>";
    }
    newsummary += "</ul></div>";
    lore.ui.summarytab.body.update(newsummary);
    lore.ui.loreInfo("Displaying a summary of compound object contents");
}
/**
 * Generate a SMIL presentation and display a link to launch it
 */
lore.ore.showSMIL = function() {
    
    var allfigures = lore.ore.graph.Graph.getDocument().getFigures();
    var numfigs = allfigures.getSize();
    var smilcontents = "<p><a title='smil test hover' href='http://www.w3.org/AudioVideo/'>SMIL</a> is the Synchronized Multimedia Integration Language.</p>";
    if (numfigs > 0) {
        var smilpath = lore.ore.createSMIL(); // generate the new smil file
        // into oresmil.xsl
        smilcontents += "<p>A SMIL slideshow has been generated from the contents of the current compound object.</p><p>"
                + "<a onclick='lore.util.launchWindow(this.href, false);return(false);' target='_blank' href='file://"
                + smilpath
                + "'>Click here to launch the slideshow in a new window</a><br/>";
    } else {
        smilcontents += "<p>Once you have added some resources to the current compound object a SMIL presentation will be available here.</p>";
    }
    Ext.getCmp("remsmilview").body.update(smilcontents);
    lore.ui.loreInfo("Display a multimedia presentation generated from the compound object contents");
}

lore.ore.showSlideshow = function (){
    var allfigures = lore.ore.graph.Graph.getDocument().getFigures();
    var numfigs = allfigures.getSize();
    var sscontents = "";
    var carouselel = Ext.get("trailcarousel");
    try{
    var params = {
    "width": carouselel.getWidth(),
    "height": (carouselel.getHeight() - 29)}; // minus 29 to account for slide nav bar
    var resultDoc = lore.ore.transformORERDF("chrome://lore/content/compound_objects/stylesheets/slideshow_view.xsl",true, params);
    var serializer = new XMLSerializer();
    sscontents += serializer.serializeToString(resultDoc);
    carouselel.update(sscontents);
    lore.ui.carousel.reloadMarkup();
    } catch (ex){
        lore.debug.ore("adding slideshow",ex);
    }
}
/**
 * Generate a visualisation to explore compound object connections
 */
lore.ore.showExploreUI = function(){
    try{
    if (lore.ore.exploreLoaded !== lore.ore.currentREM) {
        lore.debug.ore("show in explore view", lore.ore.currentREM);
        lore.ore.exploreLoaded = lore.ore.currentREM;
        lore.ore.explore.showInExploreView(lore.ore.currentREM, lore.ui.grid.getSource()["dc:title"]);
    } else {
        lore.debug.ore("refresh explore view");
        lore.ore.explore.rg.refresh();
    }
    }catch(e){lore.debug.ore("error in showExploreUI",e);}
    lore.ui.loreInfo("Click on the nodes to explore connections between compound objects.");
}
/**
 * Stores basic metadata about a compound object for the results listing
 * @param {} sparqlxml
 */
lore.ore.CompObjListing = function(result){
    var bindings;
    var node;
    var attr;
    var nodeVal;
    this.title = "Untitled";
    this.creator = "Anonymous";
    try {  
       bindings = result.getElementsByTagName('binding');
       for (var j = 0; j < bindings.length; j++){  
        attr = bindings[j].getAttributeNode('name');
        if (attr.nodeValue =='g'){ //graph uri
            node = bindings[j].getElementsByTagName('uri'); 
            this.uri = lore.util.safeGetFirstChildValue(node);
        } else {
            node = bindings[j].getElementsByTagName('literal');
            nodeVal = lore.util.safeGetFirstChildValue(node);
            if (attr.nodeValue == 't' && nodeVal){ //title
                this.title = nodeVal;
            } else if (attr.nodeValue == 'a' && nodeVal){// dc:creator
                this.creator = nodeVal;
            } else if (attr.nodeValue == 'c' && nodeVal){ // dcterms:created
                this.created = nodeVal;
            }
        }
       }
    } catch (ex) {
        lore.debug.ore("Unable to process compound object result list", ex);
    }
}

lore.ore.serializeREM = function(format) {
    if (format == 'foxml') {
        return lore.ore.createFOXML();
    }
    // TODO: remove the first line once compound object is stored as rdfquery store
    var rdf = lore.ore.createRDF(false);
    rdfDoc = new DOMParser().parseFromString(rdf, "text/xml");
        var databank = jQuery.rdf.databank();
        for (ns in lore.constants.NAMESPACES){
            databank.prefix(ns,lore.constants.NAMESPACES[ns]);
        }
        databank.load(rdfDoc);
    if (format == 'trig') {
       var result = "<" + lore.ui.grid.getSource()["rdf:about"] + ">\n{\n";
       var triples = databank.triples();
       for (var t = 0; t < triples.length; t++){
        var triple = triples[t];
        result += triple.toString() + "\n"; 
       }
       result += "}\n";
       return result;
    } else {
        return databank.dump({format:'application/rdf+xml',serialize:true});
    }
}
/**
 * Create the RDF/XML of the current resource map
 * 
 * @param {Boolean} escape Indicates whether to escape the results for rendering as HTML
 * @return {String} The RDF/XML as a string
 */
lore.ore.createRDF = function(escape) {
    /*
     * Helper function that serialises a property to RDF/XML propname The name
     * of the property to serialise properties All of the properties ltsymb Less
     * than symbol nlsymb New line symbol returns The RDF/XML representation of
     * the property
     */
    var serialise_property = function(propname, properties, ltsymb, nlsymb) {
        var result = "";
        var propval = properties[propname];
        if (propval != null && propval != '') {
            result = ltsymb + propname + ">";
            if (nlsymb == "<br/>" && propval) {
                try {
                    result += propval.toString().escapeHTML();
                } catch (e) {
                    lore.ui.loreWarning(e.toString());
                }
            } else {
                result += propval;
            }
            result += ltsymb + "/" + propname + ">" + nlsymb;
        }
        return result;
    };
    var ltsymb = "<";
    var nlsymb = "\n";
    if (escape) {
        ltsymb = "&lt;";
        nlsymb = "<br/>";
    }
    var remprops = lore.ui.grid.getSource();
    var modifiedDate = new Date();
    remprops["dcterms:modified"] = modifiedDate;
    lore.ui.grid.setSource(remprops);
    var describes = remprops["ore:describes"];
    var rdfabout = remprops["rdf:about"];

    // RDF fragments
    var rdfdescabout = "rdf:Description rdf:about=\"";
    var closetag = "\">" + nlsymb;
    var fullclosetag = "\"/>" + nlsymb;
    var rdfdescclose = "/rdf:Description>";

    // create RDF for resource map: modified and creator are required
    var rdfxml = ltsymb + "?xml version=\"1.0\" encoding=\"UTF-8\" ?>" + nlsymb
            + ltsymb + 'rdf:RDF ' + nlsymb;
    for (var pfx in lore.constants.NAMESPACES) {
        rdfxml += "xmlns:" + pfx + "=\"" + lore.constants.NAMESPACES[pfx]
                + "\"" + nlsymb;
    }
    var monthString = modifiedDate.getMonth() + 1 + "";
    if (monthString.length < 2){
        monthString = '0' + monthString;
    }
    var dayString = modifiedDate.getDate() + "";
    if (dayString.length < 2){
        dayString = "0" + dayString;
    }
    rdfxml += "xml:base = \"" + rdfabout + "\">" + nlsymb + ltsymb
            + rdfdescabout + rdfabout + closetag + ltsymb
            + "ore:describes rdf:resource=\"" + describes + fullclosetag
            + ltsymb + 'rdf:type rdf:resource="' + lore.constants.RESOURCE_MAP
            + '" />' + nlsymb + ltsymb + 'dcterms:modified rdf:datatype="'
            + lore.constants.XMLSCHEMA_NS + 'date">'
            + modifiedDate.getFullYear() + "-" + monthString
            + "-" + dayString + ltsymb + "/dcterms:modified>"
            + nlsymb;
    var created = remprops["dcterms:created"]; 
    if (created != null && created instanceof Date) {
        monthString = created.getMonth() + 1 + "";
        if (monthString.length < 2){
            monthString = '0' + monthString;
        }
        dayString = created.getDate() + "";
	    if (dayString.length < 2){
	        dayString = "0" + dayString;
	    }
        rdfxml += ltsymb + 'dcterms:created rdf:datatype="'
                + lore.constants.XMLSCHEMA_NS + 'date">'
                + created.getFullYear() + "-" + monthString + "-"
                + dayString + ltsymb + "/dcterms:created>" + nlsymb;
    } 
    else if (created != null) {
        rdfxml += ltsymb + 'dcterms:created rdf:datatype="'
                + lore.constants.XMLSCHEMA_NS + 'date">'
                + created + ltsymb + "/dcterms:created>" + nlsymb;
    }
    for (var i = 0; i < lore.ore.METADATA_PROPS.length; i++) {
        var theprop = lore.ore.METADATA_PROPS[i];
        if (theprop != 'dcterms:modified' && theprop != 'dcterms:created') {
            rdfxml += serialise_property(theprop, remprops, ltsymb, nlsymb);
        }
    }
    rdfxml += ltsymb + rdfdescclose + nlsymb;

    // create RDF for aggregation
    var aggreprops = {
        "rdf:type" : lore.constants.ORETERMS_NS + "Aggregation"
    };
    rdfxml += ltsymb + rdfdescabout + describes + closetag + ltsymb
            + "rdf:type rdf:resource=\"" + aggreprops["rdf:type"]
            + fullclosetag;
    // TODO: any other types for aggregation eg Journal Article

    for (i = 0; i < lore.ore.all_props.length; i++) {
        rdfxml += serialise_property(lore.ore.all_props[i], aggreprops, ltsymb,
                nlsymb);
    }
    var allfigures = lore.ore.graph.Graph.getDocument().getFigures();
    var resourcerdf = "";
    for (i = 0; i < allfigures.getSize(); i++) {
        var fig = allfigures.get(i);
        var figurl = fig.url.replace('<', '%3C').replace('>', '%3E')
                .escapeHTML();
        rdfxml += ltsymb + "ore:aggregates rdf:resource=\"" + figurl
                + fullclosetag;
        // create RDF for resources in aggregation
        // TODO: resource properties eg dcterms:hasFormat, ore:isAggregatedBy
        for (var mprop in fig.metadataproperties) {
            if (mprop != 'Resource' && !mprop.match('undefined')) {
                var mpropval = fig.metadataproperties[mprop];
                if (mpropval && mpropval != '') {
                    resourcerdf += ltsymb + rdfdescabout + figurl + closetag
                            + ltsymb + mprop + ">" + mpropval + ltsymb + "/"
                            + mprop + ">" + nlsymb + ltsymb + rdfdescclose
                            + nlsymb;
                }
            }
        }
        /* persist node layout */

        var objframe = window.frames[fig.url + "-data"];
        resourcerdf += ltsymb + rdfdescabout + figurl + closetag + ltsymb
                + "layout:x>" + fig.x + ltsymb + "/" + "layout:x>" + nlsymb
                + ltsymb + "layout:y>" + fig.y + ltsymb + "/" + "layout:y>"
                + nlsymb + ltsymb + "layout:width>" + fig.width + ltsymb + "/"
                + "layout:width>" + nlsymb + ltsymb + "layout:height>"
                + fig.height + ltsymb + "/" + "layout:height>" + nlsymb
                + ltsymb + "layout:originalHeight>" + fig.originalHeight
                + ltsymb + "/" + "layout:originalHeight>" + nlsymb;
        
        if (objframe && (objframe.scrollX != 0 || objframe.scrollY != 0)) {
            resourcerdf += ltsymb + "layout:scrollx>" + objframe.scrollX
                    + ltsymb + "/" + "layout:scrollx>" + nlsymb + ltsymb
                    + "layout:scrolly>" + objframe.scrollY + ltsymb + "/"
                    + "layout:scrolly>" + nlsymb;
        }
        resourcerdf += ltsymb + rdfdescclose + nlsymb;
        
        // iterate over all ports' connections and serialize if this fig is the source of the connection
        var ports = fig.getPorts();
        for (var p = 0; p < ports.getSize(); p++){
            var outgoingconnections = ports.get(p).getConnections();
            for (var j = 0; j < outgoingconnections.getSize(); j++) {
	            var theconnector = outgoingconnections.get(j);
                if (figurl == theconnector.sourcePort.parentNode.url.escapeHTML()){
	               var relpred = theconnector.edgetype;
	               var relns = theconnector.edgens;
	               var relobj = theconnector.targetPort.parentNode.url.escapeHTML();
	               resourcerdf += ltsymb + rdfdescabout + figurl + closetag + ltsymb
	                    + relpred + " xmlns=\"" + relns + "\" rdf:resource=\""
	                    + relobj + fullclosetag + ltsymb + rdfdescclose + nlsymb;
                }
	        }
        }    
    }
    rdfxml += ltsymb + rdfdescclose + nlsymb;
    rdfxml += resourcerdf;
    rdfxml += ltsymb + "/rdf:RDF>";
    return rdfxml;
}

lore.ore.generateID = function(){
    // TODO: should use a persistent identifier service to request an identifier
    return "http://austlit.edu.au/rem/" + Math.uuid();
}

/**
 * Load a compound object into the graphical view
 * @param {} rdf XML doc or XML HTTP response containing the compound object (RDF/XML)
 * @param {} showInTree boolean indicating whether to display in the recently viewed tree
 */
lore.ore.loadCompoundObject = function (rdf) {
    var nsprefix = function(ns) {
        for (var prefix in lore.constants.NAMESPACES) {
            if (lore.constants.NAMESPACES[prefix] == ns) {
                return prefix + ":";
            }
        }
    };
    var showInTree = false;
    try {
        // reset the graphical view
        lore.ui.initGraphicalView();
        //lore.ui.loreviews.activate("compoundobjecteditor");
        lore.ui.loreviews.activate("drawingarea");
        var rdfDoc;
        if (typeof rdf != 'object'){ // it should be a string
	       rdfDoc = new DOMParser().parseFromString(rdf, "text/xml");
        } else {
            showInTree = true;
            rdfDoc = rdf.responseXML;
        }
	    var databank = jQuery.rdf.databank();
        for (ns in lore.constants.NAMESPACES){
            databank.prefix(ns,lore.constants.NAMESPACES[ns]);
        }
	    databank.load(rdfDoc);
        lore.ore.currentRDF = jQuery.rdf({databank: databank});
        
        // Display the properties for the compound object
	    var remQuery = lore.ore.currentRDF.where('?rem rdf:type <' + lore.constants.RESOURCE_MAP + '>');
        var remurl, res = remQuery.get(0);
        if (res){
	       remurl = res.rem.value.toString();
        }  else {
            lore.debug.ore("no remurl found in RDF",lore.ore.currentRDF);
        }
	    var theprops = {
	        "rdf:about" : remurl,
	        "ore:describes" : "#aggregation"
	    };
        lore.ore.currentRDF.about('<' + remurl + '>')
            .each(function(){
                var propurl = this.property.value.toString();
                var propsplit = lore.util.splitTerm(propurl);
                var propname = nsprefix(propsplit.ns);
                if (propname){
                    propname = propname + propsplit.term;
                } else {
                    propname = propurl;
                }
                lore.debug.ore("rem props " + propname,this);
                lore.debug.ore("rem prop " + this.value.toString(),this);
                theprops[propname] = this.value.value.toString();
            });
	     lore.ui.grid.setSource(theprops);
         
         
        // create a node figure for each aggregated resource, restoring the layout
        lore.ore.currentRDF.where('<' + remurl + "#aggregation" + '> ore:aggregates ?aggre')
            .optional('?url layout:x ?x')
            .optional('?url layout:y ?y')
            .optional('?url layout:width ?w')
            .optional('?url layout:height ?h')
            .optional('?url layout:originalHeight ?oh')
            .optional('?url layout:scrollx ?sx')
            .optional('?url layout:scrolly ?sy')
            .optional('?url dc:format ?format')
            .each(function(){
             var resourceURL = this.url.value.toString(); 
             var fig;
             
             if (this.x && this.y) {
                var opts = {};
                for (prop in this) {
                    if (prop != 'aggre' && prop != 'format'){
                        opts[prop] = parseInt(this[prop].value);
                    } else {
                        opts[prop] = this[prop].value;
                    }
                }
                if (opts.x < 0){
                    opts.x = 0;
                }
                if (opts.y < 0) {
                    opts.y = 0;
                }
                fig = lore.ore.graph.addFigureWithOpts(opts);
             } else {
                fig = lore.ore.graph.addFigure(resourceURL);
             } 
        });
        
        // iterate over all predicates to create node connections and properties
        lore.ore.currentRDF.where('?subj ?pred ?obj')
            .filter(function(){
                // filter out the layout properties and predicates about the resource map
                if (this.pred.value.toString().match(lore.constants.LORE_LAYOUT_NS) 
                    || this.subj.value.toString().match(remurl)) return false;
                else return true;
            })
            .each(function(){  
                // try to find a node that this predicate applies to 
                var subject = this.subj.value.toString()
                var srcfig = lore.ore.graph
                    .lookupFigure(subject);
                if (!srcfig) {
                   srcfig = lore.ore.graph
                    .lookupFigure(subject.replace(
                    '%3C', '<').replace('%3F', '>')
                    .unescapeHTML());
                }
                if (srcfig) {
                    var relresult = lore.util.splitTerm(this.pred.value.toString());
                    var obj = this.obj.value.toString()
                    var tgtfig = lore.ore.graph.lookupFigure(obj);
                    if (!tgtfig) {
                        tgtfig = lore.ore.graph
                            .lookupFigure(obj.replace(
                                        '%3C', '<').replace('%3F', '>')
                                        .unescapeHTML());
                    }
                    if (tgtfig) { // this is a connection
                        var c = new lore.ore.graph.ContextmenuConnection();
                        c.setSource(srcfig.getPort("output"));
                        c.setTarget(tgtfig.getPort("input"));
                        c.setRelationshipType(relresult.ns, relresult.term);
                        lore.ore.graph.Graph.addFigure(c);
                    } else  { 
                        // not a node relationship, show in the property grid 
                        srcfig.metadataproperties[nsprefix(relresult.ns) + relresult.term] = obj;
                        if (relresult.term == "title") {
                            srcfig.setTitle(obj);
                        }
                    }
                }
            }
        );

        lore.ui.loreInfo("Loading compound object");
        lore.ore.currentREM = remurl;
        
       if (showInTree){
         var title = theprops["dc:title"] ? theprops["dc:title"] : "Untitled";
         var recentNode = new Ext.tree.TreeNode({
            text : title,
            id: remurl + 'r',
            uri: remurl,
            iconCls : 'oreresult',
            leaf : true
        });
        lore.ore.attachREMEvents(recentNode);
        var childNodes = lore.ui.recenttreeroot.childNodes;
        if (childNodes.length >= 5) {
            lore.ui.recenttreeroot
                .removeChild(lore.ui.recenttreeroot.firstChild);
        }
        lore.ui.recenttreeroot.appendChild(recentNode);
       }
    
    } catch (e){
        lore.debug.ore("exception loading RDF from string",e);
        lore.debug.ore("the RDF string was",rdf);
        lore.debug.ore("the serialized databank is",databank.dump({format:'application/rdf+xml', serialize: true}));
    }
}

/**
 * Loads a resource map from a URL into the graphical view and property panels
 * 
 * @param {String} rdfURL The direct URL to the RDF (eg restful web service on repository that returns RDF)
 */
/*lore.ore.readRDF = function(rdfURL){
    Ext.Ajax.request({
            url: rdfURL,
            method: "GET",
            disableCaching: false,
            success: lore.ore.loadCompoundObject,
            failure: function(resp, opt){
                lore.debug.ore("Unable to load compound object " + opt.url, resp);
            }
        }); 
}*/

lore.ore.readRDF = function(rdfURL) {
    var nsprefix = function(ns) {
        for (var prefix in lore.constants.NAMESPACES) {
            if (lore.constants.NAMESPACES[prefix] == ns) {
                return prefix + ":";
            }
        }
    };
    var read_property = function(theRDF, props, subj, theProp) {
        var propInfo = theProp.split(":");
        var propresult = theRDF.Match(null, subj,
                lore.constants.NAMESPACES[propInfo[0]] + propInfo[1], null);
        if (propresult.length > 0) {
            props[theProp] = propresult[0].object;
        }
    };
    // reset the graphical view
    lore.ui.initGraphicalView();
    lore.ui.loreviews.activate("drawingarea");
    var theRDF = new RDF();
    theRDF.getRDFURL(rdfURL, function() {
                var remurl = theRDF.Match(null, null,
                        lore.constants.RDF_SYNTAX_NS + "type",
                        lore.constants.RESOURCE_MAP)[0].subject.toString();
                var creator = theRDF.Match(null, remurl, lore.constants.DC_NS
                                + "creator", null)[0].object;
                var createdResult = theRDF.Match(null, remurl,
                        lore.constants.DCTERMS_NS + "created", null);
                var created = "";
                if (createdResult.length > 0) {
                    // TODO: check for minutes, seconds
                    created = createdResult[0].object;
                    var createdsplit = created.split("-");
                    if (createdsplit.length == 3) {
                        created = new Date(createdsplit[0],
                                createdsplit[1] - 1, createdsplit[2]);
                    }
                }
                var theprops = {
                    "rdf:about" : remurl,
                    "ore:describes" : "#aggregation",
                    "dc:creator" : creator,
                    "rdf:type" : lore.constants.RESOURCE_MAP
                };
                // TODO: perhaps should read any property, not just those in the
                // list?
                for (var i = 0; i < lore.ore.all_props.length; i++) {
                    read_property(theRDF, theprops, remurl,
                            lore.ore.all_props[i]);
                }
                theprops["dcterms:created"] = created;
                lore.ui.grid.setSource(theprops);

                // create a node figure for each aggregated resource
                var aggregationID = remurl + "#aggregation";
                var aggregates = theRDF.Match(null, aggregationID,
                        lore.constants.ORETERMS_NS + "aggregates", null);
                var resourcerels = [];
                for (i = 0; i < aggregates.length; i++) {
                    var resourceURL = aggregates[i].object;
                    // lookup layout info
                    var x = theRDF.getSingleObject(null, resourceURL,
                            lore.constants.LORE_LAYOUT_NS + "x", null);
                    var y = theRDF.getSingleObject(null, resourceURL,
                            lore.constants.LORE_LAYOUT_NS + "y", null);
                    var width = theRDF.getSingleObject(null, resourceURL,
                            lore.constants.LORE_LAYOUT_NS + "width", null);
                    var height = theRDF.getSingleObject(null, resourceURL,
                            lore.constants.LORE_LAYOUT_NS + "height", null);
                    var originalHeight = theRDF.getSingleObject(null,
                            resourceURL, lore.constants.LORE_LAYOUT_NS
                                    + "originalHeight", null);
                    var scrollx = theRDF.getSingleObject(null, resourceURL,
                            lore.constants.LORE_LAYOUT_NS + "scrollx", null);
                    var scrolly = theRDF.getSingleObject(null, resourceURL,
                            lore.constants.LORE_LAYOUT_NS + "scrolly", null);

                    if (x && y) {
                        var fig = lore.ore.graph.addFigureWithOpts({
                            "url": resourceURL,
                            "x": parseInt(x), 
                            "y":parseInt(y)
                        });
                        fig.originalHeight = parseInt(originalHeight);
                        fig.setDimension(parseInt(width), parseInt(height));
                        if (scrollx && scrolly) {
                            fig.scrollx = parseInt(scrollx);
                            fig.scrolly = parseInt(scrolly);

                        }
                    } else {
                        lore.ore.graph.addFigure(resourceURL);
                    }
                    // collect all predicates
                    var matches = theRDF.Match(null, resourceURL, null, null);
                    resourcerels = resourcerels.concat(matches);

                }

                // create connection figures based on resource-resource
                // relationships
                for (var j = 0; j < resourcerels.length; j++) {
                    var rel = resourcerels[j].predicate;
                    var relresult = lore.util.splitTerm(rel);
                    var srcfig = lore.ore.graph
                            .lookupFigure(resourcerels[j].subject);
                    if (!srcfig) {
                        srcfig = lore.ore.graph
                                .lookupFigure(resourcerels[j].subject.replace(
                                        '%3C', '<').replace('%3F', '>')
                                        .unescapeHTML());
                    }

                    var tgtfig = lore.ore.graph
                            .lookupFigure(resourcerels[j].object);
                    if (!tgtfig) {
                        tgtfig = lore.ore.graph
                                .lookupFigure(resourcerels[j].object.replace(
                                        '%3C', '<').replace('%3F', '>')
                                        .unescapeHTML());
                    }

                    if (srcfig && tgtfig) {
                        var c = new lore.ore.graph.ContextmenuConnection();
                        c.setSource(srcfig.getPort("output"));
                        c.setTarget(tgtfig.getPort("input"));
                        c.setRelationshipType(relresult.ns, relresult.term);
                        lore.ore.graph.Graph.addFigure(c);
                    } else if (srcfig) {
                        // not a node relationship, show in the property grid
                        if (!relresult.ns.match(lore.constants.LORE_LAYOUT_NS)) {
                            srcfig.metadataproperties[
                                    nsprefix(relresult.ns)
                                    + relresult.term] = resourcerels[j].object;
                        }
                        if (relresult.term == "title") {
                            srcfig.setTitle(resourcerels[j].object);
                        }
                    }
                }
                lore.ui.loreInfo("Loading compound object");
                lore.ore.currentREM = remurl;
                var title = theprops["dc:title"] ? theprops["dc:title"] : "Untitled";
                var recentNode = new Ext.tree.TreeNode({
                    text : title,
                    id: remurl + 'r',
                    uri: remurl,
                    iconCls : 'oreresult',
                    leaf : true
                });
                lore.ore.attachREMEvents(recentNode);
                var childNodes = lore.ui.recenttreeroot.childNodes;
                if (childNodes.length >= 5) {
                    lore.ui.recenttreeroot
                        .removeChild(lore.ui.recenttreeroot.firstChild);
                }
                lore.ui.recenttreeroot.appendChild(recentNode);
                lore.ui.propertytabs.activate("remgrid");
            });
}

lore.ore.attachREMEvents = function(node){
   /* node.on('click',function(node){
        lore.ui.propertytabs.activate("remgrid");
        // TODO: show details but disable editing if not lore.ore.currentREM
    });*/
    node.on('dblclick', function(node) {
         lore.ore.readRDF(node.attributes.uri);
    });
    node.on('contextmenu', function(node, e) {
        node.select();
        if (!node.contextmenu) {
            node.contextmenu = new Ext.menu.Menu({
                        id : node.attributes.uri + "-context-menu"
                    });
           node.contextmenu.add({
                text : "Edit compound object",
                handler : function(evt) {
                    lore.ore.readRDF(node.attributes.uri);
                }
            });
            /*node.contextmenu.add({
                text : "Delete compound object",
                handler : function(evt) {
                    
                }
            });*/
            node.contextmenu.add({
                text : "Add as node in compound object editor",
                handler : function(evt) {
                    lore.ore.graph
                            .addFigure(lore.ore.reposURL
                                    + "/statements?context=<"
                                    + node.attributes.uri + ">");
                }
            });
            
        }
        node.contextmenu.showAt(e.xy);
    });
}

/**
 * Takes a repository access URI and returns the resource map identifier This is
 * only necessary until we implement proper access of resource maps via their
 * identifier URI
 * 
 * @param {}
 *            theurl
 * @return {}
 */
lore.ore.getOREIdentifier = function(url) {
    // Example of the url :
    // http://austlit.edu.au/openrdf-sesame/repositories/lore/statements?context=<http://austlit.edu.au>
    var result;
    var theurl = url.replace('%3C', '<').replace('%3E', '>');
    if (theurl && theurl.indexOf('>') >= 0 ) {
        result = theurl.substring((theurl.indexOf('<') + 1),
                (theurl.length - 1));
    }
    if (result) {
        return result;
    } else {
        return theurl;
    }
}
/**
 * Load a resource map directly from a URL - prompt the user to enter the URL
 */
lore.ore.loadRDF = function() {
    Ext.Msg.show({
                title : 'Load RDF',
                buttons : Ext.MessageBox.OKCANCEL,
                msg : 'Please enter the URL of the compound object:',
                fn : function(btn, theurl) {
                    if (btn == 'ok') {
                        lore.ore.readRDF(theurl);
                    }
                },
                prompt : true
            });
}
/**
 * Populate connection context menu with relationship types from the ontology.
 * Assumes that onturl has been set in init from preferences
 */
lore.ore.loadRelationshipsFromOntology = function() {
    lore.ore.ontrelationships = {};
    lore.ore.resource_metadata_props = ["rdf:type", "ore:isAggregatedBy"];
    if (lore.ore.onturl) {
        var xhr = new XMLHttpRequest();
        //xhr.overrideMimeType('text/xml');
        xhr.open("GET", lore.ore.onturl, true);
        xhr.onreadystatechange= function(){
            if (xhr.readyState == 4) {
                lore.debug.ore("success",xhr);
                var db = jQuery.rdf.databank();
                for (ns in lore.constants.NAMESPACES){
                    db.prefix(ns,lore.constants.NAMESPACES[ns]);
                }
                db.load(xhr.responseXML);
                lore.ore.relOntology = jQuery.rdf({databank: db});
                lore.debug.ore("loading relationships from " + lore.ore.onturl,lore.ore.relOntology);      
                lore.ore.relOntology.where('?prop rdf:type <'+lore.constants.OWL_OBJPROP+'>')
                .each(function (){
                    var relresult = lore.util.splitTerm(this.prop.value.toString());
                    lore.ore.ontrelationships[relresult.term] = relresult.ns;
                });
            } 
        };
        xhr.send(null);
     }
     
        
  
       /* var ontRDF = new RDF();
        lore.ore.ontrelationships = {};
        ontRDF.getRDFURL(lore.ore.onturl, function() {
                    var relResult = ontRDF.Match(null, null,
                            lore.constants.RDF_SYNTAX_NS + "type",
                            lore.constants.OWL_OBJPROP);
                    for (var i = 0; i < relResult.length; i++) {
                        var relresult = lore.util.splitTerm(relResult[i].subject);
                        if (!relresult.term.match("genid:")) {
                            lore.ore.ontrelationships[relresult.term] = relresult.ns;
                        }
                    }
                    relResult = ontRDF.Match(null, null,
                            lore.constants.RDF_SYNTAX_NS + "type",
                            lore.constants.OWL_DATAPROP);
                    var tmp_resource_metadata = new Array(relResult.length);
                    for (i = 0; i < relResult.length; i++) {
                        tmp_resource_metadata[i] = relResult[i].subject;
                    }
                    lore.ore.resource_metadata_props = lore.ore.resource_metadata_props
                            .concat(tmp_resource_metadata);
                    lore.ore.resource_metadata_props.sort();
                    lore.ore.all_props = lore.ore.METADATA_PROPS
                            .concat(lore.ore.resource_metadata_props);
                    lore.ore.all_props.sort();
                }, false, function(args) {
                    lore.ui.loreWarning(args.status + "\n" + args.contentType
                            + " " + args.content);
                    lore.debug.ore("error loading relationships ontology",args);
                });
                */  
}
/**
 * Delete the compound object from the repository
 */
lore.ore.deleteFromRepository = function(){
    var remid = lore.ui.grid.getSource()["rdf:about"];
    var title = lore.ui.grid.getSource()["dc:title"];
    Ext.Msg.show({
        title : 'Remove Compound Object',
        buttons : Ext.MessageBox.OKCANCEL,
        msg : 'Are you sure you want to delete this compound object from the repository?<br><br>' + title + ' &lt;' + remid + "&gt;<br><br>This action cannot be undone.",
        fn : function(btn, theurl) {
            if (btn == 'ok') {
                try {
                    var xmlhttp = new XMLHttpRequest();
                    xmlhttp.open("DELETE",
                                  lore.ore.reposURL + "/statements?context=<"
                                        + remid + ">", true);  
                        xmlhttp.onreadystatechange= function(){
                            if (xmlhttp.readyState == 4) {
                                lore.ui.initGraphicalView();
                                lore.ui.loreInfo("Compound object deleted");
                            }
                        };
                        xmlhttp.send(null);
                } catch (e){
                    lore.debug.ore("deleting compound object",e);
                }
            }
        }
    });
}
/**
 * Save the resource map to the repository - prompt user to confirm
 */
lore.ore.saveRDFToRepository = function() {
    // TODO: implement Fedora support
    var remid = lore.ui.grid.getSource()["rdf:about"];
    Ext.Msg.show({
        title : 'Save RDF',
        buttons : Ext.MessageBox.OKCANCEL,
        msg : 'Save this compound object as ' + remid + "?",
        fn : function(btn, theurl) {
            if (btn == 'ok') {
                if (lore.ore.reposURL && lore.ore.reposType == 'sesame') {
                    var therdf = lore.ore.createRDF(false);
                    try {
                        var xmlhttp = new XMLHttpRequest();
                        xmlhttp.open("DELETE",
                                  lore.ore.reposURL + "/statements?context=<"
                                        + remid + ">", true);
                        
                        xmlhttp.onreadystatechange= function(){
                            lore.debug.ore("ready state change from delete",xmlhttp);
                            if (xmlhttp.readyState == 4) {
                               var xmlhttp2 = new XMLHttpRequest();
                               xmlhttp2.open("PUT",
                                lore.ore.reposURL + "/statements?context=<"
                                        + remid + ">", true);
		                        xmlhttp2.onreadystatechange = function() {
                                    lore.debug.ore("ready state change from update",xmlhttp2);
		                            if (xmlhttp2.readyState == 4) {
		                                if (xmlhttp2.status == 204) {
                                            lore.debug.ore("RDF saved",xmlhttp2);
		                                    lore.ui.loreInfo(remid + " saved to "
		                                            + lore.ore.reposURL);
		                                } else {
		                                    lore.ui.loreError('Unable to save to repository'
		                                                    + xmlhttp2.responseText);
		                                    Ext.Msg.show({
		                                        title : 'Problem saving RDF',
		                                        buttons : Ext.MessageBox.OKCANCEL,
		                                        msg : ('There was an problem saving to the repository: ' + xmlhttp2.responseText + '<br>Please try again or save your compound object to a file using the <i>Save to file</i> menu option and contact the Aus-e-Lit team for further assistance.')
		                                    });
		                                }
		                            }
		                        };
		                        xmlhttp2.setRequestHeader("Content-Type",
		                                "application/rdf+xml");
		                        xmlhttp2.send(therdf); 
                            }
                        }
                        xmlhttp.send(null);
                        lore.debug.ore("clearing" + remid);
                    } catch (e) {
                        xmlhttp = false;
                    }
                } else if (lore.ore.reposURL && lore.ore.reposType == 'fedora') {
                    lore.ui.loreError("Saving to Fedora not yet implemented");
                    var soaptempl = "<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">"
                    + "<soap:Body> "
                            // + "<GetInfoByZIP xmlns=\"http://www.webserviceX.NET\"> <USZip>string</USZip> </GetInfoByZIP>"
                    + "</soap:Body></soap:Envelope>";
                }
            }
        }
    });
}
/**
 * Set the global variable storing the relationship ontology
 * 
 * @param {}
 *            relonturl The new locator for the ontology
 */
lore.ore.setrelonturl = function(relonturl) {
    lore.ore.onturl = relonturl;
    try{
        lore.ore.loadRelationshipsFromOntology();
    } catch (ex){
        lore.debug.ore("exception in setrelonturl", ex);
    }
}



lore.ore.handleLocationChange = function (contextURL) {
	lore.ui.currentURL = contextURL;
	
	if ( !lore.ui.lorevisible || ! lore.ui.initialized)
		return;
	
	lore.ore.updateCompoundObjectsSourceList(contextURL);
	lore.ui.loadedURL = contextURL;
}
/**
 * Helper function for updateSourceLists: updates the compound objects list with
 * objects that reference the contextURL
 * 
 * @param {}
 *            contextURL The escaped URL
 */
lore.ore.updateCompoundObjectsSourceList = function(contextURL) {
    lore.ui.global.clearTree(lore.ui.remstreeroot);
	lore.ui.currentURL = contextURL;
    if (lore.ore.reposURL && lore.ore.reposType == 'sesame') {
        var escapedURL = escape(contextURL);
        // TODO: Fedora support
        var queryURL = lore.ore.reposURL
            + "?queryLn=sparql&query=" 
            + "select distinct ?g ?a ?c ?t where { graph ?g {{<" 
            + escapedURL + "> ?p ?o .} UNION {?s ?p2 <" 
            + escapedURL + ">}} . {?g <http://purl.org/dc/elements/1.1/creator> ?a}"
            + ". {?g <http://purl.org/dc/terms/created> ?c}"
            + ". OPTIONAL {?g <http://purl.org/dc/elements/1.1/title> ?t}}";
        try {
            var req = new XMLHttpRequest();
            req.open('GET', queryURL, true);
            req.onreadystatechange = function(aEvt) {
                if (req.readyState == 4) {
                    if (req.responseText && req.status != 204
                            && req.status < 400) {

                        var xmldoc = req.responseXML;
                        var result = {};
                        if (xmldoc) {
                            lore.debug.ore("compound objects: sparql response", req);
                            result = xmldoc.getElementsByTagNameNS(
                                    lore.constants.SPARQLRESULTS_NS, "result");
                        }
                        for (var i = 0; i < result.length; i++) {
                            var theobj = new lore.ore.CompObjListing(result[i]);
                            if (!lore.ui.remstreeroot.findChild('id',theobj.uri)){
                               lore.debug.ore("processing compound object", theobj);
                               var tmpNode = new Ext.tree.TreeNode({
                                        text : theobj.title,
                                        id : theobj.uri,
                                        uri : theobj.uri,
                                        qtip: "Created by " + theobj.creator + ", " + theobj.created,
                                        iconCls : 'oreresult',
                                        leaf : true
                                });
                               lore.ui.remstreeroot.appendChild(tmpNode);
                               lore.ore.attachREMEvents(tmpNode);
                            }

                        }
                        if (!lore.ui.remstreeroot.isExpanded()) {
                            lore.ui.remstreeroot.expand();
                        }
                        if(lore.ui.remstreeroot.hasChildNodes()){
                            lore.ui.propertytabs.activate("sourcestree");
                        }
                    }
                }
            };
            req.send(null);
        } catch (e) {
            lore.ui.loreWarning("Unable to retrieve compound objects");
        }
    }
}
/* Graph related functions */
/**
 * Updates global variables used for figure layout
 */
lore.ore.graph.nextXY = function() {
    // TODO: Need a real graph layout algorithm
    if (lore.ore.graph.dummylayoutx > lore.ore.MAX_X) {
        lore.ore.graph.dummylayoutx = 50;
        lore.ore.graph.dummylayouty += lore.ore.NODE_HEIGHT
                + lore.ore.NODE_SPACING;
    } else {
        lore.ore.graph.dummylayoutx += lore.ore.NODE_WIDTH
                + lore.ore.NODE_SPACING;
    }
}
/**
 * Get the figure that represents a resource
 * 
 * @param {}
 *            theURL The URL of the resource to be represented by the node
 * @return {} The figure representing the resource
 */
lore.ore.graph.lookupFigure = function(theURL) {
    var figid = lore.ore.graph.lookup[theURL];
    return lore.ore.graph.Graph.getDocument().getFigure(figid);
}
/**
 * Add a node figure with layout options
 * @param {} theURL
 * @param {} opts The layout options
 * @return {}
 */
lore.ore.graph.addFigureWithOpts = function(opts){
    var fig = null;
    var theURL = opts.url;
    if (theURL && lore.ore.graph.lookup[theURL] == null) {
        fig = new lore.ore.graph.ResourceFigure();
        fig.setTitle("Resource");
        if (opts.w && opts.h){
            fig.setDimension(opts.w, opts.h);    
        } else {
            fig.setDimension(220, 170);
        }
        if (opts.oh) {
           fig.originalHeight = opts.oh;
        }
        if (opts.sx && opts.sy) {
            fig.scrollx = parseInt(opts.sx);
            fig.scrolly = parseInt(opts.sy);
        }
        if (opts.format){
            fig.metadataproperties["dc:format"] = opts.format;
        }
        fig.setContent(theURL);
        lore.ore.graph.Graph.addFigure(fig, opts.x, opts.y);
        lore.ore.graph.lookup[theURL] = fig.getId();
      	  lore.ui.loreviews.activate("drawingarea");
    } else {
        lore.ui.loreWarning("Resource is already in resource map: " + theURL);
    }
    return fig;
}

/**
 * Add a node figure to the graphical view to represent a resource
 * 
 * @param {}
 *            theURL The URL of the resource to be represented by the node
 */
lore.ore.graph.addFigure = function(theURL) {
	var fig = lore.ore.graph.addFigureWithOpts({
        "url": theURL, 
        "x": lore.ore.graph.dummylayoutx,
        "y": lore.ore.graph.dummylayouty
    });
    if (fig != null) {
        lore.ore.graph.nextXY();
    }
    return fig;
}
lore.ore.transformORERDF = function(stylesheetURL, fragment, params){

    var xsltproc = new XSLTProcessor();
    // get the stylesheet - this has to be an XMLHttpRequest because Ext.Ajax.request fails on chrome urls
    var xhr = new XMLHttpRequest();
    xhr.overrideMimeType('text/xml');
    xhr.open("GET", stylesheetURL, false);
    xhr.send(null);
    var stylesheetDoc = xhr.responseXML;
    xsltproc.importStylesheet(stylesheetDoc);
    for (param in params){
        xsltproc.setParameter(null,param,params[param]);
    }
    xsltproc.setParameter(null, "indent", "yes");
    // get the compound object xml
    var theRDF = lore.ore.createRDF(false);
    var parser = new DOMParser();
    var rdfDoc = parser.parseFromString(theRDF, "text/xml");
    if (fragment){
        return xsltproc.transformToFragment(rdfDoc, document);
    } else {
        return xsltproc.transformToDocument(rdfDoc, document);
    }
    
}
/**
 * Use XSLT to generate a smil file from the compound object, plus create an
 * HTML wrapper
 * 
 * @return {} The file name of the wrapper file
 */
lore.ore.createSMIL = function() {
    try {
       
        var resultDoc = lore.ore.transformORERDF("chrome://lore/content/compound_objects/stylesheets/smil_view.xsl",true);
        var serializer = new XMLSerializer();
        lore.util.writeFile(serializer.serializeToString(resultDoc),
                "oresmil.smil");
        var htmlwrapper = "<HTML><HEAD><TITLE>SMIL Slideshow</TITLE></HEAD>"
                + "<BODY BGCOLOR=\"#003366\"><CENTER>"
                + "<embed style='border:none' height=\"95%\" width=\"95%\" src=\"oresmil.smil\" type=\"application/x-ambulant-smil\"/>"
                + "</CENTER><p style='font-size:smalller;color:#ffffff; padding:5px'>SMIL presentation generated by LORE on "
                + "<script type='text/javascript'>document.write(new Date().toString())</script>"
                + "</p></BODY></HTML>";
        return lore.util.writeFile(htmlwrapper, "playsmil.html");

    } catch (e) {
        lore.ui.loreWarning("Unable to generate SMIL: " + e.toString());
    }
}
lore.ore.createFOXML = function (){
    try {
        var params = {'coid': 'demo:' + lore.util.splitTerm(lore.ui.grid.getSource()['rdf:about']).term};
        var resultDoc = lore.ore.transformORERDF("chrome://lore/content/compound_objects/stylesheets/foxml.xsl",true,params);
        var serializer = new XMLSerializer();
        return serializer.serializeToString(resultDoc);         
    } catch (e) {
        lore.ui.loreWarning("Unable to generate FOXML: " + e.toString());
        return null;
    }
}
lore.ore.handleNodePropertyChange = function(source, recid, newval, oldval) {
    // update the metadataproperties recorded in the figure for that node
    lore.ore.graph.modified = true;
    var theval;
    lore.debug.ore("handle property change " + recid + " " + newval + " " + oldval,source);
    if (recid == 'Resource') {
        // the URL of the resource has changed
        if (newval && newval != '') {
            theval = newval;
        } else {
            theval = "about:blank";
        }
        if (lore.ore.graph.lookup[theval]) {
            lore.ui.loreWarning("Cannot change resource URL: a node already exists for " + theval);
            lore.ore.graph.selectedFigure.setContent("about:blank");
        } else {
            lore.ore.graph.lookup[theval] = lore.ore.graph.selectedFigure.getId();
        }
        delete lore.ore.graph.lookup[oldval];
    } else if (recid == 'dc:title') {
        // update figure title
        lore.ore.graph.selectedFigure.setTitle(newval);
    } else if (recid == 'relationship'){
        try{
        lore.ore.graph.selectedFigure.setRelationshipType(source["namespace"],newval);
        } catch (e){
            lore.debug.ore("updating rel",e);
        }
    }
    else {
        lore.ore.graph.selectedFigure.updateMetadata(source);
    }
}
lore.ore.graph.dummyBatchDialog = function(){
    // dummy dialog for OR09 challenge

    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
    .getService(Components.interfaces.nsIWindowMediator);
    var mainWindow = wm.getMostRecentWindow("navigator:browser");
        var thebrowser = mainWindow.getBrowser();
    var num = thebrowser.browsers.length;
    var thehtml = "<div style='border:1px solid black; padding:10px; margin:10px;background-color:white'>";
    for (var i = 0; i < num; i++) {
        var b = thebrowser.getBrowserAtIndex(i);
        try {
        //alert(b.currentURI.spec); // dump URLs of all open tabs to console
        thehtml += "<input type='checkbox' checked='checked'> " + b.currentURI.spec + "<br/>";
        } catch(e) {
        Components.utils.reportError(e);
        }
    }
    thehtml += "</div>";
    
    var win = new Ext.Window({
                //applyTo     : 'hello-win',
                layout      : 'fit',
                width       : 500,
                height      : 300,
                closeAction :'hide',
                plain       : true,
        
        html: "<p>Create a compound object using the following content:</p>" + 
        thehtml + 
        "<input type='checkbox' checked='checked'> Create relationships from browser history<br/>" +
        "<input type='checkbox' checked='checked'> Tag automatically using text-mining service<br/>",
                buttons: [{
            text     : 'OK',
            handler: function(){
                win.hide();
            }
            },{
            text     : 'Cancel',
            handler  : function(){
                win.hide();
            }
            }]
            });
    
    win.show();

    }
