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


var variationInformation = [];

var variationStore = new Ext.data.SimpleStore({
  fields: [
   {name: "name"}
  ]
});

variationStore.loadData([]);
/**
 * Class wrapper for an RDF annotation provides access to values
 *  modified from dannotate.js
 * @param rdf Root element of an RDF annotation returned by Danno
 */
function Annotation (rdf)
{
   var tmp;
   var node;
   var attr;
   
   this.rdf = rdf;
   
   try {
     attr = rdf.getAttributeNodeNS(RDF_SYNTAX_NS, 'about');
	 if (attr) {
	 	this.id = attr.nodeValue;
	 } 
     var isReply = false;
     node = rdf.getElementsByTagNameNS(RDF_SYNTAX_NS, 'type');
     for (var i = 0; i < node.length; i++) {
     	attr = node[i].getAttributeNodeNS(RDF_SYNTAX_NS, 'resource');
	  	if (attr) {
			tmp = attr.nodeValue;
		}
        if (tmp.indexOf(ANNOTATION_TYPE_NS) == 0) {
           //this.type = tmp.substr(ANNOTATION_TYPE_NS.length);
        	this.type = tmp;
        }
        else if (tmp.indexOf(REPLY_TYPE_NS) == 0) {
            //this.type = tmp.substr(REPLY_TYPE_NS.length);
            this.type = tmp;
        }
        else if (tmp.indexOf(VARIATION_ANNOTATION_NS) == 0){
        	this.type = tmp;
        }
        else if (tmp.indexOf(THREAD_NS) == 0) {
          isReply = true;
        }
        
     }
     this.isReply = isReply;
     
     if (! this.isReply) {
       node = rdf.getElementsByTagNameNS(ANNOTATION_NS, 'annotates');
       attr = node[0].getAttributeNodeNS(RDF_SYNTAX_NS, 'resource');
	   if (attr) {
	   	this.resource = attr.nodeValue;
	   }
       this.about = null;
     }
     else {
       node = rdf.getElementsByTagNameNS(THREAD_NS, 'root');
       attr = node[0].getAttributeNodeNS(RDF_SYNTAX_NS, 'resource');
	   if (attr) {
	   	this.resource = attr.nodeValue;
	   }
       node = rdf.getElementsByTagNameNS(THREAD_NS, 'inReplyTo');
       attr = node[0].getAttributeNodeNS(RDF_SYNTAX_NS, 'resource');
	   if (attr) {
	   	this.about = attr.nodeValue;
	   }
     }
     
     node = rdf.getElementsByTagNameNS(ANNOTATION_NS, 'body');
     attr = node[0].getAttributeNodeNS(RDF_SYNTAX_NS, 'resource');
	 if (attr) {
	 	this.bodyURL = attr.nodeValue;
	 } 
     node = rdf.getElementsByTagNameNS(ANNOTATION_NS, 'created');
     this.created = safeGetFirstChildValue(node);
     node = rdf.getElementsByTagNameNS(ANNOTATION_NS, 'modified');
     this.modified = safeGetFirstChildValue(node);
     
     if (this.isReply) {
       this.context = '';
     }
     else {
       node = rdf.getElementsByTagNameNS(ANNOTATION_NS, 'context');
       this.context = safeGetFirstChildValue(node);
     }
     
     node = rdf.getElementsByTagNameNS(DC10_NS, 'creator');
     this.creator = safeGetFirstChildValue(node, 'anon');
     
     node = rdf.getElementsByTagNameNS(DC10_NS, 'title');
     this.title = safeGetFirstChildValue(node);
     
     node = rdf.getElementsByTagNameNS(DC10_NS, 'language');
     this.lang = safeGetFirstChildValue(node);
     
     // body stores the contents of the html body tag as text
     this.body = getBodyContent(this.bodyURL);
     
    //Additional fields for variation annotations only 
	if (this.type.match(VARIATION_ANNOTATION_NS)) {
		node = rdf.getElementsByTagNameNS(VARIATION_ANNOTATION_NS, 'variant');
		if (node.length == 0) { node = rdf.getElementsByTagNameNS(VARIATION_ANNOTATION_NS, 'revised');}
		if (node[0]) {
			attr = node[0].getAttributeNodeNS(RDF_SYNTAX_NS, 'resource');
			if (attr) {
				this.variant = attr.nodeValue;
			}
		}
		node = rdf.getElementsByTagNameNS(VARIATION_ANNOTATION_NS, 'original');
		if (node[0]) {
			attr = node[0].getAttributeNodeNS(RDF_SYNTAX_NS, 'resource');
			if (attr) {
				this.original = attr.nodeValue;
			}
		}
		node = rdf.getElementsByTagNameNS(VARIATION_ANNOTATION_NS, 'original-context');
		this.originalcontext = safeGetFirstChildValue(node);
		node = rdf.getElementsByTagNameNS(VARIATION_ANNOTATION_NS, 'variant-context');
		if (node.length == 0){node = rdf.getElementsByTagNameNS(VARIATION_ANNOTATION_NS, 'revised-context');}
		this.variantcontext = safeGetFirstChildValue(node);
		node = rdf.getElementsByTagNameNS(VARIATION_ANNOTATION_NS, 'variation-agent');
		if (node.length == 0) {node = rdf.getElementsByTagNameNS(VARIATION_ANNOTATION_NS, 'revision-agent');}
		this.variationagent = safeGetFirstChildValue(node);
		node = rdf.getElementsByTagNameNS(VARIATION_ANNOTATION_NS, 'variation-place');
		if (node.length == 0) {node = rdf.getElementsByTagNameNS(VARIATION_ANNOTATION_NS, 'revision-place');}
		this.variationplace = safeGetFirstChildValue(node);
		node = rdf.getElementsByTagNameNS(VARIATION_ANNOTATION_NS, 'variation-date');
		if (node.length == 0) {node = rdf.getElementsByTagNameNS(VARIATION_ANNOTATION_NS, 'revision-date');}
		this.variationdate = safeGetFirstChildValue(node);
	}
   }
   catch (ex) {
     var st = "Error parsing RDF" + (this.id ? ' for ' + this.id : '') +
              ':\n' + ex.toString();
     throw new Error(st);
   }
}

