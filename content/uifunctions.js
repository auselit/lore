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
var REVISION_ANNOTATION_NS = "http://austlit.edu.au/ontologies/2009/03/lit-annotation-ns#";
var m_xps = new XPointerService();  // Instance of hacked Mozdev XPointer service

var consoleDebug = false;

/**
 * Render the current resource map as RDF/XML in the RDF view
 */
function showRDFHTML() {
	rdftab.body.update(createRDF(true));
}
/**
 * Launch create annotation form with context and annotates filled in from current browser resource
 */
function addAnnotation(){
	var currentContext = getXPathForSelection();
	var anno = {
		resource : currentURL,
		original: currentURL,
		context : currentContext,
		originalcontext : currentContext,
		creator: defaultCreator,
		created: new Date(),
		modified: new Date(),
		body: "",
		title: "New Annotation",
		type: "http://www.w3.org/2000/10/annotationType#Comment",
		lang: "en"
	}
	annotabds.loadData([anno],true);
	// get the annotation record
	var annoIndex = annotabds.findBy(function(record, id){
			return (!record.json.id);
	});
	// select the row to load into the editor
	annotabsm.selectRow(annoIndex);
	loreviews.activate("annotationslistform");
}


/**
 * This fn depends on a hacked version of nsXpointerService being loaded by the browser
 * before this script is loaded from tags in the page being annotated.
 * modified from dannotate.js
 * @return XPath/XPointer statement for selected text, or '' if no selection.
 */
function getXPathForSelection ()
{
  var mainwindow = window.top.getBrowser().selectedBrowser.contentWindow;
  var xp = '';
  try {
    seln = mainwindow.getSelection();
    if (seln != null) {
      select = seln.getRangeAt(0);
      xp = m_xps.xptrCreator.createXPointerFromSelection(seln, mainwindow.document);
    }
  }
  catch (ex) {
    loreWarning('XPath create failed\n' + ex.toString());
  }
  return xp;
}
/**
 * Get the Range defined by an XPath/Xpointer (restricted to subset of
 * expressions understood by Anozilla).
 * modified from dannotate.js
 */
function getSelectionForXPath (xp)
{
	var mainwindow = window.top.getBrowser().selectedBrowser.contentWindow;
    return m_xps.xptrResolver.resolveXPointerToRange(xp, mainwindow.document);
}

/**
 * Displays a list of resource URIs contained in the compound object
 */
