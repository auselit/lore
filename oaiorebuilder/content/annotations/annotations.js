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
 * Class wrapper for an RDF annotation provides access to values modified from
 * dannotate.js
 * 
 * @param rdf
 *            Root element of an RDF annotation returned by Danno
 */

	lore.anno.Annotation = function(rdf){
	
		var tmp;
		var node;
		var attr;
		
		this.rdf = rdf;
		
		try {
			attr = rdf.getAttributeNodeNS(lore.constants.RDF_SYNTAX_NS, 'about');
			if (attr) {
				this.id = attr.nodeValue;
			}
			var isReply = false;
			node = rdf.getElementsByTagNameNS(lore.constants.RDF_SYNTAX_NS, 'type');
			for (var i = 0; i < node.length; i++) {
				attr = node[i].getAttributeNodeNS(lore.constants.RDF_SYNTAX_NS, 'resource');
				if (attr) {
					tmp = attr.nodeValue;
				}
				if (tmp.indexOf(lore.constants.ANNOTATION_TYPE_NS) == 0) {
					this.type = tmp;
				}
				else 
					if (tmp.indexOf(lore.constants.REPLY_TYPE_NS) == 0) {
						this.type = tmp;
					}
					else 
						if (tmp.indexOf(lore.constants.VARIATION_ANNOTATION_NS) == 0) {
							this.type = tmp;
						}
						else 
							if (tmp.indexOf(lore.constants.THREAD_NS) == 0) {
								isReply = true;
							}
				
			}
			this.isReply = isReply;
			
			if (!this.isReply) {
				node = rdf.getElementsByTagNameNS(lore.constants.ANNOTATION_NS, 'annotates');
				attr = node[0].getAttributeNodeNS(lore.constants.RDF_SYNTAX_NS, 'resource');
				if (attr) {
					this.resource = attr.nodeValue;
				}
				this.about = null;
			}
			else {
				node = rdf.getElementsByTagNameNS(lore.constants.THREAD_NS, 'root');
				if (node[0]) {
					attr = node[0].getAttributeNodeNS(lore.constants.RDF_SYNTAX_NS, 'resource');
					
					if (attr) {
						this.resource = attr.nodeValue;
					}
				}
				node = rdf.getElementsByTagNameNS(lore.constants.THREAD_NS, 'inReplyTo');
				if (node[0]) {
					attr = node[0].getAttributeNodeNS(lore.constants.RDF_SYNTAX_NS, 'resource');
					if (attr) {
						this.about = attr.nodeValue;
					}
				}
			}
			
			node = rdf.getElementsByTagNameNS(lore.constants.ANNOTATION_NS, 'body');
			if (node[0]) {
				attr = node[0].getAttributeNodeNS(lore.constants.RDF_SYNTAX_NS, 'resource');
				if (attr) {
					this.bodyURL = attr.nodeValue;
				}
			}
			node = rdf.getElementsByTagNameNS(lore.constants.ANNOTATION_NS, 'created');
			this.created = lore.util.safeGetFirstChildValue(node);
			node = rdf.getElementsByTagNameNS(lore.constants.ANNOTATION_NS, 'modified');
			this.modified = lore.util.safeGetFirstChildValue(node);
			
			if (this.isReply) {
				this.context = '';
			}
			else {
				node = rdf.getElementsByTagNameNS(lore.constants.ANNOTATION_NS, 'context');
				this.context = lore.util.safeGetFirstChildValue(node);
			}
			
			node = rdf.getElementsByTagNameNS(lore.constants.DC10_NS, 'creator');
			this.creator = lore.util.safeGetFirstChildValue(node, 'anon');
			
			node = rdf.getElementsByTagNameNS(lore.constants.DC10_NS, 'title');
			this.title = lore.util.safeGetFirstChildValue(node);
			
			node = rdf.getElementsByTagNameNS(lore.constants.DC10_NS, 'language');
			this.lang = lore.util.safeGetFirstChildValue(node);
			
			// body stores the contents of the html body tag as text
			if (this.bodyURL) {
				this.body = lore.anno.getBodyContent(this.bodyURL);
			}
			// get tags
			this.tags = "";
			node = rdf.getElementsByTagNameNS(lore.constants.VARIATION_ANNOTATION_NS, 'tag');
			for (var j = 0; j < node.length; j++) {
				var tagval = "";
				attr = node[j].getAttributeNodeNS(lore.constants.RDF_SYNTAX_NS, 'resource');
				if (attr) {
					// a thesaurus tag
					tagval = attr.nodeValue;
				}
				else {
					// a freeform tag - make sure it's added to the list of tags
					tagval = node[j].firstChild.nodeValue;
					Ext.getCmp('tagselector').fireEvent('newitem', Ext.getCmp('tagselector'), tagval);
				}
				if (tagval) {
					if (j > 0) 
						this.tags += ",";
					this.tags += tagval;
				}
			}
			
			// Additional fields for variation annotations only
			if (this.type.match(lore.constants.VARIATION_ANNOTATION_NS)) {
				node = rdf.getElementsByTagNameNS(lore.constants.VARIATION_ANNOTATION_NS, 'variant');
				if (node.length == 0) {
					node = rdf.getElementsByTagNameNS(lore.constants.VARIATION_ANNOTATION_NS, 'revised');
				}
				if (node[0]) {
					attr = node[0].getAttributeNodeNS(lore.constants.RDF_SYNTAX_NS, 'resource');
					if (attr) {
						this.variant = attr.nodeValue;
					}
				}
				node = rdf.getElementsByTagNameNS(lore.constants.VARIATION_ANNOTATION_NS, 'original');
				if (node[0]) {
					attr = node[0].getAttributeNodeNS(lore.constants.RDF_SYNTAX_NS, 'resource');
					if (attr) {
						this.original = attr.nodeValue;
					}
				}
				node = rdf.getElementsByTagNameNS(lore.constants.VARIATION_ANNOTATION_NS, 'original-context');
				this.originalcontext = lore.util.safeGetFirstChildValue(node);
				node = rdf.getElementsByTagNameNS(lore.constants.VARIATION_ANNOTATION_NS, 'variant-context');
				if (node.length == 0) {
					node = rdf.getElementsByTagNameNS(lore.constants.VARIATION_ANNOTATION_NS, 'revised-context');
				}
				this.variantcontext = lore.util.safeGetFirstChildValue(node);
				node = rdf.getElementsByTagNameNS(lore.constants.VARIATION_ANNOTATION_NS, 'variation-agent');
				if (node.length == 0) {
					node = rdf.getElementsByTagNameNS(lore.constants.VARIATION_ANNOTATION_NS, 'revision-agent');
				}
				this.variationagent = lore.util.safeGetFirstChildValue(node);
				node = rdf.getElementsByTagNameNS(lore.constants.VARIATION_ANNOTATION_NS, 'variation-place');
				if (node.length == 0) {
					node = rdf.getElementsByTagNameNS(lore.constants.VARIATION_ANNOTATION_NS, 'revision-place');
				}
				this.variationplace = lore.util.safeGetFirstChildValue(node);
				node = rdf.getElementsByTagNameNS(lore.constants.VARIATION_ANNOTATION_NS, 'variation-date');
				if (node.length == 0) {
					node = rdf.getElementsByTagNameNS(lore.constants.VARIATION_ANNOTATION_NS, 'revision-date');
				}
				this.variationdate = lore.util.safeGetFirstChildValue(node);
			}
			if (!this.original) {
				this.original = this.resource;
			}
		} 
		catch (ex) {
			lore.debug.anno("Error parsing RDF" +
			(this.id ? ' for ' + this.id : ''), ex);
		}
		this.toString = function(){
			return "Annotation [" + this.id + "," +
			(this.modified ? this.modified : this.created) +
			"," +
			lore.util.splitTerm(this.type).term +
			"]";
		}
	}
	
	lore.anno.isNewAnnotation = function (anno) {
		var data;
		//Caller can supply the record object or the json object
		if ( anno.data ) {
			data = anno.data;
		} else {
			data = anno;
		}
		
		return anno.id.indexOf("#new") == 0;
	}
	
	lore.anno.calcNumReplies = function (anno) {
		if ( anno.replies) {
			var num = anno.replies.length;
			for (var i=0;i<anno.replies;i++) {
				num += lore.anno.calcNumReplies(lore.util.findRecordById(lore.anno.annods, data.replies[i]).data);
			}
			return num;
		} else {
			return 0;
		}
	}  
	
	lore.anno.addAnnotation = function(currentContext, parent){
		
		var anno = {
			id : "#new" + Math.uuid(),
			resource: (parent ? parent.data.id: lore.ui.currentURL),
			original: lore.ui.currentURL,
			context: currentContext,
			originalcontext: currentContext,
			creator: lore.defaultCreator,
			created:  new Date().format('c'),
			modified: new Date().format('c'),
			body: "",
			title: (parent ? "New Reply":"New Annotation"),
			type: lore.constants.ANNOTATION_TYPE_NS + "Comment",
			lang: "en",
			isReply: (parent ? true: null)
		};
		if (parent) {
			if ( !parent.data.replies ) {
				parent.data.replies = [];
			}
			parent.data.replies.push(anno.id);
			lore.anno.annods.fireEvent("update", lore.anno.annods, parent, Ext.data.Record.EDIT);
		}
		
		lore.anno.annods.loadData([anno], true);
		
		return anno;
	}
	
	lore.anno.updateAnnotations = function (resultCallback) {
		// TODO: this is inefficient, should create one xml request, need to change
		lore.anno.annods.each( function (rec) 
		{
			if ( rec.dirty ) {
				lore.anno.updateAnnotation(rec, function (action,result,resultMsg) {
					resultCallback(rec, action, result, resultMsg);
				});
				
				/*
				 * function (action, result, resultMsg) {
					var successes = []
				var failures = [];
					if (result == "success") {
					successes.push({
						rec: anno,
						action: action,
						result: result,
						resultMsg: resultMsg
					});
				}
				else {
					failures.push({
						rec: anno,
						action: action,
						result: result,
						resultMsg: resultMsg
					});
				}
				 */
			}
			
			
		});

	}
	lore.anno.updateAnnotation = function(anno, resultCallback){
	
		// don't send out update notification if it's a new annotation as we'll
		// be reloading tree
		anno.commit(lore.anno.isNewAnnotation(anno));
		//lore.debug.anno("anno: " + anno, anno);
		//return;
		
		var annoRDF = lore.anno.createAnnotationRDF(anno.data);
		lore.debug.anno("rdf: " + annoRDF, annoRDF);
		
		var xhr = new XMLHttpRequest();
		if ( lore.anno.isNewAnnotation(anno)) {
			lore.debug.anno("creating new annotation")
			// create new annotation
			xhr.open("POST", lore.anno.annoURL, true);
			xhr.setRequestHeader('Content-Type', "application/rdf+xml");
			xhr.setRequestHeader('Content-Length', annoRDF.length);
			xhr.onreadystatechange = function(){
				if (xhr.readyState == 4) {
					if (resultCallback) {
						var result = xhr.status == 201 ? 'success' : 'fail';
						resultCallback('create', result, xhr.responseText ? xhr.responseText:xhr.statusText);
						lore.anno.updateAnnotationsSourceList(lore.ui.currentURL);
						
					}
				}
			};
			xhr.send(annoRDF);
			lore.debug.anno("RDF of new annotation", annoRDF);
			lore.anno.annods.remove(anno);
		}
		else {
			// Update the annotation on the server via HTTP PUT
			xhr.open("PUT", anno.data.id, true);
			xhr.setRequestHeader('Content-Type', "application/xml");
			xhr.onreadystatechange = function(){
				if (xhr.readyState == 4) {
					if (resultCallback) {
						var result = xhr.status == 200 ? 'success' : 'fail';
						resultCallback('update', result, xhr.statusText);
					}
				}
			};
			xhr.send(annoRDF);
			lore.debug.anno("RDF of updated annotation", annoRDF);
		}
	}
	
	lore.anno.deleteAnnotation = function(anno, resultCallback) {
			// remove the annotation from the server
			var existsInBackend = !lore.anno.isNewAnnotation(anno);
			if (anno.data.isReply) {
				var parent = lore.util.findRecordById(lore.anno.annods, anno.data.resource);
				var ind = -1;
				for( var i=0;i< parent.data.replies.length;i++) {
					if ( parent.data.replies[i] == anno.data.id ) {
						ind = i;
						break;
					}
				}
				if (ind != -1) {
					parent.data.replies.splice(ind, 1);
					lore.anno.annods.fireEvent("update", lore.anno.annods, parent, Ext.data.Record.EDIT);
				}
				else {
					lore.debug.anno("Couldn't find reply annotation to remove from parent replies list: " + anno.id);
				}
			}		
			
			lore.anno.annods.remove(anno);
			if (existsInBackend) {

				Ext.Ajax.request({
					url: anno.data.id,
					success: function(resp){
						lore.debug.anno("Deletion success: " + resp );
						if ( resultCallback) {
							resultCallback('success', resp);
						}
						
					},
					failure: function(resp, opts){
						lore.debug.anno("Annotation deletion failed: " + opts.url, resp);
						if ( resultCallback) {
							resultCallback('fail', resp);
						}
					},
					method: "DELETE"
				});
			}

	}
	
	lore.anno.createAnnotationRDF = function(anno){
		var rdfxml = "<?xml version=\"1.0\" ?>";
		rdfxml += '<rdf:RDF xmlns:rdf="' + lore.constants.RDF_SYNTAX_NS + '">';
		rdfxml += '<rdf:Description';
		if (anno.id && !lore.anno.isNewAnnotation(anno) ) {
			rdfxml += ' rdf:about="' + anno.id + '"';
		}
		rdfxml += ">";
		if (anno.isReply) {
			rdfxml += '<rdf:type rdf:resource="http://www.w3.org/2001/03/thread#Reply"/>';
		}
		if (anno.type) {
			rdfxml += '<rdf:type rdf:resource="' + lore.constants.ANNOTATION_NS +
			'Annotation"/>';
			rdfxml += '<rdf:type rdf:resource="' + anno.type + '"/>';
		}
		
		if (anno.isReply) {
			rdfxml += '<inReplyTo xmlns="' + lore.constants.THREAD_NS + '" rdf:resource="' + anno.resource + '"/>';
			var rootannonode = lore.util.findChildRecursively(window.top.annographiframe.lore.ui.annotationstreeroot, 'id', anno.resource);
			if (rootannonode) {
				while (rootannonode.getDepth() > 2) {
					rootannonode = rootannonode.parentNode;
				}
				rdfxml += '<root xmlns="' + lore.constants.THREAD_NS + '" rdf:resource="' + rootannonode.id + '"/>';
			}
			else {
				rdfxml += '<root xmlns="' + lore.constants.THREAD_NS + '" rdf:resource="' + anno.resource + '"/>';
			}
			
		}
		else {
			rdfxml += '<annotates xmlns="' + lore.constants.ANNOTATION_NS +
			'" rdf:resource="' +
			anno.resource.replace(/&/g, '&amp;') +
			'"/>';
		}
		// also send variant as annotates for backwards compatability with older
		// clients
		if (anno.variant) {
			rdfxml += '<annotates xmlns="' + lore.constants.ANNOTATION_NS +
			'" rdf:resource="' +
			anno.variant.replace(/&/g, '&amp;') +
			'"/>';
		}
		if (anno.lang) {
			rdfxml += '<language xmlns="' + lore.constants.DC10_NS + '">' +
			anno.lang +
			'</language>';
		}
		if (anno.title) {
			rdfxml += '<title xmlns="' + lore.constants.DC10_NS + '">' + anno.title +
			'</title>';
		}
		if (anno.creator) {
			rdfxml += '<creator xmlns="' + lore.constants.DC10_NS + '">' +
			anno.creator +
			'</creator>';
		}
		if (!anno.created) {
			anno.created = new Date();
		}
		// TODO: format date strings
		//rdfxml += '<created xmlns="' + lore.constants.ANNOTATION_NS + '">'
		//		+ anno.created.toString() + '</created>';
		//anno.modified = new Date();
		//rdfxml += '<modified xmlns="' + lore.constants.ANNOTATION_NS + '">'
		//		+ anno.modified.toString() + '</modified>';
		if (anno.context) {
			rdfxml += '<context xmlns="' + lore.constants.ANNOTATION_NS + '">' +
			anno.context +
			'</context>';
		}
		if (anno.type ==
		lore.constants.VARIATION_ANNOTATION_NS +
		"VariationAnnotation") {
			if (anno.originalcontext) {
				rdfxml += '<original-context xmlns="' +
				lore.constants.VARIATION_ANNOTATION_NS +
				'">' +
				anno.originalcontext +
				'</original-context>';
			}
			if (anno.variantcontext) {
				rdfxml += '<variant-context xmlns="' +
				lore.constants.VARIATION_ANNOTATION_NS +
				'">' +
				anno.variantcontext +
				'</variant-context>';
			}
			if (anno.variationagent) {
				rdfxml += '<variation-agent xmlns="' +
				lore.constants.VARIATION_ANNOTATION_NS +
				'">' +
				anno.variationagent +
				'</variation-agent>';
			}
			if (anno.variationplace) {
				rdfxml += '<variation-place xmlns="' +
				lore.constants.VARIATION_ANNOTATION_NS +
				'">' +
				anno.variationplace +
				'</variation-place>';
			}
			if (anno.variationdate) {
				rdfxml += '<variation-date xmlns="' +
				lore.constants.VARIATION_ANNOTATION_NS +
				'">' +
				anno.variationdate +
				'</variation-date>';
			}
			if (anno.original) {
				rdfxml += '<original xmlns="' +
				lore.constants.VARIATION_ANNOTATION_NS +
				'" rdf:resource="' +
				anno.original +
				'"/>';
			}
			if (anno.variant) {
				rdfxml += '<variant xmlns="' +
				lore.constants.VARIATION_ANNOTATION_NS +
				'" rdf:resource="' +
				anno.variant +
				'"/>';
			}
		}
		if (anno.body) {
			anno.body = lore.util.sanitizeHTML(anno.body);
			rdfxml += '<body xmlns="' + lore.constants.ANNOTATION_NS +
			'"><rdf:Description>' +
			'<ContentType xmlns="' +
			lore.constants.HTTP_NS +
			'">text/html</ContentType>' +
			'<Body xmlns="' +
			lore.constants.HTTP_NS +
			'" rdf:parseType="Literal">' +
			'<html xmlns="http://www.w3.org/TR/REC-html40"><head><title>' +
			(anno.title ? anno.title : 'Annotation') +
			'</title></head>' +
			'<body>' +
			anno.body +
			'</body></html>' +
			'</Body></rdf:Description>' +
			'</body>';
		}
		if (anno.tags) {
			var tagsarray = anno.tags.split(',');
			lore.debug.anno("tags are", tagsarray);
			for (var ti = 0; ti < tagsarray.length; ti++) {
				var thetag = tagsarray[ti].escapeHTML();
				rdfxml += '<tag xmlns="' + lore.constants.VARIATION_ANNOTATION_NS + '"';
				if (thetag.indexOf("http://") == 0) {
					rdfxml += ' resource="' + thetag + '"/>';
				}
				else {
					rdfxml += '>' + thetag + '</tag>';
				}
			}
		}
		rdfxml += '</rdf:Description>' + '</rdf:RDF>';
		return rdfxml;
	}
	
	/**
	 * Creates an array of Annotations from a list of RDF nodes in ascending date
	 * created order - unchanged from dannotate.js
	 *
	 * @param nodeList
	 *            Raw RDF list in arbitrary order
	 * @return ordered array of Annotations
	 */
	lore.anno.orderByDate = function(nodeList){
		var tmp = [];
		for (var j = 0; j < nodeList.length; j++) {
			try {
				tmp[j] = new lore.anno.Annotation(nodeList.item(j));
			} 
			catch (ex) {
				lore.debug.anno("Exception processing annotations", ex);
			}
		}
		return tmp.length == 1 ? tmp : tmp.sort(function(a, b){
			return (a.created > b.created ? 1 : -1);
		});
	}
	
	
	lore.anno.genTagList = function(annodata){
		var bodyText = "";
		if (annodata.tags) {
			bodyText += '<span style="font-size:smaller;color:#51666b">Tags: ';
			var tagarray = annodata.tags.split(',');
			for (var ti = 0; ti < tagarray.length; ti++) {
				var thetag = tagarray[ti];
				if (thetag.indexOf('http://') == 0) {
					try {
						var tagname = thetag;
						Ext.getCmp('tagselector').store.findBy(function(rec){
							if (rec.data.id == thetag) {
								tagname = rec.data.name;
							}
						});
						bodyText += '<a target="_blank" style="color:orange" href="' + thetag + '">' + tagname + '</a>, ';
					} 
					catch (e) {
						lore.debug.anno("unable to find tag name for " + thetag, e);
					}
				}
				else {
					bodyText += thetag + ", ";
				}
			}
			bodyText += "</span>";
		}
		return bodyText;
	}
	
	
	/**
	 * Get annotation body value. modified from dannotate.js getAjaxRespSync
	 *
	 * @param {String} uri Fully formed request against Danno annotation server
	 * @return {Object} Server response as text or XML document.
	 */
	lore.anno.getBodyContent = function(uri){
		var req = null;
		try {
			req = new XMLHttpRequest();
			req.open('GET', uri, false);
			req.setRequestHeader('User-Agent', 'XMLHttpRequest');
			req.setRequestHeader('Content-Type', 'application/text');
			req.send(null);
		} 
		catch (ex) {
			lore.debug.anno("Error in synchronous AJAX request: " + uri, ex);
			return null;
		}
		
		if (req.status != 200) {
			var hst = (uri.length < 65) ? uri : uri.substring(0, 64) + '...';
			throw new Error('Synchronous AJAX request status error.\n  URI: ' + hst +
			'\n  Status: ' +
			req.status);
		}
		
		var rtype = req.getResponseHeader('Content-Type');
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
			else 
				if (txt != null) {
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
		var bodyText = "";
		if (rtype == 'application/xml' || rtype == 'application/xhtml+xml') {
			bodyContent = req.responseXML.getElementsByTagName('body');
			if (bodyContent[0]) {
				bodyText = serializer.serializeToString(bodyContent[0]);
			}
			else {
				bodyText = /<body.*?>((.|\n|\r)*)<\/body>/.exec(req.responseText)[1];
			}
		}
		else {
			bodyText = /<body.*?>((.|\n|\r)*)<\/body>/.exec(req.responseText)[1];
		}
		if (bodyText) {
			return lore.util.sanitizeHTML(bodyText);
		}
		lore.debug.anno("No usable annotation body for content: " + rtype + " request: " + uri, req);
		return "";
	}
	
	/**
	 * Updates the annotations list
	 *
	 * @param {String} theURL The escaped URL
	 */
	lore.anno.updateAnnotationsSourceList = function(theURL){
	
		//var ds = lore.store.get(lore.anno.ANNOTATIONS_STORE, theURL);
		//if (ds) {
			// TODO:
			// update so that triggers events lsiterenes to update the view to the
			// model ( change models of the views to this??)
			
	//	}
		
		
		// Get annotations for theURL
		
		if (lore.anno.annoURL) {
			var queryURL = lore.anno.annoURL + lore.anno.ANNOTATES + escape(theURL);
			lore.ui.loreInfo("Loading annotations for " + theURL);
			Ext.Ajax.request({
				url: queryURL,
				method: "GET",
				disableCaching: false,
				success: lore.anno.handleAnnotationsLoaded,
				failure: function(resp, opt){
					lore.debug.anno("Unable to retrieve annotations from " + opt.url, resp);
					lore.ui.loreInfo("No annotations found for the current page");
				}
			});
		}
		else {
			lore.debug.anno("Annotation server URL not set!");
		}
	}
	
	lore.anno.getAnnoData = function(annoid){
		var annoIndex = lore.anno.annods.findBy(function(record, id){
			return (annoid == record.json.id);
		});
		return lore.anno.annods.getAt(annoIndex);
	}
	
	
	lore.anno.handleAnnotationsLoaded = function(resp){
		var resultNodes = {};
		var xmldoc = resp.responseXML;
		if (xmldoc) {
			resultNodes = xmldoc.getElementsByTagNameNS(lore.constants.RDF_SYNTAX_NS, "Description");
		}
		
		lore.anno.annods.each(function(rec) {
				if ( !lore.anno.isNewAnnotation(rec)) {
					lore.anno.annods.remove(rec);
				}
			});
			
		if (resultNodes.length > 0) {
			var annotations = lore.anno.orderByDate(resultNodes);
			//lore.anno.annods.suspendEvents(false);
			
			
			lore.anno.annods.loadData(annotations, true);
			
			var annogriddata = [];
			for (var i = 0; i < annotations.length; i++) {
				var anno = annotations[i];
				var annoID = anno.id;
				var annoType = anno.type;
				
				// get annotation replies
				Ext.Ajax.request({
					disableCaching: false, // without this the request was failing
					method: "GET",
					url: lore.anno.annoURL + lore.anno.REPLY_TREE + annoID,
					success: lore.anno.handleAnnotationRepliesLoaded,
					failure: function(resp, opt){
						lore.debug.anno("Unable to obtain replies for " + opt.url, resp);
					}
				});
			}
			//lore.anno.annods.resumeEvents();
			//lore.anno.annods.fireEvent('load', lore.anno.annods, lore.anno.annods.getRange(), {});
			
		}
	}
	
	
	lore.anno.handleAnnotationRepliesLoaded = function(resp, opt){
		try {
			var replyList = resp.responseXML.getElementsByTagNameNS(lore.constants.RDF_SYNTAX_NS, 'Description');
			var isLeaf = (replyList.length == 0);
			if (!isLeaf) {
				replies = lore.anno.orderByDate(replyList);
				
				var parent = lore.util.findRecordById(lore.anno.annods, replies[0].resource);
				parent.data.replies = [];
				
				for (var i = 0; i < replies.length; i++) {
						
					parent.data.replies.push(replies[i].id);
				}

				lore.anno.annods.loadData(replies, true);
			}
		} catch (e ) {
			lore.debug.anno(e,e);
		}
	}
