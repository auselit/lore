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
 
// Constants
var OWL_OBJPROP        = "http://www.w3.org/2002/07/owl#ObjectProperty";
var OWL_DATAPROP       = "http://www.w3.org/2002/07/owl#DatatypeProperty";
var OWL_TPROP          = "http://www.w3.org/2002/07/owl#TransitiveProperty";
var OWL_SPROP          = "http://www.w3.org/2002/07/owl#SymmetricProperty";
var RDFS_CLASS         = "http://www.w3.org/2000/01/rdf-schema#Class";
var DC_NS              = "http://purl.org/dc/elements/1.0/";
var ANNOTATION_NS      = "http://www.w3.org/2000/10/annotation-ns#";
var RDF_SYNTAX_NS      = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
var ANNOTATION_TYPE_NS = "http://www.w3.org/2000/10/annotationType#";
var THREAD_NS          = "http://www.w3.org/2001/03/thread#";
var REPLY_TYPE_NS      = "http://www.w3.org/2001/12/replyType#";
var XHTML_NS           = "http://www.w3.org/1999/xhtml";
var LORE_LAYOUT_NS     = "http://maenad.itee.uq.edu.au/lore/layout.owl#";
/**
 * Render the current resource map as RDF/XML in the RDF view
 */
function showRDFHTML() {
	rdftab.body.update(createRDF(true));
}

