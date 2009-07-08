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
lore.anno.multiSelAnno = new Array();
lore.anno.colourForOwner = new Array();
lore.anno.colourCount = 0;
lore.anno.colourLookup = new Array ( /*"#FF0000",*/ "#0000FF", "#00FF00",
									 "#FFFF00", "#00FFFF", "#FF00FF",
									 "#FF8000", "#80FF00", "#00FF80",
									 "#0080FF", "#8000FF", "#FF0080",
									 "#FFC000", "#C0FF00", "#00FFC0",
									 "#00C0FF", "#C000FF", "#FF00C0",
									 "#FF4000", "#40FF00", "#00FF40",
									 "#0040FF", "#4000FF", "#FF0040");
									 
									 



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
        if (node[0]){
		  attr = node[0].getAttributeNodeNS(lore.constants.RDF_SYNTAX_NS,
				'resource');
		  if (attr) {
			this.bodyURL = attr.nodeValue;
		  }
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
        if (this.bodyURL){
		  this.body = lore.anno.getBodyContent(this.bodyURL);
        }
        // get tags
        this.tags = "";
        node = rdf.getElementsByTagNameNS(lore.constants.VARIATION_ANNOTATION_NS, 'tag');
        for (var j = 0; j < node.length; j++) {
            var tagval = "";
            attr = node[j].getAttributeNodeNS(lore.constants.RDF_SYNTAX_NS,'resource');
            if (attr) {
                // a thesaurus tag
                tagval = attr.nodeValue;
            } else {
                // a freeform tag - make sure it's added to the list of tags
               tagval = node[j].firstChild.nodeValue;
               Ext.getCmp('tagselector').fireEvent('newitem', Ext.getCmp('tagselector'), tagval);
            }
            if (tagval){
                if (j > 0) this.tags += ",";
                this.tags += tagval;
            }
        }
                    
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
        return "Annotation [" + this.id + "," 
        + (this.modified? this.modified : this.created) + "," 
        + lore.util.splitTerm(this.type).term + "]";
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
	lore.ui.loreviews.activate("annotationstab");
    Ext.getCmp("annotationstab").activate("annotationslistform");
    lore.anno.annotabsm.selectRow(annoIndex);
    Ext.getCmp("annotationslist").view.focusRow(annoIndex);
    lore.ui.loreInfo("Fill in annotation details and then select 'Save Annotation'");
}
/** 
 * Create a new annotation which is a reply to annoid
 * @param {} annoid
 */
lore.anno.replyAnno = function(annoid){
    var currentContext = "";
    try {
        currentContext = lore.util.getXPathForSelection();
    } catch (e) {
        lore.debug.anno("exception creating xpath for new annotation",e);
    }
    var anno = {
        resource : annoid,
        isReply: true,
        original : lore.ui.currentURL,
        context : currentContext,
        originalcontext : currentContext,
        creator : lore.defaultCreator,
        created : new Date(),
        modified : new Date(),
        body : "",
        title : "New Reply",
        type : lore.constants.ANNOTATION_TYPE_NS + "Comment",
        lang : "en"
    };
    lore.anno.annotabds.loadData([anno], true);
    // get the annotation record
    var annoIndex = lore.anno.annotabds.findBy(function(record, id) {
                return (!record.json.id);
            });
    // select the row to load into the editor
    lore.ui.loreviews.activate("annotationstab");
    Ext.getCmp("annotationstab").activate("annotationslistform");
    lore.anno.annotabsm.selectRow(annoIndex);
    Ext.getCmp("annotationslist").view.focusRow(annoIndex);
    lore.ui.loreInfo("Fill in annotation details and then select 'Save Annotation'");
}

