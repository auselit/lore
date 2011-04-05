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
                this.id = "#new" + Math.uuid();
            }
            this.createdOrModified = (!this.modified || this.modified == '') ? this.created : this.modified;
            if (this.type.match(lore.constants.NAMESPACES["vanno"]) && !this.original) {
                this.original = this.resource;
            }
        },
		/**
		 * If rdf property supplied read in RDF and convert to name value pairs as properties
		 * of class
		 * @constructor
		 * @param {String} rdf The RDF
		 * @param {XMlDoc} xmldoc The complete document, used for grabbing unnamed RDF sets
		 * @param {Boolean} bodyEmbedded Whether the body value is embedded in the RDF or simply a URL to the body
		 */
		loadFromXML: function(rdf, xmldoc, bodyEmbedded){
		if (!rdf)
			return;
		var tmp;
		var node;
		var attr;
		/** @property rdf
         * The wrappered rdf
		 */
		this.rdf = rdf;
		try {
			attr = rdf.getAttributeNodeNS(lore.constants.NAMESPACES["rdf"], 'about');
			if (attr) {
                /** @property id
                 * Annotation URI (identifier)
                 */
				this.id = attr.nodeValue;
			} else {
				var nodeID = rdf.getAttributeNodeNS(lore.constants.NAMESPACES["rdf"], 'nodeID');
				if (nodeID) {
					// Not an Annotea Annotation
					return;
				}
			}
			var isReply = false;
			node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["rdf"], 'type');

			for (var i = 0; i < node.length; i++) {
				attr = node[i].getAttributeNodeNS(lore.constants.NAMESPACES["rdf"], 'resource');
				if (attr) {
					tmp = attr.nodeValue;
				}
				if (tmp.indexOf(lore.constants.NAMESPACES["annotype"]) == 0) {
                    /** @property type
                     * The annotation type
                     */
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
            /** @property isReply
             * @type boolean
             * Indicates whether this is a reply type of Annotation
             */
			this.isReply = isReply;

			if (!this.isReply) {
				// resource is a url
				node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["annotea"], 'annotates');

				attr = node[0].getAttributeNodeNS(lore.constants.NAMESPACES["rdf"], 'resource');
				if (attr) {
                    /** @property resource
                     * The URI of the resource annotated (from Annotea annotates)
                     */
					this.resource = attr.nodeValue;
				}
				this.about = null;
			}
			else {

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
                        /** @property about
                         *  If the annotation is a reply, about is the URI of the annotation to which is replies (from Annotea inReplyTo)
                         */
						this.about = attr.nodeValue;
					}
				}
			}

			node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["annotea"], 'body');

			if (!bodyEmbedded) {
				if (node[0]) {
					attr = node[0].getAttributeNodeNS(lore.constants.NAMESPACES["rdf"], 'resource');
					if (attr) {
                        /** @property bodyURL
                         * The URI of the body resource
                         */
						this.bodyURL = attr.nodeValue;
					}
				}
			} else {
				var node = node[0].getElementsByTagName('body');
				if ( node[0]) {

					var serializer = new XMLSerializer();
					var bodyText = serializer.serializeToString(node[0]);
                    /** @property body
                     * The content of the body resource
                     */
					this.body = lore.global.util.sanitizeHTML(bodyText, window) || '';
                    /** @property bodyLoaded
                     * @type boolean
                     * True if the {@link #body} property has been loaded from {@link #bodyURL}
                     */
					this.bodyLoaded = true;
				}
			}

			node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["annotea"], 'created');
            /** @property created
             * From Annotea created (the date and time when the annotation was created)
             */
			this.created = lore.global.util.safeGetFirstChildValue(node);

			node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["annotea"], 'modified');
            /** @property modified
             * From Annotea modified (the date and time when the annotation was last modified)
             */
			this.modified = lore.global.util.safeGetFirstChildValue(node);

			this.createdOrModified = (this.modified == '') ? this.created : this.modified;


            /**
             * @property privateAnno
             * Is this annotation 'private', ie, only visible to the current user
             */
            node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES['vanno'], 'private');
            this.privateAnno = lore.global.util.safeGetFirstChildValue(node) === 'true';

			this.meta = { context: null, fields: []};
			if (this.isReply) {
				this.context = '';
			} else {
				node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["annotea"], 'context');
                /** @property context
                 * From Annotea context
                 */
				this.context = lore.global.util.normalizeXPointer(lore.global.util.safeGetFirstChildValue(node));

				node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["vanno"], 'meta-context' );
				if (node && node.length > 0) {
					this.meta.context = lore.global.util.safeGetFirstChildValue(node);

					this.meta.context = this.meta.context.split('\n');
				}
				//TODO: #194 - Enable code to read in semantic facts added, once changes to backend and UI have been done
