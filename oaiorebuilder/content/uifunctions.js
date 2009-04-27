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
 

/**
 * Render the current resource map as RDF/XML in the RDF view
 */
function updateRDFHTML() {
	rdftab.body.update(createRDF(true));
}
/**
 * Remove listeners and reference to RDF View if it is closed
 * @param {Object} tabpanel
 * @param {Object} panel
 */
function closeRDFView(tabpanel, panel){
	// remove listeners
	if (panel.id == 'remrdfview') {
		rdftab.un("activate", updateRDFHTML);
		rdftab.un("close", closeRDFView);
		rdftab = null;
	}
}
/**
 * Create or show the RDF View
 */
function openRDFView(){
	loreviews.activate("compoundobjecteditor");
	if (!rdftab) {
		compoundobjecttab.add({
			title: 'RDF/XML',
			id: "remrdfview",
			autoScroll: true,
			closable: true
		}).show();
					
		rdftab = Ext.getCmp('remrdfview');
		rdftab.on("activate", updateRDFHTML);
		rdftab.on("close", closeRDFView);
		updateRDFHTML();
	} else {
		compoundobjecttab.activate('remrdfview');
	}		
}

/**
 * Displays a list of resource URIs contained in the compound object
 */
function showCompoundObjectSummary() {
	var remprops = grid.getSource();
	
	var newsummary = "<table style='font-size:smaller;border:none'>" +
			"<tr valign='top'><td width='20%'><b>Compound object:</b></td><td>" + remprops["rdf:about"] + "</td></tr>";
	if (remprops["dc:title"]){
		newsummary += "<tr valign='top'><td width='20%'><b>Title:</b></td><td>" + remprops["dc:title"] + "</td></tr>";
	}
	if (remprops["dc:description"]){
		newsummary += "<tr valign='top'><td><b>Description:</b></td><td width='80%'>" + remprops["dc:description"] + "</td></tr>";
	}
	newsummary += "</table>";
	newsummary += "<div style='padding-top:1em'><p><b>List of contents:</b></p><ul>";
	var allfigures = oreGraph.getDocument().getFigures();
	for (var i = 0; i < allfigures.getSize(); i++) {
		var fig = allfigures.get(i);
		var figurl = fig.url.escapeHTML();
		newsummary += "<li><a target='_blank' href='" + figurl + "'>" + figurl + "</a></li>";
	}
	newsummary += "</ul></div>";
	summarytab.body.update(newsummary);
}
/**
 * Generate a SMIL presentation and display a link to launch it
 */
function showSMIL(){
	var allfigures = oreGraph.getDocument().getFigures();
	var numfigs = allfigures.getSize();
	var smilcontents = "<p><a href='http://www.w3.org/AudioVideo/'>SMIL</a> is the Synchronized Multimedia Integration Language.</p>";
	if (numfigs > 0) {
		var smilpath = createSMIL(); // generate the new smil file into oresmil.xsl
		//var smil2path = extension.path + "\\content\\ss_v2.html";
		smilcontents += "<p>A SMIL slideshow has been generated from the contents of the current compound object.</p><p>" +
				"<a onclick='launchWindow(this.href, false);return(false);' target='_blank' href='file://" + smilpath + "'>Click here to launch the slideshow in a new window</a><br/>";
		//smilcontents += "<br/><a onclick='launchWindow(this.href, false);return(false);' target='_blank' href='file://" + smil2path + "'>Click here for the experimental SMIL presentation</a>";
	} else {
		smilcontents += "<p>Once you have added some resources to the current compound object a SMIL presentation will be available here.</p>";
	}
	smiltab.body.update(smilcontents);
}



/**
 * Helper function for createRDF that serialises a property to RDF/XML
 * @param {} propname The name of the property to serialise
 * @param {} properties All of the properties
 * @param {} ltsymb Less than symbol
 * @param {} nlsymb New line symbol
 * @return {} The RDF/XML representation of the property
 */
function _serialise_property(propname, properties, ltsymb, nlsymb) {
	var result = "";
	var propval = properties[propname];
	if (propval != null && propval != '') {
		result = ltsymb + propname + ">";
		if (nlsymb == "<br/>" && propval) {
			try{
				result += propval.toString().escapeHTML();
			} catch (e) {loreWarning(e.toString());}
		} else {
			result += propval;
		}
		result += ltsymb + "/" + propname + ">" + nlsymb;
	}
	return result;
}
/**
 * Helper function to split a URL identifier into namespace and term
 * @param {} theterm The URL identifier to split
 * @return {} A JSON object with properties ns (the namespace) and term (the term)
 */
function _splitTerm(theterm) {
	var result = {};
	// try splitting on #
	var termsplit = theterm.split("#");
	if (termsplit.length > 1) {
		result.ns = (termsplit[0] + "#");
		result.term = termsplit[1];
	} else {
		// split after last slash
		var lastSlash = theterm.lastIndexOf('/');
		result.ns = theterm.substring(0, lastSlash + 1);
		result.term = theterm.substring(lastSlash + 1);
	}
	return result;
}
/**
 * 	Helper function to lookup the prefix for a namespace URL eg dc:
 * @param {} ns The namespace to look up
 * @return {} The prefix (including the colon)
 */
function _nsprefix(ns) {
	for (var prefix in NAMESPACES) {
		if (NAMESPACES[prefix] == ns){
			return prefix + ":";
		}
	}
}

/**
 * Create the RDF/XML of the current resource map
 * @param {} escape Boolean indicating whether to escape the results for rendering as HTML
 * @return {}
 */