lore.anno.genTipForAnnotation = function(annodata, domContainer) {
		try {
			var uid = annodata.id;
			var obj = document.createElement("span");
			obj.setAttribute("id", uid);
			obj.innerHTML = lore.anno.genDescription(annodata, true);
			
			var doc = window.top.getBrowser().selectedBrowser.contentWindow.document;
			var tipContainer = doc.getElementById("tipcontainer");

			// create the tip container and import the script onto the page
			// if first time a tip is created			
			if (tipContainer == null) {
				tipContainer = doc.createElement("div");
				tipContainer.id="tipcontainer";
				tipContainer.style.width = 0;
				tipContainer.style.height= 0;
				tipContainer.style.overflow = "hidden";
				tipContainer.style.visibility = "hidden";
				doc.body.appendChild(tipContainer);
				
				// load the script into a string
				var buffer = lore.util.readChromeFile("/content/lib/wz_tooltip.js");
				var script = doc.createElement("script");
				script.type = "text/javascript";
				script.innerHTML = buffer;
				
				doc.getElementsByTagName("head")[0].appendChild(script);
			}
			
			// add tip to the container
			if (doc.getElementById(uid) == null) {
				tipContainer.appendChild(obj);
			}
			else {
				tipContainer.replaceChild(obj, doc.getElementById(uid));
			}

			// set events via DOM so that events are handled in the context of the content window
			// and not the extension
			domContainer.setAttribute("onmouseover", "TagToTip('" + uid + "',CLOSEBTN, true, SHADOW, true, BGCOLOR, '#ffffff', BORDERCOLOR, '#51666b', TITLEBGCOLOR, '#cc0000', TITLE,'" + annodata.title + "');");
			domContainer.setAttribute("onmouseout", "UnTip();");
		} 
		catch (ex) {
			lore.debug.anno("Tip creation failure: " + ex, ex);
		}
	}
	
/**
 * Highlight all annotations on the current page
 */
lore.anno.showAllAnnotations = function(){
 
   if (lore.anno.multiSelAnno.length == 0) {
  	// toggle to highlight all

	// set text to inherit for select all fields   
 	var selAllStyle = function( domObj) {
		if ( domObj ) {
			domObj.style.textDecoration = "inherit";
		}
		return domObj;
	}
	
   	lore.anno.annotabds.each(function highlightAnnotations(rec){
   		if (rec.data.context) {
			try {
				var domContainer = lore.anno.highlightAnnotation(lore.util.normalizeXPointer(rec.data.context), lore.anno.getCreatorColour(rec.data.creator), selAllStyle);
				// 'attach' annotation description bubble
				if (domContainer != null) {
					lore.anno.multiSelAnno.push(domContainer);
					// create the tip div in the content window						
					lore.anno.genTipForAnnotation(rec.data, domContainer);
				}
				else {
					lore.debug.anno("domContainer null for context: " + rec.data.context, rec);
				}
			} 
			catch (ex) {
				lore.debug.anno("Error during highlight all: " + ex, rec);
			}
		}
   		
   		if (rec.data.variantcontext) {
   			try {
   				var domContainer = lore.anno.highlightAnnotation(lore.util.normalizeXPointer(rec.data.variantcontext), lore.anno.getCreatorColour(rec.data.creator), selAllStyle);
				if ( domContainer) {
					lore.anno.multiSelAnno.push(domContainer);
					// create the tip div in the content window						
					lore.anno.genTipForAnnotation(rec.data, domContainer);
				}
   			} 
   			catch (ex) {
   				lore.debug.anno("Error during highlight all for variant: " + ex, rec);
   			}
   		}
   	});
   } else {
   		// unhighlight
		lore.debug.anno("Unhighlighting all annotations", lore.anno.multiSelAnno);
		for ( var i = 0; i < lore.anno.multiSelAnno.length;i++) {
			try {
				lore.anno.hideMarkerFromXP(lore.anno.multiSelAnno[i]);
			} catch (ex) {
				lore.debug.anno("Error unhighlighting: " + ex, lore.anno.multiSelAnno[i]);
			}
			
		}
		// clear selection info
		lore.anno.multiSelAnno = new Array();
   }
}