/**
 * Launch create annotation form with context and annotates filled in from current browser resource
 */
function addAnnotation(){
	var currentContext = getXPathForSelection();
	var anno = {
		resource : currentURL,
		original: currentURL,
		context : currentContext,
		originalcontext : currentContext,
		creator: defaultCreator,
		created: new Date(),
		modified: new Date(),
		body: "",
		title: "New Annotation",
		type: ANNOTATION_TYPE_NS + "Comment",
		lang: "en"
	};
	annotabds.loadData([anno],true);
	// get the annotation record
	var annoIndex = annotabds.findBy(function(record, id){
			return (!record.json.id);
	});
	// select the row to load into the editor
	annotabsm.selectRow(annoIndex);
	loreviews.activate("annotationslistform");
}

function createAnnotationRDF(anno)
{
	var rdfxml = "<?xml version=\"1.0\" ?>";
	rdfxml += '<rdf:RDF xmlns:rdf="' + RDF_SYNTAX_NS + '">';
    rdfxml += '<rdf:Description';
    if (anno.id){
    	rdfxml += ' rdf:about="' + anno.id + '"';
    }
    rdfxml +=
    	'><rdf:type rdf:resource="' + ANNOTATION_NS + 'Annotation"/>';
    if (anno.type){
		rdfxml += '<rdf:type rdf:resource="' + anno.type + '"/>';
    }
	rdfxml += '<annotates xmlns="' + ANNOTATION_NS  + '" rdf:resource="' + anno.resource.replace(/&/g,'&amp;') + '"/>';
	// also send variant as annotates for backwards compatability with older clients
	/* not currently supported in danno
	 * if (anno.variant){
		rdfxml += '<annotates xmlns="http://www.w3.org/2000/10/annotation-ns#" rdf:resource="' + anno.variant + '"/>';	
	}*/
	if (anno.lang){
		rdfxml += '<language xmlns="'+ DC10_NS+'">'+ anno.lang + '</language>';
	}
	if (anno.title){
		rdfxml += '<title xmlns="'+ DC10_NS +'">' + anno.title + '</title>';
	}
	if (anno.creator){
		rdfxml += '<creator xmlns="'+ DC10_NS + '">'+ anno.creator + '</creator>';
	}
	if (!anno.created){
		anno.created = new Date();
	}
	// TODO: format date strings
	rdfxml += '<created xmlns="' + ANNOTATION_NS + '">'+ anno.created.toString() + '</created>';
	anno.modified = new Date();
	rdfxml += '<modified xmlns="'+ ANNOTATION_NS + '">' + anno.modified.toString() + '</modified>';
	if (anno.context){
		rdfxml += '<context xmlns="' + ANNOTATION_NS + '">' + anno.context + '</context>';
	}
	if (anno.type == VARIATION_ANNOTATION_NS + "VariationAnnotation") {
		if (anno.originalcontext) {
			rdfxml += '<original-context xmlns="'+ VARIATION_ANNOTATION_NS + '">' + anno.originalcontext + '</original-context>';
		}
		if (anno.variantcontext) {
			rdfxml += '<variant-context xmlns="' + VARIATION_ANNOTATION_NS + '">' + anno.variantcontext + '</variant-context>';
		}
		if (anno.variationagent) {
			rdfxml += '<variation-agent xmlns="' + VARIATION_ANNOTATION_NS + '">' +
			anno.variationagent +
			'</variation-agent>';
		}
		if (anno.variationplace) {
			rdfxml += '<variation-place xmlns="' + VARIATION_ANNOTATION_NS + '">' +
			anno.variationplace +
			'</variation-place>';
		}
		if (anno.variationdate) {
			rdfxml += '<variation-date xmlns="' + VARIATION_ANNOTATION_NS + '">' +
			anno.variationdate +
			'</variation-date>';
		}
		if (anno.original) {
			rdfxml += '<original xmlns="'+ VARIATION_ANNOTATION_NS +'" rdf:resource="' +
			anno.original +
			'"/>';
		}
		if (anno.variant) {
			rdfxml += '<variant xmlns="'+ VARIATION_ANNOTATION_NS + '" rdf:resource="' +
			anno.variant +
			'"/>';
		}
	}
	if (anno.body){
		rdfxml += '<body xmlns="' + ANNOTATION_NS 
			+ '"><rdf:Description>'
    		+ '<ContentType xmlns="' + HTTP_NS+ '">application/xhtml+xml</ContentType>'
    		+ '<Body xmlns="' + HTTP_NS + '" rdf:parseType="Literal">'
			+ '<html xmlns="' + XHTML_NS + '"><head><title>' + (anno.title? anno.title : 'Annotation') + '</title></head>'
			+ '<body>'
			+ anno.body.tidyHTML()
			+ '</body></html>'
			+ '</Body></rdf:Description>'
		+ '</body>';
	}
  	rdfxml += '</rdf:Description>'+ '</rdf:RDF>';
  	alert(rdfxml);
	return rdfxml;
} 

