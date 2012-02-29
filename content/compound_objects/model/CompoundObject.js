Ext.namespace("lore.ore.model");

/** @class lore.ore.model.CompoundObject
 * Model class representing a Resource Map */
lore.ore.model.CompoundObject = Ext.extend(Ext.util.Observable, {
    constructor: function(config){
        config = config || {};
        this.uri = config.uri || "";
        lore.ore.model.CompoundObject.superclass.constructor.call(this, config);
        /** The Resource Map properties */
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
                    {name: 'representsCO', type: 'boolean', defaultValue: false}, // indicates if this represents a nested Resource Map
                    {name: 'representsAnno',type: 'boolean', defaultValue: false}, // indicates if this represents an annotation
                    {name: 'isPlaceholder', type: 'boolean', defaultValue: false}, // indicates if this resource has a generated URI, being a placeholder for some concept/thing
                    {name: 'properties'} // all other properties, key is property uri, value is array of Property objects
                ] 
        });
        
        this.addEvents(
            'loaded'
        );
        /** rdfquery object representing content loaded or since last save (or empty for new CO) */
        this.loadedContent = {};
        this.aggregationURI = "#aggregation";
        this.wordserializer = new lore.ore.WordSerializer();
    },
    /** Getter named this way to be consistent with ExtJS record API */
    'get': function(fieldName){
      return this[fieldName];  
    },
    getInitialContent : function(){
        return this.loadedContent;  
    },
    getAggregatedResource : function(/*String*/ aUri){
        var res = this.aggregatedResourceStore.getById(aUri);
        if (res){
            return res;
        } 
    },
    initProperties : function(defaultCreator){
       /*this.properties.setProperty({
               id: lore.constants.NAMESPACES["rdf"]+ "about",
               ns: lore.constants.NAMESPACES["rdf"],
               name: "about",
               value: this.uri,
               prefix: "rdf",
               type: "uri"
        },0);*/
        if (defaultCreator){
            this.properties.setProperty({
                   id: lore.constants.NAMESPACES["dc"]+ "creator",
                   ns: lore.constants.NAMESPACES["dc"],
                   name: "creator",
                   value: defaultCreator,
                   prefix: "dc",
                   type: "plainstring"
            },0);
        }  
    },
    /**
     * Set the URI that identifies the Resource Map
     */
    copyToNewWithUri : function(newUri, defaultCreator){
        var oldUri = this.uri;
        if (oldUri != newUri){
            // remove loaded content
            this.loadedContent = {};
            this.uri = newUri;
            // update aggregation id
            this.aggregationURI = newUri + "#aggregation";
            
            // remove lorestore properties : these may be different for the new object
            var lsns = lore.constants.NAMESPACES["lorestore"];
            this.properties.removeProperty(lsns + "isLocked",0);
            this.properties.removeProperty(lsns + "user",0);
            
            // remove ore:describes property
            this.properties.removeProperty(lore.constants.NAMESPACES["ore"]+ "describes",0);
            
            this.properties.setProperty({
               id: lore.constants.NAMESPACES["rdf"]+ "about",
               ns: lore.constants.NAMESPACES["rdf"],
               name: "about",
               value: newUri,
               prefix: "rdf",
               type: "uri"
            },0);
            // reset creation and modification dates to now
            var dcterms = lore.constants.NAMESPACES["dcterms"];
            var created = this.properties.getProperty(dcterms + "created",0);
            created.value = new Date();
            this.properties.setProperty(created,0);
            var modified = this.properties.getProperty(dcterms + "modified",0);
            modified.value = created.value;
            this.properties.setProperty(modified,0);
            // add lore:id_derived_from property
            this.properties.setProperty({
               id: lore.constants.NAMESPACES["lore"]+ "is_derived_from",
               ns: lore.constants.NAMESPACES["lore"],
               name: "is_derived_from",
               value: oldUri,
               prefix: "lore",
               type: "uri"
            },0);
            // Add default creator as creator 
            var dc = lore.constants.NAMESPACES["dc"];
            var creatorIndex = this.properties.findProperty(dc + "creator", defaultCreator);
            if (creatorIndex == -1) {
                this.properties.setProperty({
                       id: dc+ "creator",
                       ns: dc,
                       name: "creator",
                       value: defaultCreator,
                       prefix: "dc",
                       type: "plainstring"
                });
            }
        }
        
    },
    /** Add a resource to the Resource Map
     * @param {} config The properties of the resource to add
     * @return {} The aggregated resources
     */
    addAggregatedResource : function(config){
      if (config instanceof Ext.data.Record){
        var index = config.get("index");
        if (index){
            this.aggregatedResourceStore.insert(index - 1, [config]);
        } else {
            this.aggregatedResourceStore.add([config]);
        }
      } else {
        this.aggregatedResourceStore.loadData([config],true);
      }
    },
    
    /** Remove a resource from the Resource Map
     * @param {} aUri The resource to remove
     * @return {} The aggregated resources
     */
    removeAggregatedResource : function (aUri){
      var rec = this.aggregatedResourceStore.getById(aUri);
      if (rec) {
        this.aggregatedResourceStore.remove(rec);
      }
      
    },
    toString : function(){
        return "Resource Map " + this.uri + " contains " + this.aggregatedResourceStore.getTotalCount() + " resources";    
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
              if (dtype && dtype == "http://purl.org/dc/terms/W3CDTF"){
                dtype = "date";
              } else if (dtype && dtype == lore.constants.NAMESPACES["layout"]+"escapedHTMLFragment"){
                dtype = "html";
              } else if(dtype && dtype == lore.constants.NAMESPACES["xsd"] + "boolean"){
                dtype = "boolean";
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
                lore.debug.ore("Error: no remurl found in RDF",[args.content, this.loadedContent]);
                throw("No Resource Map Found");
            }
            
            // Load properties for this Resource Map
            this.loadedContent.about('<' + this.uri + '>')
            .each(function(){
                try {
                var propurl = this.property.value.toString();
                var propsplit = lore.util.splitTerm(propurl); 
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
                    // TODO: handle other data types?
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
                    lore.debug.ore("Error loading Resource Map properties",e);
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
                 }  else if(this.rdftype && (this.rdftype.value.toString().match('http://www.w3.org/2000/10/annotation') || this.rdftype.value.toString().match('http://www.w3.org/2001/12/replyType') || this.rdftype.value.toString().match("http://www.w3.org/2001/03/thread"))){
                    resourceData.representsAnno = true;
                 }
                 // TODO: Load aggregated resource predicates (properties and rels)
                 oThis.loadedContent.about('<' + resourceURL + '>')
                    .each(function() {
                        var propurl = this.property.value.toString();
                        var propsplit = lore.util.splitTerm(propurl);
                        var prefix = lore.constants.nsprefix(propsplit.ns);
                        
                        if ((prefix == "dc" || prefix == "dcterms") && propsplit.term == "title"){
                            resourceData.title = this.value.value;
                        }
                        if (prefix == "layout" && propsplit.term == "orderIndex") {
                            resourceData.index = this.value.value;
                        } 
                        if (prefix == "layout" && propsplit.term == "isPlaceholder") {
                            resourceData.isPlaceholder = (this.value.value == '1');
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
                        // Most of the layout properties only apply to a single view and are managed by that view
                        
                        // highlightcolor applies to all views, so we create a property for that
                        if (!((prefix == "layout" && propsplit.term == "isPlaceholder") || (prefix == "layout" && propsplit.term == "orderIndex"))){
                            resourceData.properties.setProperty({
                               id: propurl,
                               ns: propsplit.ns,
                               name: propsplit.term,
                               value: theval,
                               prefix: prefix,
                               type: getDatatype(propurl,this.value.datatype)
                            });
                        }
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
     * Compare with another Resource Map model object to determine whether they have the same properties, 
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
    updateDates : function(){
        // update created, modified dates (for legacy store: new store manages these)
        var now = new Date();
        var dcterms = lore.constants.NAMESPACES["dcterms"];
        var modifiedData = {
                id: dcterms + "modified", 
                ns: dcterms, 
                name: "modified", 
                value: now, 
                prefix: "dcterms",
                type: "date"
        };
        this.properties.setProperty(modifiedData,0);
        if (!this.properties.getProperty(dcterms + "created")){
           var createdData = {
                id: dcterms + "created", 
                ns: dcterms, 
                name: "created", 
                value: now, 
                prefix: "dcterms",
                type: "date"
            };
            this.properties.setProperty(createdData, 0);
        }
    },
    getRDF : function(asString){
        if (lore.ore.controller){
            lore.ore.controller.persistAllLayout();
        }
        var serializeProps = function(subj, props){
            for (var p = 0; p < props.length; p++){
                var thePropValues = props[p];
                for (var pi = 0; pi < thePropValues.length; pi++){
                    var theProp = thePropValues[pi]; 
                    var mpropval;
                    if (theProp.type == "date"){
                        mpropval = "\"" + theProp.value.format('c') + "\"^^<http://purl.org/dc/terms/W3CDTF>";
                    } else {
                        mpropval = (theProp.value? theProp.value.toString().replace(/"/g, '\\"').replace(/\\/g, "\\\\") : "");
                        mpropval = ((mpropval.match("^http") == "http") ? "<" + mpropval + ">" : "\"" + mpropval + "\"");
                        if (theProp.type == "html"){
                            mpropval += "^^<http://maenad.itee.uq.edu.au/lore/layout.owl#escapedHTMLFragment>";
                        }
                    }
                    var curie = " " + theProp.prefix + ":" + theProp.name + " ";
                    rdfdb.add(subj + curie + mpropval);
                }
            }
        }
        try{
        this.updateDates();
        } catch (e){
            lore.debug.ore("Error in getRDF",e);
        }
        var rdfdb = jQuery.rdf.databank();
        for (ns in lore.constants.NAMESPACES){
            rdfdb.prefix(ns,lore.constants.NAMESPACES[ns]);
        }
        var resourcemap = "<" + this.uri + ">";
        var describedAggre = "<" + this.uri + "#aggregation" + ">";
        var loadedRDF = this.loadedContent;
        var existingAggre = !lore.util.isEmptyObject(loadedRDF);
        if (existingAggre) {
            var remQuery = loadedRDF.where('?aggre rdf:type ore:Aggregation')
                .where(resourcemap + " ore:describes ?aggre");
            if (remQuery.get(0)){
                describedAggre =  "<" + remQuery.get(0).aggre.value.toString() + ">";
            } else {
                lore.debug.ore("Could not find aggre",remQuery);
            }
        }
        var dcterms = lore.constants.NAMESPACES["dcterms"];
        var ore = lore.constants.NAMESPACES["ore"];
        // Resource Map properties
        rdfdb.add(resourcemap + " a ore:ResourceMap")
            .add(describedAggre + " a ore:Aggregation")
            .add(resourcemap + " ore:describes " + describedAggre)
            .add(resourcemap + " layout:loreVersion \"1.0\"");
            
        var skipProps = {};
        skipProps[ore+"describes"]=true;
        serializeProps(resourcemap,this.get('properties').getSortedArray(skipProps));

        // Any existing aggregation properties (from when it was loaded into LORE)
        if (existingAggre){
            // todo add to rdfdb
            var aggreprops = loadedRDF.where(describedAggre + ' ?pred ?obj')
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
                });
                
        }
        // Aggregated resources and their properties
        this.aggregatedResourceStore.each(function(rec){
            //uri, title, index, representsCO, representsAnno, isPlaceholder, properties
            var escapedUri = "<" + lore.util.preEncode(lore.util.normalizeUrlEncoding(rec.get('uri').toString())) + ">";
            rdfdb.add(describedAggre + " ore:aggregates " + escapedUri);
            serializeProps(escapedUri, rec.get('properties').getSortedArray());
            if (rec.get('isPlaceholder')){
                rdfdb.add(escapedUri + " layout:isPlaceholder '1'");
            }
            rdfdb.add(escapedUri + " layout:orderIndex '" + rec.get('index') + "'");
        });
        
      if (asString){
        return rdfdb.dump({format:'application/rdf+xml',serialize:true});
      } else {
        return rdfdb;
      }
    },
    
    /** Request Word XML that represents the contents of this Resource Map. 
     *  Generates the Word XML using a template
     **/
    toWord : function (){
        try {
            return this.wordserializer.serialize(this);
        } catch (e) {
            lore.ore.ui.vp.warning("Unable to generate Word document");
            lore.debug.ore("Error: Unable to generate Word document",e);
            return null;
        }
    },
    /** Serialize as RDF in a variety of formats 
     * @param {} format Can be trig, rdfquery, json or rdf (RDF/XML)
     * @return {}
     */
    serialize : function(format) {
        // Load into rdfquery to enable dump to json, trig or making the RDF/XML output nicer
        var databank = this.getRDF(false);
        try {
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
     * Checks whether this Resource Map has been modified since it was last saved
     * @return {Boolean} Returns true if the Resource Map has been modified
     */
    isDirty : function (){
        // TODO: #56 fix this method - compare state of model (uses graphical editor for now)
        // If it was a new Resource Map and the graphical view is either not defined 
        // or has no resources, don't consider it to be dirty
        var isEmpty = lore.util.isEmptyObject(this.loadedContent);
        
        if (!isEmpty && this.properties.findProperty(lore.constants.NAMESPACES["dc"] + "creator", lore.ore.controller.defaultCreator) == -1){
            // not creator and not a new Resource Map: don't bother prompting
            return false;
        }
        if (isEmpty && (!lore.ore.ui.graphicalEditor || 
                (lore.ore.ui.graphicalEditor.coGraph 
                    && lore.ore.ui.graphicalEditor.coGraph.getDocument().getFigures().getSize() == 0))){
            return false;
        } else {
            return lore.ore.controller.isDirty;
        }
    }
});
lore.ore.WordSerializer = function(){
    var oThis = this;
    // Load xslt from local file for transforming body content to ooxml for inclusion in docx
    var xhr = new XMLHttpRequest();                
    xhr.overrideMimeType('text/xml');
    xhr.open("GET", '../export/html2word.xsl');
    xhr.onreadystatechange= function(){
        if (xhr.readyState == 4) {
            oThis.bodyStylesheet = xhr.responseXML;
            oThis.xsltproc = new XSLTProcessor();
            oThis.xsltproc.importStylesheet(oThis.bodyStylesheet);
        }
    };
    xhr.send(null);
    this.docxTemplate.setSerializer(this);
};
Ext.apply(lore.ore.WordSerializer.prototype, {
    serialize: function(co) {
        var linksArray = [];// TODO get array of aggregated resources
        this.docxTemplate.setRels(linksArray);
        var result = {
            docxml: this.docxTemplate.apply(co),
            rels: linksArray
        };
        return result;
    },
    extractLinks: function(co) {
        var rels = [co.uri];
        for (var i = 0; i < annos.length; i++){
            var anno = annos[i];
            rels.push(anno.data.id);
            rels.push(anno.data.bodyURL);
            if (anno.data.tags){
                var splittags = anno.data.tags.split(',');
                for (var j = 0; j < splittags.length; j++){
                    rels.push(splittags[j]);
                }
            }
            // TODO extract links from body text
            // TODO original, variant etc
        }
        return rels;
    },
    docxTemplate : new Ext.XTemplate(
       '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
       '<w:document xmlns:ve="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml">',
       '<w:body>',
       '<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>{[lore.util.escapeHTML(values.properties.getTitle())]}</w:t></w:r></w:p>',
       '<tpl for="properties">{[this.displayProperties(values)]}</tpl>',
       '<w:p><w:r><w:t> ({[lore.util.escapeHTML(values.uri)]})</w:t></w:r></w:p>\n',
       '<tpl for="aggregatedResourceStore.data.items">',
       '<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr>',
       '<w:r><w:t>{[lore.util.escapeHTML(values.data.title)]}</w:t></w:r>',
       '</w:p>\n',
       '<w:p><w:pPr><w:pStyle w:val="Subtitle"/></w:pPr><w:r><w:t>{[lore.util.escapeHTML(values.data.uri)]}</w:t></w:r></w:p>\n',
       '<tpl for="data.properties">{[this.displayProperties(values)]}</tpl>',
       '</tpl>',
       '</w:body></w:document>',
       {
            displayAggregatedResources: function(o){
                
            },
            setSerializer: function(ws){
              this.wordSerializer = ws;  
            },
            /** Set array of links (used for generating ids for hyperlinks) */
            setRels: function(rels) {
                this.rels = rels;  
            },
            processHtml: function(html){
                var result = "";
                if (this.wordSerializer && this.wordSerializer.xsltproc){
                    // get the html as xml dom
                    var thedoc = lore.util.htmlToDom("<div>" + html + "</div>",window);
                    // transform the html using XSLT
                    var serializer = new XMLSerializer();
                    var thefrag = this.wordSerializer.xsltproc.transformToFragment(thedoc, document);
                    result = serializer.serializeToString(thefrag);
                } else {
                    result = lore.util.escapeHTML(html);
                }
                return result;
            },
            processHyperlink: function(url, displayText){
                return lore.util.escapeHTML(url); // FIXME
                var result = "";
                var linkidx = this.rels.indexOf(url);
                if (linkidx != -1){
                   var linkid = "rId" + (linkidx + 1); 
                   result += '<w:hyperlink r:id="' + linkid + '"><w:r><w:rPr><w:rStyle w:val="Hyperlink" /></w:rPr>'
                        + "<w:t>" + lore.util.escapeHTML(displayText? displayText : url) + "</w:t>" 
                        + "</w:r></w:hyperlink> ";
                } else {
                    result += "<w:r><w:t>" + (displayText ? displayText + " ": "") + url + "</w:t><w:br/></w:r>";
                }
                return result;
            },
            displayProperties: function(o){
                var displayDate = function(desc, cprop){
                    var cval;
                    var datehtml = "";
                    if (cprop){
                        cval = cprop.value;
                        if (Ext.isDate(cval)){
                            datehtml += desc + cval.format("j M Y");
                        } else {
                            datehtml += desc + cval;
                        }
                    }
                    return datehtml;
                };
              try{
                var res = "";
                
                var ns = lore.constants.NAMESPACES;
                var dcterms = ns["dcterms"];
                var dc = ns["dc"];
                var ccreator = o.data[dc+"creator"];
                var ccreated = o.getProperty(dcterms+"created",0);
                var cmodified = o.getProperty(dcterms+"modified",0);
                if (ccreator || ccreated || cmodified){
                    res += "<w:p><w:r><w:t>Created";
                    if (ccreator){
                        res += " by";
                        for (var i = 0; i< ccreator.length; i++){
                             if (i > 0) {
                                 res += ",";
                             }
                             res += "  " + ccreator[i].value;
                        }
                    }
                    if (ccreated) {
                        res += displayDate(' on ', ccreated);
                    }
                    
                    if (cmodified) {
                        res += displayDate(', last updated ',cmodified);
                    }
                    res += "</w:t></w:r></w:p>\n";
                } 
                var csubject = o.data[dc+"subject"];
                if (csubject){
                    res += '<w:p><w:r><w:t>Subject: ';
                    var subjects = "";
                    for (var i = 0; i < csubject.length; i++){
                        if (i > 0){
                            res += ", ";
                        }
                       var subj = csubject[i].value.toString();
                       if (subj.match("^http://") == "http://"){
                          res += lore.ore.controller.lookupTag(subj);
                          //this.resourcePropValueTpl.apply({url: subj, title:lore.ore.controller.lookupTag(subj)}); 
                       } else {
                          res += subj;
                       }
                       
                    }
                    res += "</w:t></w:r></w:p>\n";
                }
                var skipProps = {};
                skipProps[ns["ore"]+"describes"] = true;
                skipProps[dc+"title"]=true;
                skipProps[dc+"format"]=true;
                skipProps[ns["rdf"]+"type"]=true;
                skipProps[ns["lorestore"]+"user"]=true;
                skipProps[ns["lorestore"] + "isLocked"]=true;
                skipProps[ns["rdf"]+"type"]=true;
                skipProps[dc+"subject"]=true;
                skipProps[dc+"creator"]=true;
                skipProps[dcterms+"created"]=true;
                skipProps[dcterms+"modified"]=true;
                skipProps[dc+"format"]=true;
                var sortedProps = o.getSortedArray(skipProps);
               
                for (var k = 0; k < sortedProps.length; k ++){
                    var propArray = sortedProps[k];
                    for (var i=0; i < propArray.length; i++){
                        var prop = propArray[i];
                        // don't include layout props
                        if(prop.prefix != "layout"){
                            // look up title for rels
                            if (prop.value.toString().match("^http://") == "http://") {
                                // property data for related resource: for looking up title etc
                                var propR = lore.ore.cache.getLoadedCompoundObject().getAggregatedResource(prop.value);
                                var displayVal = prop.value.toString();
                                if (prop.prefix == "dc" && prop.name == "subject"){
                                    displayVal = lore.ore.controller.lookupTag(prop.value.toString());
                                }
                                if (propR) {
                                    prop.title = propR.get('properties').getTitle() || displayVal;
                                    prop.url = propR.get('representsAnno') ? prop.value + "?danno_useStylesheet=" : prop.value;
                                } else {
                                    prop.title = displayVal;
                                    prop.url = prop.value;
                                }
                                if (propR && propR.get('isPlaceholder')){
                                    // we don't want a link for placeholder resources
                                    res += '<w:p><w:r><w:rPr><w:rStyle w:val="Strong" /></w:rPr><w:t>' 
                                        + lore.util.escapeHTML(Ext.util.Format.capitalize(prop.name)) + ': </w:t></w:r><w:r><w:t>' 
                                        + lore.util.escapeHTML(prop.title) 
                                        + '</w:t></w:r></w:p>\n';
                                } else {
                                    // TODO: add rel link
                                    res += '<w:p><w:r><w:rPr><w:rStyle w:val="Strong" /></w:rPr><w:t>'
                                        + lore.util.escapeHTML(Ext.util.Format.capitalize(prop.name)) + ': </w:t></w:r><w:r><w:t>' 
                                        + lore.util.escapeHTML(prop.title) 
                                        + '</w:t></w:r></w:p>\n';
                                }
                            } else { 
                                res += '<w:p><w:r><w:rPr><w:rStyle w:val="Strong" /></w:rPr><w:t>' 
                                    + lore.util.escapeHTML(Ext.util.Format.capitalize(prop.name)) + ': </w:t></w:r><w:r><w:t>' 
                                    + this.processHtml(prop.value) 
                                    + '</w:t></w:r></w:p>\n';
                            }
                        }
                    }
                }   
                return res;
              } catch (ex){
                    lore.debug.ore("Error in Word template",ex);
              }
            }
       }
    )
});