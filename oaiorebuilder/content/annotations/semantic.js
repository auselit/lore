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



var objectIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAFWSURBVBgZBcE/SFQBAAfg792dppJeEhjZn80MChpqdQ2iscmlscGi1nBPaGkviKKhONSpvSGHcCrBiDDjEhOC0I68sjvf+/V9RQCsLHRu7k0yvtN8MTMPICJieaLVS5IkafVeTkZEFLGy0JndO6vWNGVafPJVh2p8q/lqZl60DpIkaWcpa1nLYtpJkqR1EPVLz+pX4rj47FDbD2NKJ1U+6jTeTRdL/YuNrkLdhhuAZVP6ukqbh7V0TzmtadSEDZXKhhMG7ekZl24jGDLgtwEd6+jbdWAAEY0gKsPO+KPy01+jGgqlUjTK4ZroK/UVKoeOgJ5CpRyq5e2qjhF1laAS8c+Ymk1ZrVXXt2+9+fJBYUwDpZ4RR7Wtf9u9m2tF8Hwi9zJ3/tg5pW2FHVv7eZJHd75TBPD0QuYze7n4Zdv+ch7cfg8UAcDjq7mfwTycew1AEQAAAMB/0x+5JQ3zQMYAAAAASUVORK5CYII=";
var relIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAEXSURBVDjLY/j//z8DJZhhmBpg2POQn2wDDDof8HvOe3osYtXzDzCxuM2vP3gvfn4MJIfXAP22e0Ies58eK9r2+r//3Kf3YOIhq17eK9v95j9ITrv2jhBWA/Ra7kVEr375vXDrq/9+s57eUy+4IY0kJx2w6Nk9kFzE0uffgXIRKAboNtxlC1/+/GPljjdABc9+q+ZcM0Z3qmb5LWOQXOmml/8DZz7+qJB0hQ3FBerFNyNC5z/9nrXqxX+Pvgf35OMuSSPJSXtPfXQPJBc089F3oFwE1jBQTLkiZNtw51jq4qf/XVvuwsPAa9Kjexkrnv8HyclFXxTCGwsyERf4LctvHvPuvAePBf8pDz/Y1N45BpIbKUmZFAwAR3nW32nUrY0AAAAASUVORK5CYII=";

lore.anno.ui.isHumanReadableTriple = function( triple) {
			var valid = ["isRecordFor", "birthName", "alternateName", "usesPseudoAgent", "birthOf", "deathOf", "gender", "biography",
			"influenceOnWork", "type"];
			
			//work record
			valid = valid.concat( ["title", "form", "producedOutput" ]);
			
			//manifestation
			valid = valid.concat( ['hasReprint']);
			
			if ( triple.source && triple.subject.type != 'bnode') {
			 	var rel = triple.property.toString();
				
				for (var i = 0; i < valid.length; i++) {
				
					if ( rel.lastIndexOf("#" + valid[i]) != -1 || rel.lastIndexOf("/" + valid[i]) != -1)
						return true;
				}
			} 
			return false;
		//	return true;
		}
					
		lore.anno.ui.setVisibilityForPageTriples = function( show ) {
			if (!show) {
				for (var i = 0; i < lore.anno.ui.metaSelections.length; i++) {
					try {
						var n = lore.anno.ui.metaSelections[i];
						n.removeChild(n.firstChild);
						lore.global.util.removeNodePreserveChildren(n, lore.global.util.getContentWindow(window));
					} 
					catch (e) {
						lore.debug.anno('error removing node for meta selection: ' + e, e);
					}
				}
				lore.anno.ui.metaSelections = [];
			} else {
				if (lore.anno.ui.rdfa.triples.length > 0) {
					
					for ( var i =0 ;i < lore.anno.ui.rdfa.triples.length; i++ ) {
						var z = lore.anno.ui.rdfa.triples[i];
						if ( lore.anno.ui.isHumanReadableTriple(z)){
							
							var isObject = z.property.toString().indexOf("#type") != -1;
							//var val = z.object.toString();
							//val = val.substring(val.lastIndexOf("#")+1, val.lastIndexOf(">"));
							var val = lore.anno.ui.tripleURIToString(z.object);
							lore.debug.anno(val, z);
							if ( isObject &&  val !='Agent' && val !='Work'
							 && val != 'manifestation' && val != 'expression')
							 	continue;
							var cw = lore.global.util.getContentWindow(window);
							var doc = cw.document;
							var r = doc.createRange();
							r.selectNode(z.source);
							var span = lore.global.util.domCreate("span", doc);
							r.surroundContents(span);
																					
							lore.anno.ui.metaSelections.push(span);
							var marker = lore.global.util.domCreate("img", doc);
							
							lore.debug.anno("isObject: " + isObject);
							marker.src = isObject ? objectIcon: relIcon;
							marker.setAttribute("rdfIndex", i);
							span.insertBefore(marker, z.source);
							var s = $(marker);
					 	
							marker.title = isObject ? val : lore.anno.ui.tripleURIToString(z.property);
							
							s.hover(function () {
								$(this).parent().css({
									'background-color': 'yellow'
								});},
								function() {
									$(this).parent().css({
										'background-color': ''
									});
								});
							if ( isObject)
								s.click(lore.anno.ui.handleUpdateMetaObject);
							else
								s.click(lore.anno.ui.handleUpdateMetaSelection);
							
	 				}
				}
			 }  
				
			}
		}

		lore.anno.ui.checkRDFaEnabled = function () {
	var disabled = true;
	var doc = lore.global.util.getContentWindow(window).document;
	if (doc.doctype) {
		lore.debug.anno ("Document: " +  doc.doctype.name + doc.doctype.publicId + doc.doctype.systemId );
		disabled = doc.doctype.publicId != "-//W3C//DTD HTML4+RDFa 1.0//EN" && doc.doctype.publicId != "-//W3C//DTD XHTML+RDFa 1.0//EN";
    }
//	Ext.getCmp("gleanrdfbtn").setDisabled(disabled);
}

lore.anno.ui.gleanRDFa = function () {	
	try {
		//lore.anno.ui.gleanAustlitRDFa();
		var cw = lore.global.util.getContentWindow(window);
		var doc = cw.document;
		
		var myrdf = $('body', doc).rdfa();
		lore.debug.anno("rdfa for the page...", myrdf.databank.triples());
		lore.anno.ui.rdfa = {
			triples: myrdf.databank.triples(),
			rdf: myrdf
		};
		
 		lore.debug.anno('glean rdfa: ' + lore.anno.ui.rdfa, lore.anno.ui.rdfa);		
	}catch (e) {
		lore.debug.anno("Error gleaning potential rdfa from page: " +e , e);
	}
}