/**
 * Creates an array of Annotations from a list of RDF nodes in ascending date
 * created order - unchanged from dannotate.js
 * @param nodeList Raw RDF list in arbitrary order
 * @return ordered array of Annotations
 */
function orderByDate (nodeList)
{
  var tmp = [];
  for (var j = 0; j < nodeList.length; j++) {
    try {
      tmp[j] = new Annotation(nodeList.item(j));
    }
    catch (ex) {
      loreError(ex.toString());
    }
  }
  return tmp.length == 1 ? tmp : 
         tmp.sort(function(a,b){return (a.created > b.created ? 1 : -1);});
}
function hideMarker(){
	if (annoMarker){
			// hide the marker
			//annoMarker.style.display="none";
			//annoMarker.innerHTML = "";
			annoMarker.style.backgroundColor = "transparent";
		}
}
function setVisibilityFormField(fieldName, hide){
	var thefield = annotationsform.findField(fieldName);
		if (thefield) {
			var cont = thefield.container.up('div.x-form-item');
			cont.enableDisplayMode();
			
			if (hide && cont.isVisible()) {
				cont.slideOut();
			} else if (!hide && !cont.isVisible()){
				cont.slideIn();
			}
		}
}
function hideFormFields(fieldNameArr){
	for (var i = 0; i < fieldNameArr.length; i++) {
		setVisibilityFormField(fieldNameArr[i], true);
	}
}
function showFormFields(fieldNameArr){
	for (var i = 0; i < fieldNameArr.length; i++) {
		setVisibilityFormField(fieldNameArr[i], false);
	}
}
function setAnnotationFormUI(variation){
	var nonVariationFields = ['context', 'resource'];
	var variationFields = ['original', 'variant', 'originalcontext', 'ocontextdisp','variantcontext', 'rcontextdisp','variationagent', 'variationplace', 'variationdate'];
	if(variation){
		hideFormFields(nonVariationFields);
		showFormFields(variationFields);
	} else {
		showFormFields(nonVariationFields);
		hideFormFields(variationFields);
	}
}
function updateVariationAnnotationList() {
	variationStore.removeAll();
	
	// alert (annotabds.data.items.length);
	// dumpValues (annotabds.data.items[0].data);

  var revStoreData = [];
	
	variationInformation = [];
	
	for (var i = 0; i < annotabds.data.items.length; i++) {
		var variationType = annotabds.data.items[i].data.type;
		
		// alert (variationType);
		
		if (variationType != VARIATION_ANNOTATION_NS + 'VariationAnnotation') {
			continue;
		}
		// dumpValues(annotabds.data.items[i].data);
		revStoreData.push ([annotabds.data.items[i].data.title]);
		variationInformation.push({
			id: annotabds.data.items[i].data.id,
			creator: annotabds.data.items[i].data.creator,
			modified: annotabds.data.items[i].data.modified,
      created: annotabds.data.items[i].data.created,
      agent: annotabds.data.items[i].data.variationagent,
      place: annotabds.data.items[i].data.variationplace,
      date: annotabds.data.items[i].data.variationdate,
			title: annotabds.data.items[i].data.title,
      body: annotabds.data.items[i].data.body,
      sourceURL: annotabds.data.items[i].data.original,
      targetURL: annotabds.data.items[i].data.variant,
      sourceContext: annotabds.data.items[i].data.originalcontext,
      targetContext: annotabds.data.items[i].data.variantcontext
		});
	}
	
	setVariationFrameURLs('about:blank', 'about:blank');
	
  variationStore.loadData (revStoreData);	
}
function onVariationsShow(variationsPanel) {
  if (consoleDebug) {console.debug("render!");}
  var targetPanel = Ext.getCmp("variationannotationtarget");
  var sourcePanel = Ext.getCmp("variationannotationsource");
  var listPanel = Ext.getCmp("variationsleftcolumn");
  
  targetPanel.setSize(targetPanel.getSize().width, variationsPanel.getSize().height);
  sourcePanel.setSize(sourcePanel.getSize().width, variationsPanel.getSize().height);
  listPanel.setSize(listPanel.getSize().width, variationsPanel.getSize().height);
  var theFrame = document.getElementById('variationTargetFrame');
  theFrame.style.border = "none";
  theFrame.style.borderTop = "2px solid #eeeeee";
  theFrame.style.width = targetPanel.getSize().width - FRAME_WIDTH_CLEARANCE;
  theFrame.style.height = targetPanel.getSize().height - FRAME_HEIGHT_CLEARANCE;
  theFrame = document.getElementById('variationSourceFrame');
  theFrame.style.border = "none";
  theFrame.style.borderTop = "2px solid #eeeeee";
  theFrame.style.width = sourcePanel.getSize().width - FRAME_WIDTH_CLEARANCE;
  theFrame.style.height = sourcePanel.getSize().height - FRAME_HEIGHT_CLEARANCE;
}