function showCompoundObjectSummary() {
	var newsummary = "<div><p>List of contents:</p><ul>";
	var allfigures = oreGraph.getDocument().getFigures();
	for (var i = 0; i < allfigures.getSize(); i++) {
		var fig = allfigures.get(i);
		var figurl = fig.url.replace('&', '&amp;');
		newsummary += "<li><a target='_blank' href='" + figurl + "'>" + figurl + "</a></li>";
	}
	newsummary += "</ul></div>";
	summarytab.body.update(newsummary);
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
		if (nlsymb == "<br/>") {
			result += escapeHTML(propval + "");
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
	for (var prefix in namespaces) {
		if (namespaces[prefix] == ns)
			return prefix + ":";
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
			+ "rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\""
			+ nlsymb;
	for (var pfx in namespaces) {
		rdfxml += "xmlns:" + pfx + "=\"" + namespaces[pfx] + "\"" + nlsymb;
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
			+ "rdf:type rdf:resource=\"http://www.openarchives.org/ore/terms/ResourceMap\" />"
			+ nlsymb
			+ ltsymb
			+ "dcterms:modified rdf:datatype=\"http://www.w3.org/2001/XMLSchema#date\">"
			+ modifiedDate.getFullYear() + "-" + (modifiedDate.getMonth() + 1)
			+ "-" + modifiedDate.getDate() + ltsymb + "/dcterms:modified>"
			+ nlsymb;
	var created = remprops["dcterms:created"];
	if (created != null && created instanceof Date) {
		rdfxml += ltsymb
				+ "dcterms:created rdf:datatype=\"http://www.w3.org/2001/XMLSchema#date\">"
				+ created.getFullYear() + "-" + (created.getMonth() + 1) + "-"
				+ created.getDate() + ltsymb + "/dcterms:created>" + nlsymb;
	}
	for (var i = 0; i < metadata_props.length; i++) {
		var theprop = metadata_props[i];
		if (theprop != 'dcterms:modified'){
			rdfxml += _serialise_property(theprop, remprops, ltsymb,
				nlsymb);
		}
	}
	rdfxml += ltsymb + rdfdescclose + nlsymb;

	// create RDF for aggregation
	//var aggreprops = aggregrid.getSource();
	var aggreprops = {"rdf:type" : "http://www.openarchives.org/ore/terms/Aggregation"};
	rdfxml += ltsymb + rdfdescabout + describes + closetag + ltsymb
			+ "rdf:type rdf:resource=\"" + aggreprops["rdf:type"]
			+ fullclosetag;
	// TODO: any other types for aggregation eg Journal Article

	for (var i = 0; i < all_props.length; i++) {
		rdfxml += _serialise_property(all_props[i], aggreprops, ltsymb, nlsymb);
	}
	var allfigures = oreGraph.getDocument().getFigures();
	var resourcerdf = "";
	for (var i = 0; i < allfigures.getSize(); i++) {
		var fig = allfigures.get(i);
		var figurl = fig.url.replace('&', '&amp;').replace('<','%3C').replace('>','%3E');
		rdfxml += ltsymb + "ore:aggregates rdf:resource=\"" + figurl
				+ fullclosetag;
		// create RDF for resources in aggregation
		// TODO: resource properties eg dcterms:hasFormat, ore:isAggregatedBy
		for (var mprop in fig.metadataproperties) {
			if (mprop != 'Resource') {
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
			var relobj = theconnector.targetPort.parentNode.url.replace('&',
					'&amp;');
			resourcerdf += ltsymb + rdfdescabout + figurl + closetag + ltsymb
					+ relpred + " xmlns=\"" + relns + "\" rdf:resource=\""
					+ relobj + fullclosetag + ltsymb + rdfdescclose + nlsymb;
		}
	}
	rdfxml += ltsymb + rdfdescclose + nlsymb;
	rdfxml += resourcerdf;
	rdfxml += ltsymb + "/rdf:RDF>";
	return rdfxml;
};

/**
 * Helper function for readRDF
 * @param {} theRDF
 * @param {} props
 * @param {} subj
 * @param {} theProp
 */
function _read_property(theRDF, props, subj, theProp) {
	var propInfo = theProp.split(":");
	var propresult = theRDF.Match(null, subj, namespaces[propInfo[0]]
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
						"http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
						"http://www.openarchives.org/ore/terms/ResourceMap")[0].subject
						.toString();
				var creator = theRDF.Match(null, remurl,
						"http://purl.org/dc/elements/1.1/creator", null)[0].object;
				var createdResult = theRDF.Match(null, remurl,
						"http://purl.org/dc/terms/created", null);
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
					"rdf:type" : "http://www.openarchives.org/ore/terms/ResourceMap"
				};
				// TODO: perhaps should read any property, not just those in the list?
				for (var i = 0; i < all_props.length; i++) {
					_read_property(theRDF, theprops, remurl, all_props[i]);
				}
				grid.setSource(theprops);

				// create a node figure for each aggregated resource
				var aggregationID = remurl + "#aggregation";
				aggregates = theRDF.Match(null, aggregationID,
						"http://www.openarchives.org/ore/terms/aggregates",
						null);
				var resourcerels = new Array(0);
				for (var i = 0; i < aggregates.length; i++) {
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
						fig.setDimension(parseInt(width), parseInt(height))
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
					var tgtfig = lookupFigure(resourcerels[j].object);
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
				})
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
						if (!relresult.term.match("genid:"))
							ontrelationships[relresult.term] = relresult.ns;
					}
					relResult = ontRDF.Match(null, null, RDF_SYNTAX_NS + "type", OWL_DATAPROP);
					var tmp_resource_metadata = new Array(relResult.length);
					for (var i = 0; i < relResult.length; i++) {
						tmp_resource_metadata[i] = relResult[i].subject;
					}
					resource_metadata_props = resource_metadata_props
							.concat(tmp_resource_metadata);
					resource_metadata_props.sort();
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
								xmlhttp = new XMLHttpRequest();
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
								}
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
	treeRoot.eachChild(function(node) {
		if (node) {
			node.purgeListeners();
			_clearTree(node);
			node.cascade(function(n2) {n2.remove();});
		}
	});
}

/**
 * Helper function for updateSourceLists: updates the annotations list
 * with annotations that reference the contextURL
 * @param {} contextURL The escaped URL
 */