function showCompoundObjectSummary() {
	var newsummary = "<div><p>List of contents:</p><ul>";
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
 * Launch a small window for SMIL slideshow
 * @param {} url
 */
function launchWindow(url, locbar) {
	var winOpts = 'height=650,width=800,top=200,left=250,resizable';
	if (locbar) {
		winOpts += ',location=1';
	}
	newwindow=window.open(url,'name',winOpts);
	if (window.focus) {newwindow.focus()}
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
		smilcontents += "<p>A SMIL slideshow has been generated from the contents of the current compound object.</p><p>" +
				"<a onclick='launchWindow(this.href, false);return(false);' target='_blank' href='file://" + smilpath + "'>Click here to launch the slideshow in a new window</a>";	
	} else {
		smilcontents += "<p>Once you have added some resources to the current compound object a SMIL presentation will be available here.</p>"
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
 * Helper function for updateSourceLists: updates the annotations list
 * with annotations that reference the contextURL
 * @param {} contextURL The escaped URL
 */
function _updateAnnotationsSourceList(contextURL) {
 _clearTree(annotationstreeroot);
 //annotabds.removeAll();
 annotabds.each(function(rec){
 	if (rec.data.id){
		annotabds.remove(rec);
	}
 });
 // Update annotations source tree with matching annotations
 if (annoURL){
 	var queryURL = annoURL + "?w3c_annotates=" + contextURL;
 	loreInfo("Loading annotations for " + contextURL);
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
							var annotations = orderByDate(resultNodes);
							annotabds.loadData(annotations,true);
              updateRevisionAnnotationList();
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
									id: annoID,
									rowIndex: i,
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
									loreviews.activate("annotationslistform");
									var annoIndex = annotabds.findBy(function(record, id){
										return (node.id == record.json.id);
									});
									annotabsm.selectRow(annoIndex);
								});
								tmpNode.on('contextmenu', function(node,e){
									tmpNode.contextmenu = new Ext.menu.Menu({
		        					id : node.id + "-context-menu"
								});
								tmpNode.contextmenu.add({
									text : "Add to compound object",
									handler : function(evt){
										addFigure(node.id);
									}
								});
								
								tmpNode.contextmenu.add({
									text : "Update annotation",
									handler : function (evt){
											loreviews.activate("annotationslistform");
											annotabsm.selectRow(node.attributes.rowIndex);
								}});
    							tmpNode.contextmenu.showAt(e.xy);
    							
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
				if (req.readyState == 4)
					if (req.responseText && req.status != 204
							&& req.status < 400) {
						
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
	this.currentURL = contextURL; // store the contextURL
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
/**
 * Write file content to fileName in the extensions content folder
 * @param {} content
 * @param {} fileName
 * @return {}
 */
function writeFile(content, fileName){
		try {
			netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
			var fileBase = extension.path + "\\content\\";
			var filePath =  fileBase + fileName;
			var file = Components.classes["@mozilla.org/file/local;1"]
				.createInstance(Components.interfaces.nsILocalFile);
				file.initWithPath(filePath);
			if(file.exists() == false) 
			{
				file.create( Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 420);
			}
			var stream = Components.classes["@mozilla.org/network/file-output-stream;1"]
				.createInstance(Components.interfaces.nsIFileOutputStream);
			stream.init(file, 0x02 | 0x08 | 0x20, 0666, 0);
			stream.write(content, content.length);
			stream.close();
			return filePath;
		} catch (e) {
			loreWarning("Unable to create SMIL result: " + e.toString());
		}
}
/**
 * Utility function to display all keys, values for an object
 * @param {} record
 */
function dumpValues(record){
	var res="";
	for(k in record){
		res += k + ": " + record[k] + ";\n";
	}
	alert(res);
}
/**
 * Escape characters for HTML display
 * @return {}
 */
String.prototype.escapeHTML = function () {                                       
        return(                                                                 
            this.replace(/&/g,'&amp;').                                         
                replace(/>/g,'&gt;').                                           
                replace(/</g,'&lt;').                                           
                replace(/"/g,'&quot;')                                         
        );                                                                     
};
String.prototype.unescapeHTML = function (){
	return(                                                                 
            this.replace(/&amp;/g,'&').                                         
                replace(/&gt;/g,'>').                                           
                replace(/&lt;/g,'<').                                           
                replace(/&quot;/g,'"')                                         
        );    
}
/**
 * Quick and nasty function to tidy up html produced by html editor so that 
 * it is valid XML for inclusion into RDF XML
 * @return {}
 */
String.prototype.tidyHTML = function (){
	var res = this;
	if (res.match("<title>") && res.match("</title>")){
		var res1 = res.substring(0,(res.indexOf('<title>')));
		var res2 = res.substring((res.indexOf('</title>')+8), res.length);
		res = res1 + res2;
	}
	while (res.match('<br xmlns"'+ XHTML_NS + '">')){
		res = res.replace('<br xmlns="' + XHTML_NS + '">', '<br />');
	}
	while (res.match('<br>')){
		res = res.replace('<br>','<br />');
	}
	while (res.match('</br>')){
		res = res.replace('</br>',' ');
	}
	if (res.match('nbsp')){
		res = res.replace('&nbsp;',' ');
	}
	return res;
}
/**
 * Returns value of first child of first node, or default value if provided.
 * Unchanged from dannotate.js
 */
function safeGetFirstChildValue (node, defaultValue)
{
  return ((node.length > 0) && (node[0] != null) && node[0].firstChild) ?
           node[0].firstChild.nodeValue : defaultValue ? defaultValue : '';
}


/**
 * Get annotation body value.
 * modified from dannotate.js getAjaxRespSync
 * @param uri Fully formed request against Danno annotation server
 * @return Server response as text or XML document.
 */
function getBodyContent(uri) 
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
  if (rtype == null) {
     var txt = req.responseText;
     var doc = null;
     if (txt && (txt.indexOf(':RDF') > 0)) {
       doc = req.responseXML;
       if ((doc == null) && (typeof DOMParser != 'undefined')) {          
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
    rtype = rtype.substring(0, rtype.indexOf(';'));
  }
  var serializer = new XMLSerializer();
  var bodyContent = "";
  var result = "";
  if (rtype == 'application/xml' || rtype == 'application/xhtml+xml'){
    	bodyContent = req.responseXML.getElementsByTagName('body');
    	if (bodyContent[0]){
			result = serializer.serializeToString(bodyContent[0]);
    	} else {
    		result = req.responseText.tidyHTML();
    	}
  } else {
  		// messy but will have to do for now
    	result = req.responseText.tidyHTML();
    	
  }
    
    return result;
  
  throw new Error('No usable body.\nContent is "' + rtype + '"' +
                  '\nRequest:\n' + uri + '\n' + req.responseText);
}

/**
 * Class wrapper for an RDF annotation provides access to values
 *  modified from dannotate.js
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
	 if (attr) {
	 	this.id = attr.nodeValue;
	 } 
     var isReply = false;
     node = rdf.getElementsByTagNameNS(RDF_SYNTAX_NS, 'type');
     for (var i = 0; i < node.length; i++) {
     	attr = node[i].getAttributeNodeNS(RDF_SYNTAX_NS, 'resource');
	  	if (attr) {
			tmp = attr.nodeValue;
		}
        if (tmp.indexOf(ANNOTATION_TYPE_NS) == 0) {
           //this.type = tmp.substr(ANNOTATION_TYPE_NS.length);
        	this.type = tmp;
        }
        else if (tmp.indexOf(REPLY_TYPE_NS) == 0) {
            //this.type = tmp.substr(REPLY_TYPE_NS.length);
            this.type = tmp;
        }
        else if (tmp.indexOf(REVISION_ANNOTATION_NS) == 0){
        	//this.type = tmp.substr(REVISION_ANNOTATION_NS.length);
        	this.type = tmp;
        }
        else if (tmp.indexOf(THREAD_NS) == 0) {
          isReply = true;
        }
        
     }
     this.isReply = isReply;
     
     if (! this.isReply) {
       node = rdf.getElementsByTagNameNS(ANNOTATION_NS, 'annotates');
       attr = node[0].getAttributeNodeNS(RDF_SYNTAX_NS, 'resource');
	   if (attr) {
	   	this.resource = attr.nodeValue;
	   }
       this.about = null;
     }
     else {
       node = rdf.getElementsByTagNameNS(THREAD_NS, 'root');
       attr = node[0].getAttributeNodeNS(RDF_SYNTAX_NS, 'resource');
	   if (attr) {
	   	this.resource = attr.nodeValue;
	   }
       node = rdf.getElementsByTagNameNS(THREAD_NS, 'inReplyTo');
       attr = node[0].getAttributeNodeNS(RDF_SYNTAX_NS, 'resource');
	   if (attr) {
	   	this.about = attr.nodeValue;
	   }
     }
     
     node = rdf.getElementsByTagNameNS(ANNOTATION_NS, 'body');
     attr = node[0].getAttributeNodeNS(RDF_SYNTAX_NS, 'resource');
	 if (attr) {
	 	this.bodyURL = attr.nodeValue;
	 } 
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
     
     // body stores the contents of the html body tag as text
     this.body = getBodyContent(this.bodyURL);
     
    //Additional fields for revision annotations only 
	if (this.type.match(REVISION_ANNOTATION_NS)) {
		node = rdf.getElementsByTagNameNS(REVISION_ANNOTATION_NS, 'revised');
		if (node[0]) {
			attr = node[0].getAttributeNodeNS(RDF_SYNTAX_NS, 'resource');
			if (attr) {
				this.revised = attr.nodeValue;
			}
		}
		node = rdf.getElementsByTagNameNS(REVISION_ANNOTATION_NS, 'original');
		if (node[0]) {
			attr = node[0].getAttributeNodeNS(RDF_SYNTAX_NS, 'resource');
			if (attr) {
				this.original = attr.nodeValue;
			}
		}
		node = rdf.getElementsByTagNameNS(REVISION_ANNOTATION_NS, 'original-context');
		this.originalcontext = safeGetFirstChildValue(node);
		node = rdf.getElementsByTagNameNS(REVISION_ANNOTATION_NS, 'revised-context');
		this.revisedcontext = safeGetFirstChildValue(node);
		node = rdf.getElementsByTagNameNS(REVISION_ANNOTATION_NS, 'revision-agent');
		this.revisionagent = safeGetFirstChildValue(node);
		node = rdf.getElementsByTagNameNS(REVISION_ANNOTATION_NS, 'revision-place');
		this.revisionplace = safeGetFirstChildValue(node);
		node = rdf.getElementsByTagNameNS(REVISION_ANNOTATION_NS, 'revision-date');
		this.revisiondate = safeGetFirstChildValue(node);
	}
   }
   catch (ex) {
     var st = "Error parsing RDF" + (this.id ? ' for ' + this.id : '') +
              ':\n' + ex.toString();
     throw new Error(st);
   }
}

function createAnnotationRDF(anno)
{
	var rdfxml = "<?xml version=\"1.0\" ?>";
	rdfxml += '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">';
    rdfxml += '<rdf:Description';
    if (anno.id){
    	rdfxml += ' rdf:about="' + anno.id + '"';
    }
    rdfxml +=
    	'><rdf:type rdf:resource="http://www.w3.org/2000/10/annotation-ns#Annotation"/>';
    if (anno.type){
		rdfxml += '<rdf:type rdf:resource="' + anno.type + '"/>';
    }
	rdfxml += '<annotates xmlns="http://www.w3.org/2000/10/annotation-ns#" rdf:resource="' + anno.resource + '"/>';
	// also send revised as annotates for backwards compatability with older clients
	/* not currently supported in danno
	 * if (anno.revised){
		rdfxml += '<annotates xmlns="http://www.w3.org/2000/10/annotation-ns#" rdf:resource="' + anno.revised + '"/>';	
	}*/
	if (anno.lang){
		rdfxml += '<language xmlns="http://purl.org/dc/elements/1.0/">'+ anno.lang + '</language>';
	}
	if (anno.title){
		rdfxml += '<title xmlns="http://purl.org/dc/elements/1.0/">' + anno.title + '</title>';
	}
	if (anno.creator){
		rdfxml += '<creator xmlns="http://purl.org/dc/elements/1.0/">'+ anno.creator + '</creator>';
	}
	if (!anno.created){
		anno.created = new Date();
	}
	// TODO: format date strings
	rdfxml += '<created xmlns="http://www.w3.org/2000/10/annotation-ns#">'+ anno.created.toString() + '</created>';
	anno.modified = new Date();
	rdfxml += '<modified xmlns="http://www.w3.org/2000/10/annotation-ns#">' + anno.modified.toString() + '</modified>';
	if (anno.context){
		rdfxml += '<context xmlns="http://www.w3.org/2000/10/annotation-ns#">' + anno.context + '</context>';
	}
	if (anno.type == REVISION_ANNOTATION_NS + "RevisionAnnotation") {
		if (anno.originalcontext) {
			rdfxml += '<original-context xmlns="'+ REVISION_ANNOTATION_NS + '">' + anno.originalcontext + '</original-context>';
		}
		if (anno.revisedcontext) {
			rdfxml += '<revised-context xmlns="' + REVISION_ANNOTATION_NS + '">' + anno.revisedcontext + '</revised-context>';
		}
		if (anno.revisionagent) {
			rdfxml += '<revision-agent xmlns="http://austlit.edu.au/ontologies/2009/03/lit-annotation-ns#">' +
			anno.revisionagent +
			'</revision-agent>';
		}
		if (anno.revisionplace) {
			rdfxml += '<revision-place xmlns="http://austlit.edu.au/ontologies/2009/03/lit-annotation-ns#">' +
			anno.revisionplace +
			'</revision-place>';
		}
		if (anno.revisiondate) {
			rdfxml += '<revision-date xmlns="http://austlit.edu.au/ontologies/2009/03/lit-annotation-ns#">' +
			anno.revisiondate +
			'</revision-date>';
		}
		if (anno.original) {
			rdfxml += '<original xmlns="http://austlit.edu.au/ontologies/2009/03/lit-annotation-ns#" rdf:resource="' +
			anno.original +
			'"/>';
		}
		if (anno.revised) {
			rdfxml += '<revised xmlns="http://austlit.edu.au/ontologies/2009/03/lit-annotation-ns#" rdf:resource="' +
			anno.revised +
			'"/>';
		}
	}
	if (anno.body){
		rdfxml += '<body xmlns="http://www.w3.org/2000/10/annotation-ns#"><rdf:Description>'
    		+ '<ContentType xmlns="http://www.w3.org/1999/xx/http#">application/xhtml+xml</ContentType>'
    		+ '<Body xmlns="http://www.w3.org/1999/xx/http#" rdf:parseType="Literal">'
			+ '<html xmlns="' + XHTML_NS + '"><head><title>' + (anno.title? anno.title : 'Annotation') + '</title></head>'
			+ '<body>'
			+ anno.body.tidyHTML()
			+ '</body></html>'
			+ '</Body></rdf:Description>'
		+ '</body>';
	}
  	rdfxml += '</rdf:Description>'+ '</rdf:RDF>';
	return rdfxml;
}
/**
 * Creates an array of Annotations from a list of RDF nodes in ascending date
 * created order - unchanged from dannotate.js
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
function hideMarker(){
	if (annoMarker){
			// hide the marker
			annoMarker.style.display="none";
			annoMarker.innerHTML = "";
		}
}
/**
 * Inserts a marker after a selection range
 * for an annotation provided it does not already exist.
 * modified from dannotate.js
 * @param hRange W3C Range object for annotation selection
 * @return inserted marker node
 */
function decorate (hRange, annoID, context, color)
{
  var mainwindow = window.top.getBrowser().selectedBrowser.contentWindow;
  var mimetype = mainwindow.document.contentType;
  if (mimetype.match("html")){
  	var nodeToInsert;
  	if (!mainwindow.document.getElementById(annoID)) {
    	var targetNode = null;
    
    	targetNode = findAnchorNode(hRange, annoID, context);
    	// Visual marker is an img
    	nodeToInsert = mainwindow.document.createElementNS(XHTML_NS, "span");
    	var nodeAttr = mainwindow.document.createAttribute('style');
    	nodeAttr.value = 'display:inline;color:' + color;
    	nodeToInsert.setAttributeNode(nodeAttr);
  		m_xps.markElement(nodeToInsert);
    	m_xps.markElementHide(nodeToInsert);
    	nodeToInsert.innerHTML = "***";

    	targetNode.appendChild(nodeToInsert);
  	}
  }
  return nodeToInsert;
}
/**
 * Finds or creates a node to which our annotation marker may be attached.
 * If the end of selection range lies within a text node, split it at after the
 * end of the selection and insert a zero length span tag which becomes the
 * marker node to which the visible "footnote" is attached.
 * If the XPath selection is an Element node, that becomes the marker node.
 * modified from dannotate.js
 * @param range
 * @param ano
 * @return
 */
function findAnchorNode (range, annoID, context)
{
  var mainwindow = window.top.getBrowser().selectedBrowser.contentWindow;
  
  var endNode = range.endContainer;
  var parent = endNode.parentNode;
  var node = endNode;
  
  if (endNode.nodeType != node.TEXT_NODE) {
    node = parent;
  }
  else {
    var xpath = context;
    if (xpath.toLowerCase().indexOf('string-range') > 0) {
      var nextTextNode = endNode.splitText(range.endOffset);
      var markerNode = mainwindow.document.createElementNS(XHTML_NS, "span");
      // In case we need to locate them, the empty snap tags get
      // an ID related to the annotation ID with an 'A-' prefix.
      markerNode.id = 'A-' + annoID;
      parent.insertBefore(markerNode, nextTextNode);
      node = markerNode;
    }
  }
  return node;
}

function setVisibilityFormField(fieldName, hide){
	var thefield = annotationsform.findField(fieldName);
		if (thefield) {
			var cont = thefield.container.up('div.x-form-item');
			cont.enableDisplayMode();
			
			if (hide && cont.isVisible()) {
				cont.slideOut();
			} else if (!hide && !cont.isVisible()){
				cont.slideIn();
			}
		}
}
function hideFormFields(fieldNameArr){
	for (var i = 0; i < fieldNameArr.length; i++) {
		setVisibilityFormField(fieldNameArr[i], true);
	}
}
function showFormFields(fieldNameArr){
	for (var i = 0; i < fieldNameArr.length; i++) {
		setVisibilityFormField(fieldNameArr[i], false);
	}
}
function setRevisionFormUI(revision){
	var nonRevisionFields = ['context', 'resource'];
	var revisionFields = ['original', 'revised', 'originalcontext', 'revisedcontext', 'revisionagent', 'revisionplace', 'revisiondate'];
	if(revision){
		hideFormFields(nonRevisionFields);
		showFormFields(revisionFields);
	} else {
		showFormFields(nonRevisionFields);
		hideFormFields(revisionFields);
	}
}

var FRAME_WIDTH_CLEARANCE = 7;
var FRAME_HEIGHT_CLEARANCE = 50;

var LEFT_REVISION_CLEARANCE = 255;
var TOP_REVISION_CLEARANCE = 31;

var REVISIONS_FRAME_LOAD_WAIT = 250;

var TEST_XPATH_1 = 'xpointer(string-range(/html[1]/body[1]/div[1]/p[3], "", 92, 21))';
var TEST_XPATH_2 = 'xpointer(start-point(string-range(/html[1]/body[1]/div[2]/p[2], "", 143, 1))/range-to(end-point(string-range(/html[1]/body[1]/div[2]/p[2], "", 188, 1))))';
var TEST_XPATH_3 = 'string-range(/html[1]/body[1]/div[1]/p[3], "", 92, 21)';
var TEST_XPATH_4 = 'xpointer(/html[1]/body[1]/div[1]/p[3])';
var TEST_XPATH_5 = '/html[1]/body[1]/div[1]/p[3]';
var TEST_XPATH_6 = 'GARBAGE';
var TEST_XPATH_7 = 'xpointer(/html[1]/body[1])';

var TEST_VALID_XPATH = 'xpointer(string-range(/html[1]/body[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[2]/div[1]/div[1]/div[1]/div[1]/h1[1], "", 4, 5))';
var TEST_VALID_XPATH_LORECOMMON = 'xpointer(start-point(string-range(/html[1]/body[1]/div[1]/p[3], "", 134, 1))/range-to(end-point(string-range(/html[1]/body[1]/div[1]/p[3], "", 234, 1))))';
var TEST_VALID_XPATH_LORECOMMON_2 = 'xpointer(start-point(string-range(/html[1]/body[1]/div[8]/p[2], "", 185, 1))/range-to(end-point(string-range(/html[1]/body[1]/div[8]/p[2], "", 333, 1))))';

function onRevisionsShow(revisionsPanel) {
  if (consoleDebug) console.debug("render!");
  var targetPanel = Ext.getCmp("revisionannotationtarget");
  var sourcePanel = Ext.getCmp("revisionannotationsource");
  var listPanel = Ext.getCmp("revisionsleftcolumn");
  
  targetPanel.setSize(targetPanel.getSize().width, revisionsPanel.getSize().height);
  sourcePanel.setSize(sourcePanel.getSize().width, revisionsPanel.getSize().height);
  listPanel.setSize(listPanel.getSize().width, revisionsPanel.getSize().height);
  
  document.getElementById('revisionTargetFrame').style.width = targetPanel.getSize().width - FRAME_WIDTH_CLEARANCE;
  document.getElementById('revisionTargetFrame').style.height = targetPanel.getSize().height - FRAME_HEIGHT_CLEARANCE;
  
  document.getElementById('revisionSourceFrame').style.width = sourcePanel.getSize().width - FRAME_WIDTH_CLEARANCE;
  document.getElementById('revisionSourceFrame').style.height = sourcePanel.getSize().height - FRAME_HEIGHT_CLEARANCE;
}

function onRevisionListingClick(listingPanel, rowIndex){
	// alert (rowIndex);
	setRevisionFrameURLs(revisionInformation[rowIndex].sourceURL, revisionInformation[rowIndex].targetURL);
	setTimeout('highlightRevisionFrames (' + rowIndex + ')', REVISIONS_FRAME_LOAD_WAIT);
	
	try {
  	var detailsString = "";
  	
  	detailsString += '<span style="font-weight: bold">Creator:</span> ' + revisionInformation[rowIndex].creator + "<br />";
  	detailsString += '<span style="font-weight: bold">Created:</span> ' + revisionInformation[rowIndex].created + "<br />";
  	detailsString += '<span style="font-weight: bold">Agent:</span> ' + revisionInformation[rowIndex].agent + "<br />";
  	detailsString += '<span style="font-weight: bold">Place:</span> ' + revisionInformation[rowIndex].place + "<br />";
  	detailsString += '<span style="font-weight: bold">Date:</span> ' + revisionInformation[rowIndex].date + "<br />";
    detailsString += '<br/><span style="font-weight: bold; font-style: italic">Description:</span><br/> ' + revisionInformation[rowIndex].body + "<br />";
  	
  	var detailsDiv = document.getElementById('revisionsdetailstext');
  	detailsDiv.innerHTML = detailsString;
  } catch (error) {
		alert (error);
	}
}

function setRevisionFrameURLs(sourceURL, targetURL) {
  var sourceFrame = document.getElementById("revisionSourceFrame");
  var targetFrame = document.getElementById("revisionTargetFrame");
  
  sourceFrame.src = sourceURL;
  targetFrame.src = targetURL;
  
  var sourceLabel = document.getElementById("revisionSourceLabel");
  var targetLabel = document.getElementById("revisionTargetLabel");
  
  sourceLabel.innerHTML = sourceURL;
  targetLabel.innerHTML = targetURL;
}

function scrollToElement(theElement, theWindow){

  var selectedPosX = 0;
  var selectedPosY = 0;
              
  while(theElement != null){
    selectedPosX += theElement.offsetLeft;
    selectedPosY += theElement.offsetTop;
    theElement = theElement.offsetParent;
  }
                                  
 theWindow.scrollTo(selectedPosX,selectedPosY);
}

function highlightXPointer(xpointer, targetDocument, scrollToHighlight) {
  var sel = m_xps.parseXPointerToRange(xpointer, targetDocument);
  
  var highlightNode = targetDocument.createElementNS(XHTML_NS, "span");
  m_xps.markElement(highlightNode);
  m_xps.markElementHide(highlightNode);
  highlightNode.style.backgroundColor = "yellow";
  sel.surroundContents(highlightNode);
  if (scrollToHighlight) {
    scrollToElement(highlightNode, targetDocument.defaultView);
  }
  
  return highlightNode;
}

function highlightRevisionFrames(revisionNumber) {
  var sourceFrame = document.getElementById("revisionSourceFrame");
  var targetFrame = document.getElementById("revisionTargetFrame");

  highlightXPointer(revisionInformation[revisionNumber].sourceContext, sourceFrame.contentDocument, true);
	highlightXPointer(revisionInformation[revisionNumber].targetContext, targetFrame.contentDocument, true);
}

function testRevisionMarkers() {
  if (consoleDebug) console.debug('[testRevisionMarkers() begin]');
  var sourceFrame = document.getElementById("revisionSourceFrame");
  
  highlightXPointer(TEST_VALID_XPATH_LORECOMMON, sourceFrame.contentDocument, false);
  highlightXPointer(TEST_VALID_XPATH_LORECOMMON_2, sourceFrame.contentDocument, true);
  
  if (consoleDebug) console.debug('[testRevisionMarkers() end]');
}

function testParse() {
  if (consoleDebug) console.debug('[testParse() begin]'); 
  var sourceFrame = document.getElementById('revisionSourceFrame');
  var targetFrame = document.getElementById('revisionTargetFrame');
  
  if (consoleDebug) console.debug('Retrieved revision frame handles.');

  if (targetFrame.contentDocument) {
    if (consoleDebug) console.debug('Target frame has content document.');
  }
  // var sel = m_xps.parseXPointerToRange(TEST_VALID_XPATH, document);
  var sel = m_xps.parseXPointerToRange(TEST_XPATH_4, targetFrame.contentDocument);
  
  if (consoleDebug) console.debug('Parse result: ');
  if (consoleDebug) console.debug(sel);
  if (consoleDebug) console.debug('[testParse() end]');
}

function updateRevisionAnnotationList() {
	revisionStore.removeAll();
	
	// alert (annotabds.data.items.length);
	// dumpValues (annotabds.data.items[0].data);

  var revStoreData = [];
	
	for (var i = 0; i < annotabds.data.items.length; i++) {
		var revisionType = annotabds.data.items[i].data.type;
		
		// alert (revisionType);
		
		if (revisionType != 'http://austlit.edu.au/ontologies/2009/03/lit-annotation-ns#RevisionAnnotation') {
			continue;
		}
		// dumpValues(annotabds.data.items[i].data);
		revStoreData.push ([annotabds.data.items[i].data.title]);
		revisionInformation.push({
			creator: annotabds.data.items[i].data.creator,
			modified: annotabds.data.items[i].data.modified,
      created: annotabds.data.items[i].data.created,
      agent: annotabds.data.items[i].data.revisionagent,
      place: annotabds.data.items[i].data.revisionplace,
      date: annotabds.data.items[i].data.revisiondate,
			title: annotabds.data.items[i].data.title,
      body: annotabds.data.items[i].data.body,
      sourceURL: annotabds.data.items[i].data.original,
      targetURL: annotabds.data.items[i].data.revised,
      sourceContext: annotabds.data.items[i].data.originalcontext,
      targetContext: annotabds.data.items[i].data.revisedcontext,
		});
	}
	
	setRevisionFrameURLs('about:blank', 'about:blank');
	
  revisionStore.loadData (revStoreData);	
}

var revisionInformation = [];

var revisionStore = new Ext.data.SimpleStore({
  fields: [
   {name: "name"},
  ]
});

revisionStore.loadData([]);