function createRDF(escape) {
	var ltsymb = "<";
	var nlsymb = "\n";
	if (escape) {
		ltsymb = "&lt;";
		nlsymb = "<br/>";
	}
	var remprops = grid.getSource();
	var modifiedDate = new Date();
	remprops["dcterms:modified"] = modifiedDate;
	grid.setSource(remprops);
	var describes = remprops["ore:describes"];
	var rdfabout = remprops["rdf:about"];

	// RDF fragments
	var rdfdescabout = "rdf:Description rdf:about=\"";
	var closetag = "\">" + nlsymb;
	var fullclosetag = "\"/>" + nlsymb;
	var rdfdescclose = "/rdf:Description>";

	// create RDF for resource map: modified and creator are required
	var rdfxml = ltsymb
			+ "?xml version=\"1.0\" encoding=\"UTF-8\" ?>"
			+ nlsymb
			+ ltsymb
			+ 'rdf:RDF xmlns:rdf="' + RDF_SYNTAX_NS + '"'
			+ nlsymb;
	for (var pfx in NAMESPACES) {
		rdfxml += "xmlns:" + pfx + "=\"" + NAMESPACES[pfx] + "\"" + nlsymb;
	}
	rdfxml += "xml:base = \""
			+ rdfabout
			+ "\">"
			+ nlsymb
			+ ltsymb
			+ rdfdescabout
			+ rdfabout
			+ closetag
			+ ltsymb
			+ "ore:describes rdf:resource=\""
			+ describes
			+ fullclosetag
			+ ltsymb
			+ 'rdf:type rdf:resource="' + RESOURCE_MAP + '" />'
			+ nlsymb
			+ ltsymb
			+ 'dcterms:modified rdf:datatype="' + XMLSCHEMA_NS + 'date">'
			+ modifiedDate.getFullYear() + "-" + (modifiedDate.getMonth() + 1)
			+ "-" + modifiedDate.getDate() + ltsymb + "/dcterms:modified>"
			+ nlsymb;
	var created = remprops["dcterms:created"];
	if (created != null && created instanceof Date) {
		rdfxml += ltsymb
				+ 'dcterms:created rdf:datatype="' + XMLSCHEMA_NS + 'date">'
				+ created.getFullYear() + "-" + (created.getMonth() + 1) + "-"
				+ created.getDate() + ltsymb + "/dcterms:created>" + nlsymb;
	}
	for (var i = 0; i < METADATA_PROPS.length; i++) {
		var theprop = METADATA_PROPS[i];
		if (theprop != 'dcterms:modified'){
			rdfxml += _serialise_property(theprop, remprops, ltsymb,
				nlsymb);
		}
	}
	rdfxml += ltsymb + rdfdescclose + nlsymb;

	// create RDF for aggregation
	//var aggreprops = aggregrid.getSource();
	var aggreprops = {"rdf:type" : ORETERMS_NS + "Aggregation"};
	rdfxml += ltsymb + rdfdescabout + describes + closetag + ltsymb
			+ "rdf:type rdf:resource=\"" + aggreprops["rdf:type"]
			+ fullclosetag;
	// TODO: any other types for aggregation eg Journal Article

	for (i = 0; i < all_props.length; i++) {
		rdfxml += _serialise_property(all_props[i], aggreprops, ltsymb, nlsymb);
	}
	var allfigures = oreGraph.getDocument().getFigures();
	var resourcerdf = "";
	for (i = 0; i < allfigures.getSize(); i++) {
		var fig = allfigures.get(i);
		var figurl = fig.url.replace('<','%3C').replace('>','%3E').escapeHTML();
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
		resourcerdf += ltsymb + rdfdescabout + figurl + closetag + 
			ltsymb + "layout:x>" + fig.x + ltsymb + "/" + "layout:x>" + nlsymb +
			ltsymb + "layout:y>" + fig.y + ltsymb + "/" + "layout:y>" + nlsymb + 
			ltsymb + "layout:width>" + fig.width + ltsymb + "/" + "layout:width>" + nlsymb +
			ltsymb + "layout:height>" + fig.height + ltsymb + "/" + "layout:height>" + nlsymb +
			ltsymb + "layout:originalHeight>" + fig.originalHeight + ltsymb + "/" + "layout:originalHeight>" + nlsymb +
			ltsymb + rdfdescclose + nlsymb;
		
		var outgoingconnections = fig.getPorts().get(1).getConnections();
		for (var j = 0; j < outgoingconnections.getSize(); j++) {
			var theconnector = outgoingconnections.get(j);
			var relpred = theconnector.edgetype;
			var relns = theconnector.edgens;
			var relobj = theconnector.targetPort.parentNode.url.escapeHTML();
			resourcerdf += ltsymb + rdfdescabout + figurl + closetag + ltsymb
					+ relpred + " xmlns=\"" + relns + "\" rdf:resource=\""
					+ relobj + fullclosetag + ltsymb + rdfdescclose + nlsymb;
			// caused problems	
			//var relobj = theconnector.targetPort.parentNode.url.replace('<','%3C').replace('>','%3E').escapeHTML();
			//resourcerdf += ltsymb + rdfdescabout + figurl.replace('<','%3C').replace('>','%3E').escapeHTML() + closetag + ltsymb
		}
	}
	rdfxml += ltsymb + rdfdescclose + nlsymb;
	rdfxml += resourcerdf;
	rdfxml += ltsymb + "/rdf:RDF>";
	return rdfxml;
}

/**
 * Helper function for readRDF
 * @param {} theRDF
 * @param {} props
 * @param {} subj
 * @param {} theProp
 */
function _read_property(theRDF, props, subj, theProp) {
	var propInfo = theProp.split(":");
	var propresult = theRDF.Match(null, subj, NAMESPACES[propInfo[0]]
					+ propInfo[1], null);
	if (propresult.length > 0) {
		props[theProp] = propresult[0].object;
	}
}
/**
 * Loads a resource map from a URL into the graphical view and property panels
 * @param {} rdfURL The direct URL to the RDF (eg restful web service on repository that returns RDF)
 */
