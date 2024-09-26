/*
 * Programming notes JavaScript
 * @version: 3
 * @Created: 4 June 26022
 * @author:  Chua Hock Chuan
 * 
 * Revision Notes:
 */
$( function() {
   /*
    * Load Header onto <div id="header"></div>
    */
   $("#header").html('<p>yet another insignificant programming notes... &nbsp;&nbsp;| &nbsp;&nbsp;<a href="../index.html">HOME</a></p>')
   
   /*
    * Load Footer onto <div id="footer"></div>
    */
   $("#footer").html('<p>Feedback, comments, corrections, and errata can be sent to Chua Hock-Chuan (ehchua@ntu.edu.sg) &nbsp;&nbsp;|&nbsp;&nbsp; <a href="../index.html">HOME</a></p>')
   
   /*
    * Generate Table of Content onto <div id="toc"></div>
    */
   generateTOC()

   /*
    * Toggle TOC display via via <a id="show-toc">(Hide)</a>
    */
   $("#show-toc").on('click', function(event) {
      event.preventDefault()
      $("#toc").toggle()
      if ($(this).text() === '(Hide)') {
         $(this).text('(Show)')
      } else {
         $(this).text('(Hide)')
      }
   })
	
})
   
/*
 * Generate TOC based on <h3> and <h4>:
 * - prepend section number "x." or "x.y"
 * - append an anchor point <a id="zz-x.y"></a> to the header
 * - add an entry with link to <div id="toc">
 *   <a class='toc-h3|h4' href='#zz-x.y'>heading text</a><br>"
 */
const ANCHOR_PREFIX = "zz-"
const SECTION_HEADER = "h3"
const SUB_SECTION_HEADER = "h4"

function generateTOC() {
   let currentSection    = 0  // current section number counter
   let currentSubSection = 0  // current sub-section number counter
   let headingID
   let headingText
   
   // Process the sections and sub-sections
   $(SECTION_HEADER + ',' + SUB_SECTION_HEADER).each( function() {

      if ($(this).prop("tagName").toLowerCase() === SECTION_HEADER.toLowerCase() ) {
         // Process sections
         ++currentSection
         currentSubSection = 0 // reset sub-section number

         // Add section number
         $(this).prepend(currentSection + ".&nbsp;&nbsp;")
         // Add anchor point
         headingID = ANCHOR_PREFIX + currentSection
         headingText = $(this).html()
         $(this).append('<a id="' + headingID + '"></a>')
         // Append to TOC
         $('#toc').append("<a class='toc-" + SECTION_HEADER 
               + "' href='#" + headingID + "'>" + headingText + "</a><br>")
         
      } else {
         // Process sub-sections
         ++currentSubSection
         
         // Add section.sub-section number
         $(this).prepend(currentSection + "." + currentSubSection + "&nbsp;&nbsp;")
         // Add anchor point
         headingID = ANCHOR_PREFIX + currentSection + "." + currentSubSection
         headingText = $(this).html()
         $(this).append('<a id="' + headingID + '"></a>')
         // Append to TOC
         $('#toc').append("<a class='toc-" + SUB_SECTION_HEADER 
               + "' href='#" + headingID + "'>" + headingText + "</a><br>")
      }
   })
   $('#toc').append('<br>')
}
