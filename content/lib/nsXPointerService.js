/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is XPointerLib.
 *
 * The Initial Developer of the Original Code is
 * Doug Daniels <rainking@alumni.rice.edu>
 * Portions created by the Initial Developer are Copyright (C) 2002
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Eliot Setzer
 *   C. Greg Hagerty <cgreg@cgreg.com>
 *    createXPointerFromRange: 
 *      CDATA_SECTION_NODE, TEXT_NODE and focus.TEXT_NODE cases 
 *        search for first non-marked element_above_focus  
 *      and an additional anchor.nodeType subcase 
 *        anchor.ELEMENT_NODE when anchorOffset child is a TEXT_NODE 
 *        (for eg selectNodeContents of a heading) 
 *        (note: there are probobly plenty more unhandled cases here!)
 *        should this return something like a range-inside?
 *
 *      create_child_XPointer: splice in and count children of marked nodes
 *        (any more cases where higher level elements need to be ignored?)
 *
 *      parsePredicates: in the majority of cases we don't need to look at
 *         all children while resolving pointer, we just need the nthChildTag
 *         so speedup using nthChildTag instead of parseNameTest when possible
 *      getChildrenByTagName and nthChildTag: count children of marked nodes
 *      
 *      parseStringRangeFunction: startInput==1 lengthInput==1 case
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */


/*
 * Modified 13 Oct, 2009 
 * Add support for module to be loaded via Components.utils.import
 */
var EXPORTED_SYMBOLS = ['XPointerService'];

const XPOINTER_SERVICE_VERSION = '0.2.6.a.2';


/**
 * nsXPointerService.js
 * 
 * Implements nsIXPointerService XPCOM
 * interface.
 */



/**************************************
 ************** LOGGER ****************
 **************************************/

/**
 * Console global variable.
 */
var gConsoleService = Components.classes['@mozilla.org/consoleservice;1']
    .getService(Components.interfaces.nsIConsoleService);

// Namespace for namespaces
const NAMESPACE_NS = "http://www.w3.org/2000/xmlns/";

/**
 * Logs error messages.
 */
function Logger () {
}

/***************
 * SOURCES
 * OF MESSAGES
 ***************/

Logger.XPTR_CREATE = "XPointerCreator";
Logger.XPOINTER_RESOLVER = "XPointerResolver";
Logger.XPOINTER_RESOLVER_2 = "XPointerResolver(2)";
Logger.XPOINTER_LEXER = "XPointerLexer";
Logger.NTS = "NodeToString";

/**
 * Modules that will be debugged.
 */
Logger.DEBUG_MODULES = Logger.XPOINTER_RESOLVER_2; //+Logger.XPTR_CREATE;

/**
 * Release version -- logging becomes a nop.
 */
Logger.log = function(id, message) {}

/**
 * Development version.
 * Log a message to the JavaScript console.
 *
 * @param id String identifying the source of the message (example: Logger.SERVER)
 * @param message String message to print

Logger.log = function(id, message) {
    if (Logger.DEBUG_MODULES.match (new RegExp (id))) {
        gConsoleService.logStringMessage (id + ": " +message.replace (/\n/g, ' '));
    }
}
*/


/**************************************
 ********** NODE TO STRINGER **********
 **************************************/

/**
 * Provides a one-character-at-a-time toString functionality for a DOM Node, 
 * filtering children of the node by Nodetype. 
 * Returns characters from nodes in DOM order.
 *
 * @param doc DOM Document containing node
 * @param node Node to convert to string one character at a time
 */
function NodeToString(doc, node) 
{
  
    // FIELDS
    this.begin_node = null;
    this.current_node = null;
    this.last_char_index = 0;
    this.next_char_index = 0;
    this.string_value = "";
    this.node_walker = doc.createTreeWalker(node, NodeToString.SHOW_TEXT,
					    null, NodeToString.NO_ENTITY_NODE_EXPAND);

    Logger.log(Logger.NTS, "NTS: Initialized a node to-stringer.\n");
}
 
// CONSTANTS
NodeToString.SHOW_TEXT = 0x04;
NodeToString.NO_ENTITY_NODE_EXPAND = false;

// FIELDS
NodeToString.prototype.begin_node = undefined;
NodeToString.prototype.current_node = undefined;
NodeToString.prototype.last_char_index = undefined;
NodeToString.prototype.next_char_index = undefined;
NodeToString.prototype.string_value = undefined;
NodeToString.prototype.node_walker = undefined;


/**
 * Gets the next character in the node's string-value.
 *
 * @return int value of next char in node's to-string value
 */
NodeToString.prototype.get_next_char = function()
{
    // base case and if we've exhausted node supply
    if (this.current_node == null) {
	
	Logger.log(Logger.NTS, "NTS: getting next node.\n");

	do {
            this.current_node = this.node_walker.nextNode();
        } while ((this.current_node != null)
                 && isMarkedHide(this.current_node.parentNode)); 
        // skipping any text inside "hidden" nodes, could be done with filter
        //  either way, it slows things down a wee bit
        //  maybe we can know when to check?

	// ensure we got a node
	if (this.current_node == null)
	    throw Components.Exception("NTS: get_next_char:  no more available characters");
	
	// set next character
	this.next_char_index = 0;

	// set string-value
	this.string_value = this.current_node.nodeValue;
    }
    
    // if this is the first node, set that value
    if (this.begin_node == null) {
	Logger.log(Logger.NTS, "NTS: setting begin_node.\n")
	this.begin_node = this.current_node;
    }

    // debug test
    if (this.current_node.nodeType != this.current_node.TEXT_NODE) 
	throw Components.Exception("NTS: Somehow a non-text node slipped through to get_next_char's current_node");
   
    // if there are more chars left in this text node
    if (this.next_char_index < this.string_value.length) {
	Logger.log(Logger.NTS, "NTS: returning char " + 
			    this.string_value.charAt(this.next_char_index) + "\n");
	// set last character transmitted
	this.last_char_index = this.next_char_index;
	return this.string_value.charCodeAt(this.next_char_index++);
    }
    // otherwise, move on to next text node
    else if (this.next_char_index == this.string_value.length) {
	
	Logger.log(Logger.NTS, "NTS: making recursive call to get next node.\n");

	// try again, recursively. set current_node to null.
	this.current_node = null;
	return this.get_next_char();
    }
    // otherwise, things are really screwed up
    else throw Components.Exception("NodeToString: next character is beyond the size of the node.");
}

/**
 * Gets the beginning text node from a
 * nodeToString object.
 *
 * @return beginning text node from this NodeToString
 */
NodeToString.prototype.get_begin_text_node = function () { return this.begin_node; }

/**
 * Gets the current text node from a 
 * nodeToString object.
 *
 * @return current text node from this
 */
NodeToString.prototype.get_current_text_node = function () { return this.current_node; }

/**
 * Get the index of the last character returned.
 *
 * @return index of last character returned
 */
NodeToString.prototype.get_last_char_index = function () { return this.last_char_index; }






/**************************************
 ******** XPOINTER CREATOR  ***********
 **************************************/

/**
 * XPointer creation module.
 */
function XPointerCreator() {
}

// CONSTANTS
XPointerCreator.SHOW_ONLY_TEXT_NODES = 0x04;
XPointerCreator.SHOW_TEXT_AND_ELEMENT_NODES = 0x04 | 0x01;
XPointerCreator.NO_ENTITY_NODE_EXPAND = false;
XPointerCreator.SPACE       = 0x20;
XPointerCreator.CARR_RETURN = 0x9;
XPointerCreator.LINE_FEED   = 0xD;
XPointerCreator.TAB         = 0xA;

XPointerCreator.prototype.contentDoc = undefined;
XPointerCreator.prototype.docIsRawHTML = undefined;

XPointerCreator.xpointer_wrap = function(xptr) { return "xpointer(" + xptr + ")"; }

/**
 * Given a DOM Range and the document encompassing it, 
 * creates an XPointer exactly representing it.
 * 
 * @param seln nsISelection object of current selection
 * @param contentDoc nsIDOMDocument containing selection
 * @return String XPointer representing selection in document
 */
XPointerCreator.prototype.createXPointerFromSelection = function(seln, doc) {

    if (! seln) {
	throw Components.Exception("Selection parameter was NULL\n");
    }
    if (! doc) {
	throw Components.Exception("Document parameter was NULL\n");
    }

    if (seln.rangeCount == 0 || seln.isCollapsed) {
	return XPointerCreator.xpointer_wrap("/" + convertTagName(doc.documentElement.tagName, isDocumentRawHTML(doc))
					     + "[1]");
    }

    var anchor = seln.anchorNode; // anchor node of the Selection
    var anchorOffset = seln.anchorOffset; // anchor offset of the Selection
    var focus = seln.focusNode;  // focus node of the Selection
    var focusOffset = seln.focusOffset; // focus offset of the Selection

    // see if the document is rawHTML
    this.docIsRawHTML = isDocumentRawHTML(doc);

    // get the actual node to which the node,offset pair refers
    var anchorNode, focusNode;
    if (anchor.nodeType == anchor.ELEMENT_NODE) {
	anchorNode = anchor.childNodes.item(anchorOffset);
    }
    else {
	anchorNode = anchor;
    }
    if (focus.nodeType == focus.ELEMENT_NODE) {
	focusNode = focus.childNodes.item(focusOffset - 1);
    }
    else {
	focusNode = focus;
    }
    
    // ensure that the anchorNode comes before the focusNode
    // if the anchorNode follows the focusNode, swap
    if (! XPointerCreator.compare_node_order(anchorNode, focusNode, doc)) {
	Logger.log(Logger.XPTR_CREATE, "Swapping anchor and focus nodes and offsets b/c of compare_node_order result.");
	var swap = anchor;
	anchor = focus;
	focus = swap;
	
	swap = anchorOffset;
	anchorOffset = focusOffset;
	focusOffset = swap;
    }
    // otherwise, if same node is selected and focusOffset
    // is ahead of anchorOffset, swap the offsets only
    else if ((anchor == focus) && (anchorOffset > focusOffset)) {
	// swap anchor and focus offset
	Logger.log(Logger.XPTR_CREATE, "Swapping anchor and focus offsets w/in same node.");
	var swap = anchorOffset;
	anchorOffset = focusOffset;
	focusOffset = swap;
    }

    // set the range
    var range = doc.createRange();
    range.setStart(anchor, anchorOffset);
    range.setEnd(focus, focusOffset);

    return this.createXPointerFromRange(range, doc);
}

/**
 * Given a DOM Range and the document encompassing it, 
 * creates an XPointer exactly representing it.
 * 
 * @param range nsIDOMRange to create XPointer for
 * @param contentDoc nsIDOMDocument containing selection
 * @return String XPointer representing selection in document
 */
