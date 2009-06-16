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

lore.anno.variationInformation = [];

lore.anno.variationStore = new Ext.data.SimpleStore({
			fields : [{
						name : "name"
					}]
		});

lore.anno.variationStore.loadData([]);

/**
 * Class wrapper for an RDF annotation provides access to values modified from
 * dannotate.js
 * 
 * @param rdf
 *            Root element of an RDF annotation returned by Danno
 */
lore.anno.Annotation = function(rdf) {
    
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
			attr = node[i].getAttributeNodeNS(lore.constants.RDF_SYNTAX_NS,
					'resource');
			if (attr) {
				tmp = attr.nodeValue;
			}
			if (tmp.indexOf(lore.constants.ANNOTATION_TYPE_NS) == 0) {
				this.type = tmp;
			} else if (tmp.indexOf(lore.constants.REPLY_TYPE_NS) == 0) {
				this.type = tmp;
			} else if (tmp.indexOf(lore.constants.VARIATION_ANNOTATION_NS) == 0) {
				this.type = tmp;
			} else if (tmp.indexOf(lore.constants.THREAD_NS) == 0) {
				isReply = true;
			}

		}
		this.isReply = isReply;

		if (!this.isReply) {
			node = rdf.getElementsByTagNameNS(lore.constants.ANNOTATION_NS,
					'annotates');
			attr = node[0].getAttributeNodeNS(lore.constants.RDF_SYNTAX_NS,
					'resource');
			if (attr) {
				this.resource = attr.nodeValue;
			}
			this.about = null;
		} else {
			node = rdf.getElementsByTagNameNS(lore.constants.THREAD_NS, 'root');
			attr = node[0].getAttributeNodeNS(lore.constants.RDF_SYNTAX_NS,
					'resource');
			if (attr) {
				this.resource = attr.nodeValue;
			}
			node = rdf.getElementsByTagNameNS(lore.constants.THREAD_NS,
					'inReplyTo');
			attr = node[0].getAttributeNodeNS(lore.constants.RDF_SYNTAX_NS,
					'resource');
			if (attr) {
				this.about = attr.nodeValue;
			}
		}

		node = rdf.getElementsByTagNameNS(lore.constants.ANNOTATION_NS, 'body');
		attr = node[0].getAttributeNodeNS(lore.constants.RDF_SYNTAX_NS,
				'resource');
		if (attr) {
			this.bodyURL = attr.nodeValue;
		}
		node = rdf.getElementsByTagNameNS(lore.constants.ANNOTATION_NS,
				'created');
		this.created = lore.util.safeGetFirstChildValue(node);
		node = rdf.getElementsByTagNameNS(lore.constants.ANNOTATION_NS,
				'modified');
		this.modified = lore.util.safeGetFirstChildValue(node);

		if (this.isReply) {
			this.context = '';
		} else {
			node = rdf.getElementsByTagNameNS(lore.constants.ANNOTATION_NS,
					'context');
			this.context = lore.util.safeGetFirstChildValue(node);
		}

		node = rdf.getElementsByTagNameNS(lore.constants.DC10_NS, 'creator');
		this.creator = lore.util.safeGetFirstChildValue(node, 'anon');

		node = rdf.getElementsByTagNameNS(lore.constants.DC10_NS, 'title');
		this.title = lore.util.safeGetFirstChildValue(node);

		node = rdf.getElementsByTagNameNS(lore.constants.DC10_NS, 'language');
		this.lang = lore.util.safeGetFirstChildValue(node);

		// body stores the contents of the html body tag as text
		this.body = lore.anno.getBodyContent(this.bodyURL);

		// Additional fields for variation annotations only
		if (this.type.match(lore.constants.VARIATION_ANNOTATION_NS)) {
			node = rdf.getElementsByTagNameNS(
					lore.constants.VARIATION_ANNOTATION_NS, 'variant');
			if (node.length == 0) {
				node = rdf.getElementsByTagNameNS(
						lore.constants.VARIATION_ANNOTATION_NS, 'revised');
			}
			if (node[0]) {
				attr = node[0].getAttributeNodeNS(lore.constants.RDF_SYNTAX_NS,
						'resource');
				if (attr) {
					this.variant = attr.nodeValue;
				}
			}
			node = rdf.getElementsByTagNameNS(
					lore.constants.VARIATION_ANNOTATION_NS, 'original');
			if (node[0]) {
				attr = node[0].getAttributeNodeNS(lore.constants.RDF_SYNTAX_NS,
						'resource');
				if (attr) {
					this.original = attr.nodeValue;
				}
			}
			node = rdf.getElementsByTagNameNS(
					lore.constants.VARIATION_ANNOTATION_NS, 'original-context');
			this.originalcontext = lore.util.safeGetFirstChildValue(node);
			node = rdf.getElementsByTagNameNS(
					lore.constants.VARIATION_ANNOTATION_NS, 'variant-context');
			if (node.length == 0) {
				node = rdf.getElementsByTagNameNS(
						lore.constants.VARIATION_ANNOTATION_NS,
						'revised-context');
			}
			this.variantcontext = lore.util.safeGetFirstChildValue(node);
			node = rdf.getElementsByTagNameNS(
					lore.constants.VARIATION_ANNOTATION_NS, 'variation-agent');
			if (node.length == 0) {
				node = rdf.getElementsByTagNameNS(
						lore.constants.VARIATION_ANNOTATION_NS,
						'revision-agent');
			}
			this.variationagent = lore.util.safeGetFirstChildValue(node);
			node = rdf.getElementsByTagNameNS(
					lore.constants.VARIATION_ANNOTATION_NS, 'variation-place');
			if (node.length == 0) {
				node = rdf.getElementsByTagNameNS(
						lore.constants.VARIATION_ANNOTATION_NS,
						'revision-place');
			}
			this.variationplace = lore.util.safeGetFirstChildValue(node);
			node = rdf.getElementsByTagNameNS(
					lore.constants.VARIATION_ANNOTATION_NS, 'variation-date');
			if (node.length == 0) {
				node = rdf
						.getElementsByTagNameNS(
								lore.constants.VARIATION_ANNOTATION_NS,
								'revision-date');
			}
			this.variationdate = lore.util.safeGetFirstChildValue(node);
		}
	} catch (ex) {
		lore.debug.anno("Error parsing RDF"
						+ (this.id ? ' for ' + this.id : ''), ex);
	}
    this.toString = function(){
        return "Annotation[" + this.id + "," + (this.modified? this.modified : this.created) + "]";
    }
}