lore.anno.createAnnotationRDF = function(anno) {
	var rdfxml = "<?xml version=\"1.0\" ?>";
	rdfxml += '<rdf:RDF xmlns:rdf="' + lore.constants.RDF_SYNTAX_NS + '">';
	rdfxml += '<rdf:Description';
	if (anno.id) {
		rdfxml += ' rdf:about="' + anno.id + '"';
	}
    rdfxml += ">";
    if (anno.isReply){
        rdfxml += '<rdf:type rdf:resource="http://www.w3.org/2001/03/thread#Reply"/>';
    } 
    if (anno.type) {
        rdfxml += '<rdf:type rdf:resource="' + lore.constants.ANNOTATION_NS
            + 'Annotation"/>';
		rdfxml += '<rdf:type rdf:resource="' + anno.type + '"/>';
	}
    
    if (anno.isReply){
      rdfxml += '<inReplyTo xmlns="'+ lore.constants.THREAD_NS + '" rdf:resource="' + anno.resource + '"/>';
      var rootannonode = lore.util.findChildRecursively(lore.ui.annotationstreeroot,'id',anno.resource);
      if (rootannonode){
        while (rootannonode.getDepth() > 2){
            rootannonode = rootannonode.parentNode;
        }
        rdfxml += '<root xmlns="' + lore.constants.THREAD_NS + '" rdf:resource="' + rootannonode.id + '"/>';
      } else {
        rdfxml += '<root xmlns="' + lore.constants.THREAD_NS + '" rdf:resource="' + anno.resource + '"/>';
      }
      
    } else {
	   rdfxml += '<annotates xmlns="' + lore.constants.ANNOTATION_NS
			+ '" rdf:resource="' + anno.resource.replace(/&/g, '&amp;') + '"/>';
    }
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
        anno.body = lore.util.sanitizeHTML(anno.body);
		rdfxml += '<body xmlns="' + lore.constants.ANNOTATION_NS
				+ '"><rdf:Description>' + '<ContentType xmlns="'
				+ lore.constants.HTTP_NS
				+ '">application/xhtml+xml</ContentType>' + '<Body xmlns="'
				+ lore.constants.HTTP_NS + '" rdf:parseType="Literal">'
				+ '<html xmlns="' + lore.constants.XHTML_NS + '"><head><title>'
				+ (anno.title ? anno.title : 'Annotation') + '</title></head>'
				+ '<body>' + anno.body + '</body></html>'
				+ '</Body></rdf:Description>' + '</body>';
	}
    if (anno.tags) {
        var tagsarray = anno.tags.split(',');
        lore.debug.anno("tags are", tagsarray);
        for (var ti = 0; ti < tagsarray.length; ti ++) {
            var thetag = tagsarray[ti].escapeHTML();
            rdfxml += '<tag xmlns="' + lore.constants.VARIATION_ANNOTATION_NS + '"';
            if (thetag.indexOf("http://") == 0) {
                rdfxml+= ' resource="' + thetag + '"/>';
            } else {
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
	try {
		if (lore.anno.curAnnoMarkers) {
			for (var i = 0; i < lore.anno.curAnnoMarkers.length; i++) {
				lore.anno.hideMarkerFromXP(lore.anno.curAnnoMarkers[i]);
			}
		}
	} catch(ex) { 
		lore.debug.anno("hide marker failure: " + ex, ex );
	}
}

lore.anno.hideMarkerFromXP = function(domObj){
	// this is silly but the parent node disappears
	// in certain circumstances, so can't use this for the moment
	// lore.util.removeNodePreserveChildren(domObj);
	domObj.style.textDecoration= "inherit";
	domObj.style.backgroundColor = "transparent";
	domObj.removeAttribute("onmouseover");
	domObj.removeAttribute("onmouseout");
	
			
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
        Ext.getCmp('updrctxtbtn').setVisible(true);
	} else {
        Ext.getCmp('updrctxtbtn').setVisible(false);
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
    lore.anno.updateAnnotationSummary(lore.anno.variationInformation[rowIndex],true);

}
lore.anno.genTagList = function(annodata) {
    var bodyText = "";
     if (annodata.tags){
        bodyText += '<span style="font-size:smaller;color:#51666b">Tags: ';
        var tagarray = annodata.tags.split(',');
        for (var ti=0; ti < tagarray.length; ti++){
            var thetag = tagarray[ti];
            if (thetag.indexOf('http://') == 0) {
                try{
                    var tagname = thetag;
                    Ext.getCmp('tagselector').store.findBy(function (rec){
                        if (rec.data.id == thetag) {
                            tagname = rec.data.name;
                        }
                    });
                    bodyText += '<a target="_blank" style="color:orange" href="' + thetag + '">' + tagname + '</a>, ';
                } catch (e) {
                    lore.debug.anno("unable to find tag name for " + thetag,e);
                }
            } else {
                bodyText += thetag + ", ";
            }
        }
        bodyText += "</span>";
    }
    return bodyText;
}
lore.anno.genDescription = function(annodata, noimglink) {
	if ( noimglink && noimglink == true){
		return lore.util.externalizeLinks(annodata.body); 
	}
	
	var imglink = "<a title='Show annotation body in separate window' xmlns=\""+ lore.constants.XHTML_NS + "\" href=\"javascript:lore.util.launchWindow('" +
	 annodata.bodyURL + "',false);\" ><img xmlns=\"" + lore.constants.XHTML_NS + "\" src='/skin/icons/page_go.png' /></a><br />";
	return imglink + lore.util.externalizeLinks(annodata.body);
}

lore.anno.updateAnnotationSummary = function (annodata){
    var detailsString = "";

    detailsString += '<span style="font-weight: bold">Creator:</span> '+ annodata.creator + "<br />";
    
    detailsString += '<span style="font-weight: bold">Created:</span> '+ Date.parseDate(annodata.created, 'c').format("j/n/Y H:m") + "<br />";
    if (annodata.type == lore.constants.VARIATION_ANNOTATION_NS + "VariationAnnotation"){
        lore.debug.anno("variation annotation summary",annodata);
        detailsString += '<span style="font-weight: bold">Agent:</span> '+ annodata.variationagent + "<br />";
        detailsString += '<span style="font-weight: bold">Place:</span> '+ annodata.variationplace + "<br />";
        detailsString += '<span style="font-weight: bold">Date:</span> '+ annodata.variationdate + "<br />";
    }
    detailsString += '<br/><span style="font-weight: bold; font-style: italic">Description:</span> '
                + lore.anno.genDescription( annodata) + "<br />";            
    detailsString += lore.anno.genTagList(annodata);
    lore.ui.propertytabs.activate("annotationsummary");
    Ext.getCmp("annotationsummary").body.update(detailsString);

}
lore.anno.handleFrameLoad = function(e) {
	var sourceFrame = document.getElementById("variationSourceFrame");
	var targetFrame = document.getElementById("variationTargetFrame");
	if (e.target == sourceFrame) {
		lore.debug.anno("variations source frame loaded", e);
        try {
            lore.util.externalizeDomLinks(window.frames["variationsource"].document.body);
        } catch (ex) {
            lore.debug.anno("handleFrameLoad externalizing links",ex);
        }
	} else if (e.target == targetFrame) {
		lore.debug.anno("variations target frame loaded", e);
        try {
            lore.util.externalizeDomLinks(window.frames["variationtarget"].document.body);
        } catch (ex) {
            lore.debug.anno("handleFrameLoad externalizing links",ex);
        }
	} else {
		//lore.debug.anno("frame loaded", e);
	}
}

lore.anno.setVariationFrameURLs = function(sourceURL, targetURL) {
	var changeMade = false;
	var setFrameLabel = function(label, url) {
        if (url.match("austlit.edu.au/")) {
            label.update(url);
        } else {
			label.update(" ");
		}
        
	};
	var setFrameURL = function(frame, url) {
        // only allow content from the austlit server to be displayed for security reasons
		if (frame.dom.src != url && url.match("austlit.edu.au/")) {
			frame.dom.src = url;
			changeMade = true;
		} else if (frame.dom.src != url){
            frame.dom.src = "about:blank";
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

lore.anno.getCreatorColour = function (creator) {
	
	creator = creator.replace(/\s+$/,""); //rtrim
	
	var colour = lore.anno.colourForOwner[creator];
	if ( !colour) {
		if (lore.anno.colourCount < lore.anno.colourLookup.length) {
			colour = lore.anno.colourLookup[lore.anno.colourCount++];
		}
		else {
			// back up
			colour = lore.util.generateColour(196, 196, 196, 240, 240, 240);
		}
		lore.anno.colourForOwner[creator] = colour;
	}
	return colour;
}

lore.anno.highlightAnnotation = function(currentCtxt, colour, extraStyle) {
	if (currentCtxt) {
		var idx, marker = null;
		lore.debug.anno("highlighting annotation context: " + currentCtxt, currentCtxt);
		var domObj = lore.util.highlightXPointer(currentCtxt, window.top.getBrowser().selectedBrowser.contentWindow.document, true, colour);
		if ( domObj && extraStyle) {
			
			domObj = extraStyle(domObj);
		}
		return domObj;
		
	} else {
		return null;
	}
}

lore.anno.updateHighlightFields = function(fields, colour) {
	if (fields.length) {
		for (var i = 0; i < fields.length; i++) {
			fields[i].style.backgroundColor = colour;
		}
	} else {
		fields.style.backgroundColor = colour;
	}
}

lore.anno.setCurAnnoStyle = function (domObj) {
		domObj.style.textDecoration = "underline";
		return domObj;
	}

lore.anno.handleAnnotationSelection = function(sm, row, rec) {
	// load annotation grid values into form
	lore.ui.annotationsform.loadRecord(rec);
	
	// add a marker to indicate context
    var idx, currentCtxt, sel;
    var ctxtField = lore.ui.annotationsform.findField('contextdisp');
    var vCtxtField = lore.ui.annotationsform.findField('rcontextdisp');
	
	lore.anno.curAnnoMarkers = new Array();
	
	if (rec.data.context && (rec.data.resource == lore.ui.currentURL)) {
		
        try {
			currentCtxt = lore.util.normalizeXPointer(rec.data.context);
			
			lore.anno.curAnnoMarkers.push(lore.anno.highlightAnnotation(currentCtxt, lore.anno.getCreatorColour(rec.data.creator),
			lore.anno.setCurAnnoStyle));

		      // display contents of context
		     ctxtField.setValue('"' + lore.util.getSelectionText(currentCtxt) + "'");
             lore.anno.setVisibilityFormField('contextdisp', false); 
        }
        catch (ex) {
            lore.debug.anno("exception displaying/highlighting context",ex);
            lore.anno.setVisibilityFormField('contextdisp', true);
        }
	} else {
        ctxtField.setValue("");
        lore.anno.setVisibilityFormField('contextdisp', true);
    }
    if (rec.data.variantcontext && (rec.data.variant == lore.ui.currentURL)){
        lore.debug.anno("highlighting variation context", rec);
        
		currentCtxt = lore.util.normalizeXPointer(rec.data.variantcontext);
		lore.anno.curAnnoMarkers.push(lore.anno.highlightAnnotation(currentCtxt, lore.anno.getCreatorColour(rec.data.creator), lore.anno.setCurAnnoStyle));
		
        // display contents of context
        vCtxtField.setValue('"' + lore.util.getSelectionText(currentCtxt) + "'");
        lore.anno.setVisibilityFormField('rcontextdisp', false);
    } else {
        vCtxtField.setValue("");
        lore.anno.setVisibilityFormField('rcontextdisp', true);
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
					lore.ui.loreInfo('Unable to create annotation');
                    lore.debug.anno('Unable to create annotation',xhr.statusText);
				}
			}
		};
		xhr.send(annoRDF);
        lore.debug.anno("RDF of new annotation",annoRDF);
		lore.anno.annotabds.remove(anno);
	} else {
		// update existing annotation
		if (!lore.ui.annotationsform.isDirty()) {
			lore.ui.loreInfo('Annotation content not modified: Annotation will not be updated');
			return;
		}
		// Update the annotation on the server via HTTP PUT
		xhr.open("PUT", annoID, true);
		xhr.setRequestHeader('Content-Type', "application/xml");
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					lore.ui.loreInfo('Annotation updated');
                    lore.debug.anno('Annotation updated',xhr);
                    //lore.anno.updateAnnotationsSourceList(lore.ui.currentURL);
				} else {
					lore.ui.loreInfo('Unable to update annotation');
                    lore.debug.anno('Unable to update annotation',xhr);
				}
			}
		};
		xhr.send(annoRDF);
        lore.debug.anno("RDF of updated annotation",annoRDF);
	}
	// maybe need to replace this with firing event that when annotation 
	// is saved or 'cleaned' that UI elements are updated i.e highlight fields
	// are updated ( i.e the colour may change as it's based of creator name),
	// the annotation summary window needs to be updated etc.
	lore.anno.updateUIElements(anno);
}

