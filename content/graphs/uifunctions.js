	/* 
	 * UI functions
	 * 
	 * showRDFHTML: show RDF XML (as HTML) in RDF tab
	 * createRDF: create RDF XML string
	 * loadRDFFromRepos: load a resource map from the RDF repository
	 * loadRDF: load a resource map from a RDF URL
	 * loadRelationshipsFromOntology: populate relationship (connection) types from ontology
	 * setUpMetadataMenu: populate the property column header context menu to add metadata properties
	 * setdccreator: set the dc:creator property for the resource map
	 * setrelonturl: set the url for the ontology for the relationships (connections)
	 * setrdfrepos: set the url of the RDF repository
	 */
	

// properties that can be applied to aggregations, resource maps or aggregated resources
var metadata_props = ["dcterms:abstract",
		"dcterms:audience","dc:creator","dcterms:created",
		"dc:contributor","dc:coverage", "dc:description", "dc:format",
		"dcterms:hasFormat", "dc:identifier","dc:language","dcterms:modified","dc:publisher",
		"dc:rights","dc:source","dc:subject","dc:title"];
// properties that only make sense for aggregations
var aggre_metadata_props = ["ore:similarTo", "ore:isDescribedBy", "dcterms:references", "dcterms:replaces", "foaf:logo"];
// properties for aggregated resources (also populated from relationship ontology)
var resource_metadata_props = ["rdf:type", "ore:isAggregatedBy"];
var all_props = metadata_props.concat(aggre_metadata_props).concat(resource_metadata_props);
var namespaces = {"dc": "http://purl.org/dc/elements/1.1/",
	"dcterms":"http://purl.org/dc/terms/",
	"ore":"http://www.openarchives.org/ore/terms/",
	"foaf": "http://xmlns.com/foaf/0.1/"};


function showRDFHTML(){
	document.getElementById('rdfarea').innerHTML = createRDF(true);
}

function _serialise_property(propname, properties, ltsymb, nlsymb){
	// helper function for createRDF
	var result = "";
		var propval = properties[propname];
		if (propval != null && propval != ''){
			result =  ltsymb + propname + ">" + propval + ltsymb + "/" + propname + ">" + nlsymb;
		}
	return result;
}
function _splitTerm(theterm){
	// helper function to split a URL identifier into namespace and term
	var result = {};
	// try splitting on #
	var termsplit = theterm.split("#");
	if (termsplit.length > 1) {
		result.ns = (termsplit[0] + "#");
		result.term = termsplit[1];
	} else {
		// split after last slash
		var lastSlash = theterm.lastIndexOf('/');
		result.ns = theterm.substring(0,lastSlash + 1);
		result.term = theterm.substring(lastSlash + 1);
	}
	return result;
}

