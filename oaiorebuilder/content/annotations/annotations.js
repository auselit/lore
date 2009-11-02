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

/*
 * @include  "/oaiorebuilder/content/annotations/init.js"
 * @include  "/oaiorebuilder/content/debug.js"
 * @include  "/oaiorebuilder/content/util.js"
 * @include  "/oaiorebuilder/content/uiglobal.js"
 * @include  "/oaiorebuilder/content/constants.js"
 */

/** 
 * Annotations
 * @namespace
 * @name lore.anno
 */


	/**
	 * Intialize the 'model', the store which holds the working copies
	 * of annotations for a given page.  
	 * @param {String} theURL  (Currently not utilized)The URL toe create the store for 
	 */	
	lore.anno.initModel = function ( theURL ) {
		
		var fields = [
										{name: 'created'}, 
										{name: 'creator'}, 
										{name: 'title'}, 
										{name: 'body'}, 
										{name: 'modified'}, 
										{name: 'type'}, 
										{name: 'lang'},
                                        {name: 'resource'},
                                        {name: 'id'},
                                        {name: 'context'},
                                        {name: 'isReply'},
                                        {name: 'bodyURL'},
                                        {name: 'about'},
                                        {name: 'original'},
                                        {name: 'variant'},
                                        {name: 'originalcontext'},
                                        {name: 'variantcontext'},
                                        {name: 'variationagent'},
                                        {name: 'variationplace'},
                                        {name: 'variationdate'},
                                        {name: 'tags'}
                                        ];
										
		lore.anno.annods = lore.global.store.create(lore.constants.ANNOTATIONS_STORE,
		new Ext.data.JsonStore({
									fields: fields,
									data: {}
								}), theURL);
		
		lore.anno.annosearchds = new Ext.data.JsonStore({
									fields: fields,
									data: {}
								});
								
		 lore.anno.annods.on("load",  lore.anno.onDSLoad);
		 lore.anno.annods.on("remove", lore.anno.onDSRemove);
	}
	
	lore.anno.onDSLoad = function(store, records, options) {
		for( var i =0; i < records.length;i++) {
			
				var incParentReplies = function(rec, countonly){
					if ( !rec.data.isReply  ) 
						return;
					var prec = lore.global.util.findRecordById(store, rec.data.about);
					
					if ( !prec) {
						lore.debug.anno("Couldn't find parent to update replies list. Bad");
						return;
					}
					
					if (!countonly) {
						prec.data.replies.map[rec.data.id] = rec;
						prec.data.replies.localcount++;
					}
					prec.data.replies.count++;
					store.fireEvent("update", store, prec, Ext.data.Record.EDIT);
					incParentReplies(prec, true);
				};
			
			incParentReplies(records[i]);
			records[i].data.replies = { count:0, localcount:0, map:{}};
		}
	}
	
	lore.anno.onDSRemove = function(store, record, index){
			
			var decParentReplies = function (rec, countonly) {
				if ( !rec.data.isReply)
					return;
				
				var prec = lore.global.util.findRecordById(store, rec.data.about);
				if ( !prec)
					return;
				
				if (!countonly) {
					prec.data.replies.map[rec.data.id] = null;
					prec.data.replies.localcount--;
				}
				prec.data.replies.count--;
				
				store.fireEvent("update", store, prec, Ext.data.Record.EDIT);
				decParentReplies(prec, true);
				
			};
			decParentReplies(record);
	}
	
