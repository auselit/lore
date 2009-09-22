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

var EXPORTED_SYMBOLS = ['constants'];

constants = {
	textm : {}
}
constants.EXTENSION_ID = "lore@maenad.itee.uq.edu.au";

// XML Namespaces
constants.XHTML_NS                = "http://www.w3.org/1999/xhtml";
constants.FOAF_NS                 = "http://xmlns.com/foaf/0.1/";
constants.DC10_NS                 = "http://purl.org/dc/elements/1.0/";
constants.DC_NS                   = "http://purl.org/dc/elements/1.1/";
constants.DCTERMS_NS              = "http://purl.org/dc/terms/";
constants.ORETERMS_NS             = "http://www.openarchives.org/ore/terms/";
constants.RDF_SYNTAX_NS           = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
constants.ANNOTATION_NS           = "http://www.w3.org/2000/10/annotation-ns#";
constants.ANNOTATION_TYPE_NS      = "http://www.w3.org/2000/10/annotationType#";
constants.THREAD_NS               = "http://www.w3.org/2001/03/thread#";
constants.REPLY_TYPE_NS           = "http://www.w3.org/2001/12/replyType#";
constants.VARIATION_ANNOTATION_NS = "http://austlit.edu.au/ontologies/2009/03/lit-annotation-ns#";
constants.LORE_LAYOUT_NS          = "http://maenad.itee.uq.edu.au/lore/layout.owl#";
constants.SPARQLRESULTS_NS        = "http://www.w3.org/2005/sparql-results#";
constants.HTTP_NS                 = "http://www.w3.org/1999/xx/http#";
constants.XMLSCHEMA_NS            = "http://www.w3.org/2001/XMLSchema#";

// XML Namespace prefixes
constants.NAMESPACES = {
    "dc"      : constants.DC_NS,
    "dc10"    : constants.DC10_NS,
    "dcterms" : constants.DCTERMS_NS,
    "ore"     : constants.ORETERMS_NS,
    "foaf"    : constants.FOAF_NS,
    "layout"  : constants.LORE_LAYOUT_NS,
	"rdf"	  : constants.RDF_SYNTAX_NS
};

// RDF/OWL
constants.OWL_OBJPROP    = "http://www.w3.org/2002/07/owl#ObjectProperty";
constants.OWL_DATAPROP   = "http://www.w3.org/2002/07/owl#DatatypeProperty";
constants.OWL_TPROP      = "http://www.w3.org/2002/07/owl#TransitiveProperty";
constants.OWL_SPROP      = "http://www.w3.org/2002/07/owl#SymmetricProperty";
constants.RDFS_CLASS     = "http://www.w3.org/2000/01/rdf-schema#Class";
constants.RESOURCE_MAP   = "http://www.openarchives.org/ore/terms/ResourceMap";

// Store constants
constants.ANNOTATIONS_STORE = "annotations";
constants.HIGHLIGHT_STORE = "highlights";

// Annotation query strings
constants.REPLY_TREE = "?w3c_reply_tree=";
constants.ANNOTATES = "?w3c_annotates=";

// Calais web service (text mining)
constants.textm.OPENCALAIS_KEY   = "ab3yxw3ab4b2fyexwg44amns";
constants.textm.POWEREDBY_CALAIS = "<br><hr><a href='http://opencalais.com'><img src='../skin/icons/Calais_icon.jpg'> Powered by Calais</a>";