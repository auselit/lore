/**
 * Class wrapper for an RDF annotation provides access to values
 * @class lore.anno.Annotation
 * @extends Ext.util.Observable
 * @param {Node} rdf Root element of an RDF annotation returned by Danno
 * @param {boolean} bodyEmbedded Optional parameter specifying RDF was loaded from file
 */
lore.anno.Annotation = Ext.extend(Ext.util.Observable, {
        constructor: function(config){
            Ext.apply(this,config);
            if (!this.id){
                
                this.id = "#new" + lore.util.uuid();
            }
            this.createdOrModified = (!this.modified || this.modified == '') ? this.created : this.modified;
            if (this.type && this.type.match(lore.constants.NAMESPACES["vanno"]) && !this.original) {
                this.original = this.resource;
            }
        },
        
    toString: function(){
            return "Annotation [" + this.id + "," +
            (this.modified ? this.modified : this.created) +
            "," +
            lore.util.splitTerm(this.type).term +
            "]";
    },
    /**
     * Determine whether an annotation is new, and is not in the repository
     * @param {Object} anno An Annotation object or an Ext Record object
     * @return {Boolean}
     */
     isNew : function () {
        return this.id.indexOf("#new") == 0;
    },

    /**
     * Determine whether an annotation has any replies
     * @param {Object} anno The annotation to test against
     * @return {Boolean} True if it has any replies/children
     */
     hasChildren : function () {
        return this.replies && this.replies.count >0;
    }

});

/**
 * Class that serializes Annotation object/s as RDF
 * @class lore.anno.RDFAnnotationSerialize
 */
lore.anno.RDFAnnotationSerializer  = function () {

};