XPointerCreator.prototype.createXPointerFromRange = function(range, contentDoc) {

    if (! range) {
	throw Components.Exception("NULL range passed as parameter to createXPointerFromRange\n");
    }

    if (! contentDoc) {
	throw Components.Exception("NULL contentDoc passed as parameter to createXPointerFromRange\n");
    }

    this.contentDoc = contentDoc;

    // see if the document is rawHTML
    this.docIsRawHTML = isDocumentRawHTML(this.contentDoc);

    var xptr = "";  // xpointer to return

    // must do end container first, so that you don't move the start past 
    // the end
    if (range.endContainer.nodeType == range.endContainer.ELEMENT_NODE) {
        
	var node = null;

	if (isMarkedIgnore(range.endContainer) ) {
	    Logger.log(Logger.XPTR_CREATE, "range.endContainer is marked ignore!");
	    // get the next node and set offset to beginning
	    node = this.getNextUnmarkedNode(range.endContainer);
	}
	else if ( isMarkedIgnore(range.endContainer.childNodes.item(range.endOffset - 1)) ) {
	    // get the next node from there
	    node = this.getNextUnmarkedNode(range.endContainer.childNodes.item(range.endOffset - 1));
	}

	if (node) {
	    Logger.log(Logger.XPTR_CREATE, "in range.endContainer found node: " + node.nodeName + " with nodeType: " + node.nodeType + 
		 " and nodeValue: " + node.nodeValue);
	    if (node.nodeType == node.ELEMENT_NODE) {
		range.setEndBefore(node);
	    }
	    else {
		range.setEnd(node, 0);
	    }
	    Logger.log(Logger.XPTR_CREATE, "new range.endContainer: " +  range.endContainer.nodeName + " with nodeType: " 
		       + range.endContainer.nodeType + " and nodeValue: " + range.endContainer.nodeValue +
		       " and parent: " + range.endContainer.parentNode.nodeName);
	    Logger.log(Logger.XPTR_CREATE, " and range.endOffset: " + range.endOffset);
	}
    }
    
    // see if we've annotated underneath a parent that is marked ignore
    if (range.startContainer.nodeType == range.startContainer.ELEMENT_NODE) {
	var node = null;

	// if parent is marked ignore
	if (isMarkedIgnore(range.startContainer) ) {
	    Logger.log(Logger.XPTR_CREATE, "range.startContainer is marked ignore!");
	    // get the next node and set offset to beginning
	    node = this.getNextUnmarkedNode(range.startContainer);
	}
	// if actual selected node is marked ignore
	else if ( isMarkedIgnore(range.startContainer.childNodes.item(range.startOffset)) ) {
	    Logger.log(Logger.XPTR_CREATE, "range.startContainer child is marked ignore!");
	    // get the next node from there
	    node = this.getNextUnmarkedNode(range.startContainer.childNodes.item(range.startOffset));
	}
	 
	// if we switched to a new node, update the range
	if (node) {
	    Logger.log(Logger.XPTR_CREATE, "in anchor found node: " + node.nodeName + " with nodeType: " + node.nodeType + 
		 " and nodeValue: " + node.nodeValue);
	    // if an element node, set the start before the node
	    if (node.nodeType == node.ELEMENT_NODE) {
		range.setStartBefore(node);
	    }
	    // if a text node, set the start at the beginning character of the node
	    else {
		range.setStart(node, 0);
	    }
	    Logger.log(Logger.XPTR_CREATE, "new range.startContainer: " +  range.startContainer.nodeName + 
		       " with nodeType: " + range.startContainer.nodeType + 
		       " and nodeValue: " + range.startContainer.nodeValue +
		       " and parent: " + range.startContainer.parentNode.nodeName);
	    Logger.log(Logger.XPTR_CREATE, " and range.startOffset: " + range.startOffset);
	}
    }

    // establish shortcut names
    var anchor = range.startContainer;
    var anchorOffset = range.startOffset;
    var focus = range.endContainer;
    var focusOffset = range.endOffset;

    switch(anchor.nodeType) {
	case anchor.ELEMENT_NODE:
	Logger.log(Logger.XPTR_CREATE, "anchor is an ELEMENT Node.");
	
	if (anchor == focus) {
	    Logger.log(Logger.XPTR_CREATE, "and is == to focus");

            var theChild = anchor.childNodes.item(anchorOffset);
            if (theChild.nodeType == theChild.TEXT_NODE) {
                //and should probobly check that
                // && anchorOffset == 0
                // && anchor.ChildNodes.length == focusOffset == 1
                //    otherwise there may be more child nodes?
                //we should probably handle more cases here, but for now assume
                //  we're looking to surround the node contents 
                //  (eg. selectNodeContents of a heading)
                //  should this return range-inside?
                //return XPointerCreator.xpointer_wrap('range-inside('+this.create_child_XPointer(anchor.childNodes.item(anchorOffset))+')');
                return XPointerCreator.xpointer_wrap(this.create_string_range(anchor, theChild, 0, theChild, theChild.length));
            } else {
                return XPointerCreator.xpointer_wrap(this.create_child_XPointer(anchor.childNodes.item(anchorOffset)));
            }
	}
	else {
	    xptr = "" + this.create_child_XPointer(anchor.childNodes.item(anchorOffset)) + 
		"/range-to(";
	}
	break;
    case anchor.CDATA_SECTION_NODE:
    case anchor.TEXT_NODE:
	Logger.log(Logger.XPTR_CREATE, "anchor is a TEXT Node.");

	/* if anchor offset is the absolute end of the node, then 
	   we have not selected any content in the Node, and need
	   to move forward to the beginning of the next non-empty
	   Node. 
	*/
	if (anchorOffset == anchor.nodeValue.length) {
	    Logger.log(Logger.XPTR_CREATE, "moving forward to next text node since we're at the end of this one");
	    anchor = this.get_next_ne_text_node(anchor);
	    anchorOffset = 0;
	}

	// figure Element Node above or anchor and focus Text Nodes
	var element_above_anchor = this.get_element_above(anchor);
        while (isMarkedIgnore(element_above_anchor)) {
            // ignored elements (spans) may have been inserted to surround anchor
            element_above_anchor = element_above_anchor.parentNode; 
            Logger.log(Logger.XPTR_CREATE, 
                       "**Special Case: anchor below ignored element(s)\n");
        }

	// if anchor and focus same node can return from here
	if (anchor == focus) {
	    Logger.log(Logger.XPTR_CREATE, "anchor == focus.\n");

	    return XPointerCreator.xpointer_wrap(this.create_string_range(element_above_anchor, anchor, anchorOffset,
								   focus, focusOffset));
	}
	// multi-node
	else {
	    Logger.log(Logger.XPTR_CREATE, "anchor != focus \n");
	    // can use anchorOffset + 1 because anchorOffset is never length of anchor
	    xptr = "start-point(" + this.create_string_range(element_above_anchor, anchor, anchorOffset,
							     anchor, anchorOffset + 1) +
	    ")/range-to(";
	}
    break;
    default:
    throw Components.Exception("Unexpected node type " + anchor.nodeType + 
		    "found in XPointer creation.");
    }

    // PROCESS FOCUS Node
    switch (focus.nodeType) {
    case focus.ELEMENT_NODE:
    /* We subtract one from the focusOffset because the focusOffset is inclusive, and we 
       need the exclusive value */
        Logger.log(Logger.XPTR_CREATE, "focus is an ELEMENT Node: tagName==" + focus.tagName + 
		   " # of children==" + focus.childNodes.length + " and focusOffset==" + focusOffset);
        
        var previousNode = focus.childNodes.item(focusOffset - 1);

      switch (previousNode.nodeType) {
        case previousNode.TEXT_NODE:
        case previousNode.CDATA_SECTION_NODE:
            // For text-type nodes, return an XPointer indicating
            // the end of the node
            return XPointerCreator.xpointer_wrap
               (xptr + this.create_string_range
                  (previousNode.parentNode,
                   previousNode,
                   previousNode.data.length-1,
                   previousNode,
                   previousNode.data.length) + ")");
   
        default:
            return XPointerCreator.xpointer_wrap(xptr + this.create_child_XPointer(previousNode) + ")");
      }

    case focus.CDATA_SECTION_NODE:
    case focus.TEXT_NODE:
	Logger.log(Logger.XPTR_CREATE, "focus is a TEXT Node.\n");

	/* if focus offset is 0, we have selected no content
	   in the current focus node, and hence need to move
	   back to the previous non-empty text node in DOM order and
	   set the focus to it, and the focusOffset to the last character
	   in that node.
	*/
	if (focusOffset == 0) {
	    var new_focus = this.get_prev_ne_text_node(focus);
	    focus = new_focus;
	    focusOffset = new_focus.nodeValue.length;
	}

	// figure Element Node above or at focus Text Node
	var element_above_focus  = this.get_element_above(focus);
        while (isMarkedIgnore(element_above_focus)) {
            Logger.log(Logger.XPTR_CREATE, 
                       "**Special Case: focus below ignored element(s)\n");
            //assume we're looking an inserted span(s) below some sort of 
            // ELEMENT_NODE with text node (and span) children
            element_above_focus = element_above_focus.parentNode; 
        }

	
	// can use focusOffset - 1 because focusOffset is never 0
    return XPointerCreator.xpointer_wrap(xptr + "end-point(" + this.create_string_range(element_above_focus, focus, focusOffset - 1,
										     focus, focusOffset) + "))");
    default:
	throw Components.Exception("Unexpected focus node type " + focus.nodeType + 
				   "found in XPointer resolution.");
    }
}


/**
 * Returns a child axis XPointer for the 
 * parameter DOM node.
 *
 * @param node nsIDOMNode -- of type Element
 * @return String XPath
 */
XPointerCreator.prototype.create_child_XPointer = function(node) {
    var parent;   // the parent of our node
    var children; // children of that parent node
    var i;        // loop var
    var count;    // counter variable
    var result = ""; // xpointer value to return
    var tagName;  // tag name we're looking for (normally node.tagName)

    if (isMarkedIgnore(node)) { 
        //throw up 
    }

    /*************
     * BARE-NAMES
     *************/

    // if we can grab an ID, return that instead of full XPath
    if ( node.hasAttribute && node.hasAttribute("id") && node.getAttribute("id") != "") {
        return 'id("' + node.getAttribute("id") + '")';
    }

    /* otherwise, do: */

    /*************
     * CHILD-AXIS
     * XPOINTER
     *************/

    // If the current node is a text node, then just move up to the
    // parent node (which is expected to be an Element)
    
    if (node.nodeType == node.TEXT_NODE || node.nodeType == node.CDATA_SECTION_NODE)
    {
      node = node.parentNode;
    }
    // loop until we reach top level, or a node with an ID.
    while (node.parentNode) {
        
        // Addition from Dannolib, 
        if (node.hasAttribute && node.hasAttribute("id") && node.getAttribute("id") != "") {
           return 'id("' + node.getAttribute("id") + '")' + result;
        }
	
	parent = node.parentNode;     // the parent of our current node
	children = parent.childNodes; // the children of that parent, including our node
	count = 0;  /* which occurrence of this type of tag our
		       node is */

        if (!isMarkedIgnore(node) && node.tagName) {
            tagName = convertTagName(node.tagName, this.docIsRawHTML);
        }
        // else we must still be counting estranged siblings of a bastard child
        //   (node must be an ignored parent)

	/* loop through all the child nodes of the parent, trying to
	   identify our node */
	for (i = 0; i < children.length; i++) {

            //need to add such-tagged estranged siblings to count!
            if (isMarkedIgnore(children.item(i))) {
                count += countChildTags(children.item(i), tagName,
                                        this.docIsRawHTML);
            } 
            else
	    // if there's a node of the same tagName, increment count
  	    if ((children.item(i).nodeType == node.ELEMENT_NODE) 
                && (convertTagName(children.item(i).tagName, this.docIsRawHTML)
                    == tagName)) {
                count++;
            }

	    // if we find our node, append to the return result and break
	    if (children.item(i) == node) {
                if (isMarkedIgnore(parent)) {
                    //may need to add such-tagged, preceding siblings to count!
                    // carry on by looking for same tagName 
                    // until parent(s) found as child of grandparent
                    // (et cetera)
                    // noop here and don't change tagName next cycle
                    dump("\nContinuing with ignored parent\n");
                } else {
                    result = "/" 
                    + tagName
                    + "[" + count + "]" + result;
                }
		break;
	    }
	}
	// an unsuccesful attempt is an error.  debug this.
	if (i == children.length) {
            var dbg_child = "";
	    for (i = 0; i < children.length; i++) {
		dbg_child = dbg_child + i + ": " + children.item(i).nodeValue + "\n";
	    }
	    throw Components.Exception("create_child_XPointer: Failed to find" +
				       " current child: " + node.nodeValue +
				       + " counting tags named: " + tagName +
				       "\nin list of parent's child nodes: \n" 
				       + dbg_child);
        }
	
	// continue up the tree
	node = node.parentNode;
    }
    
    return result;
}

// assume tagName is already converted
function countChildTags (parent, tagName, docIsRawHTML) {
    var children = parent.childNodes; 
    var count = 0;
    var child;
    for (var i = 0; i < children.length; i++) {
        child = children.item(i);
        if (isMarkedIgnore(child)) {
            count += countChildTags(child, tagName);
        } else if ((child.nodeType == child.ELEMENT_NODE)
                   && (convertTagName(child.tagName, docIsRawHTML)
                       == tagName)) { //might be a text node -- ouch
            count++;
        }
    }
    //dump("Counting "+tagName+" tags of "+parent.nodeName+": "+count+"\n");
    return count;
}


/**
 * Create a string-range XPointer String.
 *
 * @param element_above Element above both text nodes
 * @param begin_text_node Text Node where text starts
 * @param begin_offset offset in begin node where text starts
 * @param end_text_node Text Node where text ends
 * @param end_offset offset into end node where text ends
 * @return string-range string encompassing parameters
 */