//				node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["vanno"], 'semantic-context');
//				if (node && node.length > 0) {
//					this.semantictriple = {};
//
//					var node2 = node[0].getElementByTagNameNS(lore.constants.NAMESPACES["rdf"], 'subject');
//					this.semantictriple.subject = node2.getAttributeNS(lore.constants.NAMESPACES["rdf"], 'resource')
//
//					node2 = node[0].getElementByTagNameNS(lore.constants.NAMESPACES["rdf"], 'predicate');
//					this.semantictriple.property = node2.getAttributeNS(lore.constants.NAMESPACES["rdf"], 'resource')
//
//					node2 = node[0].getElementByTagNameNS(lore.constants.NAMESPACES["rdf"], 'object');
//					this.semantictriple.object = node2.getAttributeNS(lore.constants.NAMESPACES["rdf"], 'resource')
//				}

			}


			node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["dc10"], 'creator');
            /** @property creator
             * dc:creator of the annotation
             */
			this.creator = lore.global.util.safeGetFirstChildValue(node, 'anon');

			node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["dc10"], 'title');
            /** @property title
             * dc:title of the annotation
             */
			this.title = lore.global.util.safeGetFirstChildValue(node);

			node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["dc10"], 'language');
            /** @property lang
             * dc:lang of the annotation
             */
			this.lang = lore.global.util.safeGetFirstChildValue(node);

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
                        /** @property tags
                         * Tags attached to the annotation
                         */
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
                        /** @property variant
                         * For a VariationAnnotation, the URI of the variant resource
                         */
						this.variant = attr.nodeValue;
					}
				}

				node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["vanno"], 'original');
				if (node[0]) {
					attr = node[0].getAttributeNodeNS(lore.constants.NAMESPACES["rdf"], 'resource');
					if (attr) {
                        /** @property original
                         * For a VariationAnnotation, the URI of the original resource
                         */
						this.original = attr.nodeValue;
					}
				}

				node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["vanno"], 'original-context');
                /** @property originalcontext
                 * For a VariationAnnotation, the context associated with the {@link #original} resource
                 */
				this.originalcontext = lore.global.util.safeGetFirstChildValue(node);

				node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["vanno"], 'variant-context');
				if (node.length == 0) {
					node = rdf.getElementsByTagNameNS(lore.constants.NAMESPACES["vanno"], 'revised-context');
				}
                /** @property variantcontext
                 * For a VariationAnnotation, the context associated with the {@link #variant} resource
                 */
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
			lore.debug.anno("Error parsing RDF " +
			(this.id ? ' for ' + this.id : ''), ex);
		}
	},

    toString: function(){
            return "Annotation [" + this.id + "," +
            (this.modified ? this.modified : this.created) +
            "," +
            lore.global.util.splitTerm(this.type).term +
            "]";
    },
	/**
	 * Determine whether an annotation is new, and is not in the respository
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

}

lore.anno.RDFAnnotationSerializer.prototype = {
	/**
	 * Generate the RDF for an array of annotations
	 * @param {Array} annos An array of records or Annotation objects
	 * @param {Object} storeDates (Optional) Specify whethere dates are to be stored in the RDF. Defaults to false
	 * @return {String} The RDF that was generated
	 */

	serialize: function ( annos, store, storeDates ) {
		if (!annos.length )
			annos = [annos];


		var rdfxml = "<?xml version=\"1.0\" ?>";
		rdfxml += '<rdf:RDF xmlns:rdf="' + lore.constants.NAMESPACES["rdf"] + '">';

		for (var i = 0; i < annos.length; i++) {
			var annoOrig =  annos[i].data || annos[i]; // an array of records or anno objects
			var anno = {};

			for (var e in annoOrig) {
				var val = annoOrig[e];
				if (e!= 'body' && e!='tags' && typeof(val) == 'string') {
					anno[e] = val.replace(/&/g, '&amp;');
				}
				else
					anno[e] =val;

			}

			//lore.debug.anno('Serializing annotation to RDF/XML', {anno:anno});

			rdfxml += '<rdf:Description';
			if (annoOrig.id && !annoOrig.isNew() ) {
				rdfxml += ' rdf:about="' + anno.id + '"';
			}
			rdfxml += ">";
			if (annoOrig.isReply) {
				rdfxml += '<rdf:type rdf:resource="http://www.w3.org/2001/03/thread#Reply"/>';
			}
			else {
				rdfxml += '<rdf:type rdf:resource="' + lore.constants.NAMESPACES["annotea"] +
				'Annotation"/>';
			}
			if (annoOrig.type) {
				rdfxml += '<rdf:type rdf:resource="' + anno.type + '"/>';
			}

			if (annoOrig.isReply) {
				rdfxml += '<inReplyTo xmlns="' + lore.constants.NAMESPACES["thread"] + '" rdf:resource="' + anno.about + '"/>';

				var rootannonode = lore.global.util.findRecordById(store, annoOrig.about);
				if (rootannonode) {
					while (rootannonode.data.isReply) {
						rootannonode = lore.global.util.findRecordById(store, rootannonode.data.about);
					}
					rdfxml += '<root xmlns="' + lore.constants.NAMESPACES["thread"] + '" rdf:resource="' + rootannonode.data.id.replace(/&/g,'&amp;') + '"/>';
				}
				else {
					rdfxml += '<root xmlns="' + lore.constants.NAMESPACES["thread"] + '" rdf:resource="' + anno.about + '"/>';
				}

			} else {

				if (annoOrig.variant) {
					rdfxml += '<annotates xmlns="' + lore.constants.NAMESPACES["annotea"] +
					'" rdf:resource="' +
					anno.original +	'"/>';
					rdfxml += '<annotates xmlns="' + lore.constants.NAMESPACES["annotea"] +
					'" rdf:resource="' +
					anno.variant +
					'"/>';
				}
				else {
					rdfxml += '<annotates xmlns="' + lore.constants.NAMESPACES["annotea"] +
					'" rdf:resource="' +
					anno.resource +
					'"/>';
				}
				// also send variant as annotates for backwards compatability with older
				// clients

			}

			if (annoOrig.lang) {
				rdfxml += '<language xmlns="' + lore.constants.NAMESPACES["dc10"] + '">' +
				anno.lang +
				'</language>';
			}
			if (annoOrig.title) {
				rdfxml += '<title xmlns="' + lore.constants.NAMESPACES["dc10"] + '">' + anno.title +
				'</title>';
			}
			if (annoOrig.creator) {
				rdfxml += '<creator xmlns="' + lore.constants.NAMESPACES["dc10"] + '">' +
				lore.global.util.trim(anno.creator) +
				'</creator>';
			}
			if (!annoOrig.created) {
				anno.created = new Date();
			}
			if (storeDates) {
				// TODO: #48 - store as dates not strings
				rdfxml += '<created xmlns="' + lore.constants.NAMESPACES["annotea"] + '">'
						+ anno.created.toString() + '</created>';
				anno.modified = new Date();
				rdfxml += '<modified xmlns="' + lore.constants.NAMESPACES["annotea"] + '">'
						+ anno.modified.toString() + '</modified>';
			}
			if (annoOrig.context) {
				rdfxml += '<context xmlns="' + lore.constants.NAMESPACES["annotea"] + '">' +
				lore.global.util.getContentWindow(window).location.href.replace(/&/g, '&amp;') + "#" + anno.context +
				'</context>';
			}

			if (annoOrig.type == lore.constants.NAMESPACES["vanno"] + "VariationAnnotation") {
				if (annoOrig.originalcontext) {
					rdfxml += '<original-context xmlns="' +
					lore.constants.NAMESPACES["vanno"] +
					'">' +
					anno.originalcontext +
					'</original-context>';
				}
				if (annoOrig.variantcontext) {
					rdfxml += '<variant-context xmlns="' +
					lore.constants.NAMESPACES["vanno"] +
					'">' +
					anno.variantcontext +
					'</variant-context>';
				}
				if (annoOrig.variationagent) {
					rdfxml += '<variation-agent xmlns="' +
					lore.constants.NAMESPACES["vanno"] +
					'">' +
					anno.variationagent +
					'</variation-agent>';
				}
				if (annoOrig.variationplace) {
					rdfxml += '<variation-place xmlns="' +
					lore.constants.NAMESPACES["vanno"] +
					'">' +
					anno.variationplace +
					'</variation-place>';
				}
				if (annoOrig.variationdate) {
					rdfxml += '<variation-date xmlns="' +
					lore.constants.NAMESPACES["vanno"] +
					'">' +
					anno.variationdate +
					'</variation-date>';
				}
				if (annoOrig.original) {
					rdfxml += '<original xmlns="' +
					lore.constants.NAMESPACES["vanno"] +
					'" rdf:resource="' +
					anno.original +
					'"/>';
				}
				if (annoOrig.variant) {
					rdfxml += '<variant xmlns="' +
					lore.constants.NAMESPACES["vanno"] +
					'" rdf:resource="' +
					anno.variant +
					'"/>';
				}
			}
			if (annoOrig.tags) {
				var tagsarray = anno.tags.split(',');

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

			if ( annoOrig.scholarly) {
				if ( annoOrig.scholarly.references) {
					rdfxml += '<references xmlns="' + lore.constants.NAMESPACES["vanno"] + '">';
					rdfxml += anno.scholarly.references;
					rdfxml += '</references>';
				}

				if ( annoOrig.scholarly.importance) {
					rdfxml += '<importance xmlns="' + lore.constants.NAMESPACES["vanno"] + '">';
					rdfxml += anno.scholarly.importance;
					rdfxml += '</importance>';
				}
			}

            if (annoOrig.privateAnno) {
                rdfxml += '<private xmlns="' + lore.constants.NAMESPACES["vanno"] + '">';
                rdfxml += 'true';
                rdfxml += '</private>';
            }
//			if (annoOrig.semantictriple) {
//				var doc = document.implementation.createDocument("","",null);
//				var semanticContext = doc.createElementNS(lore.constants.NAMESPACES["vanno"], 'semantic-context');
//				var rdfStatement = doc.createElementNS(lore.constants.NAMESPACES['rdf'], 'rdf:Statement');
//
//				var rdfEl = doc.createElementNS(lore.constants.NAMESPACES["rdf"], 'rdf:subject');
//				rdfEl.setAttribute('rdf:resource', annoOrig.semantictriple.subject);
//				rdfStatement.appendChild(rdfEl);
//
//				rdfEl = doc.createElementNS(lore.constants.NAMESPACES["rdf"], 'rdf:predicate');
//				rdfEl.setAttribute('rdf:resource', annoOrig.semantictriple.property);
//				rdfStatement.appendChild(rdfEl);
//
//				rdfEl = doc.createElementNS(lore.constants.NAMESPACES["rdf"], 'rdf:object');
//				rdfEl.setAttribute('rdf:resource', annoOrig.semantictriple.object);
//
//				semanticContext.appendChild(rdfStatement);
//				rdfStatement.appendChild(rdfEl);
//				doc.appendChild(semanticContext);
//
//				var serializer = new XMLSerializer();
//				rdfxml += serializer.serializeToString(doc);
//			}

			if (anno.type.indexOf('Metadata') > -1) {
				var meta = annoOrig.meta;
				var doc = document.implementation.createDocument("","",null);
				var body = doc.createElementNS(lore.constants.NAMESPACES["annotea"], 'body');
				doc.appendChild(body);

				var rdfDesc = doc.createElementNS(lore.constants.NAMESPACES["rdf"], 'rdf:Description');
				body.appendChild(rdfDesc);

				var node = doc.createElementNS(lore.constants.NAMESPACES["http"], 'ContentType');
				var textNode = doc.createTextNode('application/rdf+xml');
				node.appendChild(textNode);
				rdfDesc.appendChild(node);

				body = doc.createElementNS(lore.constants.NAMESPACES["http"], 'Body');
				body.setAttribute('rdf:parseType', 'Literal');
				rdfDesc.appendChild(body);

				var pi = doc.createProcessingInstruction('xml-stylesheet', 'href="/danno/stylesheets/meta-to-html.xslt" type="text/xsl"');
				body.appendChild(pi);
				node = this.createMetaRDFBody(annoOrig);
				node = doc.importNode(node, true);
				body.appendChild(node);

				var serializer = new XMLSerializer();
				rdfxml += serializer.serializeToString(doc);
			} else {
				if (annoOrig.body != null) {
					rdfxml += '<body xmlns="' + lore.constants.NAMESPACES["annotea"] +
					'">' + this.createHtmlBodyRDF(anno.title, anno.body) + '</body>';
				}
			}

			rdfxml += '</rdf:Description>';
		}
		rdfxml += '</rdf:RDF>';

		return rdfxml;
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
				var rdfStatement = doc.createElementNS(lore.constants.NAMESPACES['austlit'], meta[i].name);
				var textNode = doc.createTextNode(meta[i].value);
				rdfStatement.appendChild(textNode);
				body.appendChild(rdfStatement);
		}
		return node;
	},
	/**
	 * Generate RDF for annotation body
	 * @param {String} title Annotation Title
	 * @param {String} body Annotation Body
	 */
	createHtmlBodyRDF : function (title, body) {
		return '<rdf:Description>' +
				'<ContentType xmlns="' +
				lore.constants.NAMESPACES["http"] +
				'">text/html</ContentType>' +
				'<Body xmlns="' +
				lore.constants.NAMESPACES["http"] +
				'" rdf:parseType="Literal">' +
				'<html xmlns="http://www.w3.org/1999/xhtml"><head><title>' +
				(title ? title : 'Annotation') +
				'</title></head>' +
				'<body>' +
				lore.global.util.sanitizeHTML(body, window) +
				'</body></html>' +
				'</Body></rdf:Description>';
	}

}