/**
 * Launch create annotation form with context and annotates filled in from
 * current browser resource
 */
lore.anno.addAnnotation = function() {

	var currentContext = "";
    try {
        currentContext = lore.util.getXPathForSelection();
    } catch (e) {
        lore.debug.anno("exception creating xpath for new annotation",e);
    }
	var anno = {
		resource : lore.ui.currentURL,
		original : lore.ui.currentURL,
		context : currentContext,
		originalcontext : currentContext,
		creator : lore.defaultCreator,
		created : new Date(),
		modified : new Date(),
		body : "",
		title : "New Annotation",
		type : lore.constants.ANNOTATION_TYPE_NS + "Comment",
		lang : "en"
	};
	lore.anno.annotabds.loadData([anno], true);
	// get the annotation record
	var annoIndex = lore.anno.annotabds.findBy(function(record, id) {
				return (!record.json.id);
			});
	// select the row to load into the editor
	lore.anno.annotabsm.selectRow(annoIndex);
	lore.ui.loreviews.activate("annotationstab");
    
}
/**
 * Highlight all annotations on the current page
 */
lore.anno.showAllAnnotations = function(){
    alert("not yet implemented");
}
lore.anno.createAnnotationRDF = function(anno) {
	var rdfxml = "<?xml version=\"1.0\" ?>";
	rdfxml += '<rdf:RDF xmlns:rdf="' + lore.constants.RDF_SYNTAX_NS + '">';
	rdfxml += '<rdf:Description';
	if (anno.id) {
		rdfxml += ' rdf:about="' + anno.id + '"';
	}
	rdfxml += '><rdf:type rdf:resource="' + lore.constants.ANNOTATION_NS
			+ 'Annotation"/>';
	if (anno.type) {
		rdfxml += '<rdf:type rdf:resource="' + anno.type + '"/>';
	}
	rdfxml += '<annotates xmlns="' + lore.constants.ANNOTATION_NS
			+ '" rdf:resource="' + anno.resource.replace(/&/g, '&amp;') + '"/>';
	// also send variant as annotates for backwards compatability with older
	// clients
	/*
	 * not currently supported in danno if (anno.variant){ rdfxml += '<annotates
	 * xmlns="http://www.w3.org/2000/10/annotation-ns#" rdf:resource="' +
	 * anno.variant + '"/>'; }
	 */
	if (anno.lang) {
		rdfxml += '<language xmlns="' + lore.constants.DC10_NS + '">'
				+ anno.lang + '</language>';
	}
	if (anno.title) {
		rdfxml += '<title xmlns="' + lore.constants.DC10_NS + '">' + anno.title
				+ '</title>';
	}
	if (anno.creator) {
		rdfxml += '<creator xmlns="' + lore.constants.DC10_NS + '">'
				+ anno.creator + '</creator>';
	}
	if (!anno.created) {
		anno.created = new Date();
	}
	// TODO: format date strings
	rdfxml += '<created xmlns="' + lore.constants.ANNOTATION_NS + '">'
			+ anno.created.toString() + '</created>';
	anno.modified = new Date();
	rdfxml += '<modified xmlns="' + lore.constants.ANNOTATION_NS + '">'
			+ anno.modified.toString() + '</modified>';
	if (anno.context) {
		rdfxml += '<context xmlns="' + lore.constants.ANNOTATION_NS + '">'
				+ anno.context + '</context>';
	}
	if (anno.type == lore.constants.VARIATION_ANNOTATION_NS
			+ "VariationAnnotation") {
		if (anno.originalcontext) {
			rdfxml += '<original-context xmlns="'
					+ lore.constants.VARIATION_ANNOTATION_NS + '">'
					+ anno.originalcontext + '</original-context>';
		}
		if (anno.variantcontext) {
			rdfxml += '<variant-context xmlns="'
					+ lore.constants.VARIATION_ANNOTATION_NS + '">'
					+ anno.variantcontext + '</variant-context>';
		}
		if (anno.variationagent) {
			rdfxml += '<variation-agent xmlns="'
					+ lore.constants.VARIATION_ANNOTATION_NS + '">'
					+ anno.variationagent + '</variation-agent>';
		}
		if (anno.variationplace) {
			rdfxml += '<variation-place xmlns="'
					+ lore.constants.VARIATION_ANNOTATION_NS + '">'
					+ anno.variationplace + '</variation-place>';
		}
		if (anno.variationdate) {
			rdfxml += '<variation-date xmlns="'
					+ lore.constants.VARIATION_ANNOTATION_NS + '">'
					+ anno.variationdate + '</variation-date>';
		}
		if (anno.original) {
			rdfxml += '<original xmlns="'
					+ lore.constants.VARIATION_ANNOTATION_NS
					+ '" rdf:resource="' + anno.original + '"/>';
		}
		if (anno.variant) {
			rdfxml += '<variant xmlns="'
					+ lore.constants.VARIATION_ANNOTATION_NS
					+ '" rdf:resource="' + anno.variant + '"/>';
		}
	}
	if (anno.body) {
		rdfxml += '<body xmlns="' + lore.constants.ANNOTATION_NS
				+ '"><rdf:Description>' + '<ContentType xmlns="'
				+ lore.constants.HTTP_NS
				+ '">application/xhtml+xml</ContentType>' + '<Body xmlns="'
				+ lore.constants.HTTP_NS + '" rdf:parseType="Literal">'
				+ '<html xmlns="' + lore.constants.XHTML_NS + '"><head><title>'
				+ (anno.title ? anno.title : 'Annotation') + '</title></head>'
				+ '<body>' + anno.body.tidyHTML() + '</body></html>'
				+ '</Body></rdf:Description>' + '</body>';
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
lore.anno.orderByDate = function(nodeList) {
	var tmp = [];
	for (var j = 0; j < nodeList.length; j++) {
		try {
			tmp[j] = new lore.anno.Annotation(nodeList.item(j));
		} catch (ex) {
			lore.debug.anno("Exception processing annotations", ex);
		}
	}
	return tmp.length == 1 ? tmp : tmp.sort(function(a, b) {
		return (a.created > b.created ? 1 : -1);
	});
}

lore.anno.hideMarker = function() {
	if (lore.anno.annoMarker) {
		// hide the marker
		lore.anno.annoMarker.style.backgroundColor = "transparent";
	}
}
lore.anno.setVisibilityFormField = function(fieldName, hide) {
	var thefield = lore.ui.annotationsform.findField(fieldName);
	if (thefield) {
		var cont = thefield.container.up('div.x-form-item');
		cont.enableDisplayMode();

		if (hide && cont.isVisible()) {
			cont.slideOut();
		} else if (!hide && !cont.isVisible()) {
			cont.slideIn();
		}
	}
}
lore.anno.hideFormFields = function(fieldNameArr) {
	for (var i = 0; i < fieldNameArr.length; i++) {
		lore.anno.setVisibilityFormField(fieldNameArr[i], true);
	}
}
lore.anno.showFormFields = function(fieldNameArr) {
	for (var i = 0; i < fieldNameArr.length; i++) {
		lore.anno.setVisibilityFormField(fieldNameArr[i], false);
	}
}
lore.anno.setAnnotationFormUI = function(variation) {
	var nonVariationFields = ['resource'];
	var variationFields = ['original', 'variant',
			'rcontextdisp', 'variationagent',
			'variationplace', 'variationdate'];
	if (variation) {
		lore.anno.hideFormFields(nonVariationFields);
		lore.anno.showFormFields(variationFields);
	} else {
		lore.anno.hideFormFields(variationFields);
        lore.anno.showFormFields(nonVariationFields);
	}
}
lore.anno.updateVariationAnnotationList = function() {
	lore.anno.variationStore.removeAll();
	var revStoreData = [];
	lore.anno.variationInformation = [];
	for (var i = 0; i < lore.anno.annotabds.data.items.length; i++) {
		var variationType = lore.anno.annotabds.data.items[i].data.type;

		if (variationType != lore.constants.VARIATION_ANNOTATION_NS
				+ 'VariationAnnotation') {
			continue;
		}
		revStoreData.push([lore.anno.annotabds.data.items[i].data.title]);
		lore.anno.variationInformation.push(lore.anno.annotabds.data.items[i].data);
	}
	lore.anno.setVariationFrameURLs('about:blank', 'about:blank');
	lore.anno.variationStore.loadData(revStoreData);
}

lore.anno.onVariationsShow = function(variationsPanel) {
	// lore.debug.anno("Render variations", variationsPanel);
	var targetPanel = Ext.getCmp("variationannotationtarget");
	var sourcePanel = Ext.getCmp("variationannotationsource");
	var listPanel = Ext.getCmp("variationsleftcolumn");

	targetPanel.setSize(targetPanel.getSize().width,
			variationsPanel.getSize().height);
	sourcePanel.setSize(sourcePanel.getSize().width,
			variationsPanel.getSize().height);
	listPanel.setSize(listPanel.getSize().width,
			variationsPanel.getSize().height);
	var theFrame = document.getElementById('variationTargetFrame');
	theFrame.style.border = "none";
	theFrame.style.borderTop = "2px solid #eeeeee";
	theFrame.style.width = targetPanel.getSize().width
			- lore.anno.FRAME_WIDTH_CLEARANCE;
	theFrame.style.height = targetPanel.getSize().height
			- lore.anno.FRAME_HEIGHT_CLEARANCE;
	theFrame = document.getElementById('variationSourceFrame');
	theFrame.style.border = "none";
	theFrame.style.borderTop = "2px solid #eeeeee";
	theFrame.style.width = sourcePanel.getSize().width
			- lore.anno.FRAME_WIDTH_CLEARANCE;
	theFrame.style.height = sourcePanel.getSize().height
			- lore.anno.FRAME_HEIGHT_CLEARANCE;
}

lore.anno.highlightVariationFrames = function(variationNumber) {

	var sourceFrame = document.getElementById("variationSourceFrame");
	var targetFrame = document.getElementById("variationTargetFrame");

	var sourceVariationAlreadyPresent = false;
	var targetVariationAlreadyPresent = false;

	try {
		for (var i = 0; i < lore.anno.variationInformation.length; i++) {
			var annotationElement = sourceFrame.contentDocument
					.getElementById("ANNOTATION-" + i);

			if (annotationElement) {
				if (i == variationNumber) {
					annotationElement.style.backgroundColor = "yellow";
					lore.util.scrollToElement(annotationElement,
							sourceFrame.contentDocument.defaultView);
					sourceVariationAlreadyPresent = true;
				} else {
					annotationElement.style.backgroundColor = "";
				}
			}

			annotationElement = targetFrame.contentDocument
					.getElementById("ANNOTATION-" + i);
			if (annotationElement) {
				if (i == variationNumber) {
					annotationElement.style.backgroundColor = "yellow";
					lore.util.scrollToElement(annotationElement,
							targetFrame.contentDocument.defaultView);
					targetVariationAlreadyPresent = true;
				} else {
					annotationElement.style.backgroundColor = "";
				}
			}
		}

		if (!sourceVariationAlreadyPresent) {
			var sourceHighlightElement = lore.util
					.highlightXPointer(
							lore.anno.variationInformation[variationNumber].originalcontext,
							sourceFrame.contentDocument, true);
			sourceHighlightElement.id = "ANNOTATION-" + variationNumber;
		}

		if (!targetVariationAlreadyPresent) {
			var targetHighlightElement = lore.util
					.highlightXPointer(
							lore.anno.variationInformation[variationNumber].variantcontext,
							targetFrame.contentDocument, true);
			targetHighlightElement.id = "ANNOTATION-" + variationNumber;
		}
	} catch (error) {
		lore.debug.anno("Exception in highlightVariationFrames", error);
	}
}

lore.anno.onVariationListingClick = function(listingPanel, rowIndex) {
	var locationChanged = lore.anno.setVariationFrameURLs(
			lore.anno.variationInformation[rowIndex].original,
			lore.anno.variationInformation[rowIndex].variant);

	if (locationChanged) {
		setTimeout('lore.anno.highlightVariationFrames (' + rowIndex + ')',
				lore.anno.VARIATIONS_FRAME_LOAD_WAIT);
	} else {
		lore.anno.highlightVariationFrames(rowIndex);
	}

	try {
		var detailsString = "";

		detailsString += '<span style="font-weight: bold">Creator:</span> '
				+ lore.anno.variationInformation[rowIndex].creator + "<br />";
		detailsString += '<span style="font-weight: bold">Created:</span> '
				+ lore.anno.variationInformation[rowIndex].created + "<br />";
		detailsString += '<span style="font-weight: bold">Agent:</span> '
				+ lore.anno.variationInformation[rowIndex].variationagent + "<br />";
		detailsString += '<span style="font-weight: bold">Place:</span> '
				+ lore.anno.variationInformation[rowIndex].variationplace + "<br />";
		detailsString += '<span style="font-weight: bold">Date:</span> '
				+ lore.anno.variationInformation[rowIndex].variationdate + "<br />";
		detailsString += '<br/><span style="font-weight: bold; font-style: italic">Description:</span><br/> '
				+ lore.anno.variationInformation[rowIndex].body + "<br />";

		lore.ui.propertytabs.activate("annotationsummary");
		Ext.getCmp("annotationsummary").body.update(detailsString);

	} catch (error) {

		lore.debug.anno("Exception displaying variation annotation", error);

	}
}

lore.anno.handleFrameLoad = function(e) {
	var sourceFrame = document.getElementById("variationSourceFrame");
	var targetFrame = document.getElementById("variationTargetFrame");
	if (e.target == sourceFrame) {
		lore.debug.anno("variations source frame loaded", e);
	} else if (e.target == targetFrame) {
		lore.debug.anno("variations target frame loaded", e);
	} else {
		//lore.debug.anno("frame loaded", e);
	}
}

lore.anno.setVariationFrameURLs = function(sourceURL, targetURL) {
	var changeMade = false;
	var setFrameLabel = function(label, url) {
		if (url == "about:blank") {
			label.update(" ");
		} else {
			label.update(url);
		}
	};
	var setFrameURL = function(frame, url) {
		if (frame.dom.src != url) {
			frame.dom.src = url;
			changeMade = true;
		}
	};
	setFrameURL(Ext.get("variationSourceFrame"), sourceURL);
	setFrameURL(Ext.get("variationTargetFrame"), targetURL);
	setFrameLabel(Ext.get("variationSourceLabel"), sourceURL);
	setFrameLabel(Ext.get("variationTargetLabel"), targetURL);
	return changeMade;
}

lore.anno.handleAnnotationDeselection = function(sm, row, rec) {
	lore.anno.hideMarker();
	// update annotations grid from form if it's a new annotation
	if (lore.ui.annotationsform.isDirty() && !rec.data.id) {
		lore.ui.loreWarning("You haven't saved your new annotation!");
		lore.ui.annotationsform.updateRecord(rec);
	}
}

lore.anno.handleAnnotationSelection = function(sm, row, rec) {
	// load annotation grid values into form
	lore.ui.annotationsform.loadRecord(rec);
	// add a marker to indicate context
	// TODO: check first whether the currentURL is the original or variant
	// resource (assuming original for now)
	// TODO: hide the context text if it's not relevant (ie not on currentURL)
	// TODO: show variant context text if the currentURL is the variant resource
	if (rec.data.context) {
		var idx = rec.data.context.indexOf('#');
		var currentCtxt = rec.data.context.substring(idx + 1);
		var sel = lore.util.getSelectionForXPath(currentCtxt);
		lore.anno.annoMarker = lore.util.highlightXPointer(currentCtxt,
				window.top.getBrowser().selectedBrowser.contentWindow.document,
				true);
		// display contents of context
		var ctxtField = lore.ui.annotationsform.findField('contextdisp');
		ctxtField.setValue('"' + lore.util.getSelectionText(currentCtxt) + "'");
	}

}

lore.anno.handleCancelAnnotationEdit = function(btn, e) {
	// reset all annotation form items to empty
	lore.ui.annotationsform.items.each(function(item, index, len) {
				item.reset();
			});
	lore.anno.annotabsm.clearSelections();

	// if this is a new annotation, delete the new template annotation
	var annoIndex = lore.anno.annotabds.findBy(function(record, id) {
				return (!record.json.id);
			});
	if (annoIndex > 0) {
		lore.anno.annotabds.remove(lore.anno.annotabds.getAt(annoIndex));
	}
	lore.anno.hideMarker();
}

lore.anno.handleSaveAnnotationChanges = function(btn, e) {
	var annoID = lore.ui.annotationsform.findField('id').value;
	var annoIndex = lore.anno.annotabds.findBy(function(record, id) {
				if (annoID) {
					return (annoID == record.json.id);
				} else {
					return (!record.json.id);
				}
			});
	// get the annotation contents
	var anno = lore.anno.annotabds.getAt(annoIndex);
	// update anno with properties from form
	lore.ui.annotationsform.updateRecord(anno);
	lore.anno.annotabds.commitChanges();
	var annoRDF = lore.anno.createAnnotationRDF(anno.data);
	var xhr = new XMLHttpRequest();
	if (!annoID) {
		// create new annotation
		xhr.open("POST", lore.anno.annoURL, true);
		xhr.setRequestHeader('Content-Type', "application/rdf+xml");
		xhr.setRequestHeader('Content-Length', annoRDF.length);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				if (xhr.status == 201) {
					lore.ui.loreInfo('Annotation created');
					lore.ui.updateSourceLists(lore.ui.currentURL);
					lore.ui.annotationsform.items.each(function(item, index,
									len) {
								item.reset();
							});
					lore.anno.annotabsm.clearSelections();
				} else {
					lore.ui.loreInfo('Unable to create annotation: '
							+ xhr.statusText);
				}
			}
		};
		xhr.send(annoRDF);
		lore.anno.annotabds.remove(anno);
	} else {
		// update existing annotation
		if (!lore.ui.annotationsform.isDirty()) {
			lore.ui
					.loreInfo('Annotation content not modified: Annotation will not be updated');
			return;
		}
		// Update the annotation on the server via HTTP PUT
		xhr.open("PUT", annoID, true);
		xhr.setRequestHeader('Content-Type', "application/xml");
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					lore.ui.loreInfo('Annotation updated');
				} else {
					lore.ui.loreInfo('Unable to update annotation: '
							+ xhr.statusText);
				}
			}
		};
		xhr.send(annoRDF);
	}
}
lore.anno.handleDeleteAnnotation = function(btn, e) {
	try {
		// remove the annotation from the annotations tab
		var annoID = lore.ui.annotationsform.findField('id').value;
		var annoIndex = lore.anno.annotabds.findBy(function(record, id) {
					if (annoID) {
						return (annoID == record.json.id);
					} else {
						return (!record.json.id);
					}
				});
		lore.anno.annotabds.remove(lore.anno.annotabds.getAt(annoIndex));
		if (annoID) { // annoID is null if it's a new annotation
			// remove from the source tree
			lore.ui.annotationstreeroot.findChild('id', annoID).remove();
			// remove the annotation from the server
			Ext.Ajax.request({
						url : annoID,
						success : function() {
							lore.ui.loreInfo('Annotation deleted');
						},
						failure : function(resp) {
							lore.debug.anno("Annotation deletion failed", resp);
							lore.ui.loreWarning('Unable to delete annotation');
						},
						method : "DELETE"
					});
		}
		lore.ui.annotationsform.items.each(function(item, index, len) {
					item.reset();
				});
		lore.anno.annotabsm.clearSelections();
		lore.anno.hideMarker();
	} catch (ex) {
		lore.debug.anno("Exception when deleting annotation", ex);
		lore.ui.loreWarning("Unable to delete annotation: ");
	}
}
lore.anno.handleUpdateAnnotationContext = function(btn, e) {
	try {
		var currentCtxt = lore.util.getXPathForSelection();
		var theField = lore.ui.annotationsform.findField('context');
		theField.setValue(currentCtxt);
		theField = lore.ui.annotationsform.findField('originalcontext');
		theField.setValue(currentCtxt);
		theField = lore.ui.annotationsform.findField('resource');
		theField.setValue(lore.ui.currentURL);
		theField = lore.ui.annotationsform.findField('original');
		theField.setValue(lore.ui.currentURL);
		theField = lore.ui.annotationsform.findField('contextdisp');
		theField.setValue('"' + lore.util.getSelectionText(currentCtxt) + '"');
	} catch (ex) {
		lore.debug.anno("Exception updating anno context", ex);
	}
}
lore.anno.handleUpdateAnnotationVariantContext = function(btn, e) {
	try {
		var currentCtxt = lore.util.getXPathForSelection();
		var theField = lore.ui.annotationsform.findField('variantcontext');
		theField.setValue(currentCtxt);
		theField = lore.ui.annotationsform.findField('variant');
		theField.setValue(lore.ui.currentURL);
		theField = lore.ui.annotationsform.findField('rcontextdisp');
		theField.setValue('"' + lore.util.getSelectionText(currentCtxt) + '"');
	} catch (ex) {
		lore.debug.anno("Exception updating anno variant context", ex);
	}
}

