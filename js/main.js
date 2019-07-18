//Make sure that the tampermonkey jQuery does not tamper with F5's scripts
this.$ = this.jQuery = jQuery.noConflict(true);

//Declare global ajax queue limit
var tamperDataGroupLists = new Array();
var detectedarr = [];

var poolStatuses;

var logDatabase;



var enhancementFunctions = {

   "enhanceiRuleProperties": new function(){

       // Scans for data group lists in an iRule and adds data group lists on the side
       this.name = "Improve iRule editor";
       this.description = `<ul>
                               <li>Scans iRule for data group lists</li>
                               <li>Adds detected data group lists to the right side of the iRule editor</li>
                               <li>Hovering the mouse over an iRule shows the data group list content</li>
                           </ul>`;
       this.enabled = true;
       this.appliesToVersion = ["12", "13", "14"];
       this.applicable = function(){
           return uriContains("/tmui/Control/jspmap/tmui/locallb/rule/properties.jsp")
           && this.appliesToVersion.indexOf(majorVersion) != -1
           && this.enabled;
       };
       this.enhance = improveiRuleProperties;

   },
   "improveiRuleSelection": new function(){

       this.name = "Improve virtual server iRules management";
       this.description = `<ul>
                               <li>Increases the selection box</li>
                               <li>Adds double click to move between sections.</li>
                           </ul>`;
       this.enabled = true;
       this.appliesToVersion = ["12", "13", "14"];
       this.applicable = function(){
           return uriContains("/tmui/Control/form?__handler=/tmui/locallb/virtual_server/resources&__source=Manage")
               && this.appliesToVersion.indexOf(majorVersion) != -1
               && this.enabled;
       };
       this.enhance = improveiRuleSelection;

   },
   "addHTTPMonitorSuffix": new function(){

       this.name = "Adds HTTP monitor suffix to pool names";
       this.description = `<ul>
                               <li>Adds monitor prefixes when creating pools</li>
                           </ul>`;
       this.enabled = true;
       this.appliesToVersion = ["12", "13", "14"];
       this.applicable = function(){
           return $("select[name=mon_type]").length > 0
               && this.appliesToVersion.indexOf(majorVersion) != -1
               && this.enabled;
       };

       this.enhance = addHTTPMonitorSuffix;
   },
   "makeCurrentPartitionObjectsBold": new function(){

       this.name = "Make current partition objects bold";
       this.description = `<ul>
                               <li>Adds monitor prefixes</li>
                           </ul>`;
       this.enabled = true;
       this.appliesToVersion = ["12", "13", "14"];

       this.applicable = function(){
           return uriContains('/list.jsp')
               && this.appliesToVersion.indexOf(majorVersion) != -1
               && this.enabled;
       };

       this.enhance = makeCurrentPartitionObjectsBold;
   },
   "improvePoolProperties": new function(){

       this.name = "Enhance the pool properties page";
       this.description = `<ul>
                               <li>Makes monitor selection bigger</li>
                               <li>Adds double click functionality</li>
                           </ul>`;
       this.enabled = true;
       this.appliesToVersion = ["12", "13", "14"];

       this.applicable = function(){
           return uriContains("/tmui/Control/jspmap/tmui/locallb/pool/properties.jsp?name")
               && this.appliesToVersion.indexOf(majorVersion) != -1
               && this.enabled;
       };

       this.enhance = improvePoolProperties;
   },
   "improvePoolCreation": new function(){

       this.name = "Enhance the pool creation page";
       this.description = `<ul>
                               <li>Makes monitor selection bigger</li>
                               <li>Adds double click functionality</li>
                           </ul>`;
       this.enabled = true;
       this.appliesToVersion = ["12", "13", "14"];

       this.applicable = function(){
           return uriContains("/tmui/Control/jspmap/tmui/locallb/pool/create.jsp")
               && this.appliesToVersion.indexOf(majorVersion) != -1
               && this.enabled;
       };

       this.enhance = improvePoolCreation;
   },
   "improvePoolMemberProperties": new function(){

       this.name = "Enhance the pool member properties page";
       this.description = `<ul>
                               <li>Adds monitor tests for HTTP monitors</li>
                           </ul>`;
       this.enabled = true;
       this.appliesToVersion = ["12", "13", "14"];

       this.applicable = function(){
           return uriContains("/tmui/Control/jspmap/tmui/locallb/pool/member/properties.jsp")
               && this.appliesToVersion.indexOf(majorVersion) != -1
               && this.enabled;
       };

       this.enhance = improvePoolMemberProperties;
   },
   "improveCertKeyChainSelection": new function(){

       this.name = "Client SSL Profile enhancements";
       this.description = `<ul>
                               <li>Automatically selects certificate and keys matching the name of the client SSL profile</li>
                               <li>Selects a default chain certificate according to the script configuration</li>
                           </ul>`;
       this.enabled = true;
       this.appliesToVersion = ["12", "13", "14"];

       this.applicable = function(){
           return $('input[name="cert_key_chain_override"]').length > 0
               && this.appliesToVersion.indexOf(majorVersion) != -1
               && this.enabled;
       };

       this.enhance = improveCertKeyChainSelection;

   },
   "improveVirtualServerResources": new function(){

       this.name = "Improve Virtual Server resource tab";
       this.description = `<ul>
                               <li>Adds a shortcut to the configured default pool</li>
                           </ul>`;
       this.enabled = true;
       this.appliesToVersion = ["12", "13", "14"];

       this.applicable = function(){
           return uriContains("/tmui/Control/jspmap/tmui/locallb/virtual_server/resources.jsp")
               && this.appliesToVersion.indexOf(majorVersion) != -1
               && this.enabled;
       };

       this.enhance = improveVirtualServerResources;

   },
   "improveVirtualServerProperties": new function(){

       this.name = "Improve Virtual Server properties page";
       this.description = `<ul>
                               <li>Double click to the multiple selection lists</li>
                           </ul>`;
       this.enabled = true;
       this.appliesToVersion = ["12", "13", "14"];

       this.applicable = function(){
           return uriContains("/tmui/Control/jspmap/tmui/locallb/virtual_server/properties.jsp")
               && this.appliesToVersion.indexOf(majorVersion) != -1
               && this.enabled;
       };

       this.enhance = improveVirtualServerProperties;

   },
   "improveDataGroupListProperties": new function(){

       this.name = "Data group list editing safe guards";
       this.description = `<ul>
                               <li>Disabled the update button while the key/value fields contains values not in the list to protect from accidentally removing something by mistake.</li>
                           </ul>`;
       this.enabled = true;
       this.appliesToVersion = ["12", "13", "14"];

       this.applicable = function(){
           return uriContains("/tmui/Control/jspmap/tmui/locallb/datagroup/properties.jsp")
               && this.appliesToVersion.indexOf(majorVersion) != -1
               && this.enabled;
       };

       this.enhance = improveDataGroupListProperties;

   },
   "improveDataGroupListEditing": new function(){

       this.name = "Add data group list editing features";
       this.description = `<ul>
                               <li>Adds the possibility to free-text edit, import, export and merge lists.</li>
                           </ul>`;
       this.enabled = true;
       this.appliesToVersion = ["12", "13", "14"];

       this.applicable = function(){
           return (uriContains("/tmui/Control/jspmap/tmui/locallb/datagroup/properties.jsp")
               || uriContains("/tmui/Control/jspmap/tmui/locallb/datagroup/create.jsp"))
               && this.appliesToVersion.indexOf(majorVersion) != -1
               && this.enabled;
       };

       this.enhance = improveDataGroupListEditing;

   },
   "improveClientSSLProfileCreation": new function(){

       this.name = "Improves the client SSL profile creation";
       this.description = `<ul>
                               <li>Automatically selects a parent profile according to the script configuration</li>
                           </ul>`;
       this.enabled = true;
       this.appliesToVersion = ["12", "13", "14"];

       this.applicable = function(){
           return uriContains("/tmui/Control/jspmap/tmui/locallb/profile/clientssl/create.jsp")
               && this.appliesToVersion.indexOf(majorVersion) != -1
               && this.enabled;
       };

       this.enhance = improveClientSSLProfileCreation;

   },
   "improvePoolList": new function(){

       this.name = "Improves the pool list";
       this.description = `<ul>
                               <li>Gives more granular pool state symbols</li>
                               <li>Hovering the mouse of the state symbol shows the members and their states</li>
                           </ul>
                               <font color="red">Warning: On <i>very</i> large configurations (~2000 pools) this <i><b>can</b></i> be detrimental to the HTTPD process.
                               <b>This is not a risk for the application delivery itself</b>, but <i>may</i> cause the process to be restarted.</font>`;
       this.enabled = true;
       this.appliesToVersion = ["12", "13", "14"];

       this.applicable = function(){
           return uriContains("/tmui/Control/jspmap/tmui/locallb/pool/list.jsp")
               && this.appliesToVersion.indexOf(majorVersion) != -1
               && this.enabled;
       };

       this.enhance = improvePoolList;

   },
   "addPartitionFilter": new function(){

       this.name = "Partition filter";
       this.description = `<ul>
                               <li>Adds a free text partition filter to ease partition selection</li>
                           </ul>`
       this.enabled = true;
       this.appliesToVersion = ["12", "13", "14"];

       this.applicable = function(){
           return $(parent.top.document).find("input#partitionFilter").length == 0
               && this.appliesToVersion.indexOf(majorVersion) != -1
               && this.enabled;
       };

       this.enhance = addPartitionFilter;

   },
   "addChristmasTheme": new function(){

       this.name = "Christmas theme";
       this.description = `<ul>
                               <li>Allows the user to enable/disable christmas theme during december</li>
                           </ul>`
       this.enabled = true;
       this.appliesToVersion = ["12", "13", "14"];

       this.applicable = function(){
           return isItChristmas()
               && allowChristmas
               && this.appliesToVersion.indexOf(majorVersion) != -1
               && this.enabled;
       };

       this.enhance = showChristmasOption;

   },
   "addCSRDropDownMenu": new function(){

       this.name = "CSR profiles";
       this.description = `<ul>
                               <li>Adds a drop down menu with predefined CSR options</li>
                           </ul>`;
       this.enabled = true;
       this.appliesToVersion = ["12", "13", "14"];

       this.applicable = function(){
           return uriContains("/tmui/Control/jspmap/tmui/locallb/ssl_certificate/create.jsp")
               && this.appliesToVersion.indexOf(majorVersion) != -1
               && this.enabled;
       };

       this.enhance = addCSRDropDownMenu;

   }, "addLTMLogSummary": new function(){
       this.name = "LTM log features";
       this.description = `<ul>
                               <li>Adds information from the LTM log to the top bar</li>
                               <li>Shows pool failures in the pool list</li>
                           </ul>`;
       this.enabled = true;
       this.appliesToVersion = ["12", "13", "14"];

       this.applicable = function(){
           return uriContains("/tmui/Control/jspmap/tmui/overview/welcome/introduction.jsp")
               && this.appliesToVersion.indexOf(majorVersion) != -1
               && this.enabled;
       };

       this.enhance = startLTMLogFetcher;
   }

}

var majorVersion = null;


console.log("Waiting for version info");
waitForStorageKey('majorVersion').then(async () => {
    
    let version = await getStorage('majorVersion')
    
    console.log("Got version info.");
    majorVersion = version.majorVersion;

    initiateBaloon();

    for(var i in enhancementFunctions){
    
        var f = enhancementFunctions[i];
        if(f.applicable()){
            f.enhance();
        }

    }

})