lore.anno.updateUIElements = function (rec) {
	// update the highlighted fields colour in the event the creator is changed
	// the colour is identified by the creator's name
	lore.anno.updateHighlightFields(lore.anno.curAnnoMarkers, lore.anno.getCreatorColour(rec.data.creator));
	if ( lore.anno.multiSelAnno.length > 0 ) {
		// hide then reshow 
		lore.anno.showAllAnnotations();
		lore.anno.showAllAnnotations();
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
        if (annoIndex >= 0) {
		  lore.anno.annotabds.remove(lore.anno.annotabds.getAt(annoIndex));
        }
		if (annoID) { // annoID is null if it's a new annotation
			// remove from the source tree
            var annonode = lore.util.findChildRecursively(lore.ui.annotationstreeroot,'id', annoID);
            if (annonode) annonode.remove();
			// remove the annotation from the server
			Ext.Ajax.request({
						url : annoID,
						success : function(resp) {
                            lore.debug.anno('Annotation deleted', resp);
							lore.ui.loreInfo('Annotation deleted');
						},
						failure : function(resp, opts) {
							lore.debug.anno("Annotation deletion failed: " + opts.url, resp);
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
		lore.ui.loreWarning("Unable to delete annotation");
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
    var bodyText = "";
	if (rtype == 'application/xml' || rtype == 'application/xhtml+xml') { 
		bodyContent = req.responseXML.getElementsByTagName('body');

		if (bodyContent[0]) {
			bodyText = serializer.serializeToString(bodyContent[0]);
		} else {
			bodyText = req.responseText;
		}
	} else {
		bodyText = req.responseText;
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
lore.anno.updateAnnotationsSourceList = function(theURL) {
    // clear the old annotations - only remove annotations with an id (don't clear a new annotation)
	lore.ui.clearTree(lore.ui.annotationstreeroot);
    Ext.getCmp("annotationsummary").body.update("");
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
}
/**
 * Replaces default function for generating contents of timeline bubbles
 * @param {} elmt
 * @param {} theme
 * @param {} labeller
 */
Timeline.DefaultEventSource.Event.prototype.fillInfoBubble = function (elmt, theme, labeller) {
        var doc = elmt.ownerDocument;
        var title = this.getText();
        var link = this.getLink();
        var image = this.getImage();
    
        if (image != null) {
            var img = doc.createElement("img");
            img.src = image;
        
            theme.event.bubble.imageStyler(img);
            elmt.appendChild(img);
        }
    
        var divTitle = doc.createElement("div");
        var textTitle = doc.createTextNode(title);
        if (link != null) {
            var a = doc.createElement("a");
            a.href = link;
            a.appendChild(textTitle);
            divTitle.appendChild(a);
        } else {
            divTitle.appendChild(textTitle);
        }
        theme.event.bubble.titleStyler(divTitle);
        elmt.appendChild(divTitle);
    
        var divBody = doc.createElement("div");
        this.fillDescription(divBody);
        theme.event.bubble.bodyStyler(divBody);
        elmt.appendChild(divBody);
    
        var divTime = doc.createElement("div");
        this.fillTime(divTime, labeller);
        divTime.style.fontSize = 'smaller';
        divTime.style.color = '#aaa';
        elmt.appendChild(divTime);
    
        var divOps = doc.createElement("div");
        divOps.style.paddingTop = '5px';
        var divOpsInner = "<a style='color:orange;font-size:smaller' href='#' "
                + "onclick='lore.anno.annotimeline.getBand(0).closeBubble();lore.anno.editAnno(\"" 
                + this._eventID +"\")'>EDIT</a> | "
                + "<a style='color:orange;font-size:smaller' href='#' "
                + "onclick='lore.anno.annotimeline.getBand(0).closeBubble();lore.anno.replyAnno(\"" 
                + this._eventID +"\")'>REPLY</a>";
        divOps.innerHTML = divOpsInner;
        elmt.appendChild(divOps);
        // select annotation in editor to trigger highlighting
        lore.anno.hideMarker();
        var annoid = this._eventID;
        var annoIndex = lore.anno.annotabds.findBy(
        function(record, id) {
            return (annoid == record.json.id);
        });
        lore.anno.annotabsm.selectRow(annoIndex);
};  

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
        id: anno.id,
        eventID: anno.id,
        caption: lore.util.splitTerm(anno.type).term + " by "  + anno.creator + ", " + dateEvent.format("j/n/Y H:m"),
        description: "<span style='font-size:small;color:#51666b;'>" + lore.util.splitTerm(anno.type).term 
        + " by " + anno.creator + "</span> "  + lore.anno.genDescription(anno) + "<br />" + lore.anno.genTagList(anno)
        //+ "<a style='color:orange;font-size:smaller' href='#' onclick='lore.anno.annotimeline.getBand(0).closeBubble();lore.anno.editAnno(\"" + anno.id +"\")'>EDIT</a> | "
        //+ "<a style='color:orange;font-size:smaller' href='#' onclick='lore.anno.annotimeline.getBand(0).closeBubble();lore.anno.replyAnno(\"" + anno.id +"\")'>REPLY</a>"
      });
      lore.anno.annoEventSource.add(evt);       
      lore.anno.annotimeline.getBand(0).setCenterVisibleDate(evt.getStart());
      
   }
}
lore.anno.getAnnoData = function(annoid){
    var annoIndex = lore.anno.annotabds.findBy(
    function(record, id) {
         return (annoid == record.json.id);
    });
    return lore.anno.annotabds.getAt(annoIndex);
}
/**
 * Open an annotation in the editor
 * @param {} annoid The id of the anotation to open
 */
lore.anno.editAnno = function (annoid){
    lore.ui.loreviews.activate("annotationstab");
    Ext.getCmp("annotationstab").activate("annotationslistform");
    var annoIndex = lore.anno.annotabds.findBy(
    function(record, id) {
         return (annoid == record.json.id);
    });
    lore.anno.annotabsm.selectRow(annoIndex);
    Ext.getCmp("annotationslist").view.focusRow(annoIndex);
    lore.ui.loreInfo("Edit the annotation and then select 'Save Annotation'");
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
                annoType: annoType,
				text : title
                    + " <span style='font-style:italic'>("
					+ anno.creator + ")</span>",
                qtip: lore.util.splitTerm(anno.type).term + " by " + anno.creator + ", " + Date.parseDate(anno.created, 'c').format("j/n/Y H:m"),
				iconCls : 'anno-icon'
			});

			lore.ui.annotationstreeroot.appendChild(tmpNode);
            lore.anno.attachAnnoEvents(tmpNode);
		}
		if (!lore.ui.annotationstreeroot.isExpanded()) {
			lore.ui.annotationstreeroot.expand();
		}
        lore.anno.annotimeline.layout();
	}	
}

