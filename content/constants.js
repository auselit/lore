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
if (typeof Components !== "undefined") {
    var EXPORTED_SYMBOLS = ['constants'];
}
/** Constants used in LORE
 * @singleton
 * @class lore.constants
 */
if (typeof lore !== "object"){
    var lore = {};   
}
lore.constants = {
     nsprefix : function(ns, defaultNS) {
        var nssize = 0;
        for (var prefix in this.NAMESPACES) {
            if (this.NAMESPACES[prefix] == ns) {
                return prefix;
            }
            nssize++;
        }
        
        // Prefix was not found: create a new one: ensure it has a unique ns prefix
        var nprefix;
        if (defaultNS && !this.NAMESPACES[defaultNS]){
        	nprefix = defaultNS;
        } else {
        	nprefix = "ns" + nssize;
        }
        this.NAMESPACES[nprefix] = ns;
        return nprefix;
    },
    /** The name of the Firefox extension 
     * @const */
    EXTENSION_ID: "lore@maenad.itee.uq.edu.au",
    
    /**  XML Namespaces
     * @const */
    NAMESPACES : {
        "dc"      : "http://purl.org/dc/elements/1.1/",
        "dc10"    : "http://purl.org/dc/elements/1.1/",
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
        "xsd"     : "http://www.w3.org/2001/XMLSchema#",
        "oac"     : "http://www.openannotation.org/ns/",
        "owl"     : "http://www.w3.org/2002/07/owl#",
        "rdfs"    : "http://www.w3.org/2000/01/rdf-schema#",
        "austlit" : "http://austlit.edu.au/owl/austlit.owl#",
        "danno"   : "http://metadata.net/2009/09/danno#",
        "lorestore" : "http://auselit.metadata.net/lorestore/",
        "cnt"     : "http://www.w3.org/2008/content#"
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
    /** Name of the annotations store
     * @const */
    ANNOTATIONS_STORE : "annotations",
    /** Name of the highlight store
     * @const */
    HIGHLIGHT_STORE : "highlights",
    
    ANNOMODE_NORMAL : "NORMAL",
	ANNOMODE_SCHOLARLY: "SCHOLARLY",
		
	// Annotea protocol constants constants
    
	// queries
	 /**
     * This is the standard query parameter requests the annotation or annotations
     * that are replies for an annotation whose URL is given by the parameter's value.
     * @const */
    ANNOTEA_REPLY_TREE : "?w3c_reply_tree=",
     /**
     * This is the standard query parameter requests the annotation or annotations
     * for a resource whose URL is given by the parameter's value.
     * @const */
    ANNOTEA_ANNOTATES : "?w3c_annotates=",
	
	// this parameter is currently not supported by LORE annotations
	 /**
     * This is the standard query parameter requests the bookmarks and topics.
     * for a resource whose URL is given by the parameter's value.  This was not implemented
     * by AA2.
     * @const 
     */
    ANNOTEA_BOOKMARKS : "w3c_bookmarks",
	
    /**
     * This Danno-specific request parameter sets the primary query type to select all 
     * Annotea objects in the triple store; i.e. those with an <rdf:type>  property with
     * a value of either "http://www.w3.org/2000/10/annotation-ns#Annotation" or 
     * "http://www.w3.org/2001/03/thread#Reply".
     */
    DANNO_ANNOTEA_OBJECTS : "?danno_allAnnoteaObjects=true",
	 
	
	
	
	
	// query parameters - currently not used/supported by LORE annotations
    /**
     * This Danno-specific request parameter sets the primary query type to select all 
     * objects in the triple store;
     * @const
     */
    DANNO_ALL_OBJECTS : "?danno_allObjects=true",
	
    /**
     * This Danno-specific request parameter restricts the result-set of a QUERY to records
     * whose 'a:annotates' value matches a regex.
     */
     DANNO_RESTRICT_ANNOTATES_REGEX : "danno_annotatesRegex",
	
	   /**
     * This Danno-specific request parameter restricts the result-set of a QUERY to records
     * with a given 'dc1.1:creator' value. 
     */
     DANNO_RESTRICT_CREATOR : "danno_creator",
    
    /**
     * This Danno-specific request parameter restricts the result-set of a QUERY to records
     * with a given 'dc1.1:lang' value. 
     */
     DANNO_RESTRICT_LANGUAGE : "danno_language",

    /**
     * This Danno-specific request parameter restricts the result-set of a QUERY to records
     * with a 'dc1.1:date' datetime value that is less than a given datetime value.
     */
     DANNO_RESTRICT_BEFORE_DATE : "danno_beforeDate",

    /**
     * This Danno-specific request parameter restricts the result-set of a QUERY to records
     * with a 'dc1.1:date' datetime value that is greater or equal to a given datetime value.
     */
     DANNO_RESTRICT_AFTER_DATE : "danno_afterDate",

    /**
     * This Danno-specific request parameter restricts the result-set of a QUERY to records
     * with a 'a:created' datetime value that is less than a given datetime value.
     */
     DANNO_RESTRICT_BEFORE_CREATED : "danno_createdBefore",

    /**
     * This Danno-specific request parameter restricts the result-set of a QUERY to records
     * with a 'dc1.1:created' datetime value that is greater or equal to a given datetime value.
     */
     DANNO_RESTRICT_AFTER_CREATED : "danno_createdAfter",

    /**
     * This Danno-specific request parameter restricts the result-set of a QUERY to records
     * with a 'dc1.1:modified' datetime value that is less than a given datetime value.
     */
     DANNO_RESTRICT_BEFORE_MODIFIED : "danno_modifiedBefore",

    /**
     * This Danno-specific request parameter restricts the result-set of a QUERY to records
     * with a 'dc1.1:modified' datetime value that is greater or equal to a given datetime value.
     */
     DANNO_RESTRICT_AFTER_MODIFIED : "danno_modifiedAfter",
    
    /**
     * This Danno-specific request parameter restricts the result-set of a QUERY to records
     * with a given 'th:inReplyTo' URI.
     */
     DANNO_RESTRICT_IN_REPLY_TO : "danno_inReplyTo",
    
    /**
     * This Danno-specific request parameter restricts the result-set of a QUERY to records
     * with a given 'danno:collectionId' URI.
     */
     DANNO_RESTRICT_COLLECTION_ID : "danno_collectionId",
    
    /**
     * This Danno-specific request parameter restricts the result-set of a QUERY to records
     * with a 'danno:imported' datetime value that is less than a given datetime value.
     */
     DANNO_RESTRICT_BEFORE_IMPORTED : "danno_importedBefore",
    
    /**
     * This Danno-specific request parameter restricts the result-set of a QUERY to records
     * with a 'danno:imported' datetime value that is greater equal to a given datetime value.
     */
     DANNO_RESTRICT_AFTER_IMPORTED : "danno_importedAfter",

    /**
     * This Danno-specific request parameter restricts the result-set of a QUERY to records
     * with a given 'danno:source' value.
     */
     DANNO_RESTRICT_SOURCE : "danno_source",
    
    
    textm : {
    // Calais web service (text mining)
       /** String to display to attribute Calais web service
        * @const */
       POWEREDBY_CALAIS : "<br><hr><a href='http://opencalais.com'><img src='../skin/icons/ore/Calais_icon.jpg'> Powered by Calais</a>"
    },
    
    // Icons
    icons : {
     // base64 encoded icons  
          closeIcon  : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAAAQAAAAEABcxq3DAAACjklEQVQ4y2XTv2uddRTH8dfzPDf3Po9pjRfSVGKvlUApWEkdEkRxCI4pdAgdYjvrZBEyhFJwyT+QVdAiLqLQNg6Nix10ukoGsYU0Y/OrMdomJqm5ufc+9/k65IehnuWc4ZwPh88578j/I8ZrGRer1CJssNzgAVZQHG+ODosyWtTO89FIYmw48UYtkkZYDvbmOhZ/7rjziC8qLDePq5xCwtBorH6noniSCn93CZslYaMkPO0SFlPhdipcStQThk4fDpf208BoYq5eEbYSYYPwzH/5L8ITwkoi/FQRLiXmMNCFpCA+H/vsZsnYcJt2gXKZclnI831TskwSx4q84+WC3pL+h0H4M/gxxrkPYpffyWkFOmmqMjkpm55WVKuKalU2PS2dnJSkqSjwVs77scs4V0ojF4eC/q6CXWSjo166cUOUZXR3g+zqVaHR0Jyf17p7V6XgQqQ/jQyWqvT1Fcpt5Nit11VmZ3VfuSK7dm3foRDszs7ardePblgtdPXQF8eBKAj5gUBzbc3G1JT20hJRRBRpLy3ZmJrSXFuTHz7C/lwUb7O+STscCOjt1TMxoVSrHZ25VKvpmZigt9fhplu0d1iPd3jwkNUOOiiPjDgxPi5KEtszM7ZnZkRJ4sT4uPLIiBx7WGD1H35PsNnk7Nu824vni4viNNVaXLR6/brte/d09fd7fv++Z7duCe22BXzDV+t8F1XQZOBDvv2U4VfQyDJKJZ2dHZCcPCnkubjR8Ac+59fvGS/zOOngdTbn+G2DwVc5cyrPxa2W6ICsqNXSznPzhK+p/8Anp3m0dRymDA1qF/j4Pcbe5GyVtMBT9uZ5/Au3F/iywsohTEcCL+B8JmWwh1rANkt7+zivvojzv3rjBCvezErGAAAAJXRFWHRjcmVhdGUtZGF0ZQAyMDA4LTEwLTE4VDE4OjQ1OjQ1KzA4OjAwKJpk+wAAACV0RVh0bW9kaWZ5LWRhdGUAMjAwOC0xMC0xOFQxODo0NTo0NSswODowMHcrEs8AAAAASUVORK5CYII=",
          objectIcon : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAFWSURBVBgZBcE/SFQBAAfg792dppJeEhjZn80MChpqdQ2iscmlscGi1nBPaGkviKKhONSpvSGHcCrBiDDjEhOC0I68sjvf+/V9RQCsLHRu7k0yvtN8MTMPICJieaLVS5IkafVeTkZEFLGy0JndO6vWNGVafPJVh2p8q/lqZl60DpIkaWcpa1nLYtpJkqR1EPVLz+pX4rj47FDbD2NKJ1U+6jTeTRdL/YuNrkLdhhuAZVP6ukqbh7V0TzmtadSEDZXKhhMG7ekZl24jGDLgtwEd6+jbdWAAEY0gKsPO+KPy01+jGgqlUjTK4ZroK/UVKoeOgJ5CpRyq5e2qjhF1laAS8c+Ymk1ZrVXXt2+9+fJBYUwDpZ4RR7Wtf9u9m2tF8Hwi9zJ3/tg5pW2FHVv7eZJHd75TBPD0QuYze7n4Zdv+ch7cfg8UAcDjq7mfwTycew1AEQAAAMB/0x+5JQ3zQMYAAAAASUVORK5CYII=",
          relIcon    : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAEXSURBVDjLY/j//z8DJZhhmBpg2POQn2wDDDof8HvOe3osYtXzDzCxuM2vP3gvfn4MJIfXAP22e0Ies58eK9r2+r//3Kf3YOIhq17eK9v95j9ITrv2jhBWA/Ra7kVEr375vXDrq/9+s57eUy+4IY0kJx2w6Nk9kFzE0uffgXIRKAboNtxlC1/+/GPljjdABc9+q+ZcM0Z3qmb5LWOQXOmml/8DZz7+qJB0hQ3FBerFNyNC5z/9nrXqxX+Pvgf35OMuSSPJSXtPfXQPJBc089F3oFwE1jBQTLkiZNtw51jq4qf/XVvuwsPAa9Kjexkrnv8HyclFXxTCGwsyERf4LctvHvPuvAePBf8pDz/Y1N45BpIbKUmZFAwAR3nW32nUrY0AAAAASUVORK5CYII="
    }
};
if (typeof Components !== "undefined"){
    // For Firefox code modules
    constants = lore.constants;
}