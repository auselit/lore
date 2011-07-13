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
Ext.namespace("lore.ore.model");
/** @class lore.ore.model.OntologyManager Manage object and datatype properties from domain ontology that can be used in compound objects */
lore.ore.model.OntologyManager = function() {
    /** Default list of properties that can be specified for compound objects or resources 
    * @const */
    this.METADATA_PROPS = ["dcterms:abstract", "dcterms:audience", "dc:creator",
        "dc:contributor", "dc:coverage", "dcterms:created", "dc:description",
        "dc:identifier", "dc:language", "dcterms:modified",
        "dc:publisher", "dc:rights", "dc:source",
        "dc:subject", "dc:title", "dc:type"];
    /** Properties that are mandatory/cannot be deleted for compound objects
     *  @const */
    this.CO_REQUIRED = ["dc:creator","dcterms:created",
        "dcterms:modified", "ore:describes", "rdf:about", "rdf:type", "lorestore:user"  
    ];
    /** Properties that are mandatory for an aggregated resource
     *  @const */
    this.RES_REQUIRED = ["resource"];
    /** Properties that are mandatory for a relationship 
     * @const */
    this.REL_REQUIRED = ["relationship", "namespace"];

    /** URL from which current ontology was loaded (may be different from URL e.g. when ontology is loaded from local chrome URL)*/
    this.ontologyURL = "";
    
    /** URI identifying current ontology */
    this.ontologyURI = "";
    
    /** RDFQuery object representing current ontology */
    this.ontology = {};
    
    this.dataTypeProps = [];

    // metadata for ontologies from preferences
    this.ontologyMetadata = new Ext.data.JsonStore ({
    	fields: ['nsprefix', 'nsuri', 'locurl', 'useco', 'useanno'],
    	idProperty: 'nsprefix',
    	storeId: 'ontologies'
    });
    
    // cache previously loaded ontology terms
    this.ontologyCache = {};
	
};