function highlightVariationFrames(variationNumber) {
  var sourceFrame = document.getElementById("variationSourceFrame");
  var targetFrame = document.getElementById("variationTargetFrame");
	
	var sourceVariationAlreadyPresent = false;
	var targetVariationAlreadyPresent = false;

	try {
  	for (var i = 0; i < variationInformation.length; i++) {
  		var annotationElement = sourceFrame.contentDocument.getElementById("ANNOTATION-" + i);
  		
  		if (annotationElement) {
  			if (i == variationNumber) {
					annotationElement.style.backgroundColor = "yellow";
					scrollToElement(annotationElement, sourceFrame.contentDocument.defaultView);
					sourceVariationAlreadyPresent = true;
  			}
				else {
          annotationElement.style.backgroundColor = "";
				}
  		}
  		
  		annotationElement = targetFrame.contentDocument.getElementById("ANNOTATION-" + i);
  		if (annotationElement) {
        if (i == variationNumber) {
          annotationElement.style.backgroundColor = "yellow";
          scrollToElement(annotationElement, targetFrame.contentDocument.defaultView);
					targetVariationAlreadyPresent = true;
        }
				else {
          annotationElement.style.backgroundColor = "";
				}
  		}
  	}
		
    if (!sourceVariationAlreadyPresent) {
      var sourceHighlightElement = highlightXPointer(variationInformation[variationNumber].sourceContext, sourceFrame.contentDocument, true);
      sourceHighlightElement.id = "ANNOTATION-" + variationNumber;
		}
		
		if (!targetVariationAlreadyPresent) {
      var targetHighlightElement = highlightXPointer(variationInformation[variationNumber].targetContext, targetFrame.contentDocument, true);
      targetHighlightElement.id = "ANNOTATION-" + variationNumber;
		}
  } catch (error) {
    alert (error);
  }
}
function onVariationListingClick(listingPanel, rowIndex){
	var locationChanged = setVariationFrameURLs(variationInformation[rowIndex].sourceURL, variationInformation[rowIndex].targetURL);
	
	if (locationChanged) {
    setTimeout('highlightVariationFrames (' + rowIndex + ')', VARIATIONS_FRAME_LOAD_WAIT);
	}
	else {
		highlightVariationFrames(rowIndex);
	}
	
	try {
  	var detailsString = "";
  	
  	detailsString += '<span style="font-weight: bold">Creator:</span> ' + variationInformation[rowIndex].creator + "<br />";
  	detailsString += '<span style="font-weight: bold">Created:</span> ' + variationInformation[rowIndex].created + "<br />";
  	detailsString += '<span style="font-weight: bold">Agent:</span> ' + variationInformation[rowIndex].agent + "<br />";
  	detailsString += '<span style="font-weight: bold">Place:</span> ' + variationInformation[rowIndex].place + "<br />";
  	detailsString += '<span style="font-weight: bold">Date:</span> ' + variationInformation[rowIndex].date + "<br />";
    detailsString += '<br/><span style="font-weight: bold; font-style: italic">Description:</span><br/> ' + variationInformation[rowIndex].body + "<br />";
  	
    propertytabs.activate("variationdetails");
  	Ext.getCmp("variationdetails").body.update(detailsString);
  	
  } catch (error) {
		loreWarning(error);
	}
}