function readRDF(rdfURL) {
	// reset the graphical view
	initGraphicalView();
	loreviews.activate("compoundobjecteditor");
	compoundobjecttab.activate("drawingarea");
	var theRDF = new RDF();
	theRDF.getRDFURL(rdfURL, function() {
				var remurl = theRDF.Match(null, null,
						RDF_SYNTAX_NS + "type",
						RESOURCE_MAP)[0].subject
						.toString();
				var creator = theRDF.Match(null, remurl,
						DC_NS + "creator", null)[0].object;
				var createdResult = theRDF.Match(null, remurl,
						DCTERMS_NS + "created", null);
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
					"dcterms:modified" : new Date(),
					"dcterms:created" : created,
					"rdf:type" : RESOURCE_MAP
				};
				// TODO: perhaps should read any property, not just those in the list?
				for (var i = 0; i < all_props.length; i++) {
					_read_property(theRDF, theprops, remurl, all_props[i]);
				}
				grid.setSource(theprops);

				// create a node figure for each aggregated resource
				var aggregationID = remurl + "#aggregation";
				aggregates = theRDF.Match(null, aggregationID,
						ORETERMS_NS + "aggregates",
						null);
				var resourcerels = [];
				for (i = 0; i < aggregates.length; i++) {
					var resourceURL = aggregates[i].object;
					// lookup layout info
					var x = theRDF.getSingleObject(null,resourceURL,LORE_LAYOUT_NS+"x", null);
					var y = theRDF.getSingleObject(null, resourceURL, LORE_LAYOUT_NS+"y", null);
					var width = theRDF.getSingleObject(null, resourceURL, LORE_LAYOUT_NS+"width", null);
					var height = theRDF.getSingleObject(null,resourceURL,LORE_LAYOUT_NS+"height", null);
					var originalHeight = theRDF.getSingleObject(null,resourceURL,LORE_LAYOUT_NS+"originalHeight", null);
					if (x && y){
						var fig = addFigureXY(resourceURL, parseInt(x), parseInt(y));
						fig.originalHeight = parseInt(originalHeight);
						fig.setDimension(parseInt(width), parseInt(height));
					} else {
						addFigure(resourceURL);
					}
					// collect all predicates
					var matches = theRDF.Match(null, resourceURL, null, null);
					resourcerels = resourcerels.concat(matches);
					

				}
				//var oreGraphDoc = oreGraph.getDocument();
				// create connection figures based on resource-resource
				// relationships
				for (var j = 0; j < resourcerels.length; j++) {
					var rel = resourcerels[j].predicate;
					var relresult = _splitTerm(rel);
					var srcfig = lookupFigure(resourcerels[j].subject);
					if (!srcfig) { srcfig = lookupFigure(resourcerels[j].subject.replace('%3C','<').replace('%3F','>').unescapeHTML());}
					
					var tgtfig = lookupFigure(resourcerels[j].object);
					if (!tgtfig) {tgtfig = lookupFigure(resourcerels[j].object.replace('%3C','<').replace('%3F','>').unescapeHTML());}
					
					if (srcfig && tgtfig) {
						var c = new oaiorebuilder.ContextmenuConnection();
						c.setSource(srcfig.getPort("output"));
						c.setTarget(tgtfig.getPort("input"));
						c.setRelationshipType(relresult.ns, relresult.term);
						oreGraph.addFigure(c);
					} else if (srcfig) {
						// not a node relationship, show in the property grid
						if (!relresult.ns.match(LORE_LAYOUT_NS)){
							srcfig.metadataproperties[_nsprefix(relresult.ns)
								+ relresult.term] = resourcerels[j].object;
						}
						if (relresult.term == "title"){
							srcfig.setTitle(resourcerels[j].object);
						}					
					}
				}
				loreInfo("Resource map loaded");
				
			});
}

/**
 * Load a resource map  from the repository by identifier - prompts the user to enter the id
 */
function loadRDFFromRepos() {
	// TODO: add Fedora support
	if (reposURL && reposType == 'sesame') {
		Ext.Msg.show({
					title : 'Load RDF from Repository',
					buttons : Ext.MessageBox.OKCANCEL,
					msg : 'Please enter Resource Map identifier URL',
					prompt : true,
					fn : function(btn, remID) {
						if (btn == 'ok') {
							loreInfo("Retreiving " + remID);
							loadRDFFromID(remID);
						}
					}
		});
	} else if (reposURL && reposType == 'fedora') {
		loreError("Loading from Fedora not yet implemented");
	}
}
/**
 * Load a resource map as RDF from repository by identifier
 * @param {} remID
 */
function loadRDFFromID(remID) {

	var queryStr = reposURL + "/statements?context=<" + remID + ">";
	readRDF(queryStr);
}
/**
 * Takes a repository access URI and returns the resource map identifier
 * This is only necessary until we implement proper access of resource maps via their identifier URI
 * @param {} theurl
 * @return {}
 */
function getOREIdentifier(url){
	//Example of the url : http://austlit.edu.au/openrdf-sesame/repositories/lore/statements?context=<http://austlit.edu.au>
	var result;
	var theurl = url.replace('%3C','<').replace('%3E','>');
	if (theurl) {
		result = theurl.substring((theurl.indexOf('<')+1), (theurl.length - 1));
	}
	if (result){
		return result;
	}
	else {
		return theurl;
	}
}
/**
 * Load a resource map directly from a URL - prompt the user to enter the URL
 */
function loadRDF() {
	Ext.Msg.show({
				title : 'Load RDF',
				buttons : Ext.MessageBox.OKCANCEL,
				msg : 'Please enter RDF file URL:',
				fn : function(btn, theurl) {
					if (btn == 'ok') {
						readRDF(theurl);
					}
				},
				prompt : true
			});
}
/**
 * 	Populate connection context menu with relationship types from the ontology.
 *  Assumes a global variable onturl (which is set in init from preferences)
 */