/**
 * Class wrapper for an RDF annotation provides access to values modified from
 * dannotate.js
 * @param {Node} rdf Root element of an RDF annotation returned by Danno
 * @param {boolean} bodyOps Optional parameter specifying RDF was loaded from file
 */
	lore.anno.Annotation = function(rdf, bodyOp){
	
		var tmp;
		var node;
		var attr;
		
		this.rdf = rdf;
		
		try {
			attr = rdf.getAttributeNodeNS(lore.constants.NAMESPACES["rdf"], 'about');
			if (attr) {
				this.id = attr.nodeValue;
			}
			var isReply = false;
			node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["rdf"], 'type');
			for (var i = 0; i < node.length; i++) {
				attr = node[i].getAttributeNodeNS(lore.constants.NAMESPACES["rdf"], 'resource');
				if (attr) {
					tmp = attr.nodeValue;
				}
				if (tmp.indexOf(lore.constants.NAMESPACES["annotype"]) == 0) {
					this.type = tmp;
				}
				else 
					if (tmp.indexOf(lore.constants.NAMESPACES["annoreply"]) == 0) {
						this.type = tmp;
					}
					else 
						if (tmp.indexOf(lore.constants.NAMESPACES["vanno"]) == 0) {
							this.type = tmp;
						}
						else 
							if (tmp.indexOf(lore.constants.NAMESPACES["thread"]) == 0) {
								isReply = true;
							}
				
			}
			this.isReply = isReply;
			
			if (!this.isReply) {
				// resource is a url	
				node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["annotea"], 'annotates');
				
				attr = node[0].getAttributeNodeNS(lore.constants.NAMESPACES["rdf"], 'resource');
				if (attr) {
					this.resource = attr.nodeValue;
				}
				this.about = null;
			}
			else {
				// resource is still a url of the resource the original annotation annotates
				// about is the parent node annotation id
				node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["thread"], 'root');
				if (node[0]) {
					attr = node[0].getAttributeNodeNS(lore.constants.NAMESPACES["rdf"], 'resource');
					
					if (attr) {
						this.resource = attr.nodeValue;
					}
				}
				node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["thread"], 'inReplyTo');
				if (node[0]) {
					attr = node[0].getAttributeNodeNS(lore.constants.NAMESPACES["rdf"], 'resource');
					if (attr) {
						this.about = attr.nodeValue;
					}
				}
			}
			
			node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["annotea"], 'body');
			if (!bodyOp || bodyOp == 3) {
				if (node[0]) {
					attr = node[0].getAttributeNodeNS(lore.constants.NAMESPACES["rdf"], 'resource');
					if (attr) {
						this.bodyURL = attr.nodeValue;
					}
				}
			} else if ( bodyOp == 1 ){
				var node = node[0].getElementsByTagName('body');
				if ( node[0]) {
					lore.debug.anno("node " + node[0], node[0]);
					var serializer = new XMLSerializer();
					var bodyText = serializer.serializeToString(node[0]);
					this.body = lore.global.util.sanitizeHTML(bodyText, window);
				}
			}

			node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["annotea"], 'created');
			this.created = lore.global.util.safeGetFirstChildValue(node);
			node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["annotea"], 'modified');
			this.modified = lore.global.util.safeGetFirstChildValue(node);
			
			if (this.isReply) {
				this.context = '';
			}
			else {
				node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["annotea"], 'context');
				this.context = lore.global.util.safeGetFirstChildValue(node);
			}
			
			node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["dc10"], 'creator');
			this.creator = lore.global.util.safeGetFirstChildValue(node, 'anon');
			
			node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["dc10"], 'title');
			this.title = lore.global.util.safeGetFirstChildValue(node);
			
			node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["dc10"], 'language');
			this.lang = lore.global.util.safeGetFirstChildValue(node);
			
			// body stores the contents of the html body tag as text
			if (this.bodyURL && !this.body && ( !bodyOp || bodyOp != 3)) {
				lore.debug.anno("bodyOp not 3");
				lore.anno.getBodyContent(this,window);
				//this.body = lore.anno.getBodyContent(this.bodyURL, window);
			}
			// get tags
			this.tags = "";
			node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["vanno"], 'tag');
			for (var j = 0; j < node.length; j++) {
				var tagval = "";
				attr = node[j].getAttributeNodeNS(lore.constants.NAMESPACES["rdf"], 'resource');
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
			if (this.type.match(lore.constants.NAMESPACES["vanno"])) {
				node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["vanno"], 'variant');
				if (node.length == 0) {
					node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["vanno"], 'revised');
				}
				if (node[0]) {
					attr = node[0].getAttributeNodeNS(lore.constants.NAMESPACES["rdf"], 'resource');
					if (attr) {
						this.variant = attr.nodeValue;
					}
				}
				node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["vanno"], 'original');
				if (node[0]) {
					attr = node[0].getAttributeNodeNS(lore.constants.NAMESPACES["rdf"], 'resource');
					if (attr) {
						this.original = attr.nodeValue;
					}
				}
				node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["vanno"], 'original-context');
				this.originalcontext = lore.global.util.safeGetFirstChildValue(node);
				node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["vanno"], 'variant-context');
				if (node.length == 0) {
					node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["vanno"], 'revised-context');
				}
				this.variantcontext = lore.global.util.safeGetFirstChildValue(node);
				node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["vanno"], 'variation-agent');
				if (node.length == 0) {
					node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["vanno"], 'revision-agent');
				}
				this.variationagent = lore.global.util.safeGetFirstChildValue(node);
				node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["vanno"], 'variation-place');
				if (node.length == 0) {
					node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["vanno"], 'revision-place');
				}
				this.variationplace = lore.global.util.safeGetFirstChildValue(node);
				node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["vanno"], 'variation-date');
				if (node.length == 0) {
					node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["vanno"], 'revision-date');
				}
				this.variationdate = lore.global.util.safeGetFirstChildValue(node);
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
			lore.global.util.splitTerm(this.type).term +
			"]";
		}
	}
	
	/**
	 * Determine whether an annotation is new, and is not in the respository
	 * @param {Object} anno An Annotation object or an Ext Record object 
	 * @return {Boolean} 
	 */
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
	
	/**
	 * Determine whether an annotation has any replies
	 * @param {Object} anno The annotation to test against
	 * @return {Boolean} True if it has any replies/children
	 */
	lore.anno.hasChildren = function (anno) {
		var a = anno.data || anno;
		return a.replies && a.replies.count >0;
	}
	
	/**
	 * Generate an annotation id for a new annotation
	 * @return {String} A UUID for an annotation
	 */
	lore.anno.newAnnotationId = function () {
		return "#new" + Math.uuid();
	}
	
	/**
	 * Add an annotation to the local store. This does not add the annotation
	 * to the remote repository
	 * @param {String} currentContext Page context of the annotation. XPath string currently supported.
	 * @param {Object} currentURL The URL for the page this annotation is on
	 * @param {Object} parent (Optional) The parent of this annotation
	 */
	lore.anno.addAnnotation = function(currentContext, currentURL, parent){
		
		var anno = {
			id : lore.anno.newAnnotationId(),
			resource: (parent ? parent.data.resource: currentURL),
			about: (parent ? parent.data.id: null),
			original: currentURL,
			context: currentContext,
			originalcontext: currentContext,
			creator: lore.defaultCreator,
			created:  new Date().format('c'),
			modified: new Date().format('c'),
			body: "",
			title: (parent ? "New Reply":"New Annotation"),
			type: lore.constants.NAMESPACES["annotype"] + "Comment",
			lang: "en",
			isReply: (parent ? true: null)
		};
		
		lore.anno.annods.loadData([anno], true);
		
		return anno;
	}
	
	/**
	 * Create or update the annotations in the remote repository.
	 * These actions are performed for all annotations that are flagged as 'dirty'. 
	 * @param {String} currentURL The URL of the page where the annotations are situated
	 * @param {Function} resultCallback A callback function that is used by the function to output success or failure
	 * The callback should support the following parameters
	 * rec: The record that was updated
	 * action: Action performed on the record ('create' or 'update')
	 * result: Result as a string ('success' or 'fail') 
	 * resultMsg: Result message 
	 */
	lore.anno.updateAnnotations = function (currentURL, resultCallback) {
		
		lore.anno.annods.each( function (rec) 
		{
			if ( rec.dirty ) {
				lore.anno.updateAnnotation(rec, currentURL, function (action,result,resultMsg) {
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
	
	/**
	 * Create or update the annotation in the remote repository 
	 * @param {Object} anno The annotation to update/create
	 * @param {String} currentURL The URL of the page where the annotation is situated
	 * @param {Function} resultCallback A callback function that is used by the function to output success or failure
	 * The callback should support the following parameters
	 * action: Action performed on the record ('create' or 'update')
	 * result: Result as a string ('success' or 'fail') 
	 * resultMsg: Result message 
	 */
	lore.anno.updateAnnotation = function(anno, currentURL, resultCallback){
	
		// don't send out update notification if it's a new annotation as we'll
		// be reloading tree
		anno.commit(lore.anno.isNewAnnotation(anno));
		
		var annoRDF = lore.anno.createAnnotationRDF([anno.data]);
		
		var xhr = new XMLHttpRequest();
		if (lore.anno.isNewAnnotation(anno)) {
			lore.debug.anno("creating new annotation")
			// create new annotation
			xhr.open("POST", lore.anno.annoURL, true);
			xhr.setRequestHeader('Content-Type', "application/rdf+xml");
			xhr.setRequestHeader('Content-Length', annoRDF.length);
			xhr.onreadystatechange = function(){
				if (xhr.readyState == 4) {
					if (resultCallback) {
						var result = xhr.status == 201 ? 'success' : 'fail';
						resultCallback('create', result, xhr.responseText ? xhr.responseText : xhr.statusText);
						lore.anno.updateAnnotationsSourceList(currentURL);
						
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
	
	/**
	 * Delete an annotation on the local store and on the remote repository if it exists there
	 * @param {Object} anno The annotation to delete
	 * @param {Object} resultCallback A callback function that is used by the function to output success or failure
	 * The callback should support the following parameters
	 * result: Result as a string ('success' or 'fail') 
	 * resultMsg: Result message 
	 */
	
	lore.anno.deleteAnnotation = function(anno, resultCallback) {
			// remove the annotation from the server
			
			if ( lore.anno.hasChildren(anno)) {
				if ( resultCallback)
					resultCallback("fail", "Annotation not deleted. Delete replies first.");
				return;
			}
			
			var existsInBackend = !lore.anno.isNewAnnotation(anno);
			
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
	
	/**
	 * Generate the RDF for an array of annotations  
	 * @param {Array} annos An array of records or Annotation objects 
	 * @param {Object} storeDates (Optional) Specify whethere dates are to be stored in the RDF. Defaults to false
	 * @return {String} The RDF that was generated
	 */
	lore.anno.createAnnotationRDF = function(annos, storeDates){
		var rdfxml = "<?xml version=\"1.0\" ?>";
		rdfxml += '<rdf:RDF xmlns:rdf="' + lore.constants.NAMESPACES["rdf"] + '">';
		
		for (var i = 0; i < annos.length; i++) {
			var anno = annos[i].data || annos[i]; // an array of records or anno objects
			
			rdfxml += '<rdf:Description';
			if (anno.id && !lore.anno.isNewAnnotation(anno)) {
				rdfxml += ' rdf:about="' + anno.id + '"';
			}
			rdfxml += ">";
			if (anno.isReply) {
				rdfxml += '<rdf:type rdf:resource="http://www.w3.org/2001/03/thread#Reply"/>';
			}
			else {
				rdfxml += '<rdf:type rdf:resource="' + lore.constants.NAMESPACES["annotea"] +
				'Annotation"/>';
			}
			if (anno.type) {
				rdfxml += '<rdf:type rdf:resource="' + anno.type + '"/>';
			}
			
			
			
			
			if (anno.isReply) {
				rdfxml += '<inReplyTo xmlns="' + lore.constants.NAMESPACES["thread"] + '" rdf:resource="' + anno.about + '"/>';
				
				var rootannonode = lore.global.util.findRecordById(lore.anno.annods, anno.about);
				if (rootannonode) {
					while (rootannonode.data.isReply) {
						rootannonode = lore.global.util.findRecordById(lore.anno.annods, rootannonode.data.about);
					}
					rdfxml += '<root xmlns="' + lore.constants.NAMESPACES["thread"] + '" rdf:resource="' + rootannonode.data.id + '"/>';
				}
				else {
					rdfxml += '<root xmlns="' + lore.constants.NAMESPACES["thread"] + '" rdf:resource="' + anno.about + '"/>';
				}
				
			}
			else {
				rdfxml += '<annotates xmlns="' + lore.constants.NAMESPACES["annotea"] +
				'" rdf:resource="' +
				anno.resource.replace(/&/g, '&amp;') +
				'"/>';
			}
			// also send variant as annotates for backwards compatability with older
			// clients
			if (anno.variant) {
				rdfxml += '<annotates xmlns="' + lore.constants.NAMESPACES["annotea"] +
				'" rdf:resource="' +
				anno.variant.replace(/&/g, '&amp;') +
				'"/>';
			}
			if (anno.lang) {
				rdfxml += '<language xmlns="' + lore.constants.NAMESPACES["dc10"] + '">' +
				anno.lang +
				'</language>';
			}
			if (anno.title) {
				rdfxml += '<title xmlns="' + lore.constants.NAMESPACES["dc10"] + '">' + anno.title +
				'</title>';
			}
			if (anno.creator) {
				rdfxml += '<creator xmlns="' + lore.constants.NAMESPACES["dc10"] + '">' +
				lore.global.util.trim(anno.creator) +
				'</creator>';
			}
			if (!anno.created) {
				anno.created = new Date();
			}
			if (storeDates) {
				// TODO: format date strings
				rdfxml += '<created xmlns="' + lore.constants.NAMESPACES["annotea"] + '">'
						+ anno.created.toString() + '</created>';
				anno.modified = new Date();
				rdfxml += '<modified xmlns="' + lore.constants.NAMESPACES["annotea"] + '">'
						+ anno.modified.toString() + '</modified>';
			}
			if (anno.context) {
				rdfxml += '<context xmlns="' + lore.constants.NAMESPACES["annotea"] + '">' +
				anno.context +
				'</context>';
			}
			if (anno.type ==
			lore.constants.NAMESPACES["vanno"] +
			"VariationAnnotation") {
				if (anno.originalcontext) {
					rdfxml += '<original-context xmlns="' +
					lore.constants.NAMESPACES["vanno"] +
					'">' +
					anno.originalcontext +
					'</original-context>';
				}
				if (anno.variantcontext) {
					rdfxml += '<variant-context xmlns="' +
					lore.constants.NAMESPACES["vanno"] +
					'">' +
					anno.variantcontext +
					'</variant-context>';
				}
				if (anno.variationagent) {
					rdfxml += '<variation-agent xmlns="' +
					lore.constants.NAMESPACES["vanno"] +
					'">' +
					anno.variationagent +
					'</variation-agent>';
				}
				if (anno.variationplace) {
					rdfxml += '<variation-place xmlns="' +
					lore.constants.NAMESPACES["vanno"] +
					'">' +
					anno.variationplace +
					'</variation-place>';
				}
				if (anno.variationdate) {
					rdfxml += '<variation-date xmlns="' +
					lore.constants.NAMESPACES["vanno"] +
					'">' +
					anno.variationdate +
					'</variation-date>';
				}
				if (anno.original) {
					rdfxml += '<original xmlns="' +
					lore.constants.NAMESPACES["vanno"] +
					'" rdf:resource="' +
					anno.original +
					'"/>';
				}
				if (anno.variant) {
					rdfxml += '<variant xmlns="' +
					lore.constants.NAMESPACES["vanno"] +
					'" rdf:resource="' +
					anno.variant +
					'"/>';
				}
			}
			if (anno.body) {
				anno.body = lore.global.util.sanitizeHTML(anno.body, window);
				rdfxml += '<body xmlns="' + lore.constants.NAMESPACES["annotea"] +
				'"><rdf:Description>' +
				'<ContentType xmlns="' +
				lore.constants.NAMESPACES["http"] +
				'">text/html</ContentType>' +
				'<Body xmlns="' +
				lore.constants.NAMESPACES["http"] +
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
					var thetag = lore.global.util.escapeHTML(tagsarray[ti]);
					rdfxml += '<tag xmlns="' + lore.constants.NAMESPACES["vanno"] + '"';
					if (thetag.indexOf("http://") == 0) {
						rdfxml += ' resource="' + thetag + '"/>';
					}
					else {
						rdfxml += '>' + thetag + '</tag>';
					}
				}
			}
			rdfxml += '</rdf:Description>';
		}
		rdfxml += '</rdf:RDF>';
		
		return rdfxml;
	}
	
	/**
	 * Creates an array of Annotations from a list of RDF nodes in ascending date
	 * created order - unchanged from dannotate.js
	 *
	 * @param {NodeList} nodeList
	 *            Raw RDF list in arbitrary order
	 * @param {Boolean} bodyOp (Optional) Specify whether the annotations came from a file. Defaults to false.
	 * @return {Array} ordered array of Annotations
	 */
	lore.anno.orderByDate = function(nodeList, bodyOp){
		var tmp = [];
		for (var j = 0; j < nodeList.length; j++) {
			try {
				tmp[j] = new lore.anno.Annotation(nodeList[j], bodyOp);
			} 
			catch (ex) {
				lore.debug.anno("Exception processing annotations", ex);
			}
		}
		return tmp.length == 1 ? tmp : tmp.sort(function(a, b){
			return (a.created > b.created ? 1 : -1);
		});
	}
	
	
	/**
	 * Get annotation body value. modified from dannotate.js getAjaxRespSync
	 *
	 * @param {String} uri Fully formed request against Danno annotation server
	 * @param {window} The window object
	 * @return {Object} Server response as text or XML document.
	 */
	//lore.anno.getBodyContent = function(uri, window){
	lore.anno.getBodyContent = function(anno, window, callback){
		
		var uri = anno.bodyURL;
		var async = callback != null;
		var req = null;
		var handleResponse = function(){
			
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
				return lore.global.util.sanitizeHTML(bodyText, window);
			}
			lore.debug.anno("No usable annotation body for content: " + rtype + " request: " + uri, req);
			return "";
		}
		
		try {
			req = new XMLHttpRequest();
			//req.open('GET', uri, false);
			
			if (async) {
				req.onreadystatechange = function(){
					try {
			
						if (req.readyState == 4) {
							var b = handleResponse();
							callback(anno, b);
						}
					} catch (e ) {
						lore.debug.anno(e,e);
					}
				};
			}
			
			req.open("GET",uri, async);
			req.setRequestHeader('User-Agent', 'XMLHttpRequest');
			req.setRequestHeader('Content-Type', 'application/text');
			req.send(null);
		} 
		catch (ex) {
			lore.debug.anno("Error in synchronous AJAX request: " + uri, ex);
			return null;
		}
		
		if (!async){
			return handleResponse();
		}
	}
	
	lore.anno.getBodyContentAsync = function(anno, window){
	
		var cback = function(anno, txt){
			try {
				var r = lore.global.util.findRecordById(lore.anno.annods, anno.id);
				r.data.body = txt;
				r.commit();
			} 
			catch (e) {
				lore.debug.anno(e, e)
			}
		}
		lore.anno.getBodyContent(anno,window,cback);
	}
	
	/**
	 * Updates the annotations store with update values for the
	 * annotations for the specified URL
	 * @param {String} theURL The escaped URL
	 * @param {Function} callbackFunction Callback function used to output success or failure.
	 * The function must support the following parameters:
	 * result: Result as string ( 'success' or 'fail')
	 * resultMsg: Result message as string 
	 */
	lore.anno.updateAnnotationsSourceList = function(theURL, callbackFunc){
	
		//var ds = lore.global.store.get(lore.constants.ANNOTATIONS_STORE, theURL);
		//if (ds) {
			// TODO:
			// update so that triggers events lsiterenes to update the view to the
			// model 
		//	}
		
		// Get annotations for theURL
		if (lore.anno.annoURL) {
			var queryURL = lore.anno.annoURL + lore.constants.ANNOTEA_ANNOTATES + encodeURIComponent(theURL).replace(/%5D/g,'%255d');
			lore.debug.anno("Updating annotations with request URL: " + queryURL);
			
			Ext.Ajax.request({
				url: queryURL,
				method: "GET",
				disableCaching: false,
				success: function(resp, opt) {
					try {
						if (callbackFunc) 
							callbackFunc('success', resp);
						lore.anno.handleAnnotationsLoaded(resp);
					} catch (e ) {
						lore.debug.anno(e,e);
					}
				},
				failure: function(resp, opt){
					try {
						lore.debug.anno("Unable to retrieve annotations from " + opt.url, resp);
					if ( callbackFunc) callbackFunc('fail', resp);
					} catch (e ) {
						lore.debug.anno(e,e);
					}
				}
			});
		}
		else {
			lore.debug.anno("Annotation server URL not set!");
		}
	}
	
	lore.anno.searchAnnotations = function (url, filters, resultCallback) {
		
		//TODO: 
		// pass into a constructor of a FilterCollection with a list of linked filter objects
		// linked by an 'and' 'or' operation
		// conver to a URL
		
		// encodeURIComponent(theURL).replace(/%5D/g,'%255d');
		// lore.constants.ANNOTATES +
		
		var queryURL = lore.anno.annoURL + (url ? (lore.constants.ANNOTEA_ANNOTATES + url): lore.constants.DANNO_ALL_OBJECTS);
		for (var i = 0; i < filters.length; i++) {
			queryURL += '&'+filters[i].attribute+'=' + encodeURIComponent(filters[i].filter).replace(/%5D/g,'%255d');
		}
		  
		lore.debug.anno("Search annotations with request URL: " + queryURL);
			
		Ext.Ajax.request({
			url: queryURL,
			method: "GET",
			disableCaching: false,
			success: function(resp, opt) {
				try {
					var annos = resp.responseXML.getElementsByTagNameNS(lore.constants.NAMESPACES["rdf"], 'Description');
					annos = lore.anno.orderByDate(annos, 2);
					lore.anno.annosearchds.loadData(annos);
					if (resultCallback) {
						
						resultCallback('success', resp);
					}
				} catch (e ) {
					lore.debug.anno(e,e);
				}
			},
			failure: function(resp, opt){
				try {
					lore.debug.anno("Unable to retrieve annotations from " + opt.url, resp);
				if ( resultCallback) resultCallback('fail', resp);
				} catch (e ) {
					lore.debug.anno(e,e);
				}
			}
		});
		
	}
	
	/**
	 * Retrieve data from the record for the given annotation unique identifier
	 * @param {String} annoid
	 * @return {Object} Annotation object or null
	 */
	lore.anno.getAnnoData = function(annoid){
		var annoIndex = lore.anno.annods.findBy(function(record, id){
			return (annoid == record.json.id);
		});
		return lore.anno.annods.getAt(annoIndex);
	}
	
	
	/**
	 * Handler function that's called when annotation information is successfully
	 * returned from the server. Loads the annotations into the data store and loads
	 * the replies for annotations from the server.
	 * @param {Object} resp Response XML from the server
	 */
	lore.anno.handleAnnotationsLoaded = function(resp){
		var resultNodes = {};
		var xmldoc = resp.responseXML;
		if (xmldoc) {
			resultNodes = xmldoc.getElementsByTagNameNS(lore.constants.NAMESPACES["rdf"], "Description");
		}
		
		lore.anno.annods.each(function(rec) {
				
				if ( !lore.anno.isNewAnnotation(rec)) {
					lore.anno.annods.remove(rec);
				}
			});
			
		if (resultNodes.length > 0) {
			var annotations = lore.anno.orderByDate(resultNodes,3);
			
			
			lore.anno.annods.loadData(annotations, true);
		
			for (var i = 0; i < annotations.length; i++) {
				try {
					lore.anno.getBodyContentAsync(annotations[i], window);
				} catch (e) {
					lore.debug.anno('error loading body content: '+e,e);
				}
			}
			var annogriddata = [];
			for (var i = 0; i < annotations.length; i++) {
				var anno = annotations[i];
				var annoID = anno.id;
				var annoType = anno.type;
				
				// get annotation replies
				Ext.Ajax.request({
					disableCaching: false, // without this the request was failing
					method: "GET",
					url: lore.anno.annoURL + lore.constants.ANNOTEA_REPLY_TREE + annoID,
					success: lore.anno.handleAnnotationRepliesLoaded,
					failure: function(resp, opt){
						lore.debug.anno("Unable to obtain replies for " + opt.url, resp);
					}
				});
			}
		}
	}
	
	/**
	 * Handler function that is called when for each annotation that has replies.
	 * The replies are loaded into the data store
	 * @param {Object} resp Response XML from the server.
	 */
	lore.anno.handleAnnotationRepliesLoaded = function(resp){
		try {
			var replyList = resp.responseXML.getElementsByTagNameNS(lore.constants.NAMESPACES["rdf"], 'Description');
			var isLeaf = (replyList.length == 0);
			if (!isLeaf) {
				replies = lore.anno.orderByDate(replyList,3);
				lore.anno.annods.loadData(replies, true);
				for ( var i=0; i< replies.length; i++) {
					lore.anno.getBodyContentAsync(replies[i], window);
				}
			}
		} catch (e ) {
			lore.debug.anno(e,e);
		}
	}
	
	/**
	 * For all top level annotations on a page ( those that are not replies) that are not variation annotations
	 * generated RDF and transform it using the stylesheet supplied
	 * @param {String} stylesheetURL The url of the stylesheet to use for transforming the RDF into another format
	 * @param {Object} params Parameters to supply
	 * @param {Boolean} serialize Specify whether the output will be serialized to a string. Defaults to a document fragment.
	 * @return {Object} If serialize was supplied as true, then resulting XML will be returned as a string otherwise as a document fragment  
	 */
	lore.anno.transformRDF = function(stylesheetURL, params, serialize){
		//var annos = lore.anno.annods.getRange()
		// get top level non-variation annotations
		var annos = lore.anno.annods.queryBy( function (rec,id) { return !rec.data.isReply  && 
																		 !rec.data.type.match(lore.constants.NAMESPACES["vanno"]);}).getRange();
				
		return lore.global.util.transformRDF(stylesheetURL, lore.anno.createAnnotationRDF(annos, true), 
											params, window, serialize) 
	}
	
	/** Generate a Word document from the top-level, non-variation annotations on the page
	 * @param domNode HTML node to serialize
	 
	 * @return {String} The annotated page returned as String containing WordML XML.
	 */
	lore.anno.createAnnoWord = function(domNode){
		var serializer= new XMLSerializer();
		
		// attach a span in the location of the highlight for each annotation
		// santize
		// go through and search replace, adding the rdf
		// stylesheet transform
		
		//TODO: do as the comments say above, this code is for testing out the stylesheet transform
		// logic, as it supplied a stream with RDF & HTML.
		var annos = lore.anno.annods.queryBy( function (rec,id) { return !rec.data.isReply  && 
																		 !rec.data.type.match(lore.constants.NAMESPACES["vanno"]);}).getRange();
		var theRDF = lore.anno.createAnnotationRDF(annos, true);

		 //santize HTML
		var html = serializer.serializeToString(domNode);
		html = lore.global.util.sanitizeHTML(html, window);
		html = theRDF + "\n" + html;
		
		//lore.global.util.writeFile(html, "c:\\", "test.txt", window);
		//return lore.anno.transformRDF("chrome://lore/content/annotations/stylesheets/wordml.xsl", {}, true);
				
		return lore.global.util.transformRDF("chrome://lore/content/annotations/stylesheets/wordml.xsl", html, {}, window, true) 
	}
	
	/**
	 * Serialize the current annotations on the page into the given format. 
	 * @param {String} format The format to serialize the annotations in. 'wordml' or 'rdf'.
	 * @return {String} Returns the serialized annotations in the new format
	 */
	lore.anno.serialize = function ( format) {
		lore.debug.anno("serialize format: " + format);
		if ( format == 'wordml') {
			return lore.anno.createAnnoWord( lore.global.util.getContentWindow(window).document.body, true);
		} else if ( format == 'rdf') {
			return lore.anno.createAnnotationRDF(lore.anno.annods.getRange(), true);
		} else {
			return null;
		}
	}
	
	/**
	 * Import annotations into the local store, from a string containing valid RDF. 
	 * @param {String} theRDF String containing valid RDF conformant to the Annotea spec 
	 * @param {Object} theurl The url of the page this will be loaded into (not used currently)
	 * @param {Function} callback A callback function that is used by the function to output success or failure
	 * The callback should support the following parameters
	 * result: Result as a string ('success' or 'fail') 
	 * resultMsg: Result message
	 */
	lore.anno.importRDF = function( theRDF, theurl, callback){
		var parser = new DOMParser();
		var xmldoc = parser.parseFromString(theRDF, "text/xml");
			
		if (!xmldoc) {
			return;
		}
		
		var n = xmldoc.getElementsByTagNameNS(lore.constants.NAMESPACES["rdf"],"RDF")[0].childNodes;

		var resultNodes = [];
		for (var i = 0; i < n.length; i++) {
			if (n[i].localName == 'Description' && n[i].namespaceURI == lore.constants.NAMESPACES["rdf"]) {
				resultNodes.push(n[i]);
			}
		}
			
		if (resultNodes.length == 0) 
			return;
					
			
		var createAnno = function (anno) {
			
			if ( processed[anno.id] ) // shouldn't ever be true if there's no bugs
				return processed[anno.id];
				
			if ( anno.isReply ) {
				// create parents recursively, updating the about reference
				// to the the new id assigned by the server
				if (unprocessed[anno.about]) {
					if (!createAnno(unprocessed[anno.about]))
						return null;
				}
				anno.about = processed[anno.about].id;
			}
			var annoid = anno.id + '';
			
			
			anno.id = null;
			var annoRDF = lore.anno.createAnnotationRDF([anno]);
			var xhr = new XMLHttpRequest();
			xhr.open("POST", lore.anno.annoURL, false); //synchronous
			xhr.setRequestHeader('Content-Type', "application/rdf+xml");
			xhr.setRequestHeader('Content-Length', annoRDF.length);
			xhr.send(annoRDF);

			var success = xhr.status == 201;
			
			if ( success) {
				var xml = parser.parseFromString(xhr.responseText, "text/xml");
				var n = resultNodes = xml.getElementsByTagNameNS(lore.constants.NAMESPACES["rdf"], "Description");
				if (n && n.length == 1) {
					var newanno = new lore.anno.Annotation(n[0]);
					processed[annoid] = newanno;
					unprocessed[annoid] = null;
					lore.debug.anno("processed " + anno.title +"(" + annoid + ")", newanno);
					lore.anno.annods.loadData([newanno],true);
					return newanno; 
				} else {
					lore.debug.anno("error processing response xml. invalid xml.", {
						n: n,
						responseText: xhr.responseText
					});
				}
				
			} else {
				var msg = "error returned from server: " + xhr.status +": " + xhr.statusText;
				lore.debug.anno(msg, xhr.responseText);
				if (callback) callback('fail', msg );
			}
			return null;
		};
			
		var annotations = lore.anno.orderByDate(resultNodes, 1);
		var unprocessed = {};
		var processed = {};
		for ( var i =0; i < annotations.length; i++ ) {
			unprocessed[annotations[i].id] = annotations[i];
		}
		//lore.anno.annods.suspendEvents(false);
		var success = true;
		try {
			for (var i = 0; i < annotations.length; i++) {
				lore.debug.anno("processing anno " + annotations[i].title + "(" + annotations[i].id +")", annotations[i]);
				if (!createAnno(annotations[i])) {
					if (callback) callback('fail', "Annotation import failed for annotation, \"" + annotations[i].title +"\"");
					success = false;
					break;
				}
			}
		} catch (e) {
			lore.debug.anno("error occurred during annotations import process: " + e , e);
		}
		//lore.anno.annods.resumeEvents();
		
		if ( success) {
			if (callback) callback('success', 'All annotations imported successfully');
		}
	}
	

