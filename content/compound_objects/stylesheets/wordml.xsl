<?xml version="1.0"?> 

<xsl:stylesheet version="1.0"
	xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
	xmlns:dc="http://purl.org/dc/elements/1.1/"
	xmlns:dcterms="http://purl.org/dc/terms/"
	xmlns:ore="http://www.openarchives.org/ore/terms/"
	xmlns:foaf="http://xmlns.com/foaf/0.1/"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:layout="http://maenad.itee.uq.edu.au/lore/layout.owl#"
	xmlns:w="http://schemas.microsoft.com/office/word/2003/wordml"
	xmlns:wx="http://schemas.microsoft.com/office/word/2003/auxHint"
	xmlns:o="urn:schemas-microsoft-com:office:office"
	exclude-result-prefixes="rdf dc dcterms ore foaf xsl">

	<xsl:output method="xml" indent="yes"/>
	<xsl:strip-space elements="*"/>
	<xsl:template match="/">

		<xsl:processing-instruction name="mso-application">progid="Word.Document"</xsl:processing-instruction>
		<w:wordDocument>
			<o:DocumentProperties>
				<xsl:variable name="title" select="//rdf:Description[ore:describes]/dc:title"/>
	  			<o:Title>
		  			<xsl:choose>
		  				<xsl:when test="$title"><xsl:value-of select="$title"/></xsl:when>
		  				<xsl:otherwise>Document generated by LORE</xsl:otherwise>
		  			</xsl:choose>
	  			</o:Title>
	  			<o:Author>
	  				<xsl:value-of select="//rdf:Description[ore:describes]/dc:creator"/>
	  			</o:Author>
	  			<xsl:variable name="subject">
	  				<xsl:for-each select="//rdf:Description[ore:describes]/dc:subject">
	  					<xsl:value-of select="."/>
	  					<xsl:if test="position() != last()">, </xsl:if>
	  				</xsl:for-each>
	  			</xsl:variable>
	  			<xsl:if test="$subject">
	  				<o:Subject>
	  					<xsl:value-of select="$subject"/>
	  				</o:Subject>
	  			</xsl:if>
	  			<!--  o:Created -->
	  		</o:DocumentProperties>
	  		<w:styles>
	            <w:style w:type="paragraph" w:styleId="Heading1">
	                <w:name w:val="heading 1"/>
	                <w:pPr>
	                    <w:pStyle w:val="Heading1"/>
	                    <w:keepNext/>
	                    <w:spacing w:before="400" w:after="60"/>
	                    <w:outlineLvl w:val="0"/>
	                </w:pPr>
	                <w:rPr>
	                    <w:rFonts w:ascii="Arial" w:h-ansi="Arial"/>
	                    <w:b/>
	                    <w:sz w:val="32"/>
	                </w:rPr>
	            </w:style>
	            <w:style w:type="paragraph" w:styleId="Heading2">
	                <w:name w:val="heading 2"/>
	                <w:pPr>
	                    <w:pStyle w:val="Heading2"/>
	                    <w:keepNext/>
	                    <w:spacing w:before="200" w:after="0"/>
	                    <w:outlineLvl w:val="1"/>
	                </w:pPr>
	                <w:rPr>
	                    <w:rFonts w:ascii="Arial" w:h-ansi="Arial"/>
	                    <w:b/>
	                    <w:sz w:val="24"/>
	                </w:rPr>
	            </w:style>
	            <w:style w:type="character" w:styleId="Hyperlink">
	                <w:rPr>
	                    <w:color w:val="0000FF"/>
	                    <w:u w:val="single"/>
	                </w:rPr>
	            </w:style>
	        </w:styles>
	  		
	  		<w:body>
			<xsl:apply-templates select="//rdf:Description[ore:describes]"/>
		  </w:body>
		</w:wordDocument>
	</xsl:template>
	
	<!-- about the resource map -->
	<xsl:template match="rdf:Description[ore:describes]">
		<wx:sect>
			<wx:sub-section>
				<w:p>
					<w:pPr>
						<w:pStyle w:val="Heading1" />
					</w:pPr>
					<w:r>
						<w:t><xsl:value-of select="dc:title"/><xsl:if test="dc:title">&#160;</xsl:if>Resource Map</w:t>
					</w:r>
					
				</w:p>
				<w:p>
					<w:r>
						<w:t> (<xsl:value-of select="@rdf:about"/>)</w:t>
					</w:r>
				</w:p>
				<!--  properties -->
				<w:p>
					<xsl:for-each select="*">
					<xsl:if test="name()!='ore:describes' and name() !='rdf:type'">
						<w:r>
	                        <w:rPr>
	                            <w:b/>
	                        </w:rPr>
	                        <w:t>
	                            <xsl:value-of select="local-name()"/>
	                        </w:t>
	                    </w:r>
						<w:r>
							<w:t>
								<xsl:text>: </xsl:text>
								<xsl:choose>
									<xsl:when test="text()">
										<xsl:value-of select="."/>
									</xsl:when>
									<xsl:otherwise>
										<xsl:value-of select="@*"/>
									</xsl:otherwise>
								</xsl:choose>
							</w:t>
						</w:r>
						<xsl:if test="position()!=last()">
							<w:r>
	                        	<w:br/>
	                    	</w:r>
						</xsl:if>
						</xsl:if>
					</xsl:for-each>
				</w:p>
				<xsl:apply-templates select="//rdf:Description/ore:aggregates"/>
			</wx:sub-section>
		</wx:sect>
	</xsl:template>
	
	<!--  about each aggregated resource -->
	<xsl:template match="rdf:Description/ore:aggregates">
		<xsl:variable name="res" select="@rdf:resource"/>
		<xsl:variable name="displaytitle">
			<xsl:choose>
				<xsl:when test="//rdf:Description[@rdf:about = $res]/dc:title">
					<xsl:value-of select="//rdf:Description[@rdf:about = $res]/dc:title"/>
				</xsl:when>
				<xsl:otherwise>Untitled Resource</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
			<wx:sub-section>
				<!--  heading for this section -->
                <w:p>
					<w:pPr>
                        <w:pStyle w:val="Heading2"/>
                    </w:pPr>
                    <w:r>
                    	<w:t><xsl:value-of select="$displaytitle"/></w:t>
                    </w:r>
                </w:p>
                <w:p>
                    <w:hlink w:dest="{$res}">
                        <w:r>
                            <w:rPr>
                                <w:rStyle w:val="Hyperlink"/>
                            </w:rPr>
                            <w:t>
                                (<xsl:value-of select="$res"/>)
                            </w:t>
                        </w:r>
                    </w:hlink>
                </w:p>
                <!--  list the properties and relationships -->
                <w:p>
                	<xsl:for-each select="//rdf:Description[@rdf:about = $res]/*">
                	<xsl:if test="namespace-uri() != 'http://maenad.itee.uq.edu.au/lore/layout.owl#'">
                		<w:r>
	                        <w:rPr>
	                            <w:b/>
	                        </w:rPr>
	                        <w:t>
	                            <xsl:value-of select="local-name()"/>
	                        </w:t>
	                    </w:r>
	                    <w:r>
							<w:t>
								<xsl:text>: </xsl:text>
								<xsl:choose>
									<xsl:when test="text()">
										<xsl:value-of select="."/>
									</xsl:when>
									<xsl:otherwise>
										<xsl:value-of select="@*"/>
									</xsl:otherwise>
								</xsl:choose>
							</w:t>
						</w:r>
                	
                	<xsl:if test="position() != last()">
                		<w:r>
                        	<w:br/>
                    	</w:r>
                    </xsl:if>
                    </xsl:if>
                    </xsl:for-each>
                </w:p>
              </wx:sub-section>
	</xsl:template>
	
	<!-- suppress default template for all others -->
	<xsl:template match="rdf:Description"></xsl:template>
	
</xsl:stylesheet>