function loadRelationshipsFromOntology() {
	// Properties for aggregated resources (also populated from ontology)
	resource_metadata_props = ["rdf:type", "ore:isAggregatedBy"];
	if (onturl) {	
		var ontRDF = new RDF();
		ontrelationships = {};
		ontRDF.getRDFURL(onturl, function() {
					var relResult = ontRDF.Match(null, 
						null, 
						RDF_SYNTAX_NS  + "type",
						OWL_OBJPROP
					);
					for (var i = 0; i < relResult.length; i++) {
						var relresult = _splitTerm(relResult[i].subject);
						if (!relresult.term.match("genid:")){
							ontrelationships[relresult.term] = relresult.ns;
						}
					}
					relResult = ontRDF.Match(null, null, RDF_SYNTAX_NS + "type", OWL_DATAPROP);
					var tmp_resource_metadata = new Array(relResult.length);
					for (i = 0; i < relResult.length; i++) {
						tmp_resource_metadata[i] = relResult[i].subject;
					}
					resource_metadata_props = resource_metadata_props.concat(tmp_resource_metadata);
					resource_metadata_props.sort();
					all_props = METADATA_PROPS.concat(resource_metadata_props);
					all_props.sort();
				}, false, function(args) {
					loreWarning(args.status + "\n" + args.contentType + " "
							+ args.content);
				});
	}
}

/**
 * Save the resource map to the repository - prompt user to confirm
 */
function saveRDFToRepository() {
	// TODO: implement Fedora support
	var remid = grid.getSource()["rdf:about"];
	Ext.Msg.show({
				title : 'Save RDF',
				buttons : Ext.MessageBox.OKCANCEL,
				msg : 'Save this resource graph as ' + remid + "?",
				fn : function(btn, theurl) {
					if (btn == 'ok') {
						if (reposURL && reposType == 'sesame') {
							var therdf = createRDF(false);

							try {
								var xmlhttp = new XMLHttpRequest();
								xmlhttp.open("PUT", reposURL
												+ "/statements?context=<"
												+ remid + ">", true);
								xmlhttp.onreadystatechange = function() {
									if (xmlhttp.readyState == 4) {
										if (xmlhttp.status == 204) {
											loreInfo(remid + " saved to "
													+ reposURL);
										} else {
											loreError('Unable to save to repository'
													+ xmlhttp.responseText);
											 Ext.Msg.show({title: 'Problem saving RDF', buttons:
											 Ext.MessageBox.OKCANCEL, msg:
											 ('There was an problem saving the RDF: ' 
											 + xmlhttp.responseText)});
										}
									}
								};
								xmlhttp.setRequestHeader("Content-Type",
										"application/rdf+xml");
								xmlhttp.send(therdf);
							} catch (e) {
								xmlhttp = false;
							}
						} else if (reposURL && reposType == 'fedora') {
							loreError("Saving to Fedora not yet implemented");
						}
					}
				}
			});
}
/**
 * Update the resource map dc:creator property
 * @param {} creator The new value for dc:creator
 */
function setdccreator(creator) {
	var remprops = grid.getSource();
	remprops["dc:creator"] = creator;
	grid.setSource(remprops);
	defaultCreator = creator;
}
/**
 * Set the global variable storing the relationship ontology
 * @param {} relonturl The new locator for the ontology
 */
function setrelonturl(relonturl) {
	onturl = relonturl;
	loadRelationshipsFromOntology();
}
/**
 * Set the global variables for the repository access URLs
 * @param {} rdfrepos The repository access URL
 * @param {} rdfrepostype The type of the repository (eg sesame, fedora)
 * @param {} annoserver The annotation server access URL
 */
function setRepos(rdfrepos, rdfrepostype, annoserver) {
	reposURL = rdfrepos;
	reposType = rdfrepostype;
	annoURL = annoserver;
}
/**
 * Display an informational message in the status bar
 * @param {} message The message to display
 */
function loreInfo(message) {
	lorestatus.setStatus({
				text : message,
				iconCls : 'info-icon',
				clear : true
			});
}
/**
 * Display an warning message in the status bar
 * @param {} message The message to display
 */
function loreWarning(message) {
	lorestatus.setStatus({
				text : message,
				iconCls : 'warning-icon',
				clear : true
			});
}
/**
 * Display an error message in the status bar
 * @param {} message The message to display
 */
function loreError(message) {
	lorestatus.setStatus({
				text : message,
				iconCls : 'error-icon',
				clear : true
			});
}
/**
 * Clear any results source trees
 * @param {} theTree The tree to clear
 */
function _clearTree(treeRoot){
	while(treeRoot.firstChild) {
		treeRoot.removeChild(treeRoot.firstChild);
	} 
}


/**
 * Helper function for updateSourceLists: updates the compound objects list
 * with objects that reference the contextURL
 * @param {} contextURL The escaped URL
 */