Ext.apply(lore.anno.RDFAnnotationSerializer.prototype, {
    /**
     * Generate the RDF for an array of annotations
     * @param {Array} annos An array of records or Annotation objects
     * @param {Object} storeDates (Optional) Specify whethere dates are to be stored in the RDF. Defaults to false
     * @return {String} The RDF that was generated
     */

    serialize: function ( annos, store, storeDates ) {
        
        if (!annos.length ) {
            annos = [annos];
        }
        var rdfdb = jQuery.rdf.databank();
        rdfdb.prefix('dc', lore.constants.NAMESPACES['dc']);
        rdfdb.prefix('annotea', lore.constants.NAMESPACES['annotea']);
        rdfdb.prefix('vanno', lore.constants.NAMESPACES['vanno']);
        rdfdb.prefix('thread', lore.constants.NAMESPACES['thread']);
        rdfdb.prefix('http', lore.constants.NAMESPACES['http']);
        for (var i = 0; i < annos.length; i++) {
            var anno =  annos[i].data || annos[i]; // an array of records or anno objects
            
            var annoid = anno.id;
            if (annoid && !anno.isNew() ) {
                annoid = "<" + annoid + ">";
            } else {
                // no id, generate a unique blank node for now (will be replaced on server)
                annoid = "_:anno" + lore.util.uuid();
            }

            if (anno.isReply) {
                rdfdb.add(annoid + " a thread:Reply");
            } else {
                rdfdb.add(annoid + " a annotea:Annotation");
            }
            if (anno.type) {
                rdfdb.add(annoid + " a <" + anno.type + ">");
            }
            if (anno.isReply) {
                rdfdb.add(annoid + " thread:inReplyTo <" + anno.about + ">");
                var rootannonode = lore.util.findRecordById(store, anno.about);
                if (rootannonode) {
                    while (rootannonode.data.isReply) {
                        rootannonode = lore.util.findRecordById(store, rootannonode.data.about);
                    }
                    rdfdb.add(annoid + " thread:root <" + rootannonode.data.id + ">");
                } else {
                    rdfdb.add(annoid + " thread:root <" + anno.about + ">");
                }
            } else {
                if (anno.variant) {
                    rdfdb.add(annoid + " annotea:annotates <" + anno.original + ">")
                       .add(annoid + " annotea:annotates <" + anno.variant + ">");
                } else {
                    rdfdb.add(annoid + " annotea:annotates <" + anno.resource + ">");
                }
            }
            if (anno.lang) {
                rdfdb.add(annoid + " dc:language \"" + anno.lang + "\"");
            }
            if (anno.title) {
                rdfdb.add(annoid + " dc:title \"" + lore.util.escapeQuotes(anno.title) + "\"");
            }
            if (anno.creator) {
                rdfdb.add(annoid + " dc:creator \"" + lore.util.escapeQuotes(lore.util.trim(anno.creator)) + "\"");
            }
            
            if (storeDates) {
                anno.modified = new Date();
                if (!anno.created) {
                   anno.created = new Date();
                }
                rdfdb.add(annoid + " annotea:created \"" + anno.created.toString() + "\"")
                    .add(annoid + " annotea:modified \"" + anno.modified.toString() + "\"");
            }
            if (anno.context) {
                rdfdb.add(annoid + " annotea:context \"" + anno.resource + "#" + lore.util.escapeQuotes(anno.context) + "\"");
            }

            if (anno.type == lore.constants.NAMESPACES["vanno"] + "VariationAnnotation") {
                if (anno.originalcontext) {
                    rdfdb.add(annoid + " vanno:original-context \"" + lore.util.escapeQuotes(anno.originalcontext) + "\"");
                }
                if (anno.variantcontext) {
                    rdfdb.add(annoid + " vanno:variant-context \"" + lore.util.escapeQuotes(anno.variantcontext) + "\"");
                }
                if (anno.variationagent) {
                    rdfdb.add(annoid + " vanno:variation-agent \"" + lore.util.escapeQuotes(anno.variationagent) + "\"");
                }
                if (anno.variationplace) {
                    rdfdb.add(annoid + " vanno:variation-place \"" + lore.util.escapeQuotes(anno.variationplace) + "\"");
                }
                if (anno.variationdate) {
                    rdfdb.add(annoid + " vanno:variation-date \"" + lore.util.escapeQuotes(anno.variationdate) + "\"");
                }
                if (anno.original) {
                    rdfdb.add(annoid + " vanno:original <" + anno.original + ">");
                }
                if (anno.variant) {
                    rdfdb.add(annoid + " vanno:variant <" + anno.variant + ">");
                }
            }
            if (anno.tags) {
                var tagsarray = anno.tags.split(',');
                for (var ti = 0; ti < tagsarray.length; ti++) {
                    var thetag = tagsarray[ti];
                    if (thetag.indexOf("http://") == 0) {
                        thetag = "<" + thetag + ">";
                    }
                    else {
                        thetag = "\"" + lore.util.escapeQuotes(thetag) + "\"";
                    }
                    rdfdb.add(annoid + " vanno:tag " + thetag);
                }
            }
            if ( anno.scholarly) {
                if ( anno.scholarly.references) {
                    rdfdb.add(annoid + " vanno:references \"" + lore.util.escapeQuotes(anno.scholarly.references) + "\"");
                }

                if ( anno.scholarly.importance) {
                    rdfdb.add(annoid + " vanno:importance \"" + lore.util.escapeQuotes(anno.scholarly.importance) + "\"");
                }
            }

            if (anno.privateAnno) {
                rdfdb.add(annoid + " vanno:private \"true\"");
            }
       
            if (anno.type.indexOf('Metadata') > -1) {
                // Metadata body
                var bodyid = "_:body" + lore.util.uuid();
                var serializer = new XMLSerializer();
                var metadataBody = serializer.serializeToString(this.createMetaRDFBody(anno));
                rdfdb.add(annoid + " annotea:body " + bodyid)
                .add(bodyid + " http:ContentType \"application/rdf+xml\"")
                        .add(bodyid + " http:Body \"" +
                                // FIXME: don't hardcode stylesheet
                             lore.util.escapeQuotes('<?xml-stylesheet href="/auselit/stylesheets/meta-to-html.xslt" type="text/xml"?>' + metadataBody) +
                             "\""
                         );
                                
            } else {
                if (anno.body != null) {
                    // HTML body
                    var bodyid = "_:body" + lore.util.uuid();
                    rdfdb.add(annoid + " annotea:body " + bodyid)
                        .add(bodyid + " http:ContentType \"text/html\"")
                        .add(bodyid + " http:Body \"" +
                            lore.util.escapeQuotes('<html xmlns="http://www.w3.org/1999/xhtml"><head><title>' +
                                (anno.title ? anno.title : 'Annotation') +
                                '</title></head>' +
                                '<body>' +
                                lore.util.sanitizeHTML(anno.body, window) +
                                '</body></html>')  +
                             "\""
                        );
                }
            }
        }
        return rdfdb.dump({format:'application/rdf+xml',serialize:true});
    },

    createMetaRDFBody: function(anno) {
        var meta = anno.meta;
        var metaContext = anno['semanticEntity'];
        var metaType = anno['semanticEntityType'];

        var doc = document.implementation.createDocument("","",null);

        var node = doc.createElementNS(lore.constants.NAMESPACES["rdf"], 'rdf:RDF');
        doc.appendChild(node);

        var body = doc.createElementNS(lore.constants.NAMESPACES["rdf"], 'rdf:Description');
        body.setAttributeNS(lore.constants.NAMESPACES["rdf"], 'rdf:about', metaContext);
        node.appendChild(body);

        var type = doc.createElementNS(lore.constants.NAMESPACES["rdf"], 'rdf:type');
        type.setAttributeNS(lore.constants.NAMESPACES["rdf"], 'rdf:resource', metaType);
        body.appendChild(type);

        for (var i = 0; i < meta.length; i++) {
                // Serialize to RDF/XML elements
                var rdfStatement = doc.createElementNS(lore.constants.NAMESPACES['austlit'], meta[i].name);
                var textNode = doc.createTextNode(meta[i].value);
                rdfStatement.appendChild(textNode);
                body.appendChild(rdfStatement);
        }
        return node;
    }
});