function _nsprefix(ns) {
	// helper function to lookup the prefix for a namespace URL eg dc:
	for (var prefix in namespaces) {
		if (namespaces[prefix] == ns)
			return prefix + ":";
	}
}
function createRDF(escape){
		var ltsymb = "<";
		var nlsymb = "\n";
		if (escape){
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
		var fullclosetag="\"/>" + nlsymb;
		var rdfdescclose = "/rdf:Description>";
		
		// create RDF for resource map: modified and creator are required
   		var rdfxml = ltsymb + "?xml version=\"1.0\" encoding=\"UTF-8\" ?>" + nlsymb +
   		ltsymb + "rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"" + nlsymb;
		for (var pfx in namespaces) {
			rdfxml += "xmlns:" + pfx + "=\"" + namespaces[pfx] + "\"" + nlsymb;
		}
		rdfxml += "xml:base = \"" + rdfabout + "\">" + nlsymb + 
   			ltsymb + rdfdescabout + rdfabout + closetag + 
   			ltsymb + "ore:describes rdf:resource=\"" + describes + fullclosetag  + 
   			ltsymb + "rdf:type rdf:resource=\"http://www.openarchives.org/ore/terms/ResourceMap\" />" + nlsymb +
   			ltsymb + "dc:creator rdf:resource=\"" + remprops["dc:creator"] + fullclosetag + 
   			ltsymb + "dcterms:modified rdf:datatype=\"http://www.w3.org/2001/XMLSchema#date\">" + 
			modifiedDate.getFullYear() + "-" + (modifiedDate.getMonth() + 1) + "-" + modifiedDate.getDate() +
   			ltsymb + "/dcterms:modified>" + nlsymb;
		var created = remprops["dcterms:created"];
		if (created != null && created instanceof Date){
			rdfxml += ltsymb + "dcterms:created rdf:datatype=\"http://www.w3.org/2001/XMLSchema#date\">" + 
			created.getFullYear() + "-" + (created.getMonth() + 1) + "-" + created.getDate() +
			ltsymb + "/dcterms:created>" + nlsymb;
		}
		for (var i = 0; i < metadata_props.length; i++){
			rdfxml += _serialise_property(metadata_props[i], remprops, ltsymb, nlsymb);
		}
		rdfxml += ltsymb + rdfdescclose + nlsymb;
		
		// create RDF for aggregation
		var aggreprops = aggregrid.getSource();
		rdfxml += ltsymb + rdfdescabout + describes + closetag +
		ltsymb + "rdf:type rdf:resource=\"" + aggreprops["rdf:type"] + fullclosetag;
		// TODO: any other types for aggregation eg Journal Article	

		for (var i = 0; i < all_props.length; i++){
			rdfxml += _serialise_property(all_props[i], aggreprops, ltsymb, nlsymb);
		}
		var allfigures = workflow.getDocument().getFigures();
		var resourcerdf = "";
		for (var i=0; i < allfigures.getSize(); i++){
			var fig = allfigures.get(i);
			var figurl = fig.url.replace('&','&amp;');
			rdfxml += ltsymb + "ore:aggregates rdf:resource=\"" + figurl + fullclosetag;
			// create RDF for resources in aggregation
			// TODO: resource properties eg dcterms:hasFormat, ore:isAggregatedBy
			for (var mprop in fig.metadataproperties) {
				if (mprop != 'Resource') {
					var mpropval = fig.metadataproperties[mprop];
					if (mpropval && mpropval != '') {
						resourcerdf += ltsymb + rdfdescabout + figurl + closetag + ltsymb +
						mprop + ">" + mpropval + ltsymb +
						"/" + mprop + ">" + nlsymb + ltsymb + rdfdescclose + nlsymb;
					}
				}
			}
			var outgoingconnections = fig.getPorts().get(1).getConnections();
			for (var j = 0; j < outgoingconnections.getSize(); j++) {
				var theconnector = outgoingconnections.get(j);
				var relpred = theconnector.edgetype;
				var relns = theconnector.edgens;
				var relobj = theconnector.targetPort.parentNode.url.replace('&','&amp;');
				resourcerdf += ltsymb + rdfdescabout + figurl +
				closetag +  ltsymb + relpred + " xmlns=\""+ relns + 
				"\" rdf:resource=\"" + relobj + fullclosetag + ltsymb + rdfdescclose + nlsymb;
			}
		}
		rdfxml += ltsymb + rdfdescclose + nlsymb;		
		rdfxml += resourcerdf;
		rdfxml += ltsymb + "/rdf:RDF>";
		return rdfxml;
};
   
function _read_property(theRDF, props, subj, theProp){
	// helper function for readRDF
	var propInfo = theProp.split(":");
	var propresult = theRDF.Match(null, subj, namespaces[propInfo[0]] + propInfo[1], null);
	if (propresult.length > 0) {
		props[theProp] = propresult[0].object;
	}
}
function readRDF(rdfURL){
   	theRDF = new RDF();
   	theRDF.getRDFURL(rdfURL, function(){
		var remurl = theRDF.Match(null, null, "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://www.openarchives.org/ore/terms/ResourceMap")[0].subject.toString();
		var creator = theRDF.Match(null,
			remurl,
			"http://purl.org/dc/elements/1.1/creator",
			null)[0].object;
		var createdResult = theRDF.Match(null,
			remurl,
			"http://purl.org/dc/terms/created",
			null);
		var created = "";
		if (createdResult.length > 0) {
			//TODO: check for minutes, seconds
			created = createdResult[0].object;
			var createdsplit = created.split("-");
			if (createdsplit.length == 3){
				created = new Date(createdsplit[0], createdsplit[1] - 1, createdsplit[2]);
			}
		}
		var theprops = {
			"rdf:about": remurl,
			"ore:describes": "#aggregation",
			"dc:creator": creator,
			"dcterms:modified": now,
			"dcterms:created": created,
			"rdf:type": "http://www.openarchives.org/ore/terms/ResourceMap"
		};
		// TODO: perhaps should read any property, not just those in the list?
		for (var i = 0; i < all_props.length; i++){
			_read_property(theRDF, theprops, remurl, all_props[i]);
		}
		grid.setSource(theprops);
		
		// create a node figure for each aggregated resource
		var aggregationID = remurl + "#aggregation";
			aggregates = theRDF.Match(null, aggregationID, "http://www.openarchives.org/ore/terms/aggregates",null);
		var resourcerels = new Array(0);
		for (var i=0; i < aggregates.length; i++){
			var resourceURL = aggregates[i].object;
			addFigure(resourceURL);
			// collect resource-resource relationships
			var matches = theRDF.Match(null, resourceURL, null, null);
			resourcerels = resourcerels.concat(matches);
						
		}
		var workflowdoc = workflow.getDocument();
		// create connection figures based on resource-resource relationships
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
				workflow.addFigure(c);
			} else if (srcfig) {
				// not a node relationship, show in the property grid
				srcfig.metadataproperties[_nsprefix(relresult.ns) + relresult.term] = resourcerels[j].object;
			}
		}
   	});
}
// TODO: add Fedora support
function loadRDFFromRepos(){
   	if (reposURL && reposType == 'sesame') {
   		Ext.Msg.show({
			title: 'Load RDF from Repository',
			buttons: Ext.MessageBox.OKCANCEL,
			msg: 'Please enter Resource Map identifier URL',
			prompt:true,
			fn: function(btn, remID) {
				if (btn == 'ok'){
					var queryStr = reposURL + "/statements?context=<" + remID + ">";
					readRDF(queryStr);
				}
			}
		})
	} else if (reposURL && reposType == 'fedora'){alert("Loading from Fedora not yet implemented");}
}
function loadRDF(){
   	Ext.Msg.show({
   		title: 'Load RDF',
		buttons: Ext.MessageBox.OKCANCEL,
   		msg: 'Please enter RDF file URL:',
   		fn: function(btn, theurl){
   			if (btn == 'ok') {
   				readRDF(theurl);
   			}
   		},
		prompt: true
   	});
}
   

