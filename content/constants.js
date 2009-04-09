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
 
var EXTENSION_ID = "oaiorebuilder@maenad.itee.uq.edu.au";

// XML Namespaces
var XHTML_NS               = "http://www.w3.org/1999/xhtml";
var FOAF_NS                = "http://xmlns.com/foaf/0.1/";
var DC10_NS                = "http://purl.org/dc/elements/1.0/";
var DC_NS                  = "http://purl.org/dc/elements/1.1/";
var DCTERMS_NS             = "http://purl.org/dc/terms/";
var ORETERMS_NS            = "http://www.openarchives.org/ore/terms/";
var RDF_SYNTAX_NS          = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
var ANNOTATION_NS          = "http://www.w3.org/2000/10/annotation-ns#";
var ANNOTATION_TYPE_NS     = "http://www.w3.org/2000/10/annotationType#";
var THREAD_NS              = "http://www.w3.org/2001/03/thread#";
var REPLY_TYPE_NS          = "http://www.w3.org/2001/12/replyType#";
var REVISION_ANNOTATION_NS = "http://austlit.edu.au/ontologies/2009/03/lit-annotation-ns#";
var LORE_LAYOUT_NS         = "http://maenad.itee.uq.edu.au/lore/layout.owl#";
var SPARQLRESULTS_NS       = "http://www.w3.org/2005/sparql-results#";
var HTTP_NS                = "http://www.w3.org/1999/xx/http#";
var XMLSCHEMA_NS           = "http://www.w3.org/2001/XMLSchema#";

// XML Namespace prefixes
var NAMESPACES = {
	"dc" : DC_NS,
	"dc10": DC10_NS,
	"dcterms" : DCTERMS_NS,
	"ore" : ORETERMS_NS,
	"foaf" : FOAF_NS,
	"layout" : LORE_LAYOUT_NS
};

// RDF/OWL
var OWL_OBJPROP        = "http://www.w3.org/2002/07/owl#ObjectProperty";
var OWL_DATAPROP       = "http://www.w3.org/2002/07/owl#DatatypeProperty";
var OWL_TPROP          = "http://www.w3.org/2002/07/owl#TransitiveProperty";
var OWL_SPROP          = "http://www.w3.org/2002/07/owl#SymmetricProperty";
var RDFS_CLASS         = "http://www.w3.org/2000/01/rdf-schema#Class";
var RESOURCE_MAP           = "http://www.openarchives.org/ore/terms/ResourceMap";

// Compound object editor graph view
var NODE_WIDTH = 220;
var NODE_HEIGHT = 170;
var NODE_SPACING = 40;
var MAX_X = 400;

// Revisions view
var FRAME_WIDTH_CLEARANCE = 7;
var FRAME_HEIGHT_CLEARANCE = 50;
var LEFT_REVISION_CLEARANCE = 255;
var TOP_REVISION_CLEARANCE = 31;
var REVISIONS_FRAME_LOAD_WAIT = 250;

// Default list of properties that can be specified for resource maps or aggregated resources
var METADATA_PROPS = ["dcterms:abstract", "dcterms:audience", "dc:creator",
		"dcterms:created", "dc:contributor", "dc:coverage", "dc:description",
		"dc:format", "dcterms:hasFormat", "dc:identifier", "dc:language",
		"dcterms:modified", "dc:publisher", "dc:rights", "dc:source",
		"dc:subject", "dc:title"];	

var OPENCALAIS_KEY = "ab3yxw3ab4b2fyexwg44amns";
var POWEREDBY_CALAIS = "<br><hr><a href='http://opencalais.com'><img src='../skin/icons/Calais_icon.jpg'> Powered by Calais</a>";