function setVariationFrameURLs(sourceURL, targetURL) {
  var sourceFrame = document.getElementById("variationSourceFrame");
  var targetFrame = document.getElementById("variationTargetFrame");
	var changeMade = false;
  
  if (sourceFrame.src != sourceURL) {
    sourceFrame.src = sourceURL;
		changeMade = true;
	}
	
	if (targetFrame.src != targetURL) {
    targetFrame.src = targetURL;
		changeMade = true;
	}
  
  var sourceLabel = document.getElementById("variationSourceLabel");
  var targetLabel = document.getElementById("variationTargetLabel");
  
  sourceLabel.innerHTML = sourceURL;
  targetLabel.innerHTML = targetURL;
	
	return changeMade;
}


function handleAnnotationDeselection(sm, row, rec) {
		hideMarker();
		// update grid from form if it's a new annotation
		if (annotationsform.isDirty() && !rec.data.id){
			loreWarning("You haven't saved your new annotation!");
			annotationsform.updateRecord(rec);
		}
}

function handleAnnotationSelection(sm, row, rec) {
		// load grid values into form
 		annotationsform.loadRecord(rec);
 		// add a marker to indicate context
 		// TODO: check first whether the currentURL is the original or variant resource (assuming original for now)
 		// TODO: hide the context text if it's not relevant (ie not on currentURL)
 		// TODO: show variant context text if the currentURL is the variant resource
		if (rec.data.context) {
			var idx = rec.data.context.indexOf('#');
			var currentCtxt = rec.data.context.substring(idx + 1);
			var sel = getSelectionForXPath(currentCtxt);
			annoMarker = highlightXPointer(currentCtxt,window.top.getBrowser().selectedBrowser.contentWindow.document , true);
			// display contents of context 
			var ctxtField = annotationsform.findField('ocontextdisp');
			ctxtField.setValue('"' + getSelectionText(currentCtxt) + "'");
		}
		
}

