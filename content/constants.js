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

/** Constants used in LORE
 * @namespace
 * @name lore.constants
 */
constants = {
    /** @lends lore.constants */
    
    /** The name of the Firefox extension 
     * @const */
    EXTENSION_ID: "lore@maenad.itee.uq.edu.au",
    
    /**  XML Namespaces
     * @const */
    NAMESPACES : {
        "dc"      : "http://purl.org/dc/elements/1.1/",
        "dc10"    : "http://purl.org/dc/elements/1.0/",
        "dcterms" : "http://purl.org/dc/terms/",
        "ore"     : "http://www.openarchives.org/ore/terms/",
        "foaf"    : "http://xmlns.com/foaf/0.1/",
        "layout"  : "http://maenad.itee.uq.edu.au/lore/layout.owl#",
        "rdf"     : "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        "xhtml"   : "http://www.w3.org/1999/xhtml",
        "annotea" : "http://www.w3.org/2000/10/annotation-ns#",
        "annotype": "http://www.w3.org/2000/10/annotationType#",
        "thread"  : "http://www.w3.org/2001/03/thread#",
        "annoreply"  : "http://www.w3.org/2001/12/replyType#",
        "vanno"   : "http://austlit.edu.au/ontologies/2009/03/lit-annotation-ns#",
        "sparql"  : "http://www.w3.org/2005/sparql-results#",
        "http"    : "http://www.w3.org/1999/xx/http#",
        "xsd"     : "http://www.w3.org/2001/XMLSchema#"     
    },
    
    // RDF/OWL
    /** OWL Object Property type
     * @const */
    OWL_OBJPROP    : "http://www.w3.org/2002/07/owl#ObjectProperty",
    /** OWL Datatype Property type
     * @const */
    OWL_DATAPROP   : "http://www.w3.org/2002/07/owl#DatatypeProperty",
    /** OWL Transitive Property type
     * @const */
    OWL_TPROP      : "http://www.w3.org/2002/07/owl#TransitiveProperty",
    /** OWL Symmetric Property type
     * @const */
    OWL_SPROP      : "http://www.w3.org/2002/07/owl#SymmetricProperty",
    /** RDF Schema Class type
     * @const */
    RDFS_CLASS     : "http://www.w3.org/2000/01/rdf-schema#Class",
    /** ORE Resource Map type
     * @const */
    RESOURCE_MAP   : "http://www.openarchives.org/ore/terms/ResourceMap",
  
    // Store constants
    /** Name of the annotatiosn store
     * @const */
    ANNOTATIONS_STORE : "annotations",
    /** Name of the highlight store
     * @const */
    HIGHLIGHT_STORE : "highlights",
    
    // Annotation query strings
    /** Annotea query string for retreiving reply tree of annotation
     * @const */
    REPLY_TREE : "?w3c_reply_tree=",
    /** Annotea query string for retreiving all annotations on a resource
     * @const */
    ANNOTATES : "?w3c_annotates=",
    
    textm : {
    // Calais web service (text mining)
       /** Key to access Calais web service for text mining
        * @const */
       OPENCALAIS_KEY   : "ab3yxw3ab4b2fyexwg44amns",
       /** String to display to attribute Calais web service
        * @const */
       POWEREDBY_CALAIS : "<br><hr><a href='http://opencalais.com'><img src='../skin/icons/Calais_icon.jpg'> Powered by Calais</a>"
    }
};