XPointerCreator.prototype.create_string_range = function(element_above, begin_text_node, begin_offset,
							 end_text_node, end_offset)
{
   //  // PRINT OUT _DEBUG INFO
//     Logger.log(Logger.XPTR_CREATE, "create_string_range: \n");
//     Logger.log(Logger.XPTR_CREATE, " -- elt above's nodeName: " + element_above.nodeName);
//     if (element_above.hasAttribute("id")) {
// 	Logger.log(Logger.XPTR_CREATE, " with id " + element_above.getAttribute("id") + "\n");
//     }
//     else {
// 	Logger.log(Logger.XPTR_CREATE, " with no id.\n");
//     }

//     Logger.log(Logger.XPTR_CREATE, " -- begin text node contents: " + begin_text_node.nodeValue + "\n");
//     Logger.log(Logger.XPTR_CREATE, " -- begin text node offset  : " + begin_offset + "\n");
//     Logger.log(Logger.XPTR_CREATE, " -- end text node contents  : " + end_text_node.nodeValue + "\n");
//     Logger.log(Logger.XPTR_CREATE, " -- end text node offset    : " + end_offset + "\n");  

    // node to stringer
    var node_stringer = new NodeToString(this.contentDoc, element_above);
    // current character we've gotten from node stringer
    var current_char;
    // a counter for characters in DOM representation
    var DOM_char_count = 0;
    // a counter for characters inside the begin text node
    var begin_node_DOM_index = 0;
    // a counter for characters inside the end text node
    var end_node_DOM_index = 0;
    // the index we begin searching at in the end node
    var end_node_initial_offset;
    // chars removed before the string we're searching for
    var chars_removed_before_substr = 0; 
    // chars removed from the string we're searching for
    var chars_removed_from_substr = 0;
    // whether the last character was whitespace
    var last_char_was_whitespace = true;
    // the start and length for string-range
    var start, length;


    /*
     * FIND BEGIN NODE
     */

    // get first character
    current_char = node_stringer.get_next_char();
    DOM_char_count += 1; 

    // loop until we are at beginning text node, counting chars
    while (node_stringer.get_current_text_node() != begin_text_node) {
	
	// if current char is white space
	if (this.is_white_space(current_char)) {
	    // if last char was whitespace, remove this one
	    if (last_char_was_whitespace)
		chars_removed_before_substr += 1;
	    // otherwise, don't remove
	    else last_char_was_whitespace = true;
	}
	// otherwise, not white space
	else 
	    last_char_was_whitespace = false;
	
	// get next char
	current_char = node_stringer.get_next_char();
	DOM_char_count += 1;
    }


    /*
     * FIND OFFSET IN BEGIN NODE
     */

    while (begin_node_DOM_index < begin_offset) {
	// if current char is white space
	if (this.is_white_space(current_char)) {
	    // if last char was whitespace, remove this one
	    if (last_char_was_whitespace) {
		chars_removed_before_substr += 1;
	    }
	    // otherwise, don't remove
	    else {
		last_char_was_whitespace = true;
	    }
	}
	// otherwise, not white space
	else {
	    last_char_was_whitespace = false;
	}

	// get next char
	current_char = node_stringer.get_next_char();
	begin_node_DOM_index += 1;
	DOM_char_count += 1;
    } 

    // calculate start point -- indexed from 1
    start = DOM_char_count - chars_removed_before_substr;
    

    /**
     * FIND END NODE, and
     * DETERMINE INITIAL OFFSET IN
     * END NODE.
     */

    // reset the character count -- it will now hold DOM
    // chars counted including the start char (hence 1)
    DOM_char_count = 1;	

    // if we have to find the end node
    if (begin_text_node != end_text_node) {

	// we will automatically begin searching at character 0 in the end node
	end_node_initial_offset = 0;

	// loop until we reach the end node
	while (node_stringer.get_current_text_node() != end_text_node) {
	    
	    // if current char is white space
	    if (this.is_white_space(current_char)) {
		// if last char was whitespace, remove this one
		if (last_char_was_whitespace)
		    chars_removed_from_substr += 1;
		// otherwise, don't remove
		else last_char_was_whitespace = true;
	    }
	    // otherwise, not white space
	    else 
		last_char_was_whitespace = false;
	    
	    // get next char
	    current_char = node_stringer.get_next_char();;
	    DOM_char_count += 1;
	}
    }
    // if we're already at the end node
    else {
	// we'll begin searching from the index of 
	// our start character
	end_node_initial_offset = begin_node_DOM_index;
    }
    
    /**
     * FIND END NODE
     * OFFSET and
     * CALCULATE LENGTH.
     */

    /* at this point, we are at the end node.
       end_node_initial_offset has the current char's
       offset in the end node */
    end_node_DOM_index = end_node_initial_offset;

    // loop until we reach char before end offset
    while (end_node_DOM_index < (end_offset - 1)) {
	// if current char is white space
	if (this.is_white_space(current_char)) {
	    // if last char was whitespace, remove this one
	    if (last_char_was_whitespace)
		chars_removed_from_substr += 1;
	    // otherwise, don't remove
	    else {
		last_char_was_whitespace = true;
	    }
	}
	// otherwise, not white space
	else {
	    last_char_was_whitespace = false;
	}
	
	// get next char
	current_char = node_stringer.get_next_char();
	DOM_char_count += 1;
	end_node_DOM_index += 1;
    }

    // calculate length
    length = DOM_char_count - chars_removed_from_substr;

    /* Since we must get at least one character to determine which node
     * we're in, we need to short-circuit here for a combined length
     * of zero, ie (startOffset - endOffset) in the same text node
     * equal to 0.  
     */
    if (((begin_offset - end_offset) == 0) &&
	(begin_text_node == end_text_node)) {
	return "string-range(" + this.create_child_XPointer(element_above) + ', "", ' +
	    start + ", 0)";
    }
    // otherwise, return normally
    else  
	return "string-range(" + this.create_child_XPointer(element_above) + ', "", ' +
	    start + ", " + length + ")";
}


/*************
 * UTILS 
 *************/

/**
 * Gets the Element above or at the
 * node passed in.
 *
 * @param node DOM Node
 * @return DOM Element Node above or at parameter node
 */
XPointerCreator.prototype.get_element_above = function(node) {
    while (node.nodeType != node.ELEMENT_NODE && node.parentNode) {
	node = node.parentNode;
    }

    if (node.nodeType != node.ELEMENT_NODE) 
	throw Components.Exception("get_element_above: couldn't locate an Element.");
    else return node;
}

/**
 * Is a character white-space?
 *
 * @param char_value integer value of char
 * @return whether character is whitespace
 */
XPointerCreator.prototype.is_white_space = function (char_value) 
{
    /* XML whitespace characters  
       WS ::= (#x20 | #x9 | #xD | #xA)+ */
    return  ((char_value == XPointerCreator.SPACE) || (char_value == XPointerCreator.CARR_RETURN) ||
	     (char_value == XPointerCreator.LINE_FEED) || (char_value == XPointerCreator.TAB));
}

/**
 * Compare two nodes to determine which is
 * ahead of the other in DOM order.
 *
 * @param node_a first node
 * @param node_b second node
 * @return whether the first node preceeds the second,
 * or if they are == return true
 */
XPointerCreator.compare_node_order = function (node_a, node_b, doc) {
    
    // if the two nodes are equal, return true
    if (node_a == node_b) return true;

    // node_a==anchor, node_b == focus

    var range_a = doc.createRange();
    var range_b = doc.createRange();

    range_a.selectNode(node_a);
    range_b.selectNode(node_b);

    return (range_a.compareBoundaryPoints(range_a.START_TO_START, range_b) != 1);
}

/**
 * Given a node, returns the previous non-empty 
 * visible text node.
 *
 * @param old_node Node to start from
 * @return previous text node
 */
XPointerCreator.prototype.get_prev_ne_text_node = function (old_node) {
    
    // tree walker to iterate the DOM tree 
    var walk = this.contentDoc.createTreeWalker(this.contentDoc.documentElement,
							 XPointerCreator.SHOW_ONLY_TEXT_NODES,
							 null,
							 XPointerCreator.NO_ENTITY_NODE_EXPAND);
    walk.currentNode = old_node; 
    var prev = walk.previousNode();
    
    // loop until we find a node
    while(prev != null) {
	if (this.is_empty_text_node(prev)) {
	    // all white space--get new previous
	    prev = walk.previousNode();
	}
	else {
	    return prev;
	}
    }

    // no more available text nodes! ERROR
    throw Components.Exception("get_prev_ne_text_node:  no more available text nodes!");
}

/**
 * Given a node, returns the next non-empty 
 * visible text node.
 *
 * @param old_node Node to start from
 * @return previous text node
 */
XPointerCreator.prototype.get_next_ne_text_node = function (old_node) {
    
    // tree walker to iterate the DOM tree 
    var walk = this.contentDoc.createTreeWalker(this.contentDoc.documentElement,
							 XPointerCreator.SHOW_ONLY_TEXT_NODES,
							 null,
							 XPointerCreator.NO_ENTITY_NODE_EXPAND);
    walk.currentNode = old_node; 
    var next = walk.nextNode();
    
    // loop until we find a node
    while(next != null) {
	if (this.is_empty_text_node(next)) {
	    // all white space--get next
	    next = walk.nextNode();
	}
	else {
	    return next;
	}
    }

    // no more available text nodes! ERROR
    throw Components.Exception("get_next_ne_text_node:  no more available text nodes!");
}    

XPointerCreator.prototype.is_empty_text_node = function(node) {
    
    // ensure that something other than whitespace exists in this node
    for(var i = 0; i < node.nodeValue.length; i++) {
	if (! this.is_white_space(node.nodeValue.charCodeAt(i)) ) {
	    return false;
	}
    }

    return true;
}

	
XPointerCreator.prototype.getNextUnmarkedNode = function(node) {
    // while the node is to be ignored, get the nearest sibling node
    while (isMarkedIgnore(node) || ((node.nodeType == node.TEXT_NODE) && this.is_empty_text_node(node))) {
	// while there are no siblings, search for a sibling
	while (! node.nextSibling) {
	    // go up a level
	    if (node.parentNode) {
		node = node.parentNode;
	    }
	    // else can't go up any further, we're at
	    // end of document.  give up and return 
	    // an xptr to end of document?
	    else {
		// XXX --- FIX ME --- XXX
		return null;
	    }
	}

	// grab the sibling
	node = node.nextSibling;

	// go as far down the firstChild tree as possible
	while (node.firstChild) {
	    node = node.firstChild;
	}
    }

    return node;
}

XPointerCreator.prototype.getPreviousUnmarkedNode = function(node) {
    // while the node is to be ignored, get the nearest sibling node
    while (isMarkedIgnore(node) || ((node.nodeType == node.TEXT_NODE) && this.is_empty_text_node(node))) {
	
	// while there are no siblings, search for a sibling
	while (! node.previousSibling) {
	    // go up a level
	    if (node.parentNode) {
		node = node.parentNode;
	    }
	    // else can't go up any further, we're at
	    // end of document.  give up and return 
	    // an xptr to end of document?
	    else {
		// XXX --- FIX ME --- XXX
		return null;
	    }
	}

	// grab the sibling
	node = node.previousSibling;

	// go as far down the lastChild tree as possible
	while (node.lastChild) {
	    node = node.lastChild;
	}
    }
    
    return node;
}


/********************************
 * XPOINTER LEXER
 ********************************/

/**
 * Lexer for the W3 XPointer standard
 * implemented in JavaScript.
 *
 * @param xp String to lex
 */
function XPointerLexer(xp) {
    this.peekBuffer = null;
    this.xp = xp;
}

// TAGS
XPointerLexer.FENCE_TAG = 0;
XPointerLexer.OPERATOR_TAG = 1;
XPointerLexer.NAMETEST_TAG = 2;
XPointerLexer.LITERAL_TAG = 3;
XPointerLexer.NODETYPE_TAG = 4;
XPointerLexer.FUNCTIONNAME_TAG = 5;
XPointerLexer.AXISNAME_TAG = 6;
XPointerLexer.NUMBER_TAG = 7;
XPointerLexer.AT_TAG = 8;
XPointerLexer.COLON_COLON_TAG = 9;
XPointerLexer.COMMA_TAG = 10;
XPointerLexer.DOT_TAG = 11;
XPointerLexer.DOT_DOT_TAG = 12;


// Tokens
XPointerLexer.AT = { tag: XPointerLexer.AT_TAG, value: "@"};
XPointerLexer.COLON_COLON = { tag: XPointerLexer.COLON_COLON_TAG, value: "::"};
XPointerLexer.LEFT_PAREN = { tag: XPointerLexer.FENCE_TAG, value: "("};
XPointerLexer.RIGHT_PAREN = { tag: XPointerLexer.FENCE_TAG, value: ")"};
XPointerLexer.LEFT_BRACK = { tag: XPointerLexer.FENCE_TAG, value: "["};
XPointerLexer.RIGHT_BRACK = { tag: XPointerLexer.FENCE_TAG, value: "]"};
XPointerLexer.COMMA = { tag: XPointerLexer.COMMA_TAG, value: ","};
XPointerLexer.DOT_DOT = { tag: XPointerLexer.DOT_DOT_TAG, value: ".."};
XPointerLexer.DOT = { tag: XPointerLexer.DOT_TAG, value: "."};
XPointerLexer.MULTIPLY = { tag: XPointerLexer.OPERATOR_TAG, value: "*"};
XPointerLexer.SLASH = { tag: XPointerLexer.OPERATOR_TAG, value: "/"};
XPointerLexer.SLASH_SLASH = { tag: XPointerLexer.OPERATOR_TAG, value: "//"};
XPointerLexer.OR = { tag: XPointerLexer.OPERATOR_TAG, value: "|"};
XPointerLexer.PLUS = { tag: XPointerLexer.OPERATOR_TAG, value: "+"};
XPointerLexer.MINUS = { tag: XPointerLexer.OPERATOR_TAG, value: "-"};
XPointerLexer.EQUALS = { tag: XPointerLexer.OPERATOR_TAG, value: "="};
XPointerLexer.NOT_EQUALS = { tag: XPointerLexer.OPERATOR_TAG, value: "!="};
XPointerLexer.LESS_THAN_EQUALS = { tag: XPointerLexer.OPERATOR_TAG, value: "<="};
XPointerLexer.LESS_THAN = { tag: XPointerLexer.OPERATOR_TAG, value: "<"};
XPointerLexer.GREATER_THAN_EQUALS = { tag: XPointerLexer.OPERATOR_TAG, value: ">="};
XPointerLexer.GREATER_THAN = { tag: XPointerLexer.OPERATOR_TAG, value: ">"};

/**
 * Buffer to hold peeked token.
 */
XPointerLexer.prototype.peekBuffer = undefined;

