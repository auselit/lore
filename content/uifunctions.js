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
function showRDFHTML() {
	rdftab.body.update(createRDF(true));
}
/**
 * Displays a list of resource URIs contained in the compound object
 */
function showCompoundObjectSummary() {
	var remprops = grid.getSource();
	
	var newsummary = "<table style='font-size:smaller;border:none'>" +
			"<tr valign='top'><td><b>Compound object:</b></td><td>" + remprops["rdf:about"] + "</td></tr>";
	if (remprops["dc:title"]){
		newsummary += "<tr valign='top'><td><b>Title:</b></td><td>" + remprops["dc:title"] + "</td></tr>";
	}
	if (remprops["dc:description"]){
		newsummary += "<tr valign='top'><td><b>Description:</b></td><td width='80%'>" + remprops["dc:description"] + "</td></tr></table>";
	}
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
				loreviews.activate("compoundobjecteditor");
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
								tmpNode.contextmenu = new Ext.menu.Menu({
		        					id : node.id + "-context-menu"
								});
								tmpNode.contextmenu.add({
									text : "Add to compound object",
									handler : function(evt){
										addFigure(reposURL + "/statements?context=<" + node.id + ">");
									}
								});
								tmpNode.contextmenu.add({
									text : "Load in Compound Object Editor",
									handler : function (evt){
										loadRDFFromID(node.id);
									}
								});
    							tmpNode.contextmenu.showAt(e.xy);
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