function loadRelationshipsFromOntology(){
	// populate connection context menu with relationship types from the ontology
	// assumes a variable onturl (which is set from preferences)
	if (onturl) {

		var owlobjprop = "http://www.w3.org/2002/07/owl#ObjectProperty";
		var owldataprop = "http://www.w3.org/2002/07/owl#DatatypeProperty";
		
		var owltprop = "http://www.w3.org/2002/07/owl#TransitiveProperty";
		var owlsprop = "http://www.w3.org/2002/07/owl#SymmetricProperty";
		var rdftype = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
		var rdfsclass = "http://www.w3.org/2000/01/rdf-schema#Class";
		var ontRDF = new RDF();
		ontrelationships = {};
		ontRDF.getRDFURL(onturl, function(){
			//var test = ontRDF.Match(null, null, rdfsclass, null);
			var relResult = ontRDF.Match(null, null, rdftype, owlobjprop);
			for (var i = 0; i < relResult.length; i++) {
				var relresult = _splitTerm(relResult[i].subject);
				ontrelationships[relresult.term] = relresult.ns;
			}
			relResult = ontRDF.Match(null,null,rdftype,owldataprop);
			var tmp_resource_metadata = new Array(relResult.length);
			for (var i=0; i<relResult.length;i++){
				tmp_resource_metadata[i] = relResult[i].subject;
			}
			resource_metadata_props = resource_metadata_props.concat(tmp_resource_metadata);
		}, false, function(args){
			alert(args.status + "\n" + args.contentType);
			alert(args.content);
		});
	}
}

