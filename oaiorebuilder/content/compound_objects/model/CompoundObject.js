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
Ext.namespace("lore.ore.model");

/** @class lore.ore.model.CompoundObject
 * Model class representing a compound object */
lore.ore.model.CompoundObject = Ext.extend(Ext.util.Observable, {
    constructor: function(config){
        config = config || {};
        this.uri = config.uri || "";
	    lore.ore.model.CompoundObject.superclass.constructor.call(this, config);
        /** The compound object properties */
        this.properties = new lore.ore.model.ResourceProperties(); 
        /** Store of aggregated resources */
        this.aggregatedResourceStore = new Ext.data.JsonStore({
        	    co: this,
                idProperty: "uri",
                sortInfo: {
                    field: "index",
                    direction: "asc"
                },
                fields: [
                    {name: 'uri', type:'string', allowBlank: false}, // aggregated resource URI
                    {name: 'title', type: 'string'}, // aggregated resource title
                    {name: 'index', type: 'int', defaultValue: '1000'}, // for storing order information, large default value ensures resources are initially added at the end
                    {name: 'representsCO', type: 'boolean', defaultValue: false}, // indicates if this represents a nested compound object
                    {name: 'representsAnno',type: 'boolean', defaultValue: false}, // indicates if this represents an annotation
                    {name: 'properties'} // all other properties, key is property uri, value is array of Property objects
                ] 
        });
        
        this.addEvents(
            'addAggregatedResource', 
            'removeAggregatedResource',
            'loaded'
        );
        /** rdfquery object representing content loaded or since last save (or empty for new CO) */
        this.loadedContent = {};
        this.aggregationURI = "#aggregation";
	},
    getInitialContent : function(){
        return this.loadedContent;  
    },
	getAggregatedResource : function(/*String*/ aUri){
        var res = this.aggregatedResourceStore.getById(aUri);
        if (res){
            return res;
        } else {
            lore.debug.ore("CompoundObject: resource not found " + aUri, this.aggregatedResourceStore);
        }
	},
	
	/** Add a resource to the compound object
	 * @param {} config The properties of the resource to add
	 * @return {} The aggregated resources
	 */
	addAggregatedResource : function(config){
      this.aggregatedResourceStore.loadData([config],true);
      //this.fireEvent('addAggregatedResource',config);
	  
	},
	
	/** Remove a resource from the compound object
	 * @param {} aUri The resource to remove
	 * @return {} The aggregated resources
	 */
	removeAggregatedResource : function (aUri){
      //this.fireEvent('removeAggregatedResource',aResource);
      var rec = this.aggregatedResourceStore.getById(aUri);
      if (rec) {
        this.aggregatedResourceStore.remove(rec);
      }
	  
	},
	toString : function(){
	    return "Compound Object " + this.uri + " contains " + this.aggregatedResourceStore.getTotalCount() + " resources";    
	},
    /** Load from a variety of formats eg JSON, RDF/XML etc
     * 
     * @param {} args
     * format eg applicaiton/rdf+xml
     * content eg XML object
     */
    load : function (args) {
        var getDatatype = function(propurl, theType){
              var dtype = theType;
              //lore.debug.ore("getdatatype " + propname + " is " + dtype,propvalue);
              if (dtype && dtype._string == "http://purl.org/dc/terms/W3CDTF"){
                dtype = "date";
              } else if (dtype && dtype == lore.constants.NAMESPACES["layout"]+"escapedHTMLFragment"){
                dtype = "html";
              } else {
                dtype = "plainstring";
                // Allow formatting for some fields
                if (propurl == lore.constants.NAMESPACES["dcterms"] + "abstract" || propurl == lore.constants.NAMESPACES["dc"] + "description"){
                    dtype = "string";
                }
              }
              return dtype;
          };
        var oThis = this;
        this.suspendEvents();
        // Load from RDF/XML
        if (args.format == 'application/rdf+xml'){
            var databank = jQuery.rdf.databank();
	        for (ns in lore.constants.NAMESPACES){
	            databank.prefix(ns,lore.constants.NAMESPACES[ns]);
	        }
	        databank.load(args.content);
            this.loadedContent = jQuery.rdf({databank: databank});
        } else if (args.format == 'rdfquery'){
            this.loadedContent = args.content;
        }
        var newResources = [];
        if (this.loadedContent){
            var remQuery = this.loadedContent.where('?aggre rdf:type ore:Aggregation')
                .where('?rem ore:describes ?aggre');

            var res = remQuery.get(0);
	        if (res){
	           this.uri = res.rem.value.toString();
	           this.aggregationURI = res.aggre.value.toString();
	        }  else {
	            lore.ore.ui.vp.warning("No compound object found");
	            lore.debug.ore("no remurl found in RDF",[args.content, this.loadedContent]);
                // TODO: throw some kind of error
	        }
            
            // Load properties for this Compound Object
            this.loadedContent.about('<' + this.uri + '>')
            .each(function(){
                try {
                var propurl = this.property.value.toString();
                var propsplit = lore.global.util.splitTerm(propurl); 
                var propval = this.value.value;
                var propData = {
                    id: propurl,
                    ns: propsplit.ns,
                    name: propsplit.term,
                    prefix: lore.constants.nsprefix(propsplit.ns)
                };
                var dt = this.value.datatype;
                if (dt){
                    var dtString = dt.toString();
                    propData.type = getDatatype(propurl, dtString);
                    if (dtString == lore.constants.NAMESPACES["dcterms"] + "W3CDTF"){
                        propData.value = Date.parseDate(propval,'c');
                    } else if (dtString == lore.constants.NAMESPACES["xsd"] + "date") {
                        propData.value = Date.parseDate(propval,'Y-m-d');
                    } 
                    // TODO: #10 handle other data types?
                } else if (propurl == lore.constants.NAMESPACES["dcterms"] + "created" || propurl == lore.constants.NAMESPACES["dcterms"] + "modified"){
                    // try to parse dcterms:created and dcterms:modified as dates, even if they don't have a datatype
                    var modDate = Date.parseDate(propval,'c') || Date.parseDate(propval,'Y-m-d');
                    if (modDate){
                        propData.value = modDate;
                    }
                }  
                if (!propData.value) {
                    propData.value = propval;
                }
                oThis.properties.setProperty(propData);
                } catch (e){
                    lore.debug.ore("Error loading compound object properties",e);
                }
            });
            
        // create a Resource object for each aggregated resource
        this.loadedContent.where('<' + this.aggregationURI  + '> ore:aggregates ?url')
            .optional('?url rdf:type ?rdftype')
            .each(function() {
	             var resourceURL = this.url.value.toString();
                 var resourceData = {uri: resourceURL, properties: new lore.ore.model.ResourceProperties()};
	             if (this.rdftype && this.rdftype.value.toString() == lore.constants.RESOURCE_MAP){
	                // TODO: check if it has been cached or load?
                    resourceData.representsCO = true;
	             }  else if(this.rdftype && (this.rdftype.value.toString().match('http://www.w3.org/2000/10/annotation') || this.rdftype.value.toString().match('http://www.w3.org/2001/12/replyType'))){
                    resourceData.representsAnno = true;
                 }
	             // TODO: Load aggregated resource predicates (properties and rels)
	             oThis.loadedContent.about('<' + resourceURL + '>')
                    .each(function() {
                        var propurl = this.property.value.toString();
                        var propsplit = lore.global.util.splitTerm(propurl);
                        var prefix = lore.constants.nsprefix(propsplit.ns);
                        
                        if ((prefix == "dc" || prefix == "dcterms") && propsplit.term == "title"){
                            resourceData.title = this.value.value;
                        }
                        if (prefix == "layout" && propsplit.term == "orderIndex") {
                        	resourceData.index = this.value.value;
                        } 

                        
                        var theval = this.value.value;
                        // TODO: handle bnode values
                       /* if (this.value.type == "bnode"){
                            lore.debug.ore("looking up bnode " + this.value.value)
                            oThis.loadedContent.about(this.value.value).each(function(){
                                lore.debug.ore("matched bnode",this);
                            });
                            theval = "";
                        } */
                        
                        resourceData.properties.setProperty({
                           id: propurl,
                           ns: propsplit.ns,
                           name: propsplit.term,
                           value: theval,
                           prefix: prefix,
                           type: getDatatype(propurl,this.value.datatype)
                        });
                    }
                 );   
                 newResources.push(resourceData);
            }
        );    
        }
        this.resumeEvents();
        this.fireEvent('loaded', this);
        this.aggregatedResourceStore.loadData(newResources); 
    },
    /** 
     * Compare with another compound object model object to determine whether they have the same properties, 
     * aggregated resources, resource properties and relationships
     * 
     * @param {lore.ore.model.CompoundObject} co
     * @return True if they have identical contents
     */
    sameAs : function (co) {
        var isEqual = function(o1,o2){
            
        };
        if (!(co instanceof lore.ore.model.CompoundObject)){
            return false;
        }
            
        if (isEqual(this, co) !== true){
            return false;
        }
        if (isEqual(co, this) !== true){
            return false;
        }
            
        return true;
    },
    /**
     * Serialize to RDF/XML using older method (eg from figures).
     * FIXME: needs to use model rather than grid/figures
     * @param {Boolean} escape Indicates whether to escape the results for rendering as HTML
     * @return {String} The RDF/XML as a string
     */
    toRDFXML : function(/*boolean*/escape) {
        /*
         * Helper function that serializes a property to RDF/XML propname The name
         * of the property to serialize properties All of the properties ltsymb Less
         * than symbol nlsymb New line symbol returns The RDF/XML representation of
         * the property
         */
        var serialize_property = function(propname, propval, proptype, ltsymb, nlsymb) {
            var result = "";
            try{
                if (propval && propval != '') {
                    if (propname == "dc:subject" && propval.match(',')){ 
                        // value needs to be split
                        var vals = propval.split(",");
                        for (var v = 0; v < vals.length; v++){
                            result += serialize_property(propname, vals[v], proptype, ltsymb, nlsymb);
                        }
                        return result;
                    }
                    if (propval.match("^http://") == "http://"){
                        // this is a resource
                        result = ltsymb + propname + " rdf:resource='" + 
                        lore.global.util.preEncode(lore.global.util.normalizeUrlEncoding(propval.toString())).replace(/&/g,'&amp;')
                        + "'/>" + nlsymb;
                    } else {
                        // literal
                        result = ltsymb + propname;
                        if (proptype && proptype == "html"){
                            result += " rdf:datatype=\"" + lore.constants.NAMESPACES["layout"]+ "escapedHTMLFragment\""
                        }
                        result += ">"
                          + lore.global.util.escapeHTML(propval.toString().replace(/"/g,"&quot;"))
                          + ltsymb + "/" + propname + ">" + nlsymb;
                    }
                    
                }
            } catch (e) {
                lore.debug.ore("Problem serializing property",e);
            }
            return result;
        };
        try{
        var ltsymb = "<";
        var nlsymb = "\n";
        if (escape) {
            ltsymb = "&lt;";
            nlsymb = "<br/>";
        }
        // TODO: check whether CO has been modified before changing the date
        var modifiedDate = new Date();
        var proprecidx = lore.ore.ui.grid.store.find("name","dcterms:modified");
        if (proprecidx != -1){
           lore.ore.ui.grid.store.getAt(proprecidx).set("value", modifiedDate);
           lore.ore.ui.grid.store.commitChanges();
        }
        var rdfabout = lore.ore.ui.grid.getPropertyValue(lore.ore.controller.REM_ID_PROP);
        
        // Load existing aggregation id if any from original RDF
        var describedaggre = "#aggregation";
        var loadedRDF = this.loadedContent;
        //lore.debug.ore("loadedRDF is",loadedRDF);
        var existingAggre = !lore.global.util.isEmptyObject(loadedRDF);
        if (existingAggre) {
            var remQuery = loadedRDF.where('?aggre rdf:type ore:Aggregation')
                .where('<'+ rdfabout +'> ore:describes ?aggre');
            if (remQuery.get(0)){
                describedaggre = remQuery.get(0).aggre.value.toString();
            } else {
                lore.debug.ore("Could not find aggre",remQuery);
            }
        }
    
    
    
        // RDF fragments
        var rdfdescabout = "rdf:Description rdf:about=\"";
        var closetag = "\">" + nlsymb;
        var fullclosetag = "\"/>" + nlsymb;
        var rdfdescclose = "/rdf:Description>";
    
        // create RDF for resource map: modified is required
        var rdfxml = ltsymb + "?xml version=\"1.0\" encoding=\"UTF-8\" ?>" + nlsymb
                + ltsymb + 'rdf:RDF ' + nlsymb;
        for (var pfx in lore.constants.NAMESPACES) {
            rdfxml += "xmlns:" + pfx + "=\"" + lore.constants.NAMESPACES[pfx]
                    + "\"" + nlsymb;
        }
        
        var modifiedString = modifiedDate.format('c');
        rdfxml += "xml:base = \"" + rdfabout + "\">" + nlsymb + ltsymb
                + rdfdescabout + rdfabout + closetag + ltsymb
                + "ore:describes rdf:resource=\"" + describedaggre + fullclosetag
                + ltsymb + 'rdf:type rdf:resource="' + lore.constants.RESOURCE_MAP
                + '" />' + nlsymb + ltsymb + 'dcterms:modified rdf:datatype="'
                + lore.constants.NAMESPACES["dcterms"] + 'W3CDTF">' 
                + modifiedString + ltsymb + "/dcterms:modified>"
                + nlsymb;
        var created = lore.ore.ui.grid.getPropertyValue("dcterms:created");
        
        if (created && Ext.isDate(created)) {
            rdfxml += ltsymb + 'dcterms:created rdf:datatype="' 
            + lore.constants.NAMESPACES["dcterms"] + 'W3CDTF">'
            + created.format('c') + ltsymb + "/dcterms:created>" + nlsymb;
        }   
         else if (created) {
            rdfxml += ltsymb + 'dcterms:created>'// rdf:datatype="'
                    //+ lore.constants.NAMESPACES["xsd"] + 'date">'
                    + created + ltsymb + "/dcterms:created>" + nlsymb;
        }
        // serialize remaining compound object properties
        lore.ore.ui.grid.store.each(function (rec){
           var propname = rec.id.substring(0,rec.id.indexOf("_"));
           var proptype = rec.get("type");
           if (propname != 'dcterms:modified' && propname != 'dcterms:created' && propname != 'rdf:about'){
            rdfxml += serialize_property(propname, rec.data.value, proptype, ltsymb, nlsymb);
           }
        });
        rdfxml += ltsymb + rdfdescclose + nlsymb;
        // create RDF for aggregation
        rdfxml += ltsymb + rdfdescabout + describedaggre + closetag + ltsymb
                + "rdf:type rdf:resource=\"" + lore.constants.NAMESPACES["ore"] + "Aggregation"
                + fullclosetag;
        rdfxml += ltsymb + 'dcterms:modified>' + modifiedString + ltsymb + "/dcterms:modified>" + nlsymb;
        // Load original aggregation properties if any
        // LORE does not support editing these, but should preserve them
        // TODO: REFACTOR!! this code appears several times : properties should be serialized from model
        if (existingAggre){
            var aggreprops = loadedRDF.where('<' + describedaggre + '> ?pred ?obj')
                .filter(function(){
                    // filter out ore:aggregates, type and modified
                    if (this.pred.value.toString() === lore.constants.NAMESPACES["ore"] + "aggregates" ||
                        this.pred.value.toString() === lore.constants.NAMESPACES["rdf"] + "type" ||
                        this.pred.value.toString() === lore.constants.NAMESPACES["dcterms"] + "modified") {
                            return false;
                    }
                    else {
                        return true;
                    }
                })
                .each(function(){  
                    
                    var presult = lore.global.util.splitTerm(this.pred.value.toString());
                    var propval = this.obj.value.toString();
                    var propname = presult.term;
                    var propnsdec = ' xmlns="' + presult.ns + '"';
                    //lore.debug.ore("matched aggregation prop",this);
                    if (this.obj.type == 'uri'){
                        rdfxml += ltsymb + propname + propnsdec + " rdf:resource='" + 
                        lore.global.util.escapeHTML(propval.toString().replace(/"/g,"&quot;"))
                        + "'/>" + nlsymb;
                    } else {
                        rdfxml += ltsymb + propname + propnsdec + ">"
                        + lore.global.util.escapeHTML(propval.toString().replace(/"/g,"&quot;"))
                        + ltsymb + "/" + propname + ">" + nlsymb;
                    }
                });
        }
        var allfigures = lore.ore.ui.graphicalEditor.coGraph.getFiguresSorted();
        
        var resourcerdf = "";
        for (var i = 0; i < allfigures.length; i++) {
            var fig = allfigures[i];
            if (fig instanceof lore.ore.ui.graph.ResourceFigure){
                var figurl = lore.global.util.preEncode(lore.global.util.normalizeUrlEncoding(fig.url.toString())).replace(/&/g,'&amp;');
                rdfxml += ltsymb + "ore:aggregates rdf:resource=\"" + figurl
                        + fullclosetag;
                // create RDF for resources in aggregation
                for (var mprop in fig.metadataproperties) {
                    if (mprop != 'resource_0' && !mprop.match('undefined')) {
                        var mpropval = fig.metadataproperties[mprop];
                        if (mpropval && mpropval != '') {
                            var tagname = mprop;
                            var midx = mprop.indexOf("_");
                            if (midx != -1){
                                tagname = mprop.substring(0,midx);
                            }
                            var ptype = fig.getPropertyType(mprop);
                            resourcerdf +=  ltsymb + rdfdescabout + figurl + closetag;
                            resourcerdf += serialize_property(tagname, mpropval, ptype, ltsymb, nlsymb);
                            resourcerdf += ltsymb + rdfdescclose + nlsymb;
                        }
                    }
                }
                /* persist node layout */
        
                var objframe = window.top.frames[fig.url + "-data"];
                //lore.debug.ore("window.top.frames",window.top.frames)
                
                resourcerdf += ltsymb + rdfdescabout + figurl + closetag + ltsymb
                        + "layout:x rdf:datatype=\"xsd:int\">" + fig.x + ltsymb + "/" + "layout:x>" + nlsymb
                        + ltsymb + "layout:y rdf:datatype=\"xsd:int\">" + fig.y + ltsymb + "/" + "layout:y>"
                        + nlsymb + ltsymb + "layout:width rdf:datatype=\"xsd:int\">" + fig.width + ltsymb + "/"
                        + "layout:width>" + nlsymb + ltsymb + "layout:height rdf:datatype=\"xsd:int\">"
                        + fig.height + ltsymb + "/" + "layout:height>" + nlsymb
                        + ltsymb + "layout:originalHeight rdf:datatype=\"xsd:int\">" + fig.originalHeight
                        + ltsymb + "/" + "layout:originalHeight>" + nlsymb;
                var col = fig.getHighlightColor();
                if (col){
                   resourcerdf += ltsymb + "layout:highlightColor rdf:datatype=\"xsd:string\">"+ col + ltsymb + "/layout:highlightColor>" + nlsymb;
                }
                if (fig.abstractPreview) {
                    resourcerdf += ltsymb + "layout:abstractPreview rdf:datatype=\"xsd:int\">1" + ltsymb + "/layout:abstractPreview>" + nlsymb;
                }
                
                var figRec = this.getAggregatedResource(fig.url);
                if (figRec && figRec.get('index')){
                    resourcerdf += ltsymb + "layout:orderIndex rdf:datatype=\"xsd:int\">" + figRec.get('index') + ltsymb + "/layout:orderIndex>" + nlsymb;
                }
                //lore.debug.ore("objframe " + fig.url , objframe);
                if (objframe && (objframe.scrollX != 0 || objframe.scrollY != 0)) {
                    resourcerdf += ltsymb + "layout:scrollx rdf:datatype=\"xsd:int\">" + objframe.scrollX
                            + ltsymb + "/" + "layout:scrollx>" + nlsymb + ltsymb
                            + "layout:scrolly rdf:datatype=\"xsd:int\">" + objframe.scrollY + ltsymb + "/"
                            + "layout:scrolly>" + nlsymb;
                }
                resourcerdf += ltsymb + rdfdescclose + nlsymb;
                
                // iterate over all ports' connections and serialize if this fig is the source of the connection
                var ports = fig.getPorts();
                for (var p = 0; p < ports.getSize(); p++){
                    var outgoingconnections = ports.get(p).getConnections();
                    for (var j = 0; j < outgoingconnections.getSize(); j++) {
                        var theconnector = outgoingconnections.get(j);
                        if (figurl == lore.global.util.preEncode(lore.global.util.normalizeUrlEncoding(theconnector.sourcePort.parentNode.url)).replace(/&/g,'&amp;')){
                           var relpred = theconnector.edgetype;
                           var relns = theconnector.edgens;
                           var relobj = lore.global.util.preEncode(lore.global.util.normalizeUrlEncoding(theconnector.targetPort.parentNode.url)).replace(/&/g,'&amp;');
                           resourcerdf += ltsymb + rdfdescabout + figurl + closetag + ltsymb
                                + relpred + " xmlns=\"" + relns + "\" rdf:resource=\""
                                + relobj + fullclosetag + ltsymb + rdfdescclose + nlsymb;
                        }
                    }
                } 
            }
        }
        rdfxml += ltsymb + rdfdescclose + nlsymb;
        rdfxml += resourcerdf;
        rdfxml += ltsymb + "/rdf:RDF>";
        return rdfxml;
        } catch (ex){
            lore.debug.ore("toRDFXML",ex);
        }
    },
    /** Generate FOXML for this compound object. 
     *  Equivalent to serialize('foxml')*/
    toFOXML : function (){
        try {
            var params = {'coid': 'demo:' + lore.global.util.splitTerm(this.uri).term};
            return this.transform("chrome://lore/content/compound_objects/stylesheets/foxml.xsl",params,true);     
        } catch (e) {
            lore.ore.ui.vp.warning("Unable to generate FOXML");
            lore.debug.ore("Unable to generate FOXML",e);
            return null;
        }
    },
    /** Generate a Word document to represent the contents of this compound object. 
     * Equivalent to serialize('wordml') */
    toWord : function (){
        try {
            return this.transform("chrome://lore/content/compound_objects/stylesheets/wordml.xsl",{},true);
        } catch (e) {
            lore.ore.ui.vp.warning("Unable to generate Word document");
            lore.debug.ore("Unable to generate Word document",e);
            return null;
        }
    },
    /** Generate Trig for this compound object.
     * Equivalent to serialize('trig') */
    toTrig: function(){
        return this.serialize('trig');
    },
    /**
     * Generate a smil file from this compound object, plus create an HTML wrapper
     * 
     * @return {} The file name of the wrapper file
     */
    generateSMIL : function() {
       // FIXME: generate data uris or move into util : model should not be accessing filesystem
       /* try {
            var extension = lore.global.util.getExtension();
            var result = this.transform("chrome://lore/content/compound_objects/stylesheets/smil_view.xsl",{},true);
            var file = lore.global.util.getFile(extension.path);
            file.append("content");
            file.append("oresmil.smil");
            
            lore.global.util.writeFile(result, file, window);
            var htmlwrapper = "<HTML><HEAD><TITLE>SMIL Slideshow</TITLE></HEAD>"
                    + "<BODY BGCOLOR=\"#003366\"><CENTER>"
                    + "<embed style='border:none' height=\"95%\" width=\"95%\" src=\"oresmil.smil\" type=\"application/x-ambulant-smil\"/>"
                    + "</CENTER><p style='font-size:smalller;color:#ffffff; padding:5px'>SMIL presentation generated by LORE on "
                    + "<script type='text/javascript'>document.write(new Date().toString())</script>"
                    + "</p></BODY></HTML>";
            
            file = lore.global.util.getFile(extension.path);
            file.append("content");
            file.append("playsmil.html");
            return lore.global.util.writeFile(htmlwrapper, file,window);
    
        } catch (e) {
            lore.ore.ui.vp.warning("Unable to generate SMIL: " + e.toString());
        }*/
    },
    /** Serialize to a variety of formats 
     * @param {} format Can be foxml, wordml, trig, rdfquery, json or rdf
     * @return {}
     */
    serialize : function(format) {
        if ('foxml' == format) {
            return this.toFOXML();
        } else if ('wordml' == format){
            return this.toWord();
        }
        var rdf = this.toRDFXML(false);
        /*if ('rdf' == format){
            return rdf;
        }*/
        // Load into rdfquery to enable dump to json, trig or making the RDF/XML output nicer
        try {
            var rdfDoc = new DOMParser().parseFromString(rdf, "text/xml");
                var databank = jQuery.rdf.databank();
                for (ns in lore.constants.NAMESPACES){
                    databank.prefix(ns,lore.constants.NAMESPACES[ns]);
                }
                databank.load(rdfDoc);
            if (format == 'rdfquery') {
                return jQuery.rdf({databank: databank});
            } else if (format == 'trig') {
               var result = "<" + lore.ore.cache.getLoadedCompoundObjectUri() + ">\n{\n";
               var triples = databank.triples();
               for (var t = 0; t < triples.length; t++){
                var triple = triples[t];
                result += triple.toString() + "\n"; 
               }
               result += "}\n";
               return result;
            } else if (format == 'json'){
                return Ext.util.JSON.encode(databank.dump({format: 'application/json'}));
            } else {
                return databank.dump({format:'application/rdf+xml',serialize:true}); 
            }
          
        } catch (e) {
            lore.debug.ore("Error serializing RDF",e);
            return rdf;
        }
    },
    /** 
     * Transform RDF/XML of this current compound object using XSLT 
     * @param {String} stylesheetURL The XSLT stylesheet (probably a chrome URI)
     * @param {object} params Any parameters to pass to the XSLT stylesheet
     * @param {boolean} serialize True to return the result as a String rather than a Fragment
     * @return {object} String or Fragment containing result of applying the XSLT
     */
    transform : function(stylesheetURL, params, serialize){
         return lore.global.util.transformXML(stylesheetURL, this.toRDFXML(false), params, window, serialize);
    },
    /**
     * Checks whether this compound object has been modified since it was last saved
     * @return {Boolean} Returns true if the compound object has been modified
     */
    isDirty : function (){
        // TODO: #56 fix this method - compare state of model (uses graphical editor for now)
        // If it was a new compound object and the graphical view is either not defined 
        // or has no resources, don't consider it to be dirty
    	var isEmpty = lore.global.util.isEmptyObject(this.loadedContent);
    	
    	if (!isEmpty && this.properties.findProperty(lore.constants.NAMESPACES["dc"] + "creator", lore.ore.controller.defaultCreator) == -1){
    		// not creator and not a new compound object: don't bother prompting
    		return false;
    	}
        if (isEmpty && (!lore.ore.ui.graphicalEditor || 
                (lore.ore.ui.graphicalEditor.coGraph 
                    && lore.ore.ui.graphicalEditor.coGraph.getDocument().getFigures().getSize() == 0))){
            return false;
        } else {
            return lore.ore.ui.graphicalEditor.isDirty;
        }
    }
});