/**
 * XPointer string we are processing.
 * Changes to reflect state of lexing.
 */
XPointerLexer.prototype.xp = undefined;

XPointerLexer.prototype.skipUnknownScheme = function(){
    var scope = 0;
    var token;

    // ensure that first token is a left paren
    token = this.peekToken();
    if (token.value != "(") {
        var e = "SchemeData must begin with an opening left-paren.  Got: ";
        throw Components.Exception(e + token.value);
    }
    scope++;

    // The peek buffer must now contain "(" and this.xp contains the rest of the
    // string after the end of the "(" token.

    // Eliminate the peek buffer.
    token = this.getToken();

    var c;
    var unclosedParenthesesError = Components.Exception(
        "Not enough ')'s to balance '(' in SchemeBased fragment."
    );
    var unopenedParenthesesError = Components.Exception(
        "Internal error: getToken returned '(' when a ')' precedes any '('."
    );
    var escapingError = Components.Exception(
        "'^' not followed by '^', '(', or ')' in SchemeData"
    );

    c = this._getChar();
    while(c != null){
        switch(c){
        case "(":
            scope++;
            break;
        case ")":
            if(scope == 0) throw unopenedParenthesesError;
            scope--;
            if(scope == 0) return;
            break;
        case "^": // "^" is the escape character for unbalanced ")" characters.
            c = this._getChar();
            if(c == null) throw unclosedParenthesesError;
            switch(c){
            case "^": // Exactly these three characters can be escaped by "^".
            case "(":
            case ")":
                break;
            default:
                throw escapingError;
            }
            break;
        default:
            break;
        }
        c = this._getChar();
    }
    throw unclosedParenthesesError;
}

/*
 * Peek function -- peeks the next token, or if a token
 * was previously peeked, returns it. If there are no
 * more tokens, returns null.
 */
XPointerLexer.prototype.peekToken = function () {
    if (! this.peekBuffer) {
	this.peekBuffer = this.getToken();
	if (this.peekBuffer) {
	    Logger.log(Logger.XPOINTER_LEXER, "stored token in peek buffer");
	}
    }
    
    return this.peekBuffer;
}


/**
 * Called to get the next token from the lexer.
 *
 * @exception if no more tokens exist
 * @exception if there is a syntax error
 * @return next token object with tag and value fields
 */
XPointerLexer.prototype.getToken = function() {
    // if there is a peek buffer, return it
    if (this.peekBuffer) {
	Logger.log(Logger.XPOINTER_LEXER, "returning from peek buffer");
	var tempPeek = this.peekBuffer;
	this.peekBuffer = null;
	return tempPeek;
    }
    
    // remove opening whitespace 
    this.xp = this.xp.replace(/^\s+/, "");

    Logger.log(Logger.XPOINTER_LEXER, "xp going in: " + this.xp);

    // get token
    var token = this._getToken();

    this.lastToken = token;

    return token;
}
    

/**
 * Private lexer get_token function for XPointers.  Gets the largest
 * lexical unit we understand next.
 *
 * @throws Error if XPointer Syntax Error
 * @return Object:  tag:   int tag of obj type
 *                  value: value, if applicable
 *         or null if no more tokens
 */
