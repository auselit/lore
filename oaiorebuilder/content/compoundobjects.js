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
lore.ore.updateRDFHTML = function() {
    lore.ui.rdftab.body.update(lore.ore.createRDF(true));
}
/**
 * Remove listeners and reference to RDF View if it is closed
 * 
 * @param {Object} tabpanel
 * @param {Object} panel
 */
lore.ore.closeRDFView = function(tabpanel, panel) {
    // remove listeners
    if (panel.id == 'remrdfview') {
        lore.ui.rdftab.un("activate", lore.ore.updateRDFHTML);
        lore.ui.rdftab.un("close", lore.ore.closeRDFView);
        lore.ui.rdftab = null;
    }
}
/**
 * Create or show the RDF View
 */
lore.ore.openRDFView = function() {
    lore.ui.loreviews.activate("compoundobjecteditor");
    if (!lore.ui.rdftab) {
        lore.ui.compoundobjecttab.add({
                    title : 'RDF/XML',
                    id : "remrdfview",
                    autoScroll : true,
                    closable : true
                }).show();

        lore.ui.rdftab = Ext.getCmp('remrdfview');
        lore.ui.rdftab.on("activate", lore.ore.updateRDFHTML);
        lore.ui.rdftab.on("close", lore.ore.closeRDFView);
        lore.ore.updateRDFHTML();
    } else {
        lore.ui.compoundobjecttab.activate('remrdfview');
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
        newsummary += "<li><a target='_blank' href='" + figurl + "'>" + figurl
                + "</a></li>";
    }
    newsummary += "</ul></div>";
    lore.ui.summarytab.body.update(newsummary);
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
    lore.ui.smiltab.body.update(smilcontents);
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
            + ltsymb + 'rdf:RDF xmlns:rdf="' + lore.constants.RDF_SYNTAX_NS
            + '"' + nlsymb;
    for (var pfx in lore.constants.NAMESPACES) {
        rdfxml += "xmlns:" + pfx + "=\"" + lore.constants.NAMESPACES[pfx]
                + "\"" + nlsymb;
    }
    rdfxml += "xml:base = \"" + rdfabout + "\">" + nlsymb + ltsymb
            + rdfdescabout + rdfabout + closetag + ltsymb
            + "ore:describes rdf:resource=\"" + describes + fullclosetag
            + ltsymb + 'rdf:type rdf:resource="' + lore.constants.RESOURCE_MAP
            + '" />' + nlsymb + ltsymb + 'dcterms:modified rdf:datatype="'
            + lore.constants.XMLSCHEMA_NS + 'date">'
            + modifiedDate.getFullYear() + "-" + (modifiedDate.getMonth() + 1)
            + "-" + modifiedDate.getDate() + ltsymb + "/dcterms:modified>"
            + nlsymb;
    var created = remprops["dcterms:created"];
    if (created != null && created instanceof Date) {
        rdfxml += ltsymb + 'dcterms:created rdf:datatype="'
                + lore.constants.XMLSCHEMA_NS + 'date">'
                + created.getFullYear() + "-" + (created.getMonth() + 1) + "-"
                + created.getDate() + ltsymb + "/dcterms:created>" + nlsymb;
    }
    for (var i = 0; i < lore.ore.METADATA_PROPS.length; i++) {
        var theprop = lore.ore.METADATA_PROPS[i];
        if (theprop != 'dcterms:modified') {
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
        if (objframe) {
            resourcerdf += ltsymb + "layout:scrollx>" + objframe.scrollX
                    + ltsymb + "/" + "layout:scrollx>" + nlsymb + ltsymb
                    + "layout:scrolly>" + objframe.scrollY + ltsymb + "/"
                    + "layout:scrolly>" + nlsymb;
        }
        resourcerdf += ltsymb + rdfdescclose + nlsymb;

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
            // var relobj =
            // theconnector.targetPort.parentNode.url.replace('<','%3C').replace('>','%3E').escapeHTML();
            // resourcerdf += ltsymb + rdfdescabout +
            // figurl.replace('<','%3C').replace('>','%3E').escapeHTML() +
            // closetag + ltsymb
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
 * Loads a resource map from a URL into the graphical view and property panels
 * 
 * @param {String} rdfURL The direct URL to the RDF (eg restful web service on repository that returns RDF)
 */
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

    lore.ui.loreviews.activate("compoundobjecteditor");
    lore.ui.compoundobjecttab.activate("drawingarea");
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
                    "dcterms:modified" : new Date(),
                    "dcterms:created" : created,
                    "rdf:type" : lore.constants.RESOURCE_MAP
                };
                // TODO: perhaps should read any property, not just those in the
                // list?
                for (var i = 0; i < lore.ore.all_props.length; i++) {
                    read_property(theRDF, theprops, remurl,
                            lore.ore.all_props[i]);
                }
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
                        var fig = lore.ore.graph.addFigureXY(resourceURL,
                                parseInt(x), parseInt(y));
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
                lore.ui.loreInfo("Resource map loaded");
                var recentNode = new Ext.tree.TreeNode({
                    text : rdfURL,
                    iconCls : 'oreresult',
                    leaf : true
                });
                var childNodes = lore.ui.recenttreeroot.childNodes;
                if (childNodes.length >= 5) {
                    lore.ui.recenttreeroot
                        .removeChild(lore.ui.recenttreeroot.firstChild);
                }
                lore.ui.recenttreeroot.appendChild(recentNode);
                recentNode.on('dblclick', function(node) {
                    lore.ore.readRDF(node.text);
                });
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
                msg : 'Please enter RDF file URL:',
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
    // Properties for aggregated resources (also populated from ontology)
    lore.ore.resource_metadata_props = ["rdf:type", "ore:isAggregatedBy"];
    if (lore.ore.onturl) {
        var ontRDF = new RDF();
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
                });
    }
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
                        xmlhttp.open("PUT",
                                lore.ore.reposURL + "/statements?context=<"
                                        + remid + ">", true);
                        xmlhttp.onreadystatechange = function() {
                            if (xmlhttp.readyState == 4) {
                                if (xmlhttp.status == 204) {
                                    lore.ui.loreInfo(remid + " saved to "
                                            + lore.ore.reposURL);
                                } else {
                                    lore.ui
                                            .loreError('Unable to save to repository'
                                                    + xmlhttp.responseText);
                                    Ext.Msg.show({
                                        title : 'Problem saving RDF',
                                        buttons : Ext.MessageBox.OKCANCEL,
                                        msg : ('There was an problem saving the RDF: ' + xmlhttp.responseText)
                                    });
                                }
                            }
                        };
                        xmlhttp.setRequestHeader("Content-Type",
                                "application/rdf+xml");
                        xmlhttp.send(therdf);
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
    lore.ore.loadRelationshipsFromOntology();
}
/**
 * Helper function for updateSourceLists: updates the compound objects list with
 * objects that reference the contextURL
 * 
 * @param {}
 *            contextURL The escaped URL
 */