function _updateCompoundObjectsSourceList(contextURL) {
	_clearTree(remstreeroot);
	if (reposURL && reposType == 'sesame') {
		var escapedURL = escape(contextURL);
		var queryURL = reposURL
				+ "?queryLn=sparql&query=SELECT DISTINCT ?g WHERE { GRAPH ?g {{<"
				+ escapedURL + "> ?p ?o .} UNION { ?s ?p2 <" + escapedURL
				+ ">}}}";
		try {
			var req = new XMLHttpRequest();
			req.open('GET', queryURL, true);
			req.onreadystatechange = function(aEvt) {
				if (req.readyState == 4){
					if (req.responseText && req.status != 204
							&& req.status < 400) {
						
						var xmldoc = req.responseXML;
						var result = {};
						if (xmldoc) {
							result = xmldoc.getElementsByTagNameNS(
									SPARQLRESULTS_NS,
									"uri");
						}
						for (var i = 0; i < result.length; i++) {
							var remID = result[i].childNodes[0].nodeValue;
							var tmpNode = new Ext.tree.TreeNode({
										text : remID,
										id: remID,
										iconCls : 'oreresult',
										leaf : true
									});
							remstreeroot.appendChild(tmpNode);
							tmpNode.on('dblclick', function(node) {
										loadRDFFromID(node.text);
										var recentNode = new Ext.tree.TreeNode({
											text: node.id,
											iconCls: 'oreresult',
											leaf: true
										});
										var childNodes = recenttreeroot.childNodes;
										if (childNodes.length >= 5){
											recenttreeroot.removeChild(recenttreeroot.firstChild);
										}
										recenttreeroot.appendChild(recentNode);
										recentNode.on('dblclick', function(node){
											loadRDFFromID(node.text);
										});
							});
							
							tmpNode.on('contextmenu', function(node,e){
								if (!node.contextmenu) {
									node.contextmenu = new Ext.menu.Menu({
										id: node.id + "-context-menu"
									});
									node.contextmenu.add({
										text: "Add to compound object",
										handler: function(evt){
											addFigure(reposURL + "/statements?context=<" + node.id + ">");
										}
									});
									node.contextmenu.add({
										text: "Load in Compound Object Editor",
										handler: function(evt){
											loadRDFFromID(node.id);
										}
									});
								}
    							node.contextmenu.showAt(e.xy);
							});
							
						}
						if (!remstreeroot.isExpanded()) {
							remstreeroot.expand();
						}
					}
				}
			};
			req.send(null);
		} catch (e) {
			loreWarning("Unable to retrieve compound objects");
		}
	}
}
/**
 * Update the source lists to show annotations and compound objects that reference
 * the resource currently loaded in the web browser
 * @param {} contextURL The URL of the resource currently loaded in the browser
 */
function updateSourceLists(contextURL) {
	currentURL = contextURL; // store the contextURL
	if (lorevisible) {
		_updateAnnotationsSourceList(contextURL);
		_updateCompoundObjectsSourceList(contextURL);
		loadedURL = contextURL;
	}
}

function loreOpen(){
	lorevisible = true;
	if (currentURL && currentURL != 'about:blank' && currentURL != '' && 
			(!loadedURL || currentURL != loadedURL)) {
		updateSourceLists(currentURL);
		loadedURL = currentURL;
	}
}
function loreClose(){
	lorevisible = false;
}
/* Graph related functions */
/**
 * Updates global variables used for figure layout
 */
function nextXY() {
	// TODO: Need a real graph layout algorithm
	if (dummylayoutx > MAX_X) {
		dummylayoutx = 50;
		dummylayouty += NODE_HEIGHT + NODE_SPACING;
	} else {
		dummylayoutx += NODE_WIDTH + NODE_SPACING;
	}
}
/**
 * Get the figure that represents a resource
 * @param {} theURL The URL of the resource to be represented by the node
 * @return {} The figure representing the resource
 */
function lookupFigure(theURL) {
	var figid = oreGraphLookup[theURL];
	return oreGraph.getDocument().getFigure(figid);
}
/**
 * Add a figure to the graphical view to represent a resource at co-ordinates X,Y
 * @param {} theURL The URL of the resource to be represented by the node
 * @param {} x The X co-ordinate
 * @param {} y The Y co-ordinate
 * @return {} The new figure
 */
function addFigureXY(theURL, x, y) {
	var fig = null;
	if (oreGraphLookup[theURL] == null) {
		fig = new oaiorebuilder.ResourceFigure();
		fig.setDimension(220, 170);
		fig.setTitle("Resource");
		fig.setContent(theURL);
		oreGraph.addFigure(fig, x, y);
		oreGraphLookup[theURL] = fig.getId();
		loreviews.activate("compoundobjecteditor");
		compoundobjecttab.activate("drawingarea");
	} else {
		loreWarning("Resource is already in resource map: " + theURL);
	}
	return fig;
}
/**
 * Add a node figure to the graphical view to represent a resource
 * @param {} theURL The URL of the resource to be represented by the node
 */
function addFigure(theURL) {
	var fig = addFigureXY(theURL, dummylayoutx, dummylayouty);
	if (fig != null) {
		nextXY();
	}
	
}
/**
 * Use XSLT to generate a smil file from the compound object, plus create an HTML wrapper
 * @return {} The file name of the wrapper file
 */
function createSMIL(){
	try {
		var stylesheetURL = "chrome://oaiorebuilder/content/stylesheets/ORE2SMIL.xsl";
		var xsltproc = new XSLTProcessor();

		// get the stylesheet
		var xhr = new XMLHttpRequest();
		xhr.overrideMimeType('text/xml');
		xhr.open("GET",stylesheetURL,false);
		xhr.send(null);
		var stylesheetDoc = xhr.responseXML;
		xsltproc.importStylesheet(stylesheetDoc);
		xsltproc.setParameter(null, "indent", "yes");
		// get the compound object xml
		var theRDF = createRDF(false);
		var parser = new DOMParser();
		var rdfDoc = parser.parseFromString(theRDF,"text/xml");
		var resultDoc = xsltproc.transformToFragment(rdfDoc, document);
		var serializer = new XMLSerializer();
		writeFile(serializer.serializeToString(resultDoc), "oresmil.smil");
		var htmlwrapper = "<HTML><HEAD><TITLE>SMIL Slideshow</TITLE></HEAD>" +
			"<BODY BGCOLOR=\"#003366\"><CENTER>" +
			"<embed style='border:none' height=\"95%\" width=\"95%\" src=\"oresmil.smil\" type=\"application/x-ambulant-smil\"/>" +
  			"</CENTER><p style='font-size:smalller;color:#ffffff; padding:5px'>SMIL presentation generated by LORE on " +
  			"<script type='text/javascript'>document.write(new Date().toString())</script>" +
  			"</p></BODY></HTML>";
		return writeFile(htmlwrapper, "playsmil.html");
		
	} catch (e){
		loreWarning("Unable to generate SMIL: " + e.toString());
	}
}