function _updateAnnotationsSourceList(contextURL) {
	// Update annotations source tree with matching annotations
 if (annoURL){
 	var queryURL = annoURL + "?w3c_annotates=" + contextURL;
 	loreInfo("Loading annotations for " + contextURL);
 	_clearTree(annotationstreeroot);
	var ds = annotationstab.getStore();
	ds.removeAll();
 	try {
			var req = new XMLHttpRequest();
			req.open('GET', queryURL, true);
			req.onreadystatechange = function(aEvt) {
				if (req.readyState == 4)
					if (req.responseText && req.status != 204
							&& req.status < 400) {
						var resultNodes = {};
						var xmldoc = req.responseXML;
						if (xmldoc) {
							resultNodes = xmldoc.getElementsByTagNameNS(
								"http://www.w3.org/1999/02/22-rdf-syntax-ns#",
								"Description");
						}
						
						
						if (resultNodes.length > 0){
							// clear the tree - seems to be a bug where it doesn't clear
							_clearTree(annotationstreeroot);
							var annotations = orderByDate(resultNodes);
							ds.loadData(annotations);
							var annogriddata = [];
							for (var i = 0; i < annotations.length; i++) {
								var annoID = annotations[i].id;
								/*var xmldoc2 = getAnnotationsRDF(annoID, true);
        						var replyList = xmldoc2.getElementsByTagNameNS(RDF_SYNTAX_NS, 'Description');*/
								var title = annotations[i].title;
								if (!title || title == ''){
									title = "Untitled";
								}
								//var isLeaf = (replyList.length == 0);
								var isLeaf = true;
								var tmpNode = new Ext.tree.TreeNode({
										text :  title + " <span style='font-style:italic'>(" + annotations[i].creator +")</span>",
										iconCls : 'oreresult',
										leaf: isLeaf	
								});
								
       							/*if (replyList.length > 0) {
          							replies = orderByDate(replyList);
          							for (var j = 0; j < replies.length; j++) {
            							replies[j].context = annotations[i].context;
            							insertAnnotation(replies[j]);
            
          							}
        						}*/
      
								annotationstreeroot.appendChild(tmpNode);
								tmpNode.on('dblclick', function(node) {
									//TODO: prompt first
										loreviews.activate("annotationslist");
								});
							
									
						}
						
						if (!annotationstreeroot.isExpanded()) {
							annotationstreeroot.expand();
						}
					}
				}
			};
			req.send(null);
		} catch (e) {
			loreWarning("Unable to retrieve annotations");
	}
 }
}
/**
 * Helper function for updateSourceLists: updates the compound objects list
 * with objects that reference the contextURL
 * @param {} contextURL The escaped URL
 */