lore.anno.attachAnnoEvents = function(annoNode){
    annoNode.on('contextmenu',function(node,ev){
       node.select();
       lore.anno.updateAnnotationSummary(lore.anno.getAnnoData(node.id).data);
    });
    annoNode.on('click', function(node,ev) {
        lore.ui.propertytabs.activate("annotationsummary"); 
        lore.anno.updateAnnotationSummary(lore.anno.getAnnoData(node.id).data);
    });
    annoNode.on('dblclick', function(node,ev){
        // TODO: detect double click
        lore.ui.propertytabs.activate("annotationsummary"); 
        lore.ui.loreviews.activate("annotationstab");
        Ext.getCmp("annotationstab").activate("annotimeline");
        var band = lore.anno.annotimeline.getBand(0);
        band.closeBubble();
        band.showBubbleForEvent(node.id);
    });
    annoNode.on('contextmenu', function(node, e) {
        if (!node.contextmenu) {
           node.contextmenu = new Ext.menu.Menu({
                id : node.id + "-context-menu"
           });
           node.contextmenu.add({
               text : "Show in Timeline",
               handler : function(evt) { 
                  lore.ui.loreviews.activate("annotationstab");
                  Ext.getCmp("annotationstab").activate("annotimeline");
                  var band = lore.anno.annotimeline.getBand(0);
                  band.closeBubble();
                  band.showBubbleForEvent(node.id);
               }
           });
           node.contextmenu.add({
               text : "Reply to annotation",
               handler : function(evt) {
                   lore.anno.replyAnno(node.id);
               }
           });
           node.contextmenu.add({
               text : "Edit annotation",
               handler : function(evt) {          
                  lore.anno.editAnno(node.id);
               }
           });
           
           node.contextmenu.add({
               text : "Add as node in compound object editor",
               handler : function(evt) {
                    lore.ore.graph.addFigure(node.id);
               }
           });
           if (node.annoType == lore.constants.VARIATION_ANNOTATION_NS + "VariationAnnotation") {
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

lore.anno.handleAnnotationRepliesLoaded = function(resp, opt) {
	var replyList = resp.responseXML.getElementsByTagNameNS(
		lore.constants.RDF_SYNTAX_NS, 'Description');
	var isLeaf = (replyList.length == 0);
	if (!isLeaf) {
        var annoURL = opt.url.substring((lore.anno.annoURL + lore.anno.REPLY_TREE).length);
        //lore.debug.anno("handle annotation replies for " + annoURL, resp);
        var replyLookup = {};
        replyLookup[annoURL] = lore.util.findChildRecursively(lore.ui.annotationstreeroot,"id", annoURL);
        replies = lore.anno.orderByDate(replyList);
        lore.anno.annotabds.loadData(replies, true);
        for (var j = 0; j < replies.length; j++){
            lore.debug.anno("Reply " + replies[j].toString(), replies[j]);
            var title = replies[j].title;
            if (!title || title == '') {
                title = "Untitled reply";
            }
            lore.anno.addAnnoToTimeline(replies[j], title);
            var tmpNode = new Ext.tree.TreeNode({
                id : replies[j].id,
                annoType: "reply",
                text : title + " <span style='font-style:italic'>("
                    + replies[j].creator + ")</span>",
                iconCls : 'annoreply-icon', 
                qtip: lore.util.splitTerm(replies[j].type).term + " by " 
                    + replies[j].creator + ", " + Date.parseDate(replies[j].created, 'c').format("j/n/Y H:m") 
            });
            lore.anno.attachAnnoEvents(tmpNode);
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