function handleCancelAnnotationEdit(btn,e){
		// reset all annotation form items to empty
		annotationsform.items.each(function(item, index, len){item.reset();});
		annotabsm.clearSelections();
		
		// if this is a new annotation, delete the new template annotation
		var annoIndex = annotabds.findBy(function(record, id){
			return (!record.json.id);
		});
		if (annoIndex > 0){
			annotabds.remove(annotabds.getAt(annoIndex));
		}
		hideMarker();
}

function handleSaveAnnotationChanges (btn,e){
		var annoID = annotationsform.findField('id').value;
		var annoIndex = annotabds.findBy(function(record, id){
			if (annoID) {
				return (annoID == record.json.id);
			}
			else {
				return (!record.json.id);
			}
		});
		// get the annotation contents
		var anno = annotabds.getAt(annoIndex);
		// update anno with properties from form
		annotationsform.updateRecord(anno);
		annotabds.commitChanges();
		var annoRDF = createAnnotationRDF(anno.data);
		var xhr = new XMLHttpRequest();
		if (!annoID){		
			// create new annotation
			xhr.open("POST",annoURL,true);
			xhr.setRequestHeader('Content-Type',  "application/rdf+xml");
			xhr.setRequestHeader('Content-Length', annoRDF.length);
			xhr.onreadystatechange = function(){
				if (xhr.readyState == 4) {
					if (xhr.status == 201) {
						loreInfo('Annotation created');
						updateSourceLists(currentURL);
						annotationsform.items.each(
							function(item, index, len){item.reset();}
						);
						annotabsm.clearSelections();
					} else {
						loreInfo('Unable to create annotation: '+ xhr.statusText);
					}
				}
			};
			//alert(annoRDF);
			xhr.send(annoRDF);	
			annotabds.remove(anno);
		}
		else {
			// update existing annotation
			if (!annotationsform.isDirty()){
				loreInfo('Annotation content not modified: Annotation will not be updated');
				return;
			}
			// Update the annotation on the server via HTTP PUT
			xhr.open("PUT",annoID,true);
			xhr.setRequestHeader('Content-Type',  "application/xml");
			xhr.onreadystatechange = function(){
				if (xhr.readyState == 4) {
					if (xhr.status == 200) {
						loreInfo('Annotation updated');
					} else {
						loreInfo('Unable to update annotation: '+ xhr.statusText);
					}
				}
			};
			xhr.send(annoRDF);
		}
}
function handleDeleteAnnotation(btn,e){
		try {
			// remove the annotation from the annotations tab
			var annoID = annotationsform.findField('id').value;
			var annoIndex = annotabds.findBy(function(record, id){
				if (annoID){
					return (annoID == record.json.id);
				} else {
					return (!record.json.id);
				}
			});
			annotabds.remove(annotabds.getAt(annoIndex));	
			if (annoID){ // annoID is null if it's a new annotation
				// remove from the source tree
				annotationstreeroot.findChild('id',annoID).remove();
				// remove the annotation from the server
				Ext.Ajax.request({
					url: annoID,
					success: function(){
						loreInfo('Annotation deleted');
					},
					failure: function(){
						loreWarning('Unable to delete annotation');
					},
					method: "DELETE"
				});
			}
			annotationsform.items.each(function(item, index, len){item.reset();});
			annotabsm.clearSelections();
			hideMarker();
		} catch (ex){ loreWarning("Problems deleting annotation: " + ex.toString());}
}
function handleUpdateAnnotationContext(btn, e){
			try {
				var currentCtxt = getXPathForSelection();
				var theField = annotationsform.findField('context');
				theField.setValue(currentCtxt);
				theField = annotationsform.findField('originalcontext');
				theField.setValue(currentCtxt);
				theField = annotationsform.findField('resource');
				theField.setValue(currentURL);
				theField = annotationsform.findField('original');
				theField.setValue(currentURL);
				theField = annotationsform.findField('ocontextdisp');
				theField.setValue('"' + getSelectionText(currentCtxt) + '"');	
			} 
			catch (ex) {
				loreWarning(ex.toString());
			}
}
function handleUpdateAnnotationVariantContext(btn, e){
			try {
				var currentCtxt = getXPathForSelection();
				var theField = annotationsform.findField('variantcontext');
				theField.setValue(currentCtxt);
				theField = annotationsform.findField('variant');
				theField.setValue(currentURL);
				theField = annotationsform.findField('rcontextdisp');
				theField.setValue('"' + getSelectionText(currentCtxt) + '"');
			} 
			catch (ex) {
				loreWarning(ex.toString());
			}
}