function handleNodePropertyChange (source, recid, newval, oldval) {
		// update the metadataproperties recorded in the figure for that node
		oreGraphModified = true;
		var theval;
		if (recid == 'Resource') {
			// the URL of the resource has changed
			if (newval && newval != '') {
				theval = newval;
			} else {
				theval = "about:blank";
				if (oreGraphLookup[theval]) {
					loreWarning("Cannot change resource URL: a node already exists for " + theval);
					selectedFigure.setContent("about:blank");
				} else {
					oreGraphLookup[theval] = selectedFigure.getId();
				}
			}
			delete oreGraphLookup[oldval];
		}
		if (recid == 'dc:title'){
			// update figure title
			selectedFigure.setTitle(newval);
		}
		selectedFigure.updateMetadata(source);
}
function handleOpenCalaisMetadata(resp){
	// get the contents of the string element
	// using string replace because the result using the dom was being truncated
	var res = resp.responseText.replace('<?xml version="1.0" encoding="utf-8"?>','').replace('<string xmlns="http://clearforest.com/">','').replace('</string>','');
	

	// load into an object
	var jsonObj;
	textminingtab.body.update(res + POWEREDBY_CALAIS);
	eval("jsonObj = " + res);


}
function requestOpenCalaisMetadata(){
	if (!textminingtab){
		return;
	}
	var ocParams = '<c:params xmlns:c="http://s.opencalais.com/1/pred/">' + 
    '<c:processingDirectives c:contentType="text/txt" c:outputFormat="application/json"></c:processingDirectives>'+
	'<c:userDirectives c:allowDistribution="true" c:allowSearch="true"/><c:externalMetadata />' +
    '</c:params>';
	
	// set contentStr to current main window contents
	//var contentStr = "Dear Sir, I wish to acquaint you with some of the occurrences of the present past and future. In or about the spring of 1870 the ground was very soft a hawker named Mr Gould got his waggon bogged between Greta and my mother's house on the eleven mile creek, the ground was that rotten it would bog a duck in places so Mr. Gould had abandon his waggon for fear of loosing his horses in the spewy ground. he was stopping at my Mother's awaiting finer or dryer weather Mr. McCormack and his wife. hawkers also were camped in Greta the mosquitoes were very bad which they generally are in a wet spring and to help them Mr. Johns had a horse called Ruita Cruta although a gelding was as clever as old Wombat or any other Stallion at running horses away and taking them on his beat which was from Greta swamp to the seven mile creek consequently he enticed McCormack's horse away from Greta. Mr. Gould was up early feeding his horses heard a bell and seen McCormack horses for he knew the horse well he sent his boy to take him back to Greta. When McCormack's got the horse they came straight out to Goold and accused him of working the horse; this was false, and Goold was amazed at the idea I could not help laughing to hear Mrs. McCormack accusing him of using the horse after him being so kind as to send his boy to take him from the Ruta Cruta and take him back to them. I pleaded Goulds innocence and Mrs McCormack turned on me and accused me of bringing the horse from Greta to Goolds waggon to pull him out of the bog I did not say much to the woman as my Mother was present but that same day me and my uncle was cutting calves Gould wrapped up a note and a pair of the calves testicles and gave them to me to give them to Mrs McCormack. I did not see her and I gave the parcel to a boy to give to her when she would come instead of giving it to her he gave it to her husband consequently McCormack said he would summons me I told him neither me or Gould used their horse. He said I was a liar & he could welt me or any of my breed I was about 14 years of age but accepted the challenge and dismounting when Mrs McCormack struck my horse in the flank with a bullock's skin it jumped forward and my fist came in collision with McCormack's nose and caused him to loose his equillibrium and fall postrate I tied up my horse to finish the battle but McCormack got up and ran to the Police camp. Constable Hall asked me what the row was about I told him they accused me and Gould of using their horse and I hit him and I would do the same to him if he challenged me McCormack pulled me and swore their lies against me I was sentenced to three months for hitting him and three months for the parcel and bound to keep the peace for 12 months. Mrs McCormack gave good substantial evidence as she is well acquainted with that place called Tasmania better known as the Dervon or Vandiemans land and McCormack being a Police man over the convicts and women being scarce released her from that land of bondage and tyranny, and they came to Victoria and are at present residents of Greta and on the 29th of March I was released from prison and came home Wild Wright came to the Eleven Mile to see Mr Gunn stopped all night and lost his mare both him and me looked all day for her and could not get her Wright who was a stranger to me was in a hurry to get back to Mansfield and I gave him another mare and he told me if I found his mare to keep her until he brought mine back I was going to Wangaratta and seen the mare and I caught her and took her with me all the Police and Detective Berrill seen her as Martains girls used to ride her about the town during several days that I stopped at Peter Martains Star Hotel in Wangaratta. She was a chestnut mare white face docked tail very remarkable branded (M) as plain as the hands on a town clock. the property of a Telegraph Master in Mansfield he lost her on the 6th gazetted her on the 12th of March and I was a prisoner in Beechworth Gaol until the 29 of March therefore I could not have Stole the mare. I was riding the mare through Greta Constable Hall came to me and said he wanted me to sign some papers that I did not sign at Beechworth concerning my bail bonds I thought it was the truth he said the papers was at the Barracks and I had no idea he wanted to arrest me or I would have quietly rode away instead of going to the Barracks. I was getting off when Hall caught hold of me and thought to throw me but made a mistake and came on the broad of his back himself in the dust the mare galloped away and instead of me putting my foot on Halls neck and taking his revolver and putting him in the lock up. I tried to catch the mare. Hall got up and snapped three or four caps at me and would have shot me but the colts patent refused. This is well known in Greta Hall never told me he wanted to arrest me until after he tried to shoot me when I heard the caps snapping I stood until Hall came close he had me covered and was shaking with fear and I knew he would pull the trigger before he would be game to put his hand on me so I duped, and jumped at him caught the revolver with one hand and Hall by the collar with the other. I dare not strike him or my sureties would loose the bond money I used to trip him and let him take a mouth ful of dust now and again as he was as helpless as a big guano after leaving a dead bullock or a horse. I kept throwing him in the dust until I got him across the street the very spot where Mrs O'Briens Hotel stands now the cellar was just dug then there was some brush fencing where the post and rail was taking down and on this I threw big cowardly Hall on his belly I straddled him and rooted both spurs onto his thighs he roared like a big calf attacked by dogs and shifted several yards of the fence I got his hands at the back of his neck and trid to make him let the revolver go but he stuck to it like grim death to a dead volunteer he called for assistance to a man named Cohen and Barnett, Lewis, Thompson, Jewitt two blacksmiths who was looking on I dare not strike any of there as I was bound to keep the peace or I could have spread those curs like dung in a paddock they got ropes tied my hands and feet and Hall beat me over the head with his six chambered colts revolver nine stitches were put in some of the cuts by Dr Hastings And when Wild Wright and my mother came they could trace us across the street by the blood in the dust and which spoiled the lustre of the paint on the gate-post of the Barracks Hall sent for more Police and Doctor Hastings. Next morning I was handcuffed a rope tied from them to my legs and to the seat of the cart and taken to Wangaratta Hall was frightened I would throw him out of the cart so he tied me whilst Constable Arthur laughed at his cowardice for it was he who escorted me and Hall to Wangaratta. I was tried and committed as Hall swore I claimed the mare the Doctor died or he would have proved Hall a perjurer Hall has been tried several times for perjury but got clear as this is no crime in the Police force it is a credit to a Policeman to convict an innocent man but any muff can pot a guilty one Halls character is well known about El Dorado and Snowy Creek and Hall was considerably in debt to Mr L.O. Brien and he was going to leave Greta Mr O. Brien seen no other chance of getting his money so there was a subscription collected for Hall and with the aid of this money he got James Murdock who was recently hung in Wagga Wagga to give false evidence against me but I was acquitted on the charge of horsestealing and on Halls and Murdocks evidence I was found guilty of receiving and got 3 years experience in Beechworth Pentridges dungeons. this is the only charge ever proved against me Therefore I can say I never was convicted of horse or cattle stealing My Brother Dan was never charged with assaulting a woman but he was sentenced to three months without the option of a fine and one month and two pounds fine for damaging property by Mr. Butler P.M. a sentence that there is no law to uphold therefore the Minister of Justice neglected his duty in that case, but there never was such a thing as Justice in the English laws but any amount of injustice to be had. Out of over thirty head of the very best horses the land could produce I could only find one when I got my liberty. Constable Flood stole and sold the most of them to the navvies on the railway line one bay cob he stole and sold four different times the line was completed and the men all gone when I came out and Flood was shifted to Oxley. he carried on the same game there all the stray horses that was any time without an owner and not in the Police Gazette Flood used to claim He was doing a good trade at Oxley until Mr Brown of the Laceby Station got him shifted as he was always running his horses about. Flood is different to Sergeant Steel, Strachan, Hall and the most of Police a they have got to hire cads and if they fail the Police are quite helpless. But Flood can make a cheque single-handed he is the greatest horsestealer with the exception of myself and George King I know of. I never worked on a farm a horse and saddle was never traced to me after leaving employment since February 1873 I worked as a faller at Mr J. Saunders and R Rules sawmills then for Heach and Dockendorf I never worked for less than two pound ten a week since I left Pentridge and in 1875 or 1876 I was overseer for Saunders and Rule. Bourke's water--holes sawmills in Victoria since then I was on the King River, during my stay there I ran in a wild bull which I gave to Lydicher a farmer he sold him to Carr a Publican and Butcher who killed him for beef, sometime afterwards I was blamed for stealing this bull from James Whitty Boggy Creek I asked Whitty Oxley racecourse why he blamed me for stealing his bull he said he had found his bull and never blamed me but his son-in-law Farrell told him he heard I sold the bull to Carr not long afterwards I heard again I was blamed for stealing a mob of calves from Whitty and Farrell which I knew nothing about. I began to think they wanted me to give them something to talk about. Therefore I started wholesale and retail horse and cattle dealing Whitty and Burns not being satisfied with all the picked land on the Boggy Creek and King River and the run of their stock on the certificate ground free and no one interfering with them paid heavy rent to the banks for all the open ground so as a poor man could keep no stock, and impounded every beast they could get, even off Government roads. If a poor man happened to leave his horse or bit of a poddy calf outside his paddock they would be impounded. I have known over 60 head of horses impounded in one day by Whitty and Burns all belonging to poor farmers they would have to leave their ploughing or harvest or other employment to go to Oxley. When they would get there perhaps not have money enough to release them and have to give a bill of sale or borrow the money which is no easy matter. And along with this sort of work, Farrell the Policeman stole a horse from George King and had him in Whitty and Farrells Paddocks until he left the force. And all this was the cause of me and my step-father George King taking their horses and selling them to Baumgarten and Kennedy. the pick of them was taken to a good market and the culls were kept in Petersons paddock and their brands altered by me two was sold to Kennedy and the rest to Baumgarten who were strangers to me and I believe honest men. They paid me full value for the horses and could not have known they were stolen. no person had anything to do with the stealing and selling of the horses but me and George King. William Cooke who was convicted for Whittys horses was innocent he was not in my company at Petersons. But it is not the place of the Police to convict guilty men as it is by them they get their living had the right parties been convicted it would have been a bad job for the Police as Berry would have sacked a great many of them only I came to their aid and kept them in their bilits and good employment and got them double pay and yet the ungrateful articles convicted my mother and an infant my brother-in-law and another man who was innocent and still annoy my brothers and sisters and the ignorant unicorns even threaten to shoot myself But as soon as I am dead they will be heels up in the muroo. there will be no more police required they will be sacked and supplanted by soldiers on low pay in the towns and special constables made of some of the farmers to make up for this double pay and expence. It will pay Government to give those people who are suffering innocence, justice and liberty. if not I will be compelled to show some colonial stratagem which will open the eyes of not only the Victoria Police and inhabitants but also the whole British army and now doubt they will acknowledge their hounds were barking at the 20 wrong stump. And that Fitzpatrick will be the cause of greater slaughter to the Union Jack than Saint Patrick was to the snakes and toads in Ireland. The Queen of England was as guilty as Baumgarten and Kennedy Williamson and Skillion of what they were convicted for When the horses were found on the Murray River I wrote a letter to Mr Swanhill of Lake Rowan to acquaint the Auctioneer and to advertize my horses for sale I brought some of them to that place but did not sell I sold some of them in Benalla Melbourne and other places and left the colony and became a rambling gambler soon after I left there was a warrant for me and the Police searched the place and watched night and day for two or three weeks and when they could not snare me they got a warrant against my brother Dan And on the 15 of April Fitzpatrick came to the Eleven Mile Creek to arrest him he had some conversation with a horse dealer whom he swore was William Skillion this man was not called in Beechworth, besides several other Witnesses, who alone could have proved Fitzpatricks falsehood after leaving this man he went to the house asked was Dan in Dan came out. I hear previous to this Fitzpatrick had some conversation with Williamson on the hill. he asked Dan to come to Greta with him as he had a warrant for him for stealing Whitty's horses Dan said all right they both went inside Dan was having something to eat his mother asked Fitzpatrick what he wanted Dan for. the trooper said he had a warrant for him Dan then asked him to produce it he said it was only a telegram sent from Chiltren but Sergeant Whelan ordered him to releive Steel at Greta and call and arrest Dan and take him into Wangaratta next morning and get him remanded Dans mother said Dan need not go without a warrant unless he liked and that the trooper had no business on her premises without some Authority besides his own word The trooper pulled out his revolver and said he would blow her brains out if she interfered. in the arrest she told him it was a good job for him Ned was not there or he would ram the revolver down his throat Dan looked out and said Ned is coming now, the trooper being off his guard looked out and when Dan got his attention drawn he dropped the knife and fork which showed he had no murderous intent and slapped heenans hug on him took his revolver and kept him there until Skillion and Ryan came with horses which Dan sold that night. The trooper left and invented some scheme to say that he got shot which any man can see is false, he told Dan to clear out that Sergeant Steel and Detective Brown and Strachan would be there before morning Strachan had been over the Murray trying to get up a case against him and they would convict him if they caught him as the stock society offored an enticement for witnesses to swear anything and the germans over the w:Murray RiverMurray would swear to the wrong man as well as the right. Next day Williamson and my mother was arrested and Skillion the day after who was not there at all at the time of the row which can be proved by 8 or 9 witnesses And the Police got great credit and praise in the papers for arresting the mother of 12 children one an infant on her breast and those two quiet hard working innocent men who would not know the difference a revolver and a saucepan handle and kept them six months awaiting trial and then convicted them on the evidence of the meanest article that ever the sun shone on it seems that the jury was well chosen by the Police as there was a discharged Sergeant amongst them which is contrary to law they thought it impossible for a Policeman to swear a lie but I can assure them it is by that means and hiring cads they get promoted I have heard from a trooper that he never knew Fitzpatrick to be one night sober and that he sold his sister to a chinaman but he looks a young strapping rather genteel more fit to be a starcher to a laundress than a Policeman. For to a keen observer he has the wrong appearance or a manly heart the deceit and cowardice is too plain to be seen in the puny cabbage hearted looking face. I heard nothing of this transaction until very close on the trial I being then over 400 miles from Greta when I heard I was outlawed and a hundred pound reward for me for shooting at a trooper in Victoria and a hundred pound for any man that could prove a conviction of horse-stealing against me so I came back to Victoria knew I would get no justice if I gave myself up I enquired after my brother Dan and found him digging on Bullock Creek heard how the Police used to be blowing that they would not ask me to stand they would shoot me first and then cry surrender and how they used to rush into the house upset all the milk dishes break tins of eggs empty the flour out of the bags on to the ground and even the meat out of the cask and destroy all the provisions and shove the girls in front of them into the rooms like dogs so as if anyone was there they would shoot the girls first but they knew well I was not there or I would have scattered their blood and brains like rain I would manure the Eleven mile with their bloated carcasses and yet remember there is not one drop of murderous blood in my Veins. ";
	//TODO: do this better in terms of preserving whitespace and ignoring script and hidden elems
	var contentStr = window.top.getBrowser().selectedBrowser.contentWindow.document.body.textContent.normalize().escapeHTML();
	//alert(contentStr);
	// truncate - web service can only handle 100,000 chars
	if (contentStr.length > 99999) {
		contentStr = str.substring(0,99999);
	}


	Ext.Ajax.request({
   		url: 'http://api.opencalais.com/enlighten/calais.asmx/Enlighten',
   		success: handleOpenCalaisMetadata,
   		failure: function (resp){
					loreWarning("Unable to obtain OpenCalais metadata"  + resp.responseText);},
   		params: { 
			licenseID: OPENCALAIS_KEY,
			content : contentStr, // Ext.Ajax does urlencoding by default
			paramsXML: ocParams
		}
	});
}