/**
 * Class that serializes Annotation object/s as OAC RDF
 * @class lore.anno.OACAnnotationSerialize
 */
lore.anno.OACAnnotationSerializer  = function () {

}

lore.anno.OACAnnotationSerializer.prototype = {
	/**
     * Generate OAC RDF using rdfquery to serialize
     * @param {Array} annos An array of records or Annotation objects
     * @param {Object} storeDates (Optional) Specify whethere dates are to be stored in the OAC RDF. Defaults to false
     * @return {String} The RDF that was generated
	 */
    serialize : function (annos, store, storeDates ) {
        var genTarget = function(target, context){
            if (context){
	            var hashloc = context.indexOf('#');
	            if (hashloc == 0){ // context starts with hash, assume fragment identifier
	                rdfdb.add(annoid + " oac:hasTarget <" + target + context + ">");
	            } else if (hashloc > 0){ // context contains hash, assume targetURL + fragment identifier
	                rdfdb.add(annoid + " oac:hasTarget <" + context + ">");
	            } else { 
                    // TODO: check if context contains an xpointer
                    if (context.match("xpointer").index == 0){
                        rdfdb.add(annoid + " oac:hasTarget <" + target + "#" + context + ">");
                    } else {
		                // generate a ConstrainedTarget and constraint with content as text
		                var ctuuid = "<urn:uuid:" + Math.uuid() + ">"; // constrained target
		                var cuuid = "<urn:uuid:" + Math.uuid() + ">"; // constraint
		                rdfdb.add(annoid + " oac:hasTarget " + ctuuid)
		                .add(ctuuid + " oac:constrains <" + target + ">")
		                .add(ctuuid + " a oac:ConstrainedTarget")
		                .add(ctuuid + " oac:constrainedBy " + cuuid)
		                .add(cuuid + " a oac:Constraint")
		                .prefix('cnt', 'http://www.w3.org/2008/content#')
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
                annoid = "_:anno" + Math.uuid();
            }
            if (!anno.privateAnno){ // don't export private annotations to OAC
	            if (anno.isReply) {
	                rdfdb.add(annoid + " a oac:Reply");
	            } else {
	                rdfdb.add(annoid + " a oac:Annotation");
	            }
	            if (anno.bodyURL){
	                // For a metadata annotation this will be an RDF document, for others it will be html
	                rdfdb.add(annoid + " oac:hasBody <" + anno.bodyURL + ">");
	            }
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
	                var buuid = "<urn:uuid:" + Math.uuid() + ">"; // tag body
	                var tagsrdfxml = '<rdf:RDF xmlns:rdf="' + lore.constants.NAMESPACES["rdf"] 
	                    + '" xmlns:vanno="' + lore.constants.NAMESPACES["vanno"] + '">'
	                    + '<rdf:Description about="' + anno.resource + '">';
		            for (var ti = 0; ti < tagsarray.length; ti++) {
		                var thetag = lore.global.util.escapeHTML(tagsarray[ti]);
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
	                var agentid = anno.agentId? "<" + anno.agentId + ">" : ("_:user" + Math.uuid()); // TODO: get user id from original annotation
	                rdfdb.add(annoid + " dcterms:creator " + agentid)
	                .add(agentid + " a foaf:Agent")
	                .add(agentid + " foaf:name \"" + lore.global.util.trim(anno.creator) + "\"");
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
            }
        };
        //lore.debug.anno("oac serialize to databank", rdfdb);
        //+ '<rdf:value>' + this.convertImageRangeXpointerToMediaFragment(anno.context) + '</rdf:value>'
            
        return rdfdb.dump({format:'application/rdf+xml',serialize:true});
    },
    

	convertImageRangeXpointerToMediaFragment: function(/*string*/xpointer) {
		if (!lore.global.util.isXPointerImageRange(xpointer))
			return xpointer;

		var decoded = lore.global.util.decodeImageRangeXPointer(xpointer);
		var x = decoded.coords.x1,
		    y = decoded.coords.y1,
		    w = decoded.coords.x2 - x,
		    h = decoded.coords.y2 - y;



		return decoded.imgUrl + '#xywh=' + [x,y,w,h].join(',');
	}

}