lore.ore.updateCompoundObjectsSourceList = function(contextURL) {
    lore.ui.clearTree(lore.ui.remstreeroot);
    if (lore.ore.reposURL && lore.ore.reposType == 'sesame') {
        var escapedURL = escape(contextURL);
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
                            lore.debug.ore("processing compound object", theobj);
                            var tmpNode = new Ext.tree.TreeNode({
                                        text : theobj.title,
                                        id : theobj.uri,
                                        qtip: "Created by " + theobj.creator + ", " + theobj.created,
                                        iconCls : 'oreresult',
                                        leaf : true
                                    });
                            lore.ui.remstreeroot.appendChild(tmpNode);
                            tmpNode.on('dblclick', function(node) {
                                lore.ore.readRDF(node.id);
                                
                            });

                            tmpNode.on('contextmenu', function(node, e) {
                                if (!node.contextmenu) {
                                    node.contextmenu = new Ext.menu.Menu({
                                                id : node.id + "-context-menu"
                                            });
                                    node.contextmenu.add({
                                        text : "Add to compound object",
                                        handler : function(evt) {
                                            lore.ore.graph
                                                    .addFigure(lore.ore.reposURL
                                                            + "/statements?context=<"
                                                            + node.id + ">");
                                        }
                                    });
                                    node.contextmenu.add({
                                        text : "Load in Compound Object Editor",
                                        handler : function(evt) {
                                            lore.ore.readRDF(node.id);
                                        }
                                    });
                                }
                                node.contextmenu.showAt(e.xy);
                            });

                        }
                        if (!lore.ui.remstreeroot.isExpanded()) {
                            lore.ui.remstreeroot.expand();
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
 * Add a figure to the graphical view to represent a resource at co-ordinates
 * X,Y
 * 
 * @param {}
 *            theURL The URL of the resource to be represented by the node
 * @param {}
 *            x The X co-ordinate
 * @param {}
 *            y The Y co-ordinate
 * @return {} The new figure
 */
lore.ore.graph.addFigureXY = function(theURL, x, y) {
    var fig = null;
    if (lore.ore.graph.lookup[theURL] == null) {
        fig = new lore.ore.graph.ResourceFigure();
        fig.setDimension(220, 170);
        fig.setTitle("Resource");
        fig.setContent(theURL);
        lore.ore.graph.Graph.addFigure(fig, x, y);
        lore.ore.graph.lookup[theURL] = fig.getId();
        lore.ui.loreviews.activate("compoundobjecteditor");
        lore.ui.compoundobjecttab.activate("drawingarea");
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
    var fig = lore.ore.graph.addFigureXY(theURL, lore.ore.graph.dummylayoutx,
            lore.ore.graph.dummylayouty);
    if (fig != null) {
        lore.ore.graph.nextXY();
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
        var stylesheetURL = "chrome://lore/content/stylesheets/ORE2SMIL.xsl";
        var xsltproc = new XSLTProcessor();

        // get the stylesheet - this has to be an XMLHttpRequest because Ext.Ajax.request fails on chrome urls
        var xhr = new XMLHttpRequest();
        xhr.overrideMimeType('text/xml');
        xhr.open("GET", stylesheetURL, false);
        xhr.send(null);
        var stylesheetDoc = xhr.responseXML;
        xsltproc.importStylesheet(stylesheetDoc);
        xsltproc.setParameter(null, "indent", "yes");
        // get the compound object xml
        var theRDF = lore.ore.createRDF(false);
        var parser = new DOMParser();
        var rdfDoc = parser.parseFromString(theRDF, "text/xml");
        var resultDoc = xsltproc.transformToFragment(rdfDoc, document);
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

lore.ore.handleNodePropertyChange = function(source, recid, newval, oldval) {
    // update the metadataproperties recorded in the figure for that node
    lore.ore.graph.modified = true;
    var theval;
    if (recid == 'Resource') {
        // the URL of the resource has changed
        if (newval && newval != '') {
            theval = newval;
        } else {
            theval = "about:blank";
            if (lore.ore.graph.lookup[theval]) {
                lore.ui
                        .loreWarning("Cannot change resource URL: a node already exists for "
                                + theval);
                lore.ore.graph.selectedFigure.setContent("about:blank");
            } else {
                lore.ore.graph.lookup[theval] = lore.ore.graph.selectedFigure
                        .getId();
            }
        }
        delete lore.ore.graph.lookup[oldval];
    }
    if (recid == 'dc:title') {
        // update figure title
        lore.ore.graph.selectedFigure.setTitle(newval);
    }
    lore.ore.graph.selectedFigure.updateMetadata(source);
}
