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

    <!-- 
    We only map the following html elements
      inline (map to text runs - w:r):
       bold (b)
       italic (i)
       underline (u)
       font (with color, size attrs)
       a
       img
       br
      block (map to paragraphs - w:p):
       p
       ol, ul
       div (with align attr)
       blockquote
     -->
	<xsl:output method="xml" indent="yes"/>
	
	<!--  key used to group non-block elements - lookup by first element in group -->
	<xsl:key name="kGroupByFirst"
             match="child::node()[not(self::xhtml:p | self::xhtml:ol | self::xhtml:ul | self::xhtml:div[@align] | self::xhtml:blockquote)][preceding-sibling::node()[1][not(self::xhtml:p | self::xhtml:ol | self::xhtml:ul | self::xhtml:div[@align] | self::xhtml:blockquote)]]"
             use="generate-id(preceding-sibling::node()[not(self::xhtml:p | self::xhtml:ol | self::xhtml:ul | self::xhtml:div[@align] | self::xhtml:blockquote)]
                               [not(preceding-sibling::node()[1][not(self::xhtml:p | self::xhtml:ol | self::xhtml:ul | self::xhtml:div[@align] | self::xhtml:blockquote)])][1])"/>
	
	<!--  Entry point: always wrap html content in div element before passing to template -->
	<xsl:template match="/div">
	   <!--  make sure all elements are wrapped in paragraphs, starting with the first element -->
       <xsl:apply-templates select="child::node()[1]" mode="wrap"/>
    </xsl:template>
    
    <xsl:template match="node()[not(self::xhtml:p | self::xhtml:ol | self::xhtml:ul | self::xhtml:div[@align] | self::xhtml:blockquote)]" mode="wrap">
        <!--  wrap inline elements until next block elem with w:p -->
        <w:p xml:space="preserve">
            <xsl:for-each select=".|key('kGroupByFirst',generate-id())">
                <xsl:apply-templates select="."/>
            </xsl:for-each>
        </w:p>
        <!--  apply wrap template to next block sibling -->
        <xsl:apply-templates select="following-sibling::node()[self::xhtml:p | self::xhtml:ol | self::xhtml:ul | self::xhtml:div[@align] | self::xhtml:blockquote][1]" mode="wrap"/>
    </xsl:template>
    
    
    <xsl:template match="xhtml:p | xhtml:ol | xhtml:ul | xhtml:div[@align] | xhtml:blockquote" mode="wrap">
        <!--  don't wrap block elements with paragraph (their templates create w:p elems) -->
        <xsl:apply-templates select="."/>
        <!--  apply template to wrap next block element or group of non-block elements -->
        <xsl:apply-templates select="following-sibling::node()[1]" mode="wrap"/>
    </xsl:template>
    
	<!--  structural elements (p, blockquote, div, ul, ol) -->
	<xsl:template match="xhtml:p">
	   <!--  to make our mapping simpler, we only create w:p elems from top level elements -->
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

    <xsl:template match="xhtml:blockquote">
        <!--  to keep mapping simple, only indent top level blockquotes -->
        <xsl:choose>
            <xsl:when test="parent::node() = /div">
                <w:p xml:space="preserve">
                    <w:pPr>
			          <w:ind w:left="720" /> 
			        </w:pPr>
			        <xsl:apply-templates/>
                </w:p>
            </xsl:when>
            <xsl:otherwise>
                <xsl:apply-templates/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template match="xhtml:div[@align]">
        <!--  to keep mapping simple, only indent top level divs -->
        <xsl:choose>
            <xsl:when test="parent::node() = /div">
                <w:p xml:space="preserve">
                    <w:pPr>
                      <w:jc w:val="{@align}" />  
                    </w:pPr>
                    <xsl:apply-templates/>
                </w:p>
            </xsl:when>
            <xsl:otherwise>
                <xsl:apply-templates/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template match="xhtml:ol/xhtml:li">
        <!--  to make our mapping simpler, we only create w:p elems from top level elements -->
        <xsl:choose>
            <xsl:when test="parent::ol/parent::node() = /div">
                <w:p xml:space="preserve">
                <w:pPr>
                    <w:pStyle w:val="ListParagraph"/>
                    <w:numPr>
                        <w:ilvl w:val="0" /> 
                        <!--  FIXME: each list should reference new id from numbering.xml, no numbering at present -->
                        <w:numId w:val="1" /> 
                    </w:numPr>
                </w:pPr>
                <xsl:apply-templates/>
                </w:p>
            </xsl:when>
            <xsl:otherwise>
               <xsl:apply-templates/>
            </xsl:otherwise>
        </xsl:choose>
        
    </xsl:template>
    
    <xsl:template match="xhtml:ul/xhtml:li">
        <!--  to make our mapping simpler, we only create w:p elems from top level elements -->
        <xsl:choose>
            <xsl:when test="parent::ul/parent::node() = /div">
	            <w:p xml:space="preserve">
		        <w:pPr>
		            <w:pStyle w:val="ListParagraph"/>
		            <w:numPr>
		                <w:ilvl w:val="0" /> 
		                <w:numId w:val="1" /> <!--  FIXME -->
		            </w:numPr>
		        </w:pPr>
		        <xsl:apply-templates/>
		        </w:p>
            </xsl:when>
            <xsl:otherwise>
               <xsl:apply-templates/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <!--  terminal content: br, text, image -->
    <xsl:template match="xhtml:br">
        <!--  reduce br clutter -->
        <xsl:if test="not(preceding-sibling::node()[1][local-name()='br'] and following-sibling::node()[1][local-name()='br'])">
            <w:r><w:br/></w:r>
       </xsl:if>
    </xsl:template>
    
    <xsl:template match="text()">
       <xsl:variable name="content">
           <w:t xml:space="preserve"><xsl:value-of select="."/></w:t>
       </xsl:variable>
       <xsl:choose>
           <xsl:when test="ancestor::xhtml:i | ancestor::xhtml:b | ancestor::xhtml:a | ancestor::xhtml:u | ancestor::xhtml:font[@color | @size]">
               <xsl:copy-of select="$content"/>
           </xsl:when>
           <xsl:otherwise>
               <!--  text elements that aren't already wrapped by inline elements are wrapped by text run (w:r) elem -->
               <w:r><xsl:copy-of select="$content"/></w:r>
           </xsl:otherwise>
       </xsl:choose>
    </xsl:template>
    
    <xsl:template match="xhtml:img">
       <xsl:variable name="content">
        <w:rPr><w:u w:val="single"/></w:rPr>
        <w:t xml:space="preserve"> [Image: <xsl:value-of select="@src"/>] </w:t>
       </xsl:variable>
       <xsl:choose>
        <xsl:when test="ancestor::xhtml:i | ancestor::xhtml:b | ancestor::xhtml:a | ancestor::xhtml:u | ancestor::xhtml:font[@color | @size]">
            <xsl:copy-of select="$content"/>
        </xsl:when>
        <xsl:otherwise>
	        <w:r>
	           <xsl:copy-of select="$content"/>
	        </w:r>
        </xsl:otherwise>
       </xsl:choose>
    </xsl:template>
    
    <!--  Inline style elements a, i, b, u, font -->
    <xsl:template match="xhtml:a">
        <xsl:variable name="content">
            <w:rPr><w:u w:val="single"/></w:rPr><xsl:apply-templates/><w:t xml:space="preserve"> [Link: <xsl:value-of select="@href"/>] </w:t>
       </xsl:variable>
       <xsl:choose>
        <xsl:when test="ancestor::xhtml:i | ancestor::xhtml:b | ancestor::xhtml:a | ancestor::xhtml:u | ancestor::xhtml:font[@color | @size]">
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
        <xsl:when test="ancestor::xhtml:i | ancestor::xhtml:b | ancestor::xhtml:a | ancestor::xhtml:u | ancestor::xhtml:font[@color | @size]">
            <xsl:copy-of select="$content"/>
        </xsl:when>
        <xsl:otherwise>
            <w:r>
               <xsl:copy-of select="$content"/>
            </w:r>
        </xsl:otherwise>
       </xsl:choose>
    </xsl:template>
    
    <xsl:template match="xhtml:font[@color]">
       <xsl:variable name="content">
            <w:rPr><w:color w:val="{@color}"/></w:rPr><xsl:apply-templates/>
       </xsl:variable>
       <xsl:choose>
        <xsl:when test="ancestor::xhtml:i | ancestor::xhtml:b | ancestor::xhtml:a | ancestor::xhtml:u | ancestor::xhtml:font[@color | @size]">
            <xsl:copy-of select="$content"/>
        </xsl:when>
        <xsl:otherwise>
            <w:r>
               <xsl:copy-of select="$content"/>
            </w:r>
        </xsl:otherwise>
       </xsl:choose>
    </xsl:template>
    
	<xsl:template match="xhtml:*[local-name() = 'b' or local-name()='i' or local-name() ='u'][ancestor::xhtml:i |ancestor::xhtml:b | ancestor::xhtml:a | ancestor::xhtml:u | ancestor::xhtml:font[@color | @size]]">
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
		          <w:u w:val="single"/>
		       </xsl:when>
		   </xsl:choose>
	   </w:rPr>
	   <xsl:apply-templates/>
	</xsl:template>

	<xsl:template match="xhtml:*[local-name()='b' or local-name()='i' or local-name() = 'u'][not(ancestor::xhtml:u | ancestor::xhtml:i |ancestor::xhtml:b | ancestor::xhtml:a | ancestor::xhtml:font[@color | @size])]">
	   <w:r>
		   <w:rPr>
			   <xsl:choose>
		           <xsl:when test="local-name() = 'b'">
		               <w:b/>
		           </xsl:when>
		           <xsl:when test="local-name() = 'i'">
		               <w:i/>
		           </xsl:when>
		           <xsl:when test="local-name() = 'u'">
		                <w:u w:val="single"/>
		           </xsl:when>
		       </xsl:choose>
		   </w:rPr>
		   <xsl:apply-templates/>
	   </w:r>
	</xsl:template>
	
	<!--  avoid redundant styles -->
	<xsl:template match="xhtml:b[ancestor::xhtml:b]" priority="1">
       <!--  don't create another b style -->
       <xsl:apply-templates/>
    </xsl:template>
    <xsl:template match="xhtml:i[ancestor::xhtml:i]" priority="1">
       <!--  don't create another i style -->
       <xsl:apply-templates/>
    </xsl:template>
    <xsl:template match="xhtml:u[ancestor::xhtml:u]" priority="1">
        <!--  don't create another u style -->
        <xsl:apply-templates/>
    </xsl:template>

	
</xsl:stylesheet>