Ext.apply(lore.ore.model.OntologyManager.prototype, {
	/** Update metadata for ontologies configured for use with LORE */
	updateOntologiesMetadata : function(ontologies, om, setCurrent){
		try{
			// Load metadata about ontologies from data obtained from preference
			this.ontologyMetadata.loadData(ontologies);
			// Check that all ontology metadata entries include the nsuri for the baseuri
			this.ontologyMetadata.each(function(r){
			  try{
				var nsuri = r.get('nsuri');
				var nspfx = r.get('nsprefix');
	            if (nsuri){
	                // make sure this namespace is in constants.NAMESPACES
	                lore.constants.nsprefix(nsuri,nspfx);
	            } else {
	                // Load ontology to get namespace uri
					var locurl = r.get('locurl');
	                if (locurl && locurl != "http://"){
						this.cacheOntology(locurl, function(ontData){
							var baseuri;
							if(ontData && ontData.nsuri){
								baseuri = ontData.nsuri;
							} else {
								// If there was no xml:base, lookup URI or dc:identifier of OWL ontology 
								var baseQuery = ontData.ontology
								    .where('?ont rdf:type <http://www.w3.org/2002/07/owl#Ontology>')
									.optional('?ont <http://purl.org/dc/elements/1.1/identifier> ?ontid');
								var res = baseQuery.get(0);
								if (res){
									var baseuri = res.ont.value.toString();
									if (!baseuri) {
										baseuri = res.ontid.value;
									}
								}
							}
							if (baseuri){
								// If baseuri doesn't end in hash or slash, add hash
								var lastChar = baseuri[baseuri.length - 1];
		                        if (lastChar == '>'){
		                            // remove angle brackets
		                            baseuri = baseuri.slice(1,baseuri.length - 1);
		                        }
								if (!(lastChar == '#' || lastChar == '/')){
									baseuri = baseuri + "#";
								}
								r.set('nsuri', baseuri);
								// Ensure that all prefixes are included in constants.NAMESPACES
								lore.constants.nsprefix(baseuri,nspfx);
								// TODO: store nsuri back into preference so we don't have to look it up again
		                        //r.nsuri = baseuri;
							} 
						});
					}
	            }
	            
			  } catch (ex){
					lore.debug.ore("problem loading ontology metadata",ex);
			  }
			},this);
	        if (setCurrent){
	              om.setCurrentOntology(om);
	        }
		} catch (e){
			lore.debug.ore("updateOntologiesMetadata",e);
		}
	},
	/** Load ontology terms into cache */
	cacheOntology : function(onturl, callback){
		var om = this;
		if (onturl) {
			// Check if it is already in the cache
			if (this.ontologyCache[onturl]){
				callback(this.ontologyCache[onturl]);
                return;
			}
			// Load the ontology
			var xhr = new XMLHttpRequest();
			xhr.overrideMimeType('application/xml');
			xhr.open("GET", onturl);
			xhr.setRequestHeader('Content-Type', "application/rdf+xml");
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					try {
						var ontData = {relationships:{}, dataTypeProps: []};
						// Get xml:base
						var tmp = xhr.responseXML.getElementsByTagNameNS(lore.constants.NAMESPACES["rdf"], 'RDF')[0];
						if (tmp){
							tmp = tmp.getAttributeNodeNS('http://www.w3.org/XML/1998/namespace','base');
						}
						if (tmp){
							ontData.nsuri = tmp.nodeValue;
						}
						// Load contents of ontology into rdfquery databank
						var db = jQuery.rdf.databank();
						for (ns in lore.constants.NAMESPACES) {
							db.prefix(ns, lore.constants.NAMESPACES[ns]);
						}
						db.load(xhr.responseXML);
						var relOntology = jQuery.rdf({
							databank : db
						});
						// Cache RDF properties
						relOntology.where('?prop rdf:type <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property>')
								.each(function() {
									var relresult = lore.global.util
											.splitTerm(this.prop.value
													.toString());
									ontData.relationships[relresult.term] = relresult.ns;
								});
						// Cache OWL Object properties
						relOntology.where('?prop rdf:type <'
								+ lore.constants.OWL_OBJPROP + '>').each(
								function() {
									try {
										var relresult = lore.global.util
												.splitTerm(this.prop.value
														.toString());
										ontData.relationships[relresult.term] = relresult.ns;
									} catch (e) {
										lore.debug.ore("problem loading rels", e);
									}
						});
						// Cache datatype properties
						relOntology.where('?prop rdf:type <' + lore.constants.OWL_DATAPROP + '>').each(
								function (){
									try {
										var relresult = lore.global.util.splitTerm(this.prop.value.toString());
										var ns = lore.constants.nsprefix(relresult.ns);
										ontData.dataTypeProps.push(ns + ":" + relresult.term);
									} catch (e){
										lore.debug.ore("Problem loading data props",e);
									}
								}
						);
						ontData.ontology = relOntology;
						om.ontologyCache[onturl] = ontData;
						callback(ontData);
					} catch (e) {
						lore.debug.ore("problem loading rels", e);
					}
				}
			};
			xhr.send(null);
		}
	},
	/** Change the ontology currently used for relationships and properties */
	setCurrentOntology : function(om){
        /*var current = this.ontologyMetadata.find('nsuri', onturl);
        if (current != -1){
        	current = this.ontologyMetadata.getAt(current);
        	lore.ore.debug("currentOntologyMetadata",current);
        	var onturlnspfx = current.get('nsprefix');
        }*/
        try{
		om.dataTypeProps = om.METADATA_PROPS.slice(0);
		om.cacheOntology(om.ontologyURL, function(ontData){
            try{
			om.ontrelationships = ontData.relationships;
            om.ontology = ontData.ontology;
			// TODO: merge ontData.dataTypeProps and om.dataTypeProps
			lore.ore.ontrelationships = om.ontrelationships;
            } catch (e){
                lore.debug.ore("setCurrentOntology cache",e);
            }
		});
        } catch (ex){
            lore.debug.ore("setCurrentOntology",ex);
        }

		//lore.ore.resource_metadata_props = ["rdf:type","ore:isAggregatedBy"];
		
	},
	/**
	 * Respond to ontology preferences being updated
	 */
	loadOntology : function(onturl, ontologies) {
		try {
			var om = this;
			var setCurrent = false;
			if (!(this.ontologyURL && this.ontologyURL == onturl && !isEmptyObject(this.ontology))){
                setCurrent = true;
            	this.ontologyURL = onturl;
            }
			this.updateOntologiesMetadata(ontologies, om, setCurrent); 
		} catch (e) {
			lore.debug.ore("loadOntology", e);
		}
	},
	getDataTypeProperties : function(forCompoundObject){
        if (!forCompoundObject){
            return this.dataTypeProps;    
        } else {
            return this.dataTypeProps.filter(function(e,i,a){return !(e == "dc:type" || e == "dcterms:modified" || e == "dcterms:created")});
        }
		
	},
    /** return the values from the current type vocabulary as array of [id,displayName] values */
    getDCTypeVocab : function(){
       if (!this.dctypeVocab){
	        // TODO: allow customisable type vocab and load from ontology file.
	        // At present we use DCMIType only (hardcoded below)
	        this.dctypeVocab = [
		       ['http://purl.org/dc/dcmitype/Collection','Collection'],
		       ['http://purl.org/dc/dcmitype/Dataset', 'Dataset'],
	           ['http://purl.org/dc/dcmitype/Event','Event'],
	           ['http://purl.org/dc/dcmitype/Image', 'Image'],
	           ['http://purl.org/dc/dcmitype/InteractiveResource','InteractiveResource'],
	           ['http://purl.org/dc/dcmitype/Service','Service'],
	           ['http://purl.org/dc/dcmitype/Software','Software'],
	           ['http://purl.org/dc/dcmitype/Sound','Sound'],
	           ['http://purl.org/dc/dcmitype/Text','Text'],
	           ['http://purl.org/dc/dcmitype/PhysicalObject', 'PhysicalObject']
	       ];
       }
       return this.dctypeVocab;
    }
});