/**
 * Class that serializes Annotation object/s as OAC RDF
 * @class lore.anno.OACAnnotationSerialize
 */
lore.anno.OACAnnotationSerializer  = function () {

};

Ext.apply(lore.anno.OACAnnotationSerializer.prototype, {

    /**
     * Generate OAC RDF using rdfquery to serialize
     * @param {Array} annos An array of records or Annotation objects
     * @param {Object} storeDates (Optional) Specify whethere dates are to be stored in the OAC RDF. Defaults to false
     * @return {String} The RDF that was generated
     */
    serialize : function (annos, store, storeDates, sformat) {
        var result = "";
        var genTarget = function(target, context){
            if (context){
                var hashloc = context.indexOf('#');
                if (hashloc == 0){ // context starts with hash, assume fragment identifier
                    rdfdb.add(annoid + " oac:hasTarget <" + target + context + ">");
                    rdfdb.add("<" + target + context + "> dcterms:isPartOf <" + target + ">");
                } else if (hashloc > 0){ // context contains hash, assume targetURL + fragment identifier
                    rdfdb.add(annoid + " oac:hasTarget <" + context + ">");
                    rdfdb.add("<" + context + "> dcterms:isPartOf <" + target + ">");
                } else { 
                    // check if context contains an xpointer
                    if (context.match("xpointer").index == 0){
                        rdfdb.add(annoid + " oac:hasTarget <" + target + "#" + context + ">");
                        rdfdb.add("<" + target + "#" + context + "> dcterms:isPartOf <" + target + ">");
                    } else {
                        // generate a ConstrainedTarget and constraint with content as text
                        var ctuuid = "<urn:uuid:" + lore.util.uuid() + ">"; // constrained target
                        var cuuid = "<urn:uuid:" + lore.util.uuid() + ">"; // constraint
                        rdfdb.add(annoid + " oac:hasTarget " + ctuuid)
                        .add(ctuuid + " oac:constrains <" + target + ">")
                        .add(ctuuid + " a oac:ConstrainedTarget")
                        .add(ctuuid + " oac:constrainedBy " + cuuid)
                        .add(cuuid + " a oac:Constraint")
                        .prefix('cnt', lore.constants.NAMESPACES['cnt'])
                        .add(cuuid + " a cnt:ContentAsText")
                        .add(cuuid + " cnt:chars \"" + context + "\"")
                        .add(cuuid + " cnt:characterEncoding \"utf-8\"");
                    }
                }
            } else if (target){
                // no annotea context, use resource url directly for target
                rdfdb.add(annoid + " oac:hasTarget <" + target + ">");
            }
        };
        
        if (!annos.length ) {
            annos = [annos];
        }
        var rdfdb = jQuery.rdf.databank();
        for (ns in lore.constants.NAMESPACES){
            rdfdb.prefix(ns,lore.constants.NAMESPACES[ns]);
        }
        for (var i = 0; i < annos.length; i++) {
            var anno =  annos[i].data || annos[i]; // an array of records or anno objects
            var annoid = anno.id;
            if (annoid && !anno.isNew() ) {
                annoid = "<" + annoid + ">";
            } else {
                // no id, generate a unique blank node
                annoid = "_:anno" + lore.util.uuid();
            }
            if (!anno.privateAnno){ // don't export private annotations to OAC
                if (anno.isReply) {
                    rdfdb.add(annoid + " a oac:Reply");
                } else {
                    rdfdb.add(annoid + " a oac:Annotation");
                }
                // FIXME: allow bodyURLs
                /*if (anno.bodyURL){
                    // For a metadata annotation this will be an RDF document, for others it will be html
                    rdfdb.add(annoid + " oac:hasBody <" + anno.bodyURL + ">");
                } else {*/
                    
                    var buuid = "<urn:uuid:" + lore.util.uuid() + ">";
                    rdfdb.prefix('cnt', lore.constants.NAMESPACES['cnt'])
                        .add(annoid + " oac:hasBody " + buuid)
                        .add(buuid + " a cnt:ContentAsXML")
                        .add(buuid + " cnt:version \"1.0\"")
                        .add(buuid + " cnt:declaredEncoding \"UTF-8\"")
                        .add(buuid + " cnt:standalone \"yes\"")
                        .add(buuid + " cnt:rest \"" + lore.util.sanitizeHTML(anno.body, window) + "\"");
                //}
                // TODO: inline body if no body URL
                if (!anno.variant){
                    genTarget(anno.resource, anno.context); 
                } else { 
                    // Variation Annotation (other variation metadata will be in compound body resource)
                    genTarget(anno.original, anno.originalcontext);
                    genTarget(anno.variant, anno.variantcontext);
                }
                if (anno.meta && anno.meta.context){
                    // metadata annotation, another constraint for entity
                    
                }
                // At present attach tags as another body: eventually we may wish to use a structured/compound body with both tags and html/text body
                var tagsarray = anno.tags.split(',');
                if (tagsarray.length > 0 && tagsarray[0] != ""){
                    var buuid = "<urn:uuid:" + lore.util.uuid() + ">"; // tag body
                    var tagsrdfxml = '<rdf:RDF xmlns:rdf="' + lore.constants.NAMESPACES["rdf"] 
                        + '" xmlns:vanno="' + lore.constants.NAMESPACES["vanno"] + '">'
                        + '<rdf:Description about="' + anno.resource + '">';
                    for (var ti = 0; ti < tagsarray.length; ti++) {
                        var thetag = lore.util.escapeHTML(tagsarray[ti]);
                        tagsrdfxml += '<vanno:tag';
                        if (thetag.indexOf("http://") == 0) { // uri
                            tagsrdfxml += ' resource="' + thetag + '"/>';
                        }
                        else { // literal
                            tagsrdfxml += '>' + thetag + '</tag>';
                        }  
                    }
                    tagsrdfxml += "</rdf:Description></rdf:RDF>";
                    // store tags in structured (RDF/XML) body
                    rdfdb.prefix('cnt', 'http://www.w3.org/2008/content#')
                        .add(annoid + " oac:hasBody " + buuid)
                        .add(buuid + " a cnt:ContentAsXML")
                        .add(buuid + " cnt:version \"1.0\"")
                        .add(buuid + " cnt:declaredEncoding \"UTF-8\"")
                        .add(buuid + " cnt:standalone \"yes\"")
                        .add(buuid + " cnt:rest \"" + tagsrdfxml + "\"");
                    
                }
                // Annotation properties
                if (anno.creator) {
                    var agentid = anno.agentId? "<" + anno.agentId + ">" : ("_:user" + lore.util.uuid()); 
                    rdfdb.add(annoid + " dcterms:creator " + agentid)
                    .add(agentid + " a foaf:Agent")
                    .add(agentid + " foaf:name \"" + lore.util.trim(anno.creator) + "\"");
                }
                if (anno.lang) {
                    rdfdb.add(annoid + " dc:language \"" +  anno.lang +"\"");
                }
                if (anno.title) {
                    rdfdb.add(annoid + " dc:title \"" + anno.title +"\"");
                }
                if (!anno.created) {
                    anno.created = new Date();
                }
                if (!anno.modified){
                        anno.modified = anno.created;
                }
                if (storeDates) {
                    // TODO: #48 - store as dates not strings
                    rdfdb.add(annoid + " dcterms:created \"" + anno.created.toString() + "\"");
                    rdfdb.add(annoid + " dcterms:modified \"" + anno.modified.toString() + "\"");
                }
                if (sformat == "trig"){
                    // if exporting to trig, reset databank for each anno
                    result +=  annoid + "\n{\n";
                    var triples = rdfdb.triples();
                    for (var t = 0; t < triples.length; t++){
                     var triple = triples[t];
                     result += triple.toString() + "\n"; 
                    }
                    result += "}\n";
                    rdfdb = jQuery.rdf.databank();
                    for (ns in lore.constants.NAMESPACES){
                        rdfdb.prefix(ns,lore.constants.NAMESPACES[ns]);
                    }
                }
            }
        };
        lore.debug.anno("OAC JSON",Ext.util.JSON.encode(rdfdb.dump({format:'application/json', serialize:false})));
        if (sformat == "trig"){
            return result;  
        } else {
            return rdfdb.dump({format:'application/rdf+xml',serialize:true});
        }
    },
    

    convertImageRangeXpointerToMediaFragment: function(/*string*/xpointer) {
        if (!lore.util.isXPointerImageRange(xpointer))
            return xpointer;

        var decoded = lore.util.decodeImageRangeXPointer(xpointer);
        var x = decoded.coords.x1,
            y = decoded.coords.y1,
            w = decoded.coords.x2 - x,
            h = decoded.coords.y2 - y;



        return decoded.imgUrl + '#xywh=' + [x,y,w,h].join(',');
    }

});
lore.anno.WordSerializer = function(){
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
}
Ext.apply(lore.anno.WordSerializer.prototype, {
    docxTemplate : new Ext.XTemplate(
       '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
       '<w:document xmlns:ve="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml">',
       '<w:body>',
       '<w:p><w:pPr><w:pStyle w:val="Title"/></w:pPr><w:r><w:t>LORE Annotations</w:t></w:r></w:p>',
       '<w:p><w:r><w:rPr><w:rStyle w:val="SubtleEmphasis" /> </w:rPr><w:t>Exported for {[this.processHyperlink(lore.anno.controller.currentURL, lore.anno.controller.currentURL)]},<w:br />{[new Date().format("F j, Y, g:i a")]}</w:t></w:r></w:p>',
       '<tpl for="."><tpl for="data">',
           '<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr>',
           '<w:bookmarkStart w:id="{#}" w:name="_Ref{[this.getRef(values.id)]}" />',
           '<w:r><w:t>{[lore.util.escapeHTML(values.title)]}</w:t></w:r>',
           '<w:bookmarkEnd w:id="{#}" />',
           '</w:p>\n',
           '<w:p><w:pPr><w:pStyle w:val="Subtitle"/></w:pPr><w:r><w:t>By {[lore.util.escapeHTML(values.creator)]}, {[new Date(values.created).format("F j, Y, g:i a")]}</w:t></w:r>',
                '<tpl if="modified"><w:r><w:br /><w:t>Last modified {[new Date(values.modified).format("F j, Y, g:i a")]}</w:t></w:r></tpl>',
           '</w:p>\n',
           '<tpl if="isReply==true">',
                '{[this.refTpl.apply({ref: this.getRef(values.resource), name:"(IN REPLY TO ANNOTATION)"})]}',
           '</tpl>',
           '{[this.processBody(values.body)]}\n',
           '<tpl if="tags">',
                '<w:p><w:r><w:rPr><w:rStyle w:val="Strong" /></w:rPr><w:t>Tags: </w:t></w:r></w:p>\n',
                '<w:p>{[this.processTags(values.tags)]}</w:p>',
           '</tpl>',
           '{[this.processReplies(values.replies)]}',
       '</tpl></tpl>',
       //'<w:sectPr><w:pgSz w:w="11906" w:h="16838" /><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0" /> <w:cols w:space="708" /> <w:docGrid w:linePitch="360" /> </w:sectPr>',
       '</w:body></w:document>',
       {
            refTpl : new Ext.XTemplate(
                '<w:p>',
                '<w:r><w:fldChar w:fldCharType="begin" /></w:r>',
                '<w:r><w:instrText xml:space="preserve">REF _Ref{ref} \\\\h</w:instrText> </w:r>',
                '<w:r><w:fldChar w:fldCharType="separate" /> </w:r>',
                '<w:r><w:rPr><w:color w:val="EA9A47"/><w:u w:val="single"/></w:rPr><w:t>{name}</w:t></w:r>',
                '<w:r><w:fldChar w:fldCharType="end" /></w:r></w:p>'),
            getRef: function(uri){
              return   uri.substring(uri.lastIndexOf('/') + 1);
            },
            setSerializer: function(ws){
              this.wordSerializer = ws;  
            },
            /** Set array of links (used for generating ids for hyperlinks) */
            setRels: function(rels) {
                this.rels = rels;  
            },
            processReplies: function(repObj) {
                var result = "";
               if (repObj && repObj.count > 0){
                   result += "<w:p><w:r><w:t>Replies:</w:t></w:r></w:p>";
                   for (r in repObj.map){
                        var reply = repObj.map[r];
                        result += this.refTpl.apply({ref: this.getRef(reply.data.id), name:reply.data.title})
                   }
                   
               }
               return result;
            },
            processBody: function(body){
                var result = "";
                
                if (this.wordSerializer && this.wordSerializer.xsltproc){
                    // get body as xml dom
                    var bodyDoc = lore.util.htmlToDom("<div>" + body + "</div>",window);
                    // transform body using XSLT
                    var serializer = new XMLSerializer();
                    var thefrag = this.wordSerializer.xsltproc.transformToFragment(bodyDoc, document);
                    result = serializer.serializeToString(thefrag);
                } else {
                    result = lore.util.escapeHTML(body);
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
            processTags: function(tags){
                var result = "";
                if (typeof tags == 'string'){
                    var splittags = tags.split(',');
                    for (var i = 0; i < splittags.length; i++){
                        var tag = splittags[i];
                        var tagName;
                        var tagidx = this.rels.indexOf(tag);
                        if (tagidx != -1){
                            var tagid = "rId" + (tagidx + 1); 
                            tagidx = lore.anno.thesaurus.findUnfiltered('id',tag);
                            if (tagidx != -1) {
                                var tagRec = lore.anno.thesaurus.getAtUnfiltered(tagidx);
                                tagName = tagRec.get('name');
                            }
                            
                            result += '<w:hyperlink r:id="' + tagid + '"><w:r><w:rPr><w:rStyle w:val="Hyperlink" /></w:rPr>'
                                + "<w:t>" + lore.util.escapeHTML(tagName? tagName : splittags[i]) + "</w:t>" // should be tag display name
                                + "<w:br/></w:r></w:hyperlink> ";
                        } else { // no hyperlink
                            result += "<w:r><w:t>" + tag + "</w:t><w:br/></w:r>";
                        }
                        
                    }
                }
                return result;
            }
       }
    ),
    serialize: function(annos) {
        lore.debug.anno("serialize to word", annos);
        var linksArray = this.extractLinks(annos);
        this.docxTemplate.setRels(linksArray);
        var result = {
            docxml: this.docxTemplate.apply(annos),
            rels: linksArray
        };
        
        
        return result;
    },
    extractLinks: function(annos) {
        var rels = [lore.anno.controller.currentURL];
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
            // TODO extract links from body text, original, variant etc
        }
        return rels;
    }
});