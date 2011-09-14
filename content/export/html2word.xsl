<?xml version="1.0"?> 

<xsl:stylesheet version="1.0"
	xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
	xmlns:dc="http://purl.org/dc/elements/1.1/"
	xmlns:dcterms="http://purl.org/dc/terms/"
	xmlns:ore="http://www.openarchives.org/ore/terms/"
	xmlns:foaf="http://xmlns.com/foaf/0.1/"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:layout="http://maenad.itee.uq.edu.au/lore/layout.owl#"
	xmlns:http="http://www.w3.org/1999/xx/http#"
	xmlns:xhtml="http://www.w3.org/1999/xhtml"
	xmlns:ve="http://schemas.openxmlformats.org/markup-compatibility/2006" 
	xmlns:o="urn:schemas-microsoft-com:office:office" 
	xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" 
	xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" 
	xmlns:v="urn:schemas-microsoft-com:vml" 
	xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" 
	xmlns:w10="urn:schemas-microsoft-com:office:word" 
	xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" 
	xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
	xmlns:ans="http://www.w3.org/2000/10/annotation-ns#"
	exclude-result-prefixes="rdf dc dcterms ore foaf xsl xhtml ans">

	<xsl:output method="xml" indent="yes"/>
	
	<!--  key used to group non-block elements - lookup by first element in group -->
	<xsl:key name="kGroupByFirst"
             match="child::node()[not(self::xhtml:p | self::xhtml:ol | self::xhtml:ul | self::xhtml:div[@align])][preceding-sibling::node()[1][not(self::xhtml:p | self::xhtml:ol | self::xhtml:ul | self::xhtml:div[@align])]]"
             use="generate-id(preceding-sibling::node()[not(self::xhtml:p | self::xhtml:ol | self::xhtml:ul | self::xhtml:div[@align])]
                               [not(preceding-sibling::node()[1][not(self::xhtml:p | self::xhtml:ol | self::xhtml:ul | self::xhtml:div[@align])])][1])"/>
	<xsl:template match="/div">
	   <!--  start with the first element -->
       <xsl:apply-templates select="child::node()[1]" mode="wrap"/>
    </xsl:template>
    
    <xsl:template match="node()[not(self::xhtml:p | self::xhtml:ol | self::xhtml:ul | self::xhtml:div[@align])]" mode="wrap">
        <!--  wrap everything until next block elem (bullet, p or div) with w:p -->
        <w:p xml:space="preserve">
            <xsl:for-each select=".|key('kGroupByFirst',generate-id())">
                <xsl:apply-templates select="."/>
            </xsl:for-each>
        </w:p>
        <!--  apply wrap template to next block sibling -->
        <xsl:apply-templates select="following-sibling::node()[self::xhtml:p | self::xhtml:ol | self::xhtml:ul | self::xhtml:div[@align]][1]" mode="wrap"/>
    </xsl:template>
    
    <!--  wrap template for block elements (create their own w:p elems) -->
    <xsl:template match="xhtml:p | xhtml:ol | xhtml:ul | xhtml:div[@align]" mode="wrap">
        <xsl:apply-templates select="."/>
        <!--  apply template to wrap next block element or group of non-block elements -->
        <xsl:apply-templates select="following-sibling::node()[1]" mode="wrap"/>
    </xsl:template>
    
	<!--  structural elements -->
	<xsl:template match="xhtml:p">
	   <!--  to make our mapping simpler, don't create w:p for paragraphs nested inside other elems -->
	   <xsl:choose>
	       <xsl:when test="parent::* = /div">
	           <w:p xml:space="preserve">
	               <xsl:apply-templates/>
	           </w:p>
	       </xsl:when>
	       <xsl:otherwise>
	           <w:r><w:br/></w:r><xsl:apply-templates/>
	       </xsl:otherwise>
	   </xsl:choose>
    </xsl:template>
    
    <xsl:template match="xhtml:br">
       <w:r><w:br/></w:r>
    </xsl:template>
    
    <xsl:template match="xhtml:ol/xhtml:li">
        <w:p>
        <w:pPr>
            <w:pStyle w:val="ListParagraph"/>
            <w:numPr>
	            <w:ilvl w:val="0" /> 
	            <w:numId w:val="5" /> 
            </w:numPr>
        </w:pPr>
        <w:r><xsl:apply-templates/></w:r>
        </w:p>
    </xsl:template>
    
    <xsl:template match="xhtml:ul/xhtml:li">
        <w:p>
        <w:pPr>
            <w:pStyle w:val="ListParagraph"/>
            <w:numPr>
                <w:ilvl w:val="0" /> 
                <w:numId w:val="4" /> 
            </w:numPr>
        </w:pPr>
        <w:r><xsl:apply-templates/></w:r>
        </w:p>
    </xsl:template>
    
    <!--  text content -->
    <xsl:template match="text()">
       <xsl:variable name="content">
           <w:t xml:space="preserve"><xsl:value-of select="."/></w:t>
       </xsl:variable>
       <xsl:choose>
           <xsl:when test="ancestor::xhtml:li | ancestor::xhtml:i | ancestor::xhtml:b | ancestor::xhtml:a | ancestor::xhtml:u | ancestor::xhtml:font[@color | @size]">
               <xsl:copy-of select="$content"/>
           </xsl:when>
           <xsl:otherwise>
               <!--  text elements that aren't already wrapped with something are wrapped with w:r -->
               <w:r><xsl:copy-of select="$content"/></w:r>
           </xsl:otherwise>
       </xsl:choose>
    </xsl:template>
    
    <!-- 
    Formatting elements
    We only map the following html elements
       bold (b)
       italic (i)
       underline (u)
       font (with color, size attrs)
       a
       img
       div (with align attr)
       blockquote (may be nested)
     -->
     
    <xsl:template match="xhtml:img">
       <xsl:variable name="content">
        <w:t> [Image: <xsl:value-of select="@src"/>] </w:t>
       </xsl:variable>
       <xsl:choose>
        <xsl:when test="ancestor::xhtml:li | ancestor::xhtml:i | ancestor::xhtml:b | ancestor::xhtml:a | ancestor::xhtml:u | ancestor::xhtml:font[@color | @size]">
            <xsl:copy-of select="$content"/>
        </xsl:when>
        <xsl:otherwise>
	        <w:r>
	           <xsl:copy-of select="$content"/>
	        </w:r>
        </xsl:otherwise>
       </xsl:choose>
    </xsl:template>
    
    <xsl:template match="xhtml:a">
        <xsl:variable name="content">
            <w:rPr><w:u/></w:rPr><xsl:apply-templates/><w:t> [Link: <xsl:value-of select="@href"/>] </w:t>
       </xsl:variable>
       <xsl:choose>
        <xsl:when test="ancestor::xhtml:li | ancestor::xhtml:i | ancestor::xhtml:b | ancestor::xhtml:a | ancestor::xhtml:u | ancestor::xhtml:font[@color | @size]">
            <xsl:copy-of select="$content"/>
        </xsl:when>
        <xsl:otherwise>
            <w:r>
               <xsl:copy-of select="$content"/>
            </w:r>
        </xsl:otherwise>
       </xsl:choose>
    </xsl:template>
    
	<xsl:template match="xhtml:*[local-name() = 'b' or local-name()='i' or local-name() ='u'][ancestor::xhtml:li | ancestor::xhtml:u | ancestor::xhtml:i |ancestor::xhtml:b | ancestor::xhtml:a | ancestor::xhtml:font[@color | @size]]">
	   <!--  already wrapped with w:r by template applied to ancestor -->
	   <w:rPr>
		   <xsl:choose>
		       <xsl:when test="local-name() = 'b'">
		           <w:b/>
		       </xsl:when>
		       <xsl:when test="local-name() = 'i'">
		           <w:i/>
		       </xsl:when>
		       <xsl:when test="local-name() = 'u'">
		          <w:u/>
		       </xsl:when>
		   </xsl:choose>
	   </w:rPr>
	   <xsl:apply-templates/>
	</xsl:template>

	<xsl:template match="xhtml:*[local-name()='b' or local-name()='i' or local-name() = 'u'][not(ancestor::xhtml:li | ancestor::xhtml:u | ancestor::xhtml:i |ancestor::xhtml:b | ancestor::xhtml:a | ancestor::xhtml:font[@color | @size])]">
	   <w:r><w:rPr>
	   <xsl:choose>
           <xsl:when test="local-name() = 'b'">
               <w:b/>
           </xsl:when>
           <xsl:when test="local-name() = 'i'">
               <w:i/>
           </xsl:when>
           <xsl:when test="local-name() = 'u'">
                <w:u/>
           </xsl:when>
       </xsl:choose>
	   </w:rPr><xsl:apply-templates/></w:r>
	</xsl:template>
	
	<xsl:template match="xhtml:font[@color]">
	   <xsl:variable name="content">
            <w:rPr><w:color w:val="{@color}"/></w:rPr><xsl:apply-templates/>
       </xsl:variable>
       <xsl:choose>
        <xsl:when test="ancestor::xhtml:li | ancestor::xhtml:i | ancestor::xhtml:b | ancestor::xhtml:a | ancestor::xhtml:u | ancestor::xhtml:font[@color | @size]">
            <xsl:copy-of select="$content"/>
        </xsl:when>
        <xsl:otherwise>
            <w:r>
               <xsl:copy-of select="$content"/>
            </w:r>
        </xsl:otherwise>
       </xsl:choose>
	</xsl:template>
	
	<xsl:template match="xhtml:font[@size]">
	   <xsl:variable name="content">
            <w:rPr><w:sz w:val="{@size * 10}"/></w:rPr><xsl:apply-templates/>
       </xsl:variable>
       <xsl:choose>
        <xsl:when test="ancestor::xhtml:li | ancestor::xhtml:i | ancestor::xhtml:b | ancestor::xhtml:a | ancestor::xhtml:u | ancestor::xhtml:font[@color | @size]">
            <xsl:copy-of select="$content"/>
        </xsl:when>
        <xsl:otherwise>
            <w:r>
               <xsl:copy-of select="$content"/>
            </w:r>
        </xsl:otherwise>
       </xsl:choose>
	</xsl:template>
	
	<!--  avoid redundant markup -->
	<xsl:template match="xhtml:b[ancestor::xhtml:b]">
       <!--  don't create another b style -->
       <xsl:apply-templates/>
    </xsl:template>
    <xsl:template match="xhtml:i[ancestor::xhtml:i]">
       <!--  don't create another i style -->
       <xsl:apply-templates/>
    </xsl:template>
    <xsl:template match="xhtml:u[ancestor::xhtml:u]">
        <xsl:apply-templates/>
    </xsl:template>

	
</xsl:stylesheet>