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
 
// set up javascript namespaces
Ext.namespace("lore.constants",
	"lore.ui", 
	"lore.util",
	"lore.anno", 
	"lore.ore.graph",
	"lore.textm", 
	"lore.debug");

lore.constants.EXTENSION_ID = "oaiorebuilder@maenad.itee.uq.edu.au";

// XML Namespaces
lore.constants.XHTML_NS               = "http://www.w3.org/1999/xhtml";
lore.constants.FOAF_NS                = "http://xmlns.com/foaf/0.1/";
lore.constants.DC10_NS                = "http://purl.org/dc/elements/1.0/";
lore.constants.DC_NS                  = "http://purl.org/dc/elements/1.1/";
lore.constants.DCTERMS_NS             = "http://purl.org/dc/terms/";
lore.constants.ORETERMS_NS            = "http://www.openarchives.org/ore/terms/";
lore.constants.RDF_SYNTAX_NS          = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
lore.constants.ANNOTATION_NS          = "http://www.w3.org/2000/10/annotation-ns#";
lore.constants.ANNOTATION_TYPE_NS     = "http://www.w3.org/2000/10/annotationType#";
lore.constants.THREAD_NS              = "http://www.w3.org/2001/03/thread#";
lore.constants.REPLY_TYPE_NS          = "http://www.w3.org/2001/12/replyType#";
lore.constants.VARIATION_ANNOTATION_NS = "http://austlit.edu.au/ontologies/2009/03/lit-annotation-ns#";
lore.constants.LORE_LAYOUT_NS         = "http://maenad.itee.uq.edu.au/lore/layout.owl#";
lore.constants.SPARQLRESULTS_NS       = "http://www.w3.org/2005/sparql-results#";
lore.constants.HTTP_NS                = "http://www.w3.org/1999/xx/http#";
lore.constants.XMLSCHEMA_NS           = "http://www.w3.org/2001/XMLSchema#";

// XML Namespace prefixes
lore.constants.NAMESPACES = {
	"dc" : lore.constants.DC_NS,
	"dc10": lore.constants.DC10_NS,
	"dcterms" : lore.constants.DCTERMS_NS,
	"ore" : lore.constants.ORETERMS_NS,
	"foaf" : lore.FOAF_NS,
	"layout" : lore.LORE_LAYOUT_NS
};

// RDF/OWL
lore.constants.OWL_OBJPROP        = "http://www.w3.org/2002/07/owl#ObjectProperty";
lore.constants.OWL_DATAPROP       = "http://www.w3.org/2002/07/owl#DatatypeProperty";
lore.constants.OWL_TPROP          = "http://www.w3.org/2002/07/owl#TransitiveProperty";
lore.constants.OWL_SPROP          = "http://www.w3.org/2002/07/owl#SymmetricProperty";
lore.constants.RDFS_CLASS         = "http://www.w3.org/2000/01/rdf-schema#Class";
lore.constants.RESOURCE_MAP           = "http://www.openarchives.org/ore/terms/ResourceMap";


// Default list of properties that can be specified for resource maps or aggregated resources
lore.ore.METADATA_PROPS = ["dcterms:abstract", "dcterms:audience", "dc:creator",
		"dcterms:created", "dc:contributor", "dc:coverage", "dc:description",
		"dc:format", "dcterms:hasFormat", "dc:identifier", "dc:language",
		"dcterms:modified", "dc:publisher", "dc:rights", "dc:source",
		"dc:subject", "dc:title"];	
		
// Compound object editor graph view
lore.ore.NODE_WIDTH = 220;
lore.ore.NODE_HEIGHT = 170;
lore.ore.NODE_SPACING = 40;
lore.ore.MAX_X = 400;

// Variations view
lore.anno.FRAME_WIDTH_CLEARANCE = 7;
lore.anno.FRAME_HEIGHT_CLEARANCE = 50;
lore.anno.VARIATIONS_FRAME_LOAD_WAIT = 250;


lore.textm.OPENCALAIS_KEY = "ab3yxw3ab4b2fyexwg44amns";
lore.textm.POWEREDBY_CALAIS = "<br><hr><a href='http://opencalais.com'><img src='../skin/icons/Calais_icon.jpg'> Powered by Calais</a>";