function _updateCompoundObjectsSourceList(contextURL) {
	
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
				if (req.readyState == 4)
					if (req.responseText && req.status != 204
							&& req.status < 400) {
						_clearTree(remstreeroot);
						var xmldoc = req.responseXML;
						var result = {};
						if (xmldoc) {
							result = xmldoc.getElementsByTagNameNS(
									"http://www.w3.org/2005/sparql-results#",
									"uri");
						}
						for (var i = 0; i < result.length; i++) {
							var remID = result[i].childNodes[0].nodeValue;
							var tmpNode = new Ext.tree.TreeNode({
										text : remID,
										iconCls : 'oreresult',
										leaf : true
									});
							remstreeroot.appendChild(tmpNode);
							tmpNode.on('dblclick', function(node) {
										loadRDFFromID(node.text);
							});
							
							tmpNode.on('contextmenu', function(node,e){
								tmpNode.contextmenu = new Ext.menu.Menu({
		        					id : remID + "-add-metadata-menu"
								});
								tmpNode.contextmenu.add({
									text : "Add to resource map",
									handler : function(evt){
										addFigure(reposURL + "/statements?context=<" + node.text + ">");
									}
								});
								tmpNode.contextmenu.add({
									text : "Load in Compound Object Editor",
									handler : function (evt){
										loadRDFFromID(node.text);
									}
								});
    							tmpNode.contextmenu.showAt(e.xy);
							});
							
						}
						if (!remstreeroot.isExpanded()) {
							remstreeroot.expand();
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
	_updateAnnotationsSourceList(contextURL);
	_updateCompoundObjectsSourceList(contextURL);
}

/* Graph related functions */
/**
 * Updates global variables used for figure layout
 */
function nextXY() {
	// TODO: Need a real graph layout algorithm
	if (dummylayoutx > maxx) {
		dummylayoutx = 50;
		dummylayouty += nodeheight + nodespacing;
	} else {
		dummylayoutx += nodewidth + nodespacing;
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
		xsltproc.importStyleSheet(stylesheetDoc);
	
		// get the compound object xml
		var theRDF = createRDF(false);
		var parser = new DOMParser();
		var rdfDoc = parser.parseFromString(theRDF,"text/xml");
	} catch (e){
		loreWarning("Unable to generate SMIL");
	}
}

/* Functions from dannotate.js follow */

/**
 * Returns value of first child of first node, or default value if provided.
 */
function safeGetFirstChildValue (node, defaultValue)
{
  return ((node.length > 0) && (node[0] != null) && node[0].firstChild) ?
           node[0].firstChild.nodeValue : defaultValue ? defaultValue : '';
}


/**
 * Get annotation body value.
 * modified from dannotate.js
 * @param uri Fully formed request against Danno annotation server
 * @return Server response as text or XML document.
 */
function getAjaxRespSync (uri) 
{
  var req = null;
  try {
    req = new XMLHttpRequest();
    req.open('GET', uri, false);
    req.setRequestHeader('User-Agent','XMLHttpRequest');
    req.setRequestHeader('Content-Type','application/text');
    req.send(null);
  }
  catch (ex) {
    loreError('Error in synchronous AJAX request:\n  ' + ex + '\n\nURL: ' + uri);
    return null;
  }

  if (req.status != 200) {
    var hst = (uri.length < 65) ? uri : uri.substring(0, 64) + '...';
    throw new Error('Synchronous AJAX request status error.\n  URI: ' + hst + 
                    '\n  Status: ' + req.status);
  } 

  rtype = req.getResponseHeader('Content-Type');
//alert('POST Headers:\n'+req.getAllResponseHeaders());
  if (rtype == null) {
    // FIXME: Safari sometimes does no set the Content-Type, so for now,
    // try to intuit it thru the text.
//alert('null content-type. Headers:\n'+req.getAllResponseHeaders());
     var txt = req.responseText;
     var doc = null;
     if (txt && (txt.indexOf(':RDF') > 0)) {
       doc = req.responseXML;
       if ((doc == null) && (typeof DOMParser != 'undefined')) {
         //alert('parsing:\n'+txt);           
         var parser = new DOMParser();
         doc = parser.parseFromString(txt, 'application/xml');
       }
     }

     if (doc != null) {
       return doc;
     }
     else if (txt != null) {
       return txt;
     }
  }
  if (rtype.indexOf(';') > 0) {
    // strip any charset encoding etc
    // FIXME: What to do with Annozilla bodies of application/xhtml+xml ?
    rtype = rtype.substring(0, rtype.indexOf(';'));
  }
  switch (rtype) {
    case 'application/xml':  return req.responseXML;
    case 'application/html': return req.responseText;
    case 'application/text': return escapeHTML(req.responseText);
  }
  throw new Error('No usable response.\nContent is "' + rtype + '"' +
                  '\nRequest:\n' + uri + '\n' + req.responseText);
}

/**
 * Class wrapper for an RDF annotation provides access to values
 *  - modified from dannotate.js
 * @param rdf Root element of an RDF annotation returned by Danno
 */
function Annotation (rdf)
{
   var tmp;
   var node;
   var attr;
   
   this.rdf = rdf;
   
   try {
     attr = rdf.getAttributeNodeNS(RDF_SYNTAX_NS, 'about');
     this.id = attr.nodeValue;
     
     var isReply = false;
     node = rdf.getElementsByTagNameNS(RDF_SYNTAX_NS, 'type');
     for (var i = 0; i < node.length; i++) {
      attr = node[i].getAttributeNodeNS(RDF_SYNTAX_NS, 'resource');
        tmp = attr.nodeValue;
        if (tmp.indexOf(ANNOTATION_TYPE_NS) == 0) {
           this.type = tmp.substr(ANNOTATION_TYPE_NS.length);
        }
        else if (tmp.indexOf(REPLY_TYPE_NS) == 0) {
            this.type = tmp.substr(REPLY_TYPE_NS.length);
        }
        else if (tmp.indexOf(THREAD_NS) == 0) {
          isReply = true;
        }
     }
     this.isReply = isReply;
     
     if (! this.isReply) {
       node = rdf.getElementsByTagNameNS(ANNOTATION_NS, 'annotates');
       attr = node[0].getAttributeNodeNS(RDF_SYNTAX_NS, 'resource');
       this.resource = attr.nodeValue;
       this.about = null;
     }
     else {
       node = rdf.getElementsByTagNameNS(THREAD_NS, 'root');
       attr = node[0].getAttributeNodeNS(RDF_SYNTAX_NS, 'resource');
       this.resource = attr.nodeValue;
       node = rdf.getElementsByTagNameNS(THREAD_NS, 'inReplyTo');
       attr = node[0].getAttributeNodeNS(RDF_SYNTAX_NS, 'resource');
       this.about = attr.nodeValue;
     }
     
     node = rdf.getElementsByTagNameNS(ANNOTATION_NS, 'body');
     attr = node[0].getAttributeNodeNS(RDF_SYNTAX_NS, 'resource');
     this.bodyURL = attr.nodeValue;
     
     node = rdf.getElementsByTagNameNS(ANNOTATION_NS, 'created');
     this.created = safeGetFirstChildValue(node);
     node = rdf.getElementsByTagNameNS(ANNOTATION_NS, 'modified');
     this.modified = safeGetFirstChildValue(node);
     
     if (this.isReply) {
       this.context = '';
     }
     else {
       node = rdf.getElementsByTagNameNS(ANNOTATION_NS, 'context');
       this.context = safeGetFirstChildValue(node);
     }
     
     node = rdf.getElementsByTagNameNS(DC_NS, 'creator');
     this.creator = safeGetFirstChildValue(node, 'anon');
     
     node = rdf.getElementsByTagNameNS(DC_NS, 'title');
     this.title = safeGetFirstChildValue(node);
     
     node = rdf.getElementsByTagNameNS(DC_NS, 'language');
     this.lang = safeGetFirstChildValue(node);

     
   }
   catch (ex) {
     var st = "Error parsing RDF" + (this.id ? ' for ' + this.id : '') +
              ':\n' + ex.toString();
     throw new Error(st);
   }
}

/**
 * Creates an array of Annotations from a list of RDF nodes in ascending date
 * created order
 * @param nodeList Raw RDF list in arbitrary order
 * @return ordered array of Annotations
 */
function orderByDate (nodeList)
{
  var tmp = new Array();
  for (var j = 0; j < nodeList.length; j++) {
    try {
      tmp[j] = new Annotation(nodeList.item(j));
    }
    catch (ex) {
      loreError(ex.toString());
    }
  }
  return tmp.length == 1 ? tmp : 
         tmp.sort(function(a,b){return (a.created > b.created ? 1 : -1)});
}

/**
 * Escapes a string using HTML entities
 * @param {} st The string to be escaped
 * @return {}
 */
function escapeHTML(st) {
	var txt = st;
	var atom = st.split('&');
	if (atom.length > 1) {
		txt = atom[0];
		for (var i = 1; i < atom.length; i++) {
			txt += '&amp;' + atom[i];
		}
	}
	atom = txt.split('<');
	if (atom.length > 1) {
		txt = atom[0];
		for (var i = 1; i < atom.length; i++) {
			txt += '&lt;' + atom[i];
		}
	}
	atom = txt.split('>');
	if (atom.length > 1) {
		txt = atom[0];
		for (var i = 1; i < atom.length; i++) {
			txt += '&gt;' + atom[i];
		}
	}
	return txt;
}