// TODO: implement Fedora support
function saveRDFToRepository() {
	var remid = grid.getSource()["rdf:about"];
	Ext.Msg.show({
   		title: 'Save RDF',
		buttons: Ext.MessageBox.OKCANCEL,
   		msg: 'Save this resource graph as ' + remid + "?",
   		fn: function(btn, theurl){
   			if (btn == 'ok') {
   				if (reposURL && reposType == 'sesame') {
					var therdf = createRDF(false);

					try {
						xmlhttp = new XMLHttpRequest();
						xmlhttp.open("PUT", reposURL + "/statements?context=<" + remid +">", true);
						xmlhttp.onreadystatechange = function(){
							if (xmlhttp.readyState == 4) {
								if (xmlhttp.status == 204) {
									Ext.Msg.show({title: 'RDF Saved', buttons: Ext.MessageBox.OKCANCEL, msg: (remid + " saved to " + reposURL)});
								}
								else {
									Ext.Msg.show({title: 'Problem saving RDF', buttons: Ext.MessageBox.OKCANCEL, msg: ('There was an problem saving the RDF: ' + xmlhttp.responseText)});
								}
							}
						}
						xmlhttp.setRequestHeader("Content-Type", "application/rdf+xml");
						xmlhttp.send(therdf);
					} 
					catch (e) {
						xmlhttp = false;
					}
				} else if (reposURL && reposType == 'fedora'){
						alert("Saving to Fedora not yet implemented");
				}
   			}
   		}
   	});
}
function setdccreator(creator){
   	var remprops = grid.getSource();
	remprops["dc:creator"] = creator;
	grid.setSource(remprops);	
}
function setrelonturl(relonturl){
   onturl = relonturl;
}
function setrdfrepos(rdfrepos, rdfrepostype){
	reposURL = rdfrepos;
	reposType = rdfrepostype;
}
function _make_menu_entry(menu, gridname, propname){
// helper function for setUpMetadataMenu
	var funcstr = "var props = " + gridname + ".getSource();"
	funcstr += "if (props && !props[\"" + propname + "\"]){";
	funcstr += "props[\"" + propname + "\"] = \"\";";
	funcstr += gridname + ".setSource(props);}";
	menu.add( {
        id: menu.id + "-add-" + propname,
        text: propname,
        handler: new Function(funcstr)
    });
} 
function setUpMetadataMenu (the_grid, gridname){
	// create context menu to add additional metadata properties to property grid
	var metadataMenu = new Ext.menu.Menu({id:gridname + "-metadata-menu"});
	if (gridname == "aggregrid"){
		for (var i = 0; i < aggre_metadata_props.length; i++){
			_make_menu_entry(metadataMenu, gridname, aggre_metadata_props[i]);
		}
	}
	for (var i = 0; i < metadata_props.length; i++){
		_make_menu_entry(metadataMenu, gridname, metadata_props[i]);
	}
	if (gridname == "nodegrid"){
		for (var i = 0; i < resource_metadata_props.length; i++){
			_make_menu_entry(metadataMenu, gridname, resource_metadata_props[i]);
		}
	}
	the_grid.getView().hmenu.add({id: 
		gridname + "metadata", text: "Add metadata", menu: metadataMenu});
}