lore.anno.handleAnnotationTypeChange = function(combo) {
	var theVal = combo.getValue();
	if (theVal == 'Variation') {
		lore.anno.setAnnotationFormUI(true);
	} else if (theVal == 'Comment' || theVal == 'Explanation') {
		lore.anno.setAnnotationFormUI(false);
	}
}

lore.anno.launchFieldWindow = function(field) {
	lore.util.launchWindow(field.value, true);
}

/**
 * Get annotation body value. modified from dannotate.js getAjaxRespSync
 * 
 * @param {String} uri Fully formed request against Danno annotation server
 * @return {Object} Server response as text or XML document.
 */
lore.anno.getBodyContent = function(uri) {
	var req = null;
	try {
		req = new XMLHttpRequest();
		req.open('GET', uri, false);
		req.setRequestHeader('User-Agent', 'XMLHttpRequest');
		req.setRequestHeader('Content-Type', 'application/text');
		req.send(null);
	} catch (ex) {
		lore.debug.anno("Error in synchronous AJAX request: " + uri, ex);
		return null;
	}

	if (req.status != 200) {
		var hst = (uri.length < 65) ? uri : uri.substring(0, 64) + '...';
		throw new Error('Synchronous AJAX request status error.\n  URI: ' + hst
				+ '\n  Status: ' + req.status);
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
		} else if (txt != null) {
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
	if (rtype == 'application/xml' || rtype == 'application/xhtml+xml') {
		bodyContent = req.responseXML.getElementsByTagName('body');
		if (bodyContent[0]) {
			return serializer.serializeToString(bodyContent[0]);
		} else {
			return req.responseText.tidyHTML();
		}
	} else {
		// messy but will have to do for now
		return req.responseText.tidyHTML();

	}
    lore.debug.anno("No usable annotation body for content: " + rtype + " request: " + uri, req);
    return "";
}

/**
 * Updates the annotations list
 * 
 * @param {String} theURL The escaped URL
 */
lore.anno.updateAnnotationsSourceList = function(theURL) {
    // clear the old annotations - only remove annotations with an id (don't clear a new annotation)
	lore.ui.clearTree(lore.ui.annotationstreeroot);
	lore.anno.annotabds.each(function(rec) {
		if (rec.data.id) {
			lore.anno.annotabds.remove(rec);
		}
	});
    if (lore.anno.annoEventSource){
        lore.anno.annoEventSource.clear();
    }
	// Get annotations for theURL
	if (lore.anno.annoURL) {
		var queryURL = lore.anno.annoURL + lore.anno.ANNOTATES + theURL;
		lore.ui.loreInfo("Loading annotations for " + theURL);
		Ext.Ajax.request({
			url: queryURL,
			method: "GET",
			disableCaching: false,
			success: lore.anno.handleAnnotationsLoaded,
			failure: function(resp, opt){
				lore.debug.anno("Unable to retrieve annotations from " + opt.url, resp);
                lore.ui.loreWarning("Unable to retrieve annotations");
            }
		});	
	}
}
lore.anno.addAnnoToTimeline = function(anno, title){
    lore.debug.anno(anno.toString(),anno);
   if (lore.anno.annoEventSource) {
    var annoicon = "comment.png";
    if (anno.isReply){
        annoicon = "comments.png";
    }
    
      var dateEvent = new Date();
      dateEvent = Date.parseDate(anno.created, "c");
      var evt = new Timeline.DefaultEventSource.Event({instant: true,
        icon: "chrome://lore/skin/icons/" + annoicon,
        start: dateEvent,
        text: title,
        eventID: anno.id,
        caption: lore.util.splitTerm(anno.type).term + " by "  + anno.creator + ", " + dateEvent.format("j/n/Y H:m"),
        description: "<span style='font-size:small;color:#51666b;'>" + lore.util.splitTerm(anno.type).term + " by " + anno.creator + "</span><br/>" + anno.body
        //description: "is reply to: "
      });
      lore.anno.annoEventSource.add(evt);       
      lore.anno.annotimeline.getBand(0).setCenterVisibleDate(evt.getStart());
      
   }
}
lore.anno.handleAnnotationsLoaded = function (resp){		
	var resultNodes = {};
	var xmldoc = resp.responseXML;
	if (xmldoc) {
		resultNodes = xmldoc.getElementsByTagNameNS(
				lore.constants.RDF_SYNTAX_NS,"Description");
	}
	if (resultNodes.length > 0) {
		var annotations = lore.anno.orderByDate(resultNodes);
		lore.anno.annotabds.loadData(annotations, true);
		lore.anno.updateVariationAnnotationList();
		var annogriddata = [];
		for (var i = 0; i < annotations.length; i++) {
            var anno = annotations[i];
			var annoID = anno.id;
			var annoType = anno.type;
			// get annotation replies
			Ext.Ajax.request({
				disableCaching : false, // without this the request was failing
				method : "GET",
				url : lore.anno.annoURL + lore.anno.REPLY_TREE + annoID,
				success : lore.anno.handleAnnotationRepliesLoaded,
				failure : function(resp, opt) {
					lore.debug.anno("Unable to obtain replies for "+ opt.url, resp);
				}
			});
			var title = anno.title;
			if (!title || title == '') {
				title = "Untitled";
			}
			lore.anno.addAnnoToTimeline(annotations[i], title);

			var tmpNode = new Ext.tree.TreeNode({
				id : annoID,
				rowIndex : i,
				text : title
                    + " <span style='font-style:italic'>("
					+ anno.creator + ")</span>",
                qtip: lore.util.splitTerm(anno.type).term + " by " + anno.creator + ", " + Date.parseDate(anno.created, 'c').format("j/n/Y H:m"),
				iconCls : 'anno-icon'
			});

			lore.ui.annotationstreeroot.appendChild(tmpNode);
            tmpNode.on('click', function(node){
               lore.ui.propertytabs.activate("annotationsummary"); 
            });
			tmpNode.on('dblclick', function(node) {
				lore.ui.loreviews.activate("annotationstab");
				Ext.getCmp("annotationstab").activate("annotationslistform");
				var annoIndex = lore.anno.annotabds.findBy(
					function(record, id) {
						return (node.id == record.json.id);
				});
				lore.anno.annotabsm.selectRow(annoIndex);
			});
			tmpNode.on('contextmenu', function(node, e) {
				if (!node.contextmenu) {
					node.contextmenu = new Ext.menu.Menu({
						id : node.id + "-context-menu"
					});
					node.contextmenu.add({
						text : "Add to compound object",
						handler : function(evt) {
							lore.ore.graph.addFigure(node.id);
						}
					});
					node.contextmenu.add({
						text : "Edit annotation",
						handler : function(evt) {
							lore.ui.loreviews.activate("annotationstab");
							Ext.getCmp("annotationstab").activate("annotationslistform");
							lore.anno.annotabsm.selectRow(node.attributes.rowIndex);
						}
					});
					if (annoType == lore.constants.VARIATION_ANNOTATION_NS + "VariationAnnotation") {
						node.contextmenu.add({
							text : "Show in Variations View",
							handler : function(evt) {
								lore.ui.loreviews.activate("annotationstab");
								Ext.getCmp("annotationstab").activate("variationannotations");
								// TODO: make it easier to
								// select the annotation in
								// the variations listing
							}
						});
					}
				}
				node.contextmenu.showAt(e.xy);
			});
		}
		if (!lore.ui.annotationstreeroot.isExpanded()) {
			lore.ui.annotationstreeroot.expand();
		}
        lore.anno.annotimeline.layout();
	}	
}
lore.anno.handleAnnotationRepliesLoaded = function(resp, opt) {
	var replyList = resp.responseXML.getElementsByTagNameNS(
		lore.constants.RDF_SYNTAX_NS, 'Description');
	var isLeaf = (replyList.length == 0);
	if (!isLeaf) {
        var annoURL = opt.url.substring((lore.anno.annoURL + lore.anno.REPLY_TREE).length);
        lore.debug.anno("handle annotation replies for " + annoURL, resp);
        var replyLookup = {};
        replyLookup[annoURL] = lore.ui.annotationstreeroot.findChild("id", annoURL);
        replies = lore.anno.orderByDate(replyList);
        for (var j = 0; j < replies.length; j++){
            lore.debug.anno("reply details", replies[j]);
            var title = replies[j].title;
            if (!title || title == '') {
                title = "Untitled reply";
            }
            lore.anno.addAnnoToTimeline(replies[j], title);
            
            var tmpNode = new Ext.tree.TreeNode({
                id : replies[j].id,
                text : title + " <span style='font-style:italic'>("
                    + replies[j].creator + ")</span>",
                iconCls : 'annoreply-icon', 
                qtip: lore.util.splitTerm(replies[j].type).term + " by " 
                    + replies[j].creator + ", " + Date.parseDate(replies[j].created, 'c').format("j/n/Y H:m")
                
                
            });
            
            var parentNode = replyLookup[replies[j].about];
            if (parentNode){
                parentNode.appendChild(tmpNode);
                replyLookup[replies[j].id] = tmpNode;
            } else {
                // TODO: handle this - trying to add child before parent node has been created
                lore.debug.anno("parent not found!", replies[j]);
            }
        }
	}
    lore.anno.annotimeline.layout();
}