function handleAnnotationTypeChange(combo){
		var theVal = combo.getValue();
			if (theVal == 'Variation') {
				setAnnotationFormUI(true);
			}
			else if (theVal == 'Comment'  || theVal =='Explanation'){
				setAnnotationFormUI(false);
			}
}
function launchFieldWindow (field){
	launchWindow(field.value, true);
}


/**
 * Get annotation body value.
 * modified from dannotate.js getAjaxRespSync
 * @param uri Fully formed request against Danno annotation server
 * @return Server response as text or XML document.
 */
function getBodyContent(uri) 
{
  var req = null;
  try {
    req = new XMLHttpRequest();
    req.open('GET', uri, false);
    req.setRequestHeader('User-Agent','XMLHttpRequest');
    req.setRequestHeader('Content-Type','application/text');
    req.send(null);
  }
  catch (ex) {
    loreError('Error in synchronous AJAX request:\n  ' + ex + '\n\nURL: ' + uri);
    return null;
  }

  if (req.status != 200) {
    var hst = (uri.length < 65) ? uri : uri.substring(0, 64) + '...';
    throw new Error('Synchronous AJAX request status error.\n  URI: ' + hst + 
                    '\n  Status: ' + req.status);
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
     else if (txt != null) {
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
  if (rtype == 'application/xml' || rtype == 'application/xhtml+xml'){
    	bodyContent = req.responseXML.getElementsByTagName('body');
    	if (bodyContent[0]){
			return serializer.serializeToString(bodyContent[0]);
    	} else {
    		return req.responseText.tidyHTML();
    	}
  } else {
  		// messy but will have to do for now
    	return req.responseText.tidyHTML();
    	
  }

  throw new Error('No usable body.\nContent is "' + rtype + '"' +
                  '\nRequest:\n' + uri + '\n' + req.responseText);
  
}


/**
 * Helper function for updateSourceLists: updates the annotations list
 * with annotations that reference the contextURL
 * @param {} contextURL The escaped URL
 */
function _updateAnnotationsSourceList(contextURL) {
 _clearTree(annotationstreeroot);
 //annotabds.removeAll();
 annotabds.each(function(rec){
 	if (rec.data.id){
		annotabds.remove(rec);
	}
 });
 // Update annotations source tree with matching annotations
 if (annoURL){
 	var queryURL = annoURL + "?w3c_annotates=" + contextURL;
 	loreInfo("Loading annotations for " + contextURL);
 	try {
			var req = new XMLHttpRequest();
			req.open('GET', queryURL, true);
			req.onreadystatechange = function(aEvt) {
				if (req.readyState == 4){
					if (req.responseText && req.status != 204
							&& req.status < 400) {
						var resultNodes = {};
						var xmldoc = req.responseXML;
						if (xmldoc) {
							resultNodes = xmldoc.getElementsByTagNameNS(
								RDF_SYNTAX_NS,
								"Description");
						}

						if (resultNodes.length > 0){
							var annotations = orderByDate(resultNodes);
							annotabds.loadData(annotations,true);
              				updateVariationAnnotationList();
							var annogriddata = [];
							for (var i = 0; i < annotations.length; i++) {
								var annoID = annotations[i].id;
								var annoType = annotations[i].type;
								/*var xmldoc2 = getAnnotationsRDF(annoID, true);
        						var replyList = xmldoc2.getElementsByTagNameNS(RDF_SYNTAX_NS, 'Description');*/
								var title = annotations[i].title;
								if (!title || title == ''){
									title = "Untitled";
								}
								if (annoEventSource){
									
    								var dateEvent = new Date();
    								
    								var evt = new Timeline.DefaultEventSource.Event(
         dateEvent, //start
         dateEvent, //end
         dateEvent, //latestStart
         dateEvent, //earliestEnd
         true, //instant
         "Event " + i, //text
         "Description for Event " + i //description
      );
    									
    									//annotations[i].body + " (" + annotations[i].creator + ")");
    								
    								annoEventSource.add(evt);
    								//alert(evt.getText());
    							}
								//var isLeaf = (replyList.length == 0);
								var isLeaf = true;
								var tmpNode = new Ext.tree.TreeNode({
									id: annoID,
									rowIndex: i,
									text :  title + " <span style='font-style:italic'>(" + annotations[i].creator +")</span>",
									iconCls : 'oreresult',
									leaf: isLeaf	
								});
								
       							/*if (replyList.length > 0) {
          							replies = orderByDate(replyList);
          							for (var j = 0; j < replies.length; j++) {
            							replies[j].context = annotations[i].context;
            							insertAnnotation(replies[j]);
            
          							}
        						}*/
								annotationstreeroot.appendChild(tmpNode);
								
								tmpNode.on('dblclick', function(node) {
									loreviews.activate("annotationstab");
									Ext.getCmp("annotationstab").activate("annotationslistform");
									var annoIndex = annotabds.findBy(function(record, id){
										return (node.id == record.json.id);
									});
									annotabsm.selectRow(annoIndex);
								});
								tmpNode.on('contextmenu', function(node,e){
									if (!node.contextmenu){
										node.contextmenu = new Ext.menu.Menu({
											id: node.id + "-context-menu"
										});
										node.contextmenu.add({
											text: "Add to compound object",
											handler: function(evt){
												addFigure(node.id);
											}
										});
										
										node.contextmenu.add({
											text: "Update annotation",
											handler: function(evt){
												loreviews.activate("annotationstab");
												Ext.getCmp("annotationstab").activate("annotationslistform");
												annotabsm.selectRow(node.attributes.rowIndex);
											}
										});
										if (annoType == VARIATION_ANNOTATION_NS + "VariationAnnotation") {
											node.contextmenu.add({
												text: "Show in Variations View",
												handler: function(evt){
													loreviews.activate("annotationstab");
													Ext.getCmp("annotationstab").activate("variationannotations");
												// TODO: make it easier to select the annotation in the variations listing
												}
											});
										}
									}
    								node.contextmenu.showAt(e.xy);
    							
							});	
							
						}
	
						if (!annotationstreeroot.isExpanded()) {
							annotationstreeroot.expand();
						}
					}
				}
				}
			};
			req.send(null);
		} catch (e) {
			loreWarning("Unable to retrieve annotations");
   	}
  }
}