XPointerLexer.prototype._getToken = function ()
{
    /* If there is a preceding token and the preceding 
       token is not one of @, ::, (, [, , or an Operator, 
       then a * must be recognized as a MultiplyOperator 
       and an NCName must be recognized as an OperatorName. */
    var mustBeAnOperator = (this.lastToken && 
			    (this.lastToken != XPointerLexer.AT) &&
			    (this.lastToken != XPointerLexer.COLON_COLON) &&
			    (this.lastToken != XPointerLexer.LEFT_PAREN) &&
			    (this.lastToken != XPointerLexer.LEFT_BRACK) &&
			    (this.lastToken != XPointerLexer.COMMA) &&
			    (this.lastToken.tag != XPointerLexer.OPERATOR_TAG) );

    // get the first character in the string remaining
    var charZero = this._getChar();
    if (! charZero ) {
	Logger.log(Logger.XPOINTER_LEXER, "No more chars in the xp");
	// return null if there are no more tokens
	return null;
    }    

    switch(charZero) {

	case "(": return XPointerLexer.LEFT_PAREN;
	
	case ")": return XPointerLexer.RIGHT_PAREN;
	
	case "[": return XPointerLexer.LEFT_BRACK;
	
	case "]": return XPointerLexer.RIGHT_BRACK;
	
	case ".": 
	var charOne = this._getChar();
	if (charOne && (charOne == ".")) {
	    return XPointerLexer.DOT_DOT;
	}
	else {
	    if (charOne) {
		this._pushBackChar(charOne);
	    }
	    return XPointerLexer.DOT;
	}
	
	case "@":
	return XPointerLexer.AT;

	case ",":
	return XPointerLexer.COMMA;

	case ":":
	var charOne = this._getChar();
	if (charOne) {
	    if (charOne == ":") {
		return XPointerLexer.COLON_COLON;
	    }
	    else {
		throw Components.Exception("XPointer Syntax Error: Expected :: and got " +
				charZero + charOne);
	    }
	}
	else {
	    throw Components.Exception("XPointer Syntax Error: Unexpected end of string after ':'");
	}

	case "*":
	if (mustBeAnOperator) {
	    return XPointerLexer.MULTIPLY;
	}
	else {
	    return { tag: XPointerLexer.NAMETEST_TAG, value: charZero };
	}
		
	// string literal
	case '"':
	var match = this.xp.match(/^([^"]*?)"/);
	if (match) {
	    this._removeChars(match[0].length);
	    if (match[1]) {
		return { tag: XPointerLexer.LITERAL_TAG,
				  value: match[1] };
	    }
	    else {
		return { tag: XPointerLexer.LITERAL_TAG,
				  value: "" };
	    }
	}
	else {
	    throw Components.Exception("XPointer Syntax Error: Unterminated string literal : \"" +
			    this.xp);
	}
	
	case "'":
        var match = this.xp.match(/^([^']*?)'/);
	if (match && match[1]) {
	    this._removeChars(match[0].length);
	    return { tag: XPointerLexer.LITERAL_TAG,
		     value: match[1] };
	}
	else {
	    throw Components.Exception("XPointer Syntax Error: Unterminated string literal : \'" +
			    this.xp);
	}
	
	case "/":
	var charOne = this._getChar();
	if (charOne && (charOne == "/") ) {
	    return XPointerLexer.SLASH_SLASH;
	}
	else {
	    if (charOne) {
		this._pushBackChar(charOne);
	    }
	    return XPointerLexer.SLASH;
	}
	
	case "|": return XPointerLexer.OR;
	case "+": return XPointerLexer.PLUS;
	case "-": return XPointerLexer.MINUS;
	case "=": return XPointerLexer.EQUALS;
	case "!": 
	var charOne = this._getChar();
	if (charOne) {
	    if (charOne == "=") {
		return XPointerLexer.NOT_EQUALS;
	    } 
	    else {
		throw Components.Exception("XPointer Syntax Error: Expected != and got " +
				charZero + charOne);
	    }
	}
	else {
	    throw Components.Exception("XPointer Syntax Error: Unexpected end of string after '!'");
	}
	
	case "<":
	var charOne = this._getChar();
	if (charOne && (charOne == "=") ) {
	    return XPointerLexer.LESS_THAN_EQUALS;
	}
	else {
	    if (charOne) {
		this._pushBackChar(charOne);
	    }
	    return XPointerLexer.LESS_THAN;
	}

	case ">":
	var charOne = this._getChar();
	if (charOne && (charOne == "=") ) {
	    return XPointerLexer.GREATER_THAN_EQUALS;
	}
	else {
	    if (charOne) {
		this._pushBackChar(charOne);
	    }
	    return XPointerLexer.GREATER_THAN;
	}
	
	// VARIABLE NAMES

	case "$":
	throw Components.Exception("XPointerLexer: Variables are not yet implemented",
				   Components.results.NS_ERROR_NOT_IMPLEMENTED);

	default:
	// not a single character type, so push back our charZero
	this._pushBackChar(charZero);	
    }

    /**
     * W3 XPath Grammar Hacks follow.  Perhaps in the
     * future they'll write a non-ambiguous grammar...
     */

    // so, first off see if we have an NCName
    var ncNameMatch = this.xp.match(/^[a-zA-Z_][a-zA-Z0-9_\-\.]*/);
    if (ncNameMatch) {
	Logger.log(Logger.XPOINTER_LEXER, "NCName: " + ncNameMatch[0]);
	// remove the NCName
	this._removeChars(ncNameMatch[0].length);
	Logger.log(Logger.XPOINTER_LEXER, "xp after NCName removal: " + this.xp);

	/* If there is a preceding token and the preceding 
	   token is not one of @, ::, (, [, , or an Operator, 
	   then a * must be recognized as a MultiplyOperator 
	   and an NCName must be recognized as an OperatorName. */
	if (mustBeAnOperator) {
	    Logger.log(Logger.XPOINTER_LEXER, "mustbeanoperator.");
	    // try to find an operator name
	    if (ncNameMatch[0].
		match(/^(and|or|mod|div)$/)) {
		return { tag: XPointerLexer.OPERATOR_TAG, value: ncNameMatch[0] };
	    }
	    else {
		throw Components.Exception("XPointer Syntax Error: Required and|or|mod|div operator " +
				"and got: " + ncNameMatch[0]);
	    }
	}

	/* If the character following an NCName 
	   (possibly after intervening ExprWhitespace) is (, 
	   then the token must be recognized as a NodeType 
	   or a FunctionName. */	 
	var parenMatch = this.xp.match(/^\s*\(/);
	if (parenMatch) {
	    // we have a FunctionName or NodeType
	    // NodeType testing
	    if (ncNameMatch[0].
		  match(/^(comment|text|processing\-instruction|node|point|range)$/)) {
		Logger.log(Logger.XPOINTER_LEXER, "nodetype");
		return { tag: XPointerLexer.NODETYPE_TAG, value: ncNameMatch[0] };
	    }
	    // else FunctionName
	    else {
		Logger.log(Logger.XPOINTER_LEXER, "functionname");
		return { tag: XPointerLexer.FUNCTIONNAME_TAG, value: ncNameMatch[0] };
	    }
	}

	/* If the two characters following an NCName 
	   (possibly after intervening ExprWhitespace) 
	   are ::, then the token must be recognized as an AxisName. */
	var colonColonMatch = this.xp.match(/^\s*\:\:/);
	if (colonColonMatch) {
	    // we should have an AxisName -- check to be sure
	     // try to find an AxisName
	    if (ncNameMatch[0].
		  match(/^(ancestor|ancestor\-or\-self|attribute|child|descendant|descendant\-or\-self|following|following\-sibling|namespace|parent|preceding|preceding\-sibling|self)$/)) {
		return { tag: XPointerLexer.AXISNAME_TAG, value: ncNameMatch[0] };		
	    }
	    else {
		throw Components.Exception("XPointer Syntax Error: Required valid AxisName operator " +
				"before :: but instead got: " + ncNameMatch[0]);
	    }
	}

	// otherwise it's a NameTest (we already took care of * case above)
	var nameTestMatch = this.xp.match(/^(\:\*)|(\:[a-zA-Z_][a-zA-Z0-9_\-\.]*)/);
	if (nameTestMatch) {
	    this._removeChars(nameTestMatch[0].length);
	    return { tag: XPointerLexer.NAMETEST_TAG, value: ncNameMatch[0] + nameTestMatch[0] };
	}
	

	Logger.log(Logger.XPOINTER_LEXER, "Nametest found");
	// must be a non-namespace nametest
	return { tag: XPointerLexer.NAMETEST_TAG, value: ncNameMatch[0] };
	
    } // end if ncNameMatch

    /************
     * NUMBERS
     ************/
    var number = this.xp.match(/^(\.\d+)|(\d+(\.\d+?)?)/);
    if (number) {
	this._removeChars(number[0].length);
	return { tag: XPointerLexer.NUMBER_TAG,
			  value: (number[0] - 0) };
    }			      
    
    throw Components.Exception("XPointerLexer: unrecognized sequence of input: " + this.xp);
}


/**
 * Private function to get a character from
 * the xp string.
 *
 * @return character or null if doesn't exist
 */
XPointerLexer.prototype._getChar = function() {
    if ( this.xp && (this.xp.length > 0)) {
	var charToReturn = this.xp.charAt(0);
	this.xp = this.xp.substring(1);
	return charToReturn;
    }
    else return null;
}
    

/**
 * Private function to push a character
 * back onto xp.
 *
 * @param charToPushBack String of character to push back
 */
XPointerLexer.prototype._pushBackChar = function(charToPushBack) {
    if (charToPushBack && (charToPushBack != "")) {
	this.xp = charToPushBack + this.xp;
    }
}

/**
 * Private function to remove characters
 * from xp.
 *
 * @param num Number of characters to remove
 */
XPointerLexer.prototype._removeChars = function(num) {
    if (this.xp.length < num) {
	throw Components.Exception("XPointerLexer:_removeChars called with " + num + 
			" chars to remove, which is more than length==" + 
			this.xp.length);
    }
    
    this.xp = this.xp.substring(num);
}

/**
 * Private function to regenerate the state of the lexer.
 * Called by the parser, in an ugly and revolting hack.
 *
 * @param xp new XPointer string to use
 * @param peekBuffer new peek buffer to use
 */
XPointerLexer.prototype._regenerateLexerState = function(xp, peekBuffer) {
    this.xp = xp;
    this.peekBuffer = peekBuffer;
}

XPointerLexer.prototype._getXP = function() { return this.xp };

XPointerLexer.prototype._getPeek = function() { return this.peekBuffer; }




/*********************************
 * XPOINTER RESOLVER
 *********************************/

/**
 * javascript to parse
 * an XPointer created by
 * annozilla.
 * 
 */
function XPointerResolver() {
}

XPointerResolver.NODE_TYPE = 0;
XPointerResolver.RANGE_TYPE = 1;
XPointerResolver.LITERAL_TYPE = 2;
XPointerResolver.NUMBER_TYPE = 3;
XPointerResolver.BOOLEAN_TYPE = 4;

// XML whitespace characters
XPointerResolver.SPACE       = 0x20;
XPointerResolver.CARR_RETURN = 0x9;
XPointerResolver.LINE_FEED   = 0xD;
XPointerResolver.TAB         = 0xA;

// ways to collapse for boundary functions
XPointerResolver.COLLAPSE_TO_START = true;  // collapse a range to its start point
XPointerResolver.COLLAPSE_TO_END   = false; // collapse a range to its end point

// instance fields
XPointerResolver.prototype.lexer = undefined; // XPointerLexer
XPointerResolver.prototype.doc = undefined; // nsIDOMDocument
XPointerResolver.prototype.docIsRawHTML = undefined; // whether the document we're parsing is Raw HTML
XPointerResolver.prototype.xp = undefined;

/**
 * Resolve an XPointer reference.  Currently
 * resolves only the subset of XPointers that
 * Annozilla creates.  Approximates to an Element.
 *
 * @param xp String URI of XPointer to parse
 * @param doc DOM Document to find xp in
 * @return DOM Element approximating resolved xpointer
 */
XPointerResolver.prototype.resolveXPointerToElement = function (xp, doc)
{
    var node = this.resolveXPointerToRange(xp,doc).startContainer;

    while (node.nodeType != node.ELEMENT_NODE) {
	node = node.parentNode;
    }

    return node;
}

/*
 * Resolve an XPointer reference.  Currently
 * resolves only the subset of XPointers that
 * Annozilla creates.
 *
 * @param xp String URI including XPointer to parse
 * @param doc DOM Document to find xp in
 * @return DOM Range enclosing resolved xpointer
 */
XPointerResolver.prototype.resolveXPointerToRange = function (xp, doc)
{
     // store the original xp
    this.xp = xp;

    // store content doc
    this.doc = doc;

    // see if the document is rawHTML
    this.docIsRawHTML = isDocumentRawHTML(this.doc);

    // get the lexer
    this.lexer = new XPointerLexer(xp);

    // process the XPointer
    var rangeArray = this.parseXPointers();

    var len=rangeArray.length;
//    dump('resolveXPointerToRange: len='+len+'\n'); 

    // if we got a node, package it in a range
    if (rangeArray[0].type == XPointerResolver.NODE_TYPE) {
	var newRange = this.doc.createRange();
	// range doesn't work correctly if you try to select
	// whole document
	if (rangeArray[0].location == doc) {
//            dump("resolveXPointerToRange: entire document\n");
	    newRange.selectNode(doc.documentElement);
	}
	// normal case
	else {
/*
            dump("resolveXPointerToRange "
                 +xp+"\n  (normal case) location of:" // +rangeArray[0]+"=="
                 +rangeArray[0].location+"\n");
*/
	    newRange.selectNode(rangeArray[0].location);
/*
            dump("  range: "
                 +newRange.startContainer+"+"+newRange.startOffset
                 +"\n   .."+newRange.endContainer+"+"+newRange.endOffset+"\n");
            dump("  toString: "+newRange.toString()+"\n\n");
*/
	}
	return newRange;
    }
    else {
//	dump("resolveXPointerToRange: not a node\n"
//             +" returning location of: "+rangeArray[0]
//             +"=="+rangeArray[0].location+"\n");
	return rangeArray[0].location;
    }
}

// call when token seen
XPointerResolver.prototype.parseXPointers = function() {
    
    Logger.log(Logger.XPOINTER_RESOLVER, "in parseXPointers\n");

    // start with root element context
    var context = [ this.createContext(XPointerResolver.NODE_TYPE, this.doc) ];

    // get first token
    var token = this.safeGetToken();
    
    // if there are no tokens, this is an error
    if (! token) {
	throw Components.Exception("XPointer Sub-Resource Error: Empty String is not an XPointer");
    }
    
    Logger.log(Logger.XPOINTER_RESOLVER, "about switch on token.tag");
    switch(token.tag) {
	
	// bare names ID 
	case XPointerLexer.NAMETEST_TAG:
	Logger.log(Logger.XPOINTER_RESOLVER, "Nametest case");
	context = this.parseBareNames(token, context);
	break;
	    
	// child sequence -- operator must be '/'
	case XPointerLexer.OPERATOR_TAG:
	if (token.value != "/") {
	    throw Components.Exception("XPointer Syntax Error: XPointer cannot begin with " +
			    token.value);
	}
	context = this.parseChildSequence(token, context);
	break;
	
	// schemes, we only understand xpointer
	case XPointerLexer.FUNCTIONNAME_TAG:
	context = this.parseFullXPointer(token, context);
	break;
	
	default:
	throw Components.Exception("XPointer Syntax Error: XPointer cannot begin with " +
			token.value);
    }
    
    // safe get the next token to ensure there's no garbage afterward
    token = this.safeGetToken();
    if (token) {
	throw Components.Exception("XPointer Syntax Error: garbage after legal xpointer: " + token.value);
    }
    

    // if we found nothing, it is an error
    if (context.length == 0) {
	//throw Components.Exception("XPointer Sub-Resource Error: All xpointers provided evaluate to the empty set");
        dump("XPointer Sub-Resource Warning: All xpointers provided evaluate to the empty set in context of "+ this.xp); 
    }
    else {
	return context;
    }
} // end parseXPointers

/**
 * Parses the schemes that we understand.
 *
 * @param token scheme token of tag type function
 * @param context incoming context
 */
XPointerResolver.prototype.parseFullXPointer = function(token, context) {
    var success = false;  // success records whether an xpointer has successfully resolved yet

    while(token) {
	var testContext; // context from this particular xpointer

	// unknown scheme
	if (! token.value.match(/^xpointer/) ) {
	    Logger.log(Logger.XPOINTER_RESOLVER, "Unknown scheme: " + token.value + " encountered.  Ignoring.");
	    // consume the other PointerPart
	    this.lexer.skipUnknownScheme();
	}
	// XPointer scheme (what we all showed up for tonight anyhow)
	else {
	    token = this.getToken();
	    if (token.value != "(") {
		throw Components.Exception("XPointer Syntax Error: xpointer must be have  opening paren '(' -- got: " + token.value);
	    }
	    
	    // and the actual xpointer
	    token = this.getToken();
	    testContext = this.parseXPtrExpr(token, context);

	    // and the trailing paren
	    token = this.getToken();
	    if (token.value != ")") {
		throw Components.Exception("XPointer Syntax Error: xpointer must be followed by closing paren ')' -- got: " + token.value);
	    }
	    
	    // if we resolved a context, save it and record that we actually resolved something
	    if (testContext.length > 0 && (testContext[0].type == XPointerResolver.NODE_TYPE || testContext[0].type == XPointerResolver.RANGE_TYPE)) {
		context = testContext;
		success = true;
	    }
	} // end xpointer
	    
	// get the next token with safeGetToken
	token = this.safeGetToken();	
    } // end while loop over tokens
    
    // if we succeeded, context is correct
    if (success) {
	return context;
    }
    // otherwise, our context becomes the empty set
    else {
	return [];
    }
}

/**
 * Parses an XPointer Expr.
 * FIRST set --
 *  a minus signifies the production
 *   UnaryExpr ::= '-' UnaryExpr
 *  otherwise, we can cruise on down 
 * to LocationPath, which is Relative or Absolute.
 * a'/', it is
 *  AbsoluteLocationPath ::= '/' RelativeLocationPath?
 * a '//' it is AbbreviatedAbsoluteLocationPath ::= '//' RelativeLocationPath
 * a Step -- 
 *
 * @param token the first token
 * @param context the context
 */
XPointerResolver.prototype.parseXPtrExpr = function(token, context) {
    // switch on the token tag
    switch(token.tag) {
	
    case XPointerLexer.OPERATOR_TAG:
	// UnaryExpr ::= '-' UnaryExpr
	switch(token.value) {
	case '-':
	    return this.parseUnaryExpr(token, context);
	// PathExpr ::= LocationPath
	case '/':
	case '//':
	    return this.parseAbsoluteLocationPath(token, context);
	default:
	    throw Components.Exception("XPointer Syntax Error: " + token.value + " does not begin a valid XPointer Expression");
	}

    case XPointerLexer.FENCE_TAG:
	// PrimaryExpr ::= '(' Expr ')'
	if(token.value != '(') { 
	    throw Components.Exception("XPointer Syntax Error: " + token.value + " does not begin a valid XPointer Expression");
	}
	// PathExpr ::= FilterExpr 
	//           |  FilterExpr '/' RelativeLocationPath
	//           |  FilterExpr '/' RelativeLocationPath
	
	// get xpointer first token
	token = this.getToken();
	context = this.parseXPtrExpr(token, context);

	// ensure final paren
	token = this.getToken();
	if (token.value != ')') {
	    throw Components.Exception("XPointer Syntax Error: Expected closing parenthesis after expression.  Got: " + token.value);
	}	
	break;

    case XPointerLexer.LITERAL_TAG:
	context = this.parseLiteral(token, context);
	break;

    case XPointerLexer.NUMBER_TAG:
	context = [ this.createContext(XPointerResolver.NUMBER_TYPE, token.value) ];
	break;

    case XPointerLexer.FUNCTIONNAME_TAG:
    if(token.value == 'range-to') {
	return this.parseRelativeLocationPath(token, context);
    }
    else {
	context =  this.parseFunctionCall(token, context);
    }
    break;
	
    case XPointerLexer.AXISNAME_TAG:
	context =  this.parseRelativeLocationPath(token, context);
	break;

    case XPointerLexer.AT_TAG:
	context =  this.parseRelativeLocationPath(token, context);
	break;

    case XPointerLexer.DOT_TAG:
	context =  this.parseRelativeLocationPath(token, context);
	break;

    case XPointerLexer.DOT_DOT_TAG:
	context =  this.parseRelativeLocationPath(token, context);
	break;

    case XPointerLexer.NODETYPE_TAG:
	context =  this.parseRelativeLocationPath(token, context);
	break;

    case XPointerLexer.NAMETEST_TAG:
	context =  this.parseRelativeLocationPath(token, context);
	break;

    default:
	throw Components.Exception("XPointer Syntax Error: " + token.value + " does not begin a valid XPointer Expression");
    }

    // now, test for following context
    var peek = this.peekToken();

    // PathExpr ::= FilterExpr '/' RelativeLocationPath
    if (peek.value == '/') {
	// get the / token
	this.getToken();

	// get the beginning of the RelativeLocationPath
	token = this.getToken();

	return this.parseRelativeLocationPath(token, context);
    }
    // PathExpr ::= FilterExpr '//' RelativeLocationPath
    else if (peek.value == '//') {
	throw Components.Exception("Sorry, // is not yet implemented.",
				   Components.results.NS_ERROR_NOT_IMPLEMENTED);
    }
    // PathExpr ::= FilterExpr 
    else {
	return context;
    }
}


XPointerResolver.prototype.parseLiteral = function(token, context) {
    if (token.tag == XPointerLexer.LITERAL_TAG) {
	return [ this.createContext(XPointerResolver.LITERAL_TYPE, token.value) ];
    }
    else { 
	throw Components.Exception("XPointer Syntax Error: Expected string literal, got: " + token.value);
    }
}

XPointerResolver.prototype.parseUnaryExpr = function(token, context) {
    throw Components.Exception("XPointerResolver: UnaryExpr not yet implemented. Sorry!",
				   Components.results.NS_ERROR_NOT_IMPLEMENTED);
}

XPointerResolver.tokenBeginsStep = function(token) {
    // test for tag types
	switch(token.tag) {
	case XPointerLexer.DOT_TAG:
	    // falls through
	case XPointerLexer.DOT_DOT_TAG:
	    // falls through
	case XPointerLexer.AXISNAME_TAG:
	    // falls through
	case XPointerLexer.AT_TAG:
	    // falls through
	case XPointerLexer.NODETYPE_TAG:
	    // falls through
	case XPointerLexer.NAMETEST_TAG:
	return true;
	    
	case XPointerLexer.FUNCTIONNAME_TAG:
	return (token.value == 'range-to');
	default:
	return false;
	} 
}
	

XPointerResolver.prototype.parseAbsoluteLocationPath = function(token, context) {
    switch(token.value) {

	case "//":
	throw Components.Exception("XPointerResolver: // is not yet implemented.  Sorry!",
				   Components.results.NS_ERROR_NOT_IMPLEMENTED);


	// AbsoluteLocationPath ::= '/' RelativeLocationPath?
	case "/":
	context = [ this.createContext(XPointerResolver.NODE_TYPE, this.doc) ];
	
	// peek the next token to see if followed by Relative Location Path (de facto--a Step)
	var peek = this.peekToken();
	if (XPointerResolver.tokenBeginsStep(peek)) {
	    // consume the token
	    token = this.getToken();
	    
	    // do the relative location path
	    return this.parseRelativeLocationPath(token, context);
	}
	else {
	    return context;
	}
	
	// should not happen
	default:
	throw Components.Exception("XPointer Syntax Error: " + token.value + " does not begin a valid AbsoluteLocationPath");
    }
} 

XPointerResolver.prototype.parseRelativeLocationPath = function(token, context) {
    
    while(true) {

	switch (token.tag) {
	    // AbbreviatedStep ::= .
	    case XPointerLexer.DOT_TAG:
	    if ((context.length != 1) || (context[0].type != XPointerResolver.NODE_TYPE)) {	    
		Logger.log(Logger.XPOINTER_RESOLVER, "parseRelativeLocationPath: . called incorrectly. returning empty set");
		context = [];		
	    }
	    break;

	    // AbbreviatedStep ::= ..
	    case XPointerLexer.DOT_DOT_TAG:
	    if ((context.length == 1) && (context[0].type == XPointerResolver.NODE_TYPE) && (context[0].location != this.doc)) {
		context = [ this.createContext(XPointerResolver.NODE_TYPE, context[0].location.parentNode) ];
	    }
	    else {
		Logger.log(Logger.XPOINTER_RESOLVER, "parseRelativeLocationPath: .. called incorrectly. returning empty set");
		context = [];
	    }
	    break;

	    case XPointerLexer.AXISNAME_TAG:
	    context = this.parseAxisTypeStep(token, context);
	    break;
	    
	    case XPointerLexer.AT_TAG:
	    context = this.parseAxisTypeStep(token, context);
	    break;
	    
	    case XPointerLexer.NODETYPE_TAG:
	    context = this.parseAxisTypeStep(token, context);
	    break;
	    
	    case XPointerLexer.NAMETEST_TAG:
	    context = this.parseAxisTypeStep(token, context);
	    break;
	    
	    case XPointerLexer.FUNCTIONNAME_TAG:
	    if (token.value == 'range-to') {
		Logger.log(Logger.XPOINTER_RESOLVER, "about to call parseRangeTo from parseRelativeLocationPath");
		context = this.parseRangeTo(token, context);
	    }
	    else {
		throw Components.Exception("XPointer Syntax Error: the function " + token.value + " cannot be called " +
				"from within an RelativeLocationPath");
	    }
	    break;
	    
	    default:
	    throw Components.Exception("XPointer Syntax Error: a valid RelativeLocationPath cannot begin with " + token.value);
	} // end switch on token.tag

	// if the next token is a slash, keep it up
	var peek = this.peekToken();
	if (peek.value == "/") {
	    // get the peeked token
	    this.getToken();
	    
	    // get the next token and continue
	    token = this.getToken();
	}
	// we don't do // yet
	else if (peek.value == "//") {
	    throw Components.Exception("XPointerResolver: // is not yet implemented.  Sorry!",
				   Components.results.NS_ERROR_NOT_IMPLEMENTED);
	}
	// otherwise, we're finished
	else {
	    return context;
	}
    }  // end while(true)
    return 0; // never happens, but avoids a warning
} // end parseRelativeLocationPath

// Step ::= AxisSpecifier NodeTest Predicate*
XPointerResolver.prototype.parseAxisTypeStep = function(token, context) {
        
    // AxisSpecifier ::= AxisName '::' 
    //                 | '@'? 
    switch(token.tag) {
	case XPointerLexer.AXISNAME_TAG:
	// eventually this will move on to next token
	throw Components.Exception("Sorry, AxisName tests like " + token.value + " are not implemented yet.",
				   Components.results.NS_ERROR_NOT_IMPLEMENTED);

	case XPointerLexer.AT_TAG:
	// eventually this will move on to next token
	throw Components.Exception("Sorry, Attribute selection with the @ abbreviation is not yet implemented.",
				   Components.results.NS_ERROR_NOT_IMPLEMENTED);
	// since epsilon is a valid string, do nothing for default case
	default:
	break;
    }

    // NodeTest ::= NameTest
    //           |  NodeType '(' ')'
    //           | 'processing-instruction' '(' Literal ')'
    switch(token.tag) {
	case XPointerLexer.NODETYPE_TAG:
	throw Components.Exception("Sorry, Nodetype selection with the " + token.value + " operation is not yet implemented.",
				   Components.results.NS_ERROR_NOT_IMPLEMENTED);
	
	case XPointerLexer.NAMETEST_TAG:
        // do this in parsePredicates if we can't do it faster with nthChildTag
        //  context = this.parseNameTest(token, context);
	break;

	default:
	throw Components.Exception("XPointer Syntax Error: Expected a NodeType or NameTest, got: " + token.value);
    }

    //    return this.parsePredicates(null, context);    
    // pass tag token so that we can find the node there
    return this.parsePredicates(token, context); 
}
	
/**
 * Parses a boundary function.
 */
XPointerResolver.prototype.parseBoundaryFunction = function(token, context, wayToCollapse) {
    
    var returnContext = [];

    Logger.log(Logger.XPOINTER_RESOLVER, "parseBoundaryFunction: way: " + wayToCollapse);

    // grab the first token
    token = this.getToken();

    // process the internal expression
    context = this.parseXPtrExpr(token, context);

    for (var i = 0; i < context.length; i++) {
	if (context[i].type == XPointerResolver.NODE_TYPE) {
	    Logger.log(Logger.XPOINTER_RESOLVER, "parseBoundaryFunction: found a node");
	    var newRange = this.doc.createRange();
	    newRange.selectNode(context[i].location);
	    returnContext.push(this.createContext(XPointerResolver.RANGE_TYPE,
						  newRange));
	}
	else if (context[i].type == XPointerResolver.RANGE_TYPE) {
	    Logger.log(Logger.XPOINTER_RESOLVER, "parseBoundaryFunction: found a range:" + context[i].location.toString());
	    returnContext.push(context[i]);
	}
	else {
	    throw Components.Exception("XPointer Sub-Resource Error: boundary functions start-point " +
			    "and end-point must take as input either a range or a node.");
	}
	
	returnContext[i].location.collapse(wayToCollapse);
    }

    return returnContext;
}

/**
 * Previously: Called with null token, since it doesn't use token.
 * Modified to take tag token, so that we can speed things up
 *   by deferring child search (parseNameTest) from parseAxisTypeStep
 */
XPointerResolver.prototype.parsePredicates = function(token, context) { 
    
    var tagToken = token; //new arg for deferred child search

    // now, possible predicates
    // Predicate ::= '[' Expr ']'
    var peek = this.peekToken();
    while (peek.value == '[') {
	// consume the [
	this.getToken();

	// get the next token
	token = this.getToken();

	// parse the expression
	var predResult = this.parseXPtrExpr(token, context);
    
	if (predResult.length > 0) {
	    switch(predResult[0].type) {

		// if we get back a non-empty set of Nodes, no worries
	    case XPointerResolver.NODE_TYPE:
		context = predResult;
		break;
		
		// ranges don't make sense, become false for all
	    case XPointerResolver.RANGE_TYPE:
		context = [];
		break;

		// string literals are true if length is non-zero
	    case XPointerResolver.LITERAL_TYPE:
		if (predResult[0].location.length == 0) {
		    context = [];
		}		    
		break;
	    case XPointerResolver.BOOLEAN_TYPE:
		if (! predResult[0].location) {
		    context = [];
		}
		break;
	    case XPointerResolver.NUMBER_TYPE:
		var newContext = [];
                if (predResult.length == 1) {
                    // most of the time we just need a single child (*1 based*)
                    var hit = this.nthChildTag(tagToken.value, context,
                                                 predResult[0].location);
                    if (hit) {
                        newContext.push( 
                           this.createContext(XPointerResolver.NODE_TYPE, hit) ); 
                    } 

                } else {
                    dump("[parsePredicate: general case]\n");
                    // in the worst case, we have to deal with multiple contexts
                    // so better get all the children together after all
                    context = this.parseNameTest(tagToken, context);
                    
                    for (var i = 0; i < predResult.length; i++) {
                        // numbering begins with 1 in XPointer, yuck
                        // if the number is a valid index
                        if ((predResult[i].location >= 1) 
                            && (predResult[i].location <= context.length)) {
                            // add the context with that index to our new set
                            newContext.push(context[predResult[i].location - 1]);
                        }
                        else {
                            Logger.log(Logger.XPOINTER_RESOLVER, "There are not " + predResult[i].location + "children in the context node.");
                        }
                    }
                    
                }

		context = newContext;
		break;
	
		default:
		throw Components.Exception("Unconsidered type in parsePredicates: " + predResult[0].type);
	    } // end switch
	} // end if there exist predResult
	// if no results (empty set), context becomes false
	else {
	    context = [];
	}
	   
	// next token must be a close bracket
	token = this.getToken();
	if (token.value != "]") {
	    throw Components.Exception("XPointer Syntax Error: Predicate must be closed with a right bracket.  Got: " + token.value);
	}	

	// peek the next token
	peek = this.peekToken();
    } // end while loop	  
    
    return context;	
}

XPointerResolver.prototype.parseFunctionCall = function(token, context) {
    // get the opening paren
    var paren = this.getToken();
    if (paren.value != '(') {
	throw Components.Exception("XPointer Syntax Error: A call to the function " + token.value + 
			" must have an opening parenthesis.  Got: " + paren.value);
    }
    
    switch(token.value) {
	case "id":
	context = this.parseIdFunction(null, context);
	break;
	case "string-range":
	context = this.parseStringRangeFunction(null, context);
	break;
        case "start-point":
	context = this.parseBoundaryFunction(null, context, XPointerResolver.COLLAPSE_TO_START);
	break;
        case "end-point":
	Logger.log(Logger.XPOINTER_RESOLVER, "end-point seen, about to call parseBoundaryFunction");
	context = this.parseBoundaryFunction(null, context, XPointerResolver.COLLAPSE_TO_END);
	break;
	default:
	throw Components.Exception("Sorry, the function " + token.value + " is not yet implemented!",
				   Components.results.NS_ERROR_NOT_IMPLEMENTED);
    }

    // get the closing paren
    paren = this.getToken();
    if (paren.value != ')') {
	throw Components.Exception("XPointer Syntax Error: A call to the function " + token.value + 
			" must have a closing parenthesis.  Got: " + paren.value);
    }
    
    return context;
}   

XPointerResolver.prototype.parseIdFunction = function(token, context) {
    Logger.log(Logger.XPOINTER_RESOLVER, "parseIDFunction running");
    // get the id
    var id = this.getToken();
    if (id.tag != XPointerLexer.LITERAL_TAG) {
	throw Components.Exception("XPointer Syntax Error: argument to id function must be a \"-delimeted String.  Got: " + id.value);
    }

    var element = this.doc.getElementById(id.value);
    if (element) {
	return [ this.createContext(XPointerResolver.NODE_TYPE, element) ];
    }
    else {
	Logger.log(Logger.XPOINTER_RESOLVER, "Couldn't locate element with id: " + id.value);
	return [];
    }
}


XPointerResolver.prototype.parseNameTest = function(token, context) {

    var newContext = [];

    // try to find the name in all contexts
    for (var i = 0; i < context.length; i++) {
	// ensure we're looking at a node
	if (context[i].type == XPointerResolver.NODE_TYPE) {
	    // get the children that have the token.value tagname
	    var hits = this.getChildrenByTagName(context[i].location, token.value);
	    // add all hits to the newContext
	    for (var j = 0; j < hits.length; j++) {
		newContext.push( this.createContext(XPointerResolver.NODE_TYPE, hits[j]) );
	    } 
	}
    }
    
    if (newContext.length == 0) {
	Logger.log(Logger.XPOINTER_RESOLVER, "NameTest for nodeName " + token.value + " found 0 nodes.");
    }

    return newContext;
}

/*
 * Mashup of parseNameTest and getChildrenByTagName 
 * Returns the seekNth (1 based) child node (if found)
 * If called with a negative N 
 *  (recursively, to splice in children of marked nodes) 
 *   return the found child OR the number of such children seen 
 *    (which variant needs to be detected, sorry for the hack)
 *  
 * Otherwise, ought to throw, but just return a number
 * 
 * getChildrenByTagName should splice as well
 */

XPointerResolver.prototype.nthChildTag = function(tagName, context, seekN) {
    var seenChild = 0;
    tagName = convertTagName(tagName, this.docIsRawHTML);

    var reentry = false;
    if (seekN < 0) {
        reentry = true;
        seekN *= -1;
    }

    // try to find the name in all contexts
    for (var i = 0; i < context.length; i++) {

	// ensure we're looking at a node
	if (context[i].type == XPointerResolver.NODE_TYPE) {

            // getChild...ByTagName
            var parent = context[i].location;
            for (var i = 0; i < parent.childNodes.length; i++) {

                var child = parent.childNodes.item(i);
                if (isMarkedIgnore(child)) {
                    var subcontext 
                        = [this.createContext(XPointerResolver.NODE_TYPE, child)];
                    var subresult
                        = this.nthChildTag(tagName, subcontext,
                                           -1 * (seekN - seenChild));
                    if (typeof subresult == 'object') {
                        return subresult; //it's is an object
                    } else {
                        seenChild += subresult; //it's a count!
                    }
                } 
                else
                if ( (child.nodeType == child.ELEMENT_NODE)
                     && (! isMarkedIgnore(child)) 
                     && (convertTagName(child.tagName, this.docIsRawHTML) 
                         == tagName) 
                     ) {
                    seenChild++;
                    if (seenChild == seekN) {
                        return child;
                    }
                }
            }
        }}

    if (!reentry) {
        Logger.log(Logger.XPOINTER_RESOLVER, 
                   "Can't find "+tagName+" child #"+seekN);
        dump("Can't find "+tagName+" child #"+seekN+"\n\n");
    }
    //return 0;
    return seenChild;
}


XPointerResolver.prototype.parseRangeTo = function(token, context) {

    Logger.log(Logger.XPOINTER_RESOLVER, "parseRangeTo running for token: " + token.value);

    /* if there is no context, short-circuit and consume the function,
       because range-to makes no sense without an incoming context */
    if (context.length == 0) {
	this.consumeFunction();
	return context;
    }

    // next token must be '('
    token = this.getToken();
    if (token.value != '(') {
	throw Components.Exception("XPointer Syntax Error: range-to Step must begin with opening parenthesis.  Got: " + token.value);
    }
    
    /* returnContext is an array of ranges representing the context that
       parseRangeTo was called from.  The context location-set is all
       transformed into range types, and the beginning node is set.
    */
    var returnContext = []; 
    for (var i = 0; i < context.length; i++) {
	returnContext.push(this.createContext(XPointerResolver.RANGE_TYPE, this.doc.createRange()));
	switch(context[i].type) {
	case XPointerResolver.NODE_TYPE: 
	    returnContext[i].location.selectNode(context[i].location);
	    break;
	case XPointerResolver.RANGE_TYPE:
	    returnContext[i].location.setStart(context[i].location.startContainer,
					       context[i].location.startOffset);
	    break;
	default:
	    throw Components.Exception("range-to is currently only supported where the context is a Node or Range");
	}
    }

    
    /* we need to evaluate the xptr expression for each location
       in the location set context.  so, we're going to have
       to regenerate the xp string in the lexer each time. this is NASTY.
       sorry... */

    var xp = this.lexer._getXP();
    var peek = this.lexer._getPeek();
    // get first token 
    token = this.getToken();

    // otherwise, process each context
    for (var i = 0; i < context.length; i++) {	
	// if we need to regenerate the lexer state
	if (i > 0) {
	    Logger.log(Logger.XPOINTER_RESOLVER, "*** regenerating lexer state!!!! ***");
	    this.lexer._regenerateLexerState(xp, peek);
	}	
	
	Logger.log(Logger.XPOINTER_RESOLVER, "about to parse the num. " + i + " range-to expr starting with token " + token.value);
	// parse the xptr
	var newLocation = this.parseXPtrExpr(token, context[i]);
	Logger.log(Logger.XPOINTER_RESOLVER, "finished parsing the num. " + i + " range-to expr");
	
	switch(newLocation.length) {
	// if we found nothing, collapse the range 
	case 0:
	    returnContext[i].location.setEnd(returnContext[i].location.startContainer,
					     returnContext[i].location.startOffset);
	    break;
	// if we found one thing
	case 1:
	    if (newLocation[0].type == XPointerResolver.NODE_TYPE) {
		// if we have the root node, get the document element instead
		// since selectNode doesn't work on the root
		if (newLocation[0].location == this.doc) {
		    newLocation[0] = this.createContext(XPointerResolver.NODE_TYPE, this.doc.documentElement);
		}
		var aRange = this.doc.createRange();
		aRange.selectNode(newLocation[0].location);
		
		try {
		    returnContext[i].location.setEnd(aRange.endContainer,
						     aRange.endOffset);
		}
		catch(e) {
		    // this error means the proposed end was actually *before* the start
		    Logger.log(Logger.XPOINTER_RESOLVER, "Error trying to set range in NODE_TYPE: " + e.toString());
		    // for error state, collapse the range
		    returnContext[i].location.setEnd(returnContext[i].location.startContainer,
						     returnContext[i].location.startOffset);
		}
	    }
	    else if (newLocation[0].type == XPointerResolver.RANGE_TYPE) {
		try {
		    returnContext[i].location.setEnd(newLocation[0].location.endContainer,
						     newLocation[0].location.endOffset);
		}
		catch (e) {
		     // this error means the proposed end was actually *before* the start
		    Logger.log(Logger.XPOINTER_RESOLVER, "Error trying to set range in RANGE_TYPE: " + e.toString());
		    // for error state, collapse the range
		    returnContext[i].location.setEnd(returnContext[i].location.startContainer,
						     returnContext[i].location.startOffset);
		}
	    }
	    else {
		throw Components.Exception("rangeTo Step is only implemented for Nodes and Ranges",
				   Components.results.NS_ERROR_NOT_IMPLEMENTED);
	    }
	    break;
	default:
	    throw Components.Exception("range-to Step is only implemented for xpointers returning location, not location-set",
				   Components.results.NS_ERROR_NOT_IMPLEMENTED);
	} // end switch on length of parsed xpointer
    } // end loop over all incoming contexts

    // get the closing paren
    token = this.getToken();
    if (token.value != ')') {
	throw Components.Exception("XPointer Syntax Error: rangeTo function must have a closing parenthesis.  Got: " + token.value);
    }

    return returnContext;
}

XPointerResolver.prototype.parseStringRangeFunction = function(token, context) {
    
    // first token
    token = this.getToken();    
    
    // first argument
    var firstArgContext = this.parseXPtrExpr(token, context);

    // ensure comma
    var comma = this.getToken();
    if (comma.tag != XPointerLexer.COMMA_TAG) {
	throw Components.Exception("XPointer Syntax Error: first argument in string-range must be followed by comma. Got: " + comma.value);
    }

    // get literal
    var literal = this.getToken();
    if (literal.tag != XPointerLexer.LITERAL_TAG) {
	throw Components.Exception("XPointer Syntax Error: second argument in string-range must be a string.  got: " + literal.value);
    }
    if (literal.value != "") {
	throw Components.Exception("Sorry, we only support \"\" as the second arg to string-range.  It'll get more robust soon!");
    }
    literal = literal.value;

    // XXX need to add support for three and four arg string-range
    // XXX this will require peeking here and branching to different behaviors
    comma = this.getToken();
    if (comma.value == ')') {
	throw Components.Exception("Sorry, XPointerResolver currently only supports the four-arg version of string-range.");
    }
    if (comma.tag != XPointerLexer.COMMA_TAG) {
	throw Components.Exception("XPointer Syntax Error: Expected a comma or a right-paren after second arg " +
			"in string-range.  Got: " + comma.value);
    }

    // third argument -- start input
    var startInput = this.getToken();
    if (startInput.tag != XPointerLexer.NUMBER_TAG) {
	throw Components.Exception("XPointer Syntax Error: third argument in string-range must be a number.  got: " + startInput.value);
    }
    startInput = startInput.value;

    // comma after third arg
    comma = this.getToken();
    if (comma.value == ')') {
	throw Components.Exception("Sorry, XPointerResolver currently only supports the four-arg version of string-range.");
    }
    if (comma.tag != XPointerLexer.COMMA_TAG) {
	throw Components.Exception("XPointer Syntax Error: Expected a comma or a right-paren after third arg " +
			"in string-range.  Got: " + comma.value);
    }

    // fourth argument -- lengthInput
    var lengthInput = this.getToken();
    if (lengthInput.tag != XPointerLexer.NUMBER_TAG) {
	throw Components.Exception("XPointer Syntax Error: third argument in string-range must be a number.  got: " + lengthInput.value);
    }
    lengthInput = lengthInput.value;

    // DO THE EVALUTATION
    var returnContext = [];

    for (var i = 0; i < firstArgContext.length; i++) {
        //try {

	/****************
	 * LOOP LOCAL VARS
	 ****************/
	var lastCharWasWhitespace = false;  // whether the last char was whitespace
	var xptrStringIndex = 1;  // our location in the XPointer version of the string
	var charValue;             // Unicode value for the current DOM Node char
	var nts;         // multiple node toString-er
	var range = this.doc.createRange();

	// ensure that the first-arg location is a node
	if (firstArgContext[i].type != XPointerResolver.NODE_TYPE) {
	    throw Components.Exception("The first argument to string-range must select a node " +
			    "for this initial version of the resolver.");
	}

	// make our node to-Stringer
	nts = new NodeToString(this.doc, firstArgContext[i].location);

	/* Now, we must convert from the XPointer string representation to 
	   the DOM representation.  Namely, we must accommodate for extra whitespace
	   in the DOM representation.  Opening whitespace in the DOM is ignored in
	   XPointer.  All other runs of whitespace in the DOM are condensed to one
	   character in XPointer */

	/******************************
	 * COMPENSATE FOR OPENING
	 * WHITESPACE IN THE DOM STRING
	 ******************************/
	try {
	    charValue = nts.get_next_char();
	}
	catch (e) {
	    throw Components.Exception("XPointer Sub-Resource Error: defined start=" + startInput +
			    " and length=" + lengthInput + " exceed the length " +
			    " of the context of the first parameter for string-range (looking at first char).");
	}
	    
	/* loop over and count all introductory whitespace, which XPointer
	   ignores but is included in the DOM Node */
        if ((startInput==1) && (lengthInput==1)) {
            //charValue is it! don't go trying to eat any more whitespace
        } else {
            while (XPointerResolver.isWhiteSpace(charValue)) {
                try {
                    // get the next char to test
                    charValue = nts.get_next_char();	
                }
                catch (e) {
                    throw Components.Exception("XPointer Sub-Resource Error: defined start=" + startInput +
                                               " and length=" + lengthInput + " exceed the length " +
                                               " of the context of the first parameter for string-range (looking for whitespace).");
                }
            }
        }
	// loop until we get to the string-range acknowledged start character
	Logger.log(Logger.XPOINTER_RESOLVER, "searching for start position (xptr coords): " + startInput);
	while(xptrStringIndex < startInput) {
	    try {
		charValue = nts.get_next_char();
	    }
	    catch (e) {
		throw Components.Exception("XPointer Sub-Resource Error: defined start=" + startInput +
				" and length=" + lengthInput + " exceed the length " +
				" of the context of the first parameter for string-range (looking for start).");
                
	    }
	    // if current char is whitespace
	    if (XPointerResolver.isWhiteSpace(charValue)) {
		/* if the last char was not whitespace, count this character. */
		if (!(lastCharWasWhitespace)) {
		    lastCharWasWhitespace = true;
		    xptrStringIndex += 1;
		}
	    }
	    /* else if current char is NOT whitespace, record this fact and 
	       advance our position in the xptr string */
	    else {
		lastCharWasWhitespace = false;
		xptrStringIndex += 1;
	    }	    
	} // end while loop
        
    
        // at this point, we have the text node and the last character.  set
	// start point
	range.setStart(nts.get_current_text_node(),
		       nts.get_last_char_index());

	// since we've already counted begin char, make
	// xptrCharsCounted = 1
	var xptrCharsCounted = 1;

	// loop until we count the requested length
	while(xptrCharsCounted < lengthInput) {	    
	    
	    try {
		charValue = nts.get_next_char();
	    }
	    catch (e) {
		throw Components.Exception("XPointer Sub-Resource Error: defined start=" + startInput +
				" and *length=" + lengthInput + " exceed the length " +
				" of the context of the first parameter for string-range.");
	    }
	    // if current char is whitespace
	    if (XPointerResolver.isWhiteSpace(charValue)) {
		/* if last char was not whitespace,
		   set lastCharWasWhitespace to true, and advance the 
		   xptr string posn since this is an actual counted white space */
		if (!(lastCharWasWhitespace)) {	
		    lastCharWasWhitespace = true;
		    xptrCharsCounted += 1;
		}
	    }
	    /* else if current char is NOT whitespace, record this fact and 
	       advance our position in the xptr string */
	    else {
		lastCharWasWhitespace = false;
		xptrCharsCounted += 1;
	    }	    
	} // end while loop

	// add one to end offset because range offsets are exclusive
	range.setEnd(nts.get_current_text_node(),
		     nts.get_last_char_index() + 1);

	// add the new range
	returnContext.push( this.createContext(XPointerResolver.RANGE_TYPE, range) );

        
        /*
      } catch (e) {
          Logger.log(Logger.XPOINTER_RESOLVER_2, "Forgiving "+e);
      }
        */
    } // end for loop
    
    return returnContext;
} // end parseStringRangeFunction
	
    

/**
 * Parses the bare names XPointer style.
 * 
 * @param token first token
 * @param context
 * @return resolved context
 */
XPointerResolver.prototype.parseBareNames = function(token, context) {
    
    var newContext;

    Logger.log(Logger.XPOINTER_RESOLVER, "in parseBareNames with token: " + token.value);

    // try to get this element in the document
    var element = this.doc.getElementById(token.value);

    // if we can't find an element, the new context is empty
    if (! element) {
	Logger.log(Logger.XPOINTER_RESOLVER, "parseBareNames: Couldn't find the element");
	newContext = [];
    }
    else {
	Logger.log(Logger.XPOINTER_RESOLVER, "parseBareNames: found the element");
	newContext = [ this.createContext(XPointerResolver.NODE_TYPE,
					  element) ];
    }

    // peek what follows
    var peek = this.safePeekToken();

    // if the peek value is a /, this is really a child sequence
    // short circuited by a beginning Name
    if (peek && (peek.value == "/")) {
	Logger.log(Logger.XPointerResolver, "About to get a peeked beginning of child sequence");
	// consume the token we peeked
	this.getToken();
	
	newContext = this.parseChildSequence(peek, newContext);
    }

    return newContext;
}

/**
 * Parses a child-sequence type XPointer.
 * Assumes that token has been verified to be
 * a slash.
 */
XPointerResolver.prototype.parseChildSequence = function(token, context) {
    
    while (true) {
	
	// get the number in token
	token = this.getToken();

	if ((token.tag != XPointerLexer.NUMBER_TAG) || (Math.floor(token.value) != token.value)) {
	    throw Components.Exception("XPointer Syntax Error: Child sequences require an integer " +
			    "to follow a forward slash. Got /" + token.value);
	}
	
	// if there is a context
	if (context.length > 0) {
	    var unmarkedChildren = this.getUnmarkedChildren(context[0].location);
	    
	    // if the child exists
	    if ( token.value <= unmarkedChildren.length ) {
		Logger.log(Logger.XPOINTER_RESOLVER, "parseBareNames: found the element " + unmarkedChildren[token.value - 1].nodeName);
		context = [ this.createContext(XPointerResolver.NODE_TYPE, 
					       unmarkedChildren[token.value - 1]) ];
	    }
	    // if the child doesn't exist, log it and set the context to empty
	    else {
		Logger.log(Logger.XPOINTER_RESOLVER, "parseChildSequence: In child sequence, node " + context[0].location.nodeName + " does not have " + token.value + " unmarked children.  This yields the empty set.");
		context = [];
	    }
	}

	// safe peek the next token to see if it's a /
	token = this.safePeekToken();
	if (! token || (token.value != "/")) {
	    return context;
	}

	// consume the / token
	token = this.getToken();
    } // while (true)
    return 0; // never happens, but avoids a warning
}

	        

/**
 * Consumes the tokens for a function.
 * Assumes that function name was just seen.
 * Requires first token to be an opening left paren. 
 */
XPointerResolver.prototype.consumeFunction = function() {
    var scope = 0;
    var token;

    // ensure that first token is a left paren
    token = this.peekToken();    
    if (token.value != "(") {
	throw Components.Exception("A function must begin with an opening left-paren.  Got: " +
			token.value);
    }

    // consume tokens until we're back out to 0-level scope
    do {
	token = this.getToken();
	
	switch (token.value) {
	case "(": 
	    scope += 1;
	    break;
	case ")":
	    scope -= 1;
	    break;
	default:
	    break;
	}
    } while(scope > 0);
}
   
    
		

/**
 * Gets a token from the lexer,
 * and if it is null (signifying the
 * end of availble input) throws an
 * error.
 *
 * @throws Error if no more tokens available
 * @return next token
 */
XPointerResolver.prototype.getToken = function() {

    var token = this.lexer.getToken();

    if (! token) {
	throw Components.Exception("XPointer Syntax Error: " + 
			this.xp + " ended prematurely and is thus invalid.");
    }

    return token;
}
    
 
/**
 * Peek a token from the lexer,
 * and if it is null (signifying the
 * end of availble input) throws an
 * error.
 *
 * @throws Error if no more tokens available
 * @return next token
 */
XPointerResolver.prototype.peekToken = function() {
    
    var token = this.lexer.peekToken();
    
    if (! token) {
	throw Components.Exception("XPointer Syntax Error: " + 
			this.xp + " ended prematurely and is thus invalid.");
    }
    
    return token;
}
    
/**
 * Peeks without throwing an error if there
 * are no more tokens.
 *
 * @return peeked token
 */
XPointerResolver.prototype.safePeekToken = function() {
    return this.lexer.peekToken();
}

/**
 * Gets a token without throwing an error
 * if there are no more tokens.
 *
 * @return next token or null if no more tokens
 */
XPointerResolver.prototype.safeGetToken = function() {
    return this.lexer.getToken();
}

/**
 * Creates an XPointer context.
 *
 * @param aType either XPointerResolver.NODE_TYPE or XPointerResolver.RANGE_TYPE
 * @param aLocation the location
 * @return a context object
 */
XPointerResolver.prototype.createContext = function(aType, aLocation) {
    return { mType: aType,
	     mLocation: aLocation,
	     get type() { return this.mType; },
	     get location() { return this.mLocation; } 
    };
}

/**
 * Function to return an array of the immediate 
 * children of Node with a given tag Name.
 *
 * @param Node parent
 * @param String tagName
 * @return array of Node
 */
XPointerResolver.prototype.getChildrenByTagName = function(parent, tagName)
{
    children = [];

    // convert the tag name to correct format (it needs to be lowercase'd for HTML)
    tagName = convertTagName(tagName, this.docIsRawHTML);
   
    for (var i = 0; i < parent.childNodes.length; i++) {
	var child = parent.childNodes.item(i);
        if (isMarkedIgnore(child)) {
            var subchildren = this.getChildrenByTagName(child, tagName);
            for (var j = 0; j < subchildren.length; j++) {
                children.push(subchildren[j]);
            }
        } else
	if ( (child.nodeType == child.ELEMENT_NODE) &&
	     (convertTagName(child.tagName, this.docIsRawHTML) == tagName)
             // (! child.hasAttributeNS(XPointerService.XPOINTERLIB_NS, XPointerService.DOM_IGNORE_ELEMENT_ATTRIBUTE)) 
             ) {
	    children.push(child);
	}
    }
    
    return children;
}

XPointerResolver.prototype.getUnmarkedChildren = function(node) {
    var children = [];
    for (var i = 0; i < node.childNodes.length; i++) {
	var child = node.childNodes.item(i);
	if (child.hasAttributeNS && ! child.hasAttributeNS(XPointerService.XPOINTERLIB_NS, XPointerService.DOM_IGNORE_ELEMENT_ATTRIBUTE)) {
	    children.push(child);
	}
    }
    return children;
}

/**
 * Is a character white-space?
 *
 * @param char_value integer value of char
 * @return whether character is whitespace
 */
XPointerResolver.isWhiteSpace = function (char_value) 
{
    /* XML whitespace characters  
       WS ::= (#x20 | #x9 | #xD | #xA)+ */
    return  ((char_value == XPointerResolver.SPACE) || (char_value == XPointerResolver.CARR_RETURN) ||
	     (char_value == XPointerResolver.LINE_FEED) || (char_value == XPointerResolver.TAB));
}

/******************************
 * Global Utility Functions
 ******************************/

/**
 * This function converts a tagName to
 * lowercase if the document is raw
 * HTML.  This does not include XHTML,
 * which is actually XML.
 *
 * @param tagName string 
 * @param isRawHTML boolean whether document is in raw HTML
 * @return converted tagName
 */
function convertTagName(tagName, isRawHTML) {
    if (isRawHTML) {
	tagName = tagName.toLowerCase();
    }
    return tagName;
}

function isDocumentRawHTML(doc) {  
    if (doc.body) {
	return true;
    }
    else {
	return false;
    }
}

function isMarkedIgnore(element) {
    return ( (element.nodeType == element.ELEMENT_NODE) &&
             //?element.hasAttributeNS(XPointerService.XPOINTERLIB_NS, XPointerService.DOM_IGNORE_ELEMENT_ATTRIBUTE) &&
             element.getAttributeNS(XPointerService.XPOINTERLIB_NS, XPointerService.DOM_IGNORE_ELEMENT_ATTRIBUTE) == "true");
}

function isMarkedHide(element) {
    return ( (element.nodeType == element.ELEMENT_NODE) &&
             //?element.hasAttributeNS(XPointerService.XPOINTERLIB_NS, XPointerService.DOM_IGNORE_ELEMENT_ATTRIBUTE) &&
             element.getAttributeNS(XPointerService.XPOINTERLIB_NS, XPointerService.DOM_HIDE_ELEMENT_ATTRIBUTE) == "true");
}

/* we ought to add this to the interface, 
  but for now we can just set the attribute externally by hand
XPointerService.prototype.markElementHide = function(element) {
    if (element.setAttributeNS) {
	element.setAttributeNS(XPointerService.XPOINTERLIB_NS, XPointerService.DOM_HIDE_ELEMENT_ATTRIBUTE, true);
    }
    else {
	throw Components.results.NS_ERROR_FAILURE;
    }
}
*/

/******************************
 * XPCOM Component Constants
 ******************************/

const NS_XPOINTER_SERVICE_CONTRACTID =
    "@mozilla.org/xpointer-service;1";
const NS_XPOINTER_SERVICE_CID =
    Components.ID("{4e40e0d7-1d71-49f0-83d9-ccfd883c7033}");
const NS_XPOINTER_SERVICE_IID = Components.interfaces.nsIXPointerService;
const nsISupports        = Components.interfaces.nsISupports;

/**
 * XPointerService object implementing
 * the nsIXPointerService interface.
 */
function XPointerService() {
    this.xptrCreator = new XPointerCreator();
    this.xptrResolver = new XPointerResolver();
}

XPointerService.XPOINTERLIB_NS = "http://xpointerlib.mozdev.org/xptr-ns#";
XPointerService.DOM_IGNORE_ELEMENT_ATTRIBUTE = "_dom_ignore_element_";
XPointerService.DOM_HIDE_ELEMENT_ATTRIBUTE = "_dom_hide_element_";

XPointerService.prototype.QueryInterface =
function (iid) {

    if (!iid.equals(nsISupports) &&
        !iid.equals(NS_XPOINTER_SERVICE_IID))
        throw Components.results.NS_ERROR_NO_INTERFACE;

    return this;
}

XPointerService.prototype.parseXPointerToRange = function(xptr, doc) {
    return this.xptrResolver.resolveXPointerToRange(xptr, doc);
}

XPointerService.prototype.parseXPointerToNode = function(xptr, doc) {
    return this.xptrResolver.resolveXPointerToElement(xptr, doc);
}

XPointerService.prototype.createXPointerFromSelection = function(seln, doc) {
    return this.xptrCreator.createXPointerFromSelection(seln, doc);
}

XPointerService.prototype.createXPointerFromRange = function(range, doc) {
    return this.xptrCreator.createXPointerFromRange(range, doc);
}

XPointerService.prototype.markElement = function(element) {
    if (element.setAttributeNS) {
	element.setAttributeNS(XPointerService.XPOINTERLIB_NS, XPointerService.DOM_IGNORE_ELEMENT_ATTRIBUTE, true);
    }
    else {
	throw Components.results.NS_ERROR_FAILURE;
    }
}
    
XPointerService.prototype.getVersion = function() {
  return XPOINTER_SERVICE_VERSION;
}


/**
 * Factory for nsXPointerService.
 */
var nsXPointerServiceFactory = new Object();

nsXPointerServiceFactory.createInstance = function (outer, iid) {
  if (outer != null) {
    throw Components.results.NS_ERROR_NO_AGGREGATION;
  }
  
  if (!iid.equals(nsISupports)) {
    throw Components.results.NS_ERROR_INVALID_ARG;
  }

  return new XPointerService();
}


/**
 * Module for nsXPointerService.
 */
var nsXPointerServiceModule = new Object();
nsXPointerServiceModule.registerSelf =
function (compMgr, fileSpec, location, type)
{
    compMgr = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
    dump("***** XPointer Service -- registering self ******\n");
    debug("***** XPointer Service -- registering self ******\n");
    compMgr.registerFactoryLocation(NS_XPOINTER_SERVICE_CID,
                                    "XPointer Service",
                                    NS_XPOINTER_SERVICE_CONTRACTID, 
                                    fileSpec,
                                    location,
                                    type);
}

nsXPointerServiceModule.unregisterSelf = function(compMgr, fileSpec, location) {
  compMgr = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
  compMgr.unregisterFactoryLocation(NS_XPOINTER_SERVICE_CID, fileSpec);
}

nsXPointerServiceModule.getClassObject = function (compMgr, cid, iid) {
  if (cid.equals(NS_XPOINTER_SERVICE_CID)) {
    return nsXPointerServiceFactory;
  }
  else {
    throw Components.results.NS_ERROR_NO_INTERFACE;  
  }
}

nsXPointerServiceModule.canUnload =
function(compMgr)
{
    return true;
}

/* entrypoint */
function NSGetModule(compMgr, fileSpec) {
    return nsXPointerServiceModule;
}
