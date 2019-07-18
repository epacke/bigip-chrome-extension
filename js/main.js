//Make sure that the tampermonkey jQuery does not tamper with F5's scripts
this.$ = this.jQuery = jQuery.noConflict(true);

//Declare global ajax queue limit
var tamperDataGroupLists = new Array();
var detectedarr = [];

var poolStatuses;

var logDatabase;

var ltmLogPatterns = {
   "poolFailures": new function(){
       this.enabled = true;
       this.name = "Pool failures";
       this.isMatching = function(event){
           return(event.logEvent.match(/^Pool.+monitor status down/) !== null);
       }
   },
   "nodeFailures": new function(){
       this.enabled = true;
       this.name = "Node failures";
       this.isMatching = function(event){
           return(event.logEvent.match(/^Node.+monitor status down/) !== null);
       }
   },
   "errors": new function(){
       this.enabled = true;
       this.name = "Errors";
       this.isMatching = function(event){
           return(event.logLevel === "error");
       }
   },
   "warnings": new function(){
       this.enabled = true;
       this.name = "Warnings";
       this.isMatching = function(event){
           return(event.logLevel === "warning");
       }
   },
   "tclErrors": new function(){
       this.enabled = true;
       this.name = "TCL Errors";
       this.isMatching = function(event){
           return(event.logEvent.match(/^TCL error/) !== null);
       }
   },
   "aggressiveMode": new function(){
       this.enabled = true;
       this.name = "Aggressive Mode"
       this.isMatching = function(event){
           return(event.logEvent.match(/aggressive mode activated/) !== null);
       }
   },
   "addressConflicts": new function(){
       this.enabled = true;
       this.name = "Address Conflicts"
       this.isMatching = function(event){
           return(event.logEvent.match(/address conflict detected for/) !== null);
       }
   }
}


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
       this.enabled = false;
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

waitForStorageKey('majorVersion').then(async () => {
    
    let version = await getStorage('majorVersion')

    
    majorVersion = version.majorVersion;

    initiateBaloon();

    for(var i in enhancementFunctions){
    
    var f = enhancementFunctions[i];
    if(f.applicable()){
        f.enhance();
    }

    }

})


/**************************************************************************
*
*                  Modify the top frame
*
**************************************************************************/

String.prototype.hashCode = function(){
   var hash = 0;
   if (this.length == 0) return hash;
   for (var i = 0; i < this.length; i++) {
       var char = this.charCodeAt(i);
       hash = ((hash<<5)-hash)+char;
       hash = hash & hash; // Convert to 32bit integer
   }
   return hash;
}




function addPartitionFilter(){

   initiateBaloon();

   var partitionDiv = $(parent.top.document).find("div#partition");

   // Add the filter input and the label
   partitionDiv.prepend("<input size=10 id=\"partitionFilter\"/>  ")
   partitionDiv.prepend("<label>Partition filter <a title=\"Hit enter to activate the selected partition\" id=\"partitionFilterHelp\" href=\"https://loadbalancing.se/f5-webui-tweaks/#Partition_filtering\" target=\"_blank\">[?]</a>: </label>");

   var partitionDropDown = partitionDiv.find("select#partition_control");
   var partitonOptions = partitionDropDown.find("option");
   var partitionFilterInput = partitionDiv.find("input#partitionFilter");

   partitionFilterInput.on("keyup", function(e){

       if(e.keyCode === 13){
           triggerEvent("change", parent.top.document.querySelector("div#partition select#partition_control"))
           return;
       }

       var searchValue = this.value;

       // Set the local storage in order to re-populate the filter upon page reload
       localStorage.setItem("tamperMonkey-PartitionFilter", searchValue);

       var re = new RegExp(searchValue, "i");

       partitonOptions.each(function(){
           if($(this).val().match(re) || $(this).val() === "[All]"){
               $(this).attr("ismatch", "true")
               $(this).show();
           } else {
               $(this).attr("ismatch", "false")
               $(this).hide();
           }
       });

       var selectedOption = partitionDropDown.find("option:selected");
       var selectedOptionValue = selectedOption.val() || ""
       var matchedCount = partitionDropDown.find("option[ismatch='true']").length;

       if(!selectedOptionValue.match(re) && matchedCount > 0){
           selectedOption.removeAttr("selected");
           partitionDropDown.find("option[ismatch='true']:eq(0)").attr("selected", "selected");
       }

   })

   partitionFilterInput.val(localStorage.getItem("tamperMonkey-PartitionFilter") || "").trigger("keyup");

}


/**************************************************************************
*
*                              iRule improvements
*
**************************************************************************/

function improveiRuleProperties(){

   // Show the data group lists used in an iRule
   cacheDataGroupLists(function(dataGroupLists){

       //This part prepares the iRule definition table for the data group lists (adds a third column)
       $("table#general_table thead tr.tablehead td").attr("colspan", 3);
       $("table#general_table tr").not("#definition_ace_row").each(function(){
           $(this).find("td").eq(1).attr("colspan", 2);
       });

       $("tr#definition_ace_row").append("<td id=\"dglist\" class=\"settings\"></td>").css({
           "vertical-align": "top"
       });

       $("tr#definition_ace_row td.settings").css("width","80%");

       //This command generates the data group lists (if any)
       getDataGroupListsFromRule($("textarea#rule_definition").val());
       //getDataGroupListsFromRuleOld($("textarea#rule_definition").val());
       //Update the list on every key stroke
       $(document).on("keyup", function(){

           var iRuleContent = codeEditor.gSettings.editor.container.env.document.doc.$lines.join("\n");
           getDataGroupListsFromRule(iRuleContent);
           //getDataGroupListsFromRuleOld($("textarea#rule_definition").val());

       });

   });

}

// Caches a list of all the data group lists available in Common and the current partition (if any)
function cacheDataGroupLists(updateDGPage){

   var DataGroupListLink = "https://" + window.location.host + "/tmui/Control/jspmap/tmui/locallb/datagroup/list.jsp";

   // We want to get all data group lists in case there is a direct reference
   var currentPartition = getCookie("F5_CURRENT_PARTITION");
   replaceCookie("F5_CURRENT_PARTITION", "\"[All]\"");

   //Request the iRule page to see if the instance exists or not
   $.ajax({
       url: DataGroupListLink,
       type: "GET",
       success: function(response) {

           var dataGroupListLinks = $(response).find('table.list tbody#list_body tr td:nth-child(3) a');

           for(var i = 0; i < dataGroupListLinks.length; i++){

               var link = dataGroupListLinks[i].href;
               var name = link.split("name=")[1];

               tamperDataGroupLists.push(name);

           }

           replaceCookie("F5_CURRENT_PARTITION", currentPartition);

           updateDGPage();
       }
   });

}

//Parses data group list html to get the key/value pairs for the hover information

function parseDataGroupValues(dg, showBalloon){

   var dgLink = 'https://' + window.location.host + '/tmui/Control/jspmap/tmui/locallb/datagroup/properties.jsp?name=' + dg;
   var html;

   $.ajax({
       url: dgLink,
       type: "GET",
       success: function(htmlresponse) {
           var matches = htmlresponse.match(/<option value="[^"]+(\\x0a)?.+?" >/g);

           //Set the header
           html = '<span style="color:blue">Key</span> = <span style="color:red">Value</span>'

           if(matches){
               for(var i=0; i < matches.length; i++){
                   var match = matches[i].replace('<option value="', '').replace('" >', '')
                   var matcharr = match.split('\\x0a')

                   if(matcharr.length == 2){
                       html += '<br><span style="color:blue">' + matcharr[0] + '</span> = <span style="color:red">' + matcharr[1] + '</span>';
                   } else {
                       html += '<br><span style="color:blue">' + matcharr[0] + '</span> = <span style="color:red">""</span>';
                   }
               }
           } else {
               html += "<br><span style=\"color:blue\">Empty data group list</span>";
           }

           //Show the balloon using the callback function
           showBalloon(html);
       },
       async: false
   });

   return html;

}

function getDataGroupListsFromRule(str){

   "use strict"

   let lines = str.split("\n");
   let partitionPrefix = "/" + getCookie("F5_CURRENT_PARTITION") + "/";

   let foundDataGroupLists = {};

   let updateDGObject = function(dg){
       let partition = dg.split("/")[1];
       let name = dg.split("/")[2];
       if(!(partition in foundDataGroupLists)){
           foundDataGroupLists[partition] = new Array();
       }
       foundDataGroupLists[partition].push(name);
   };

   for(var i = 0; i < lines.length; i++){

       // Skip lines that start with a comment
       if((lines[i].match(/^\s*#/))){
           continue;
       }

       if(lines[i].indexOf("class ") > -1){

           let words = lines[i].split(/[\s\[\]]/);
           let classIndex = words.indexOf("class");

           words.map(function(word, index){

               if(index < classIndex){
                   return;
               }

               if(word !== ""){
                   if(tamperDataGroupLists.indexOf(word) > -1){
                       updateDGObject(word);
                   } else if(tamperDataGroupLists.indexOf(partitionPrefix + word) > -1){
                       updateDGObject(partitionPrefix + word);
                   } else if(tamperDataGroupLists.indexOf("/Common/" + word) > -1){
                       updateDGObject("/Common/" + word);
                   }
               }

           });
       }

   }

   let html = "<div id=\"dglabel\"><span style=\"font-weight:bold\">Detected Data group lists:</span><hr>";

   if (Object.keys(foundDataGroupLists).length === 0 && foundDataGroupLists.constructor === Object){
       html += "None";
   } else {
       for(var partition in foundDataGroupLists){

           let list = foundDataGroupLists[partition];

           html += `
               <div style="padding-bottom:5px;">
                   <span style="font-weight:bold;">/` + partition + `:</span>`;

           for(let i = 0; i < list.length; i++){

               let fullPath = "/" + partition + "/" + list[i];

               html += `
                   <br>
                   <a href="https://` + window.location.host + `/tmui/Control/jspmap/tmui/locallb/datagroup/properties.jsp?name=` + fullPath + `" data-name="` + fullPath + `">` + list[i] + `</a>`;
           }

           html += `
               <br>
               </div>`
       }
   }

   html += "</div>";

   $("td#dglist").html(html);

   $("td#dglist a").each(function(){

       let name = this.getAttribute("data-name");

       $(this).on("mouseover", function(){

           if(this.data === undefined){

               this.data = parseDataGroupValues(name, (html) => $(this).showBalloon({
                       position: "left",
                       css: {
                           whitespace: "nowrap"
                       },
                       showDuration: 0,
                       hideDuration: 0,
                       contents: html
               }));

           } else {

               $(this).showBalloon({
                       position: "left",
                       css: {
                           whitespace: "nowrap"
                       },
                       showDuration: 0,
                       hideDuration: 0,
                       contents: this.data
               });
           }

       });

       $(this).on("mouseleave", function(){
           $(this).hideBalloon();
       });
   })

}

/**************************************************************************
*
*                       Data group list improvements
*
**************************************************************************/

function improveDataGroupListEditing(){
   //Increase the size of the lists
   $("select").not("#datagroup_type_select").attr("size", DatagroupListCount);

   //Add extra cell and buttons for bulk import
   $("table#records thead tr.tablehead td").after(`<td>
                                                       <div class="title">Bulk import text</div>
                                                   </td>
                                                   `);
   $("table#records tbody tr td.settings").after(`<td class="settings" id="dgbulkimport">
                                                   <textarea cols="60" rows="` + (DatagroupListCount + 8) + `" class="bulkcontent"/>
                                                   <br>
                                                   <input type="button" value="Merge the lists" id="bulkMerge"/>
                                                   <input type="button" value="Replace current list" id="bulkReplace"/>
                                                   <input type="button" value="Edit active list" id="bulkEdit"/>
                                                   <input type="button" value="Help" id="bulkHelp" onClick="window.open('https://loadbalancing.se/webui-tweaks-manual/#Data_group_list_editing','_blank')"/>
                                                   </td>
                                                   `
                                           )


   //Attach the functions to the buttons

   $("input#bulkMerge").on("click", function(){

       "use strict";

       //First get the data
       var importListArr = $("textarea.bulkcontent:visible").val().split("\n");
       var currentListArr = [];
       $("select:visible").last().find("option").each(function(){
           currentListArr.push($(this).text().trim())
       })

       //Create objects from the arrays
       var importObj = createDGListObject(importListArr);
       var currentObj = createDGListObject(currentListArr);
       var selectList = "";

       for(var key in importObj){
           var value = importObj[key];
           var optionValue = value === "" ? key : (key + "\\x0a" + value);
           var optionText = value === "" ? key : (key + " := " + value);

           if(!(key in currentObj)){
               selectList += "<option value=\"" + optionValue + "\" selected>"
                   + optionText + "</option>";
           }
       }

       $("select:visible").last().append(selectList);

       $("input#bulkEdit").prop("disabled", false);
       $("input#update").prop("disabled", false);

   })

   $("input#bulkReplace").on("click", function(){

       "use strict";

       //First get the data
       var importListArr = $("textarea.bulkcontent:visible").val().split("\n");

       //Create an object from the array
       var importObj = createDGListObject(importListArr);

       //Remove current options
       $("select:visible").last().find("option").remove();

       var selectList = "";

       for(var key in importObj){

           var value = importObj[key];
           var optionValue = value === "" ? key : (key + "\\x0a" + value);
           var optionText = value === "" ? key : (key + " := " + value);

           selectList += "<option value=\"" + optionValue + "\" selected>" + optionText + "</option>";
       }

       $("select:visible").last().append(selectList);

       $("input#bulkEdit").prop("disabled", false);
       $("input#update").prop("disabled", false);
   })

   $("input#bulkEdit").on("click", function(){

       var keyVals = []

       $("select:visible").last().find("option").each(function(){
           keyVals.push($(this).text().trim())
           $(this).remove();
       })

       $("input#bulkEdit").prop("disabled", true);
       $("input#update").prop("disabled", true);
       $("textarea.bulkcontent:visible").val(keyVals.join("\n"));

   })

}

function improveDataGroupListProperties(){

   $("input[name=string_input], input[name=string_pair_value], input#string_add_button").on("keyup change input focus click", function(){

       var key = $("input[name=string_input]").val();
       var value = $("input[name=string_pair_value]").val();

       var currentList = [];

       $('select#class_string_item option').each(function(){
           currentList.push($(this).val());
       })

       if(key.length){

           var listItem = "";

           if(value === ""){
               listItem = key;
           } else {
               listItem = key + "\\x0a" + value;
           }

           if(currentList.indexOf(listItem) === -1){
               $("input#update").prop("disabled", true);
           } else {
               $("input#update").prop("disabled", false);
           }

       } else if(dgbulkimport.length && currentList.length === 0){

           $("input#update").prop("disabled", true);

       } else {

           $("input#update").prop("disabled", false);

       }

   })

   $("input#edit_string").on("click", function(){
       $("input#update").prop("disabled", true);
   })
}

function validateDGObject(lines){
   //Validate that all records has one or no delimiter
   return !(lines.some(function(line){
       return (line.split(/\s*:=\s*/i).length > 2)
   }));
}


function createDGListObject(lines){

   var bulkImportObj = {}

   if(validateDGObject(lines)){

       //Creating object and ignoring duplicates
       lines.map(function(line){

           var lineArr = line.split(/\s*:=\s*/i)
           var key = lineArr[0];
           var value = lineArr[1] || "";

           if(!(key in bulkImportObj)){
               bulkImportObj[key] = value;
           }

       });
   }

   return bulkImportObj
}


/**************************************************************************
*
*                        Virtual server improvements
*
**************************************************************************/

function improveVirtualServerProperties(){

       //  SSL Profile (client)
       addDoubleClick("selectedclientsslprofiles", "availableclientsslprofiles_button");
       addDoubleClick("availableclientsslprofiles", "selectedclientsslprofiles_button");

       //  SSL Profile (server)
       addDoubleClick("selectedserversslprofiles", "availableserversslprofiles_button");
       addDoubleClick("availableserversslprofiles", "selectedserversslprofiles_button");

       //  VLANs and Tunnels
       addDoubleClick("selected_vlans", "available_vlans_button");
       addDoubleClick("available_vlans", "selected_vlans_button");
}

function improveiRuleSelection(){

   assignedrules = $("#assigned_rules").attr("size", iRulesCount);
   rulereferences = $("#rule_references").attr("size", iRulesCount);

   // Add double click feature
   addDoubleClick("rule_references", "assigned_rules_button");
   addDoubleClick("assigned_rules", "rule_references_button");

}

function improveVirtualServerResources(){
   var selecteddefaultpool = $('input[name=default_pool_before]').val();
   if(selecteddefaultpool != 'NO_SELECTION'){
       $('input[name=default_pool_before]').after('<a href="https://' + window.location.host + '/tmui/Control/jspmap/tmui/locallb/pool/properties.jsp?name=' + selecteddefaultpool + '"><input type="button" value="Show default pool"/></a>')
   }
}

/**************************************************************************
*
*                        Pool improvements
*
**************************************************************************/

function improvePoolList(){

   addGlobalStyle('div.tamperpoolstatus{position:relative;}div.tamperpoolstatus table.list{position:relative;width:100%;border:1px solid #999 }div.tamperpoolstatus table.list tbody tr.color0{background:#deddd9}div.tamperpoolstatus table.list tbody tr.color0 td{border-bottom:1px solid #c4c2be}div.tamperpoolstatus table.list tbody tr.inner td,div.tamperpoolstatus table.list tbody tr.innerbold td{padding:3px 5px;border-bottom:none;white-space:nowrap}div.tamperpoolstatus table.list tbody tr.color1{background:#fff}div.tamperpoolstatus table.list tbody tr.color2{background:#f7f6f5}div.tamperpoolstatus table.list tbody tr.innerbold td{font-weight:700}div.tamperpoolstatus table.list tbody td{vertical-align:top;padding:6px 5px 4px;border-bottom:1px solid #ddd;white-space:nowrap}div.tamperpoolstatus table.list tbody td input{margin-top:0}div.tamperpoolstatus table.list tbody td img{padding-top:1px}div.tamperpoolstatus table.list div.customtooltip div,div.tamperpoolstatus table.list div.filter div{padding:3px 5px}div.tamperpoolstatus table.list tbody td.first{border-left:1px solid #999}div.tamperpoolstatus table.list tbody td.last{border-right:1px solid #999}div.tamperpoolstatus table.list tbody td.column1,div.tamperpoolstatus table.list tbody td.column2{border-left:1px solid #ddd}div.tamperpoolstatus table.list div.customtooltip,div.tamperpoolstatus table.list div.filter{position:absolute;z-index:1;margin-top:2px;border:1px solid #666;background:#deddd9}div.tamperpoolstatus table.list div.customtooltip div a.close{color:red;font-weight:700}div.tamperpoolstatus table.list div.filter div.current{margin:1px;padding:3px;border:1px solid #999;background:#eee}div.tamperpoolstatus table.list tbody tr.expanded td,div.tamperpoolstatus table.list tbody tr.notlast td{border-bottom:none!important}div.tamperpoolstatus table.list .expired{padding-left:17px;background:url(../images/status_certificate_expired.gif) left center no-repeat}div.tamperpoolstatus table.list .warning{padding-left:17px;background:url(../images/status_certificate_warning.gif) left center no-repeat}div.tamperpoolstatus table.list tbody tr.collapsible-parent td a{vertical-align:top}div.tamperpoolstatus table.list thead tr td div.collapsible-toggle.expanded{background:url(/xui/common/images/icon_toggle_all_minus.gif) no-repeat;width:15px;height:15px;display:inline-block;cursor:pointer;zoom:1}div.tamperpoolstatus table.list tbody tr.expanded td div.collapsible-toggle{background:url(/xui/common/images/icon_toggle_minus.gif) no-repeat;width:12px;height:12px;margin:0 auto;zoom:1}div.tamperpoolstatus table.list thead tr td div.collapsible-toggle.collapsed{background:url(/xui/common/images/icon_toggle_all_plus.gif) no-repeat;width:15px;height:15px;display:inline-block;cursor:pointer;zoom:1}div.tamperpoolstatus table.list tbody tr.collapsed td div.collapsible-toggle{background:url(/xui/common/images/icon_toggle_plus.gif) no-repeat;width:12px;height:12px;margin:0 auto;zoom:1}div.tamperpoolstatus table.list tbody tr.set-whitespace-normal td{white-space:normal}div.tamperpoolstatus table.list tbody.group_move_placeholder{display:table-row}div.tamperpoolstatus table.list tbody tr.handle td.first{width:15px;background:url(/tmui/tmui/skins/Default/images/icon_gripper.png) 50% no-repeat!important;cursor:url(/xui/common/images/openhand.cur),default}div.tamperpoolstatus thead tr.columnhead td div.reorder{width:16px;height:16px;background:url(/xui/common/images/cursor-openhand.png) center no-repeat}div.tamperpoolstatus table.list .highlight{background:#dbefff!important;cursor:url(/xui/common/images/openhand.cur),default}div.tamperpoolstatus table.list .highlight a{cursor:url(/xui/common/images/openhand.cur),default}div.tamperpoolstatus div.section{margin:10px 0}div.tamperpoolstatus thead tr.tablehead td{border-bottom:1px solid #999;vertical-align:bottom}div.tamperpoolstatus thead tr.tablehead div{padding-bottom:3px;white-space:nowrap}div.tamperpoolstatus thead tr.tablehead div.title{float:left;margin-top:.5em;color:#000;font-weight:700}div.tamperpoolstatus thead tr.tablehead div.advancedtoggle{float:left;margin:0 0 0 5px;color:#000}div.tamperpoolstatus thead tr.tablehead div.search{float:left}div.tamperpoolstatus thead tr.tablehead div.searchnofloat{clear:both;float:left}div.tamperpoolstatus thead tr.tablehead div.search input.search,div.tamperpoolstatus thead tr.tablehead div.searchnofloat input.search{width:240px}div.tamperpoolstatus thead tr.tablehead div.buttons{float:right}div.buttons input[type=button],div.tamperpoolstatus thead tr.tablehead div.buttons input[type=button],div.tamperpoolstatus thead tr.tablehead div.buttons input[type=submit]{padding:0 5px}div.tamperpoolstatus thead tr.tablehead div.buttons input.checkall{margin-right:9px}div.tamperpoolstatus thead tr.tablehead div.grouptitle{margin:0 3px 0 2px;padding:1px 10px;border:1px solid #999;border-bottom:none;background:#deddd9;text-align:center;font-weight:700}div.tamperpoolstatus thead tr.columnhead td{padding:5px;border-bottom:1px solid #999;border-top:1px solid #999;border-left:1px solid #999;background:url(../images/background_list_head.gif) #deddd9;white-space:nowrap}div.tamperpoolstatus thead tr.columnhead td.last{border-right:1px solid #999}div.tamperpoolstatus thead tr.columnhead td a{display:block;width:expression("1%");padding-top:1px;margin-top:-1px;color:#000}div.tamperpoolstatus thead tr.columnhead td a.filteroff{margin-top:0;padding-left:20px;background:url(../images/button_filter_off.gif) left center no-repeat}div.tamperpoolstatus thead tr.columnhead td a.filteron{margin-top:0;padding-left:20px;background:url(../images/button_filter_on.gif) left center no-repeat}div.tamperpoolstatus thead tr.columnhead td a.selectall{margin-top:0;width:15px;background:url(../images/button_select_all.gif) left center no-repeat}div.tamperpoolstatus thead tr.columnhead td a.selectall:hover{text-decoration:none}div.tamperpoolstatus thead tr.columnhead td a.sortoff{margin-top:0;padding-left:12px;background:url(../images/button_sort_off.gif) left center no-repeat}div.tamperpoolstatus thead tr.columnhead td a.sorton{margin-top:0;padding-left:12px;background:url(../images/button_sort_on.gif) left center no-repeat}div.tamperpoolstatus thead tr.columnhead td a.sortup{margin-top:0;padding-left:12px;background:url(../images/button_sort_up.gif) left center no-repeat}div.tamperpoolstatus thead tr.columnhead td a.sortdown{margin-top:0;padding-left:12px;background:url(../images/button_sort_down.gif) left center no-repeat}div.tamperpoolstatus thead tr.columnhead td .greenflag,div.tamperpoolstatus thead tr.columnhead td .redflag,div.tamperpoolstatus thead tr.columnhead td .yellowflag{display:block;width:expression("1%");padding-top:1px;padding-left:20px}div.tamperpoolstatus thead tr.columnhead td .greenflag{background:url(../images/status_flag_green.gif) left center no-repeat}div.tamperpoolstatus thead tr.columnhead td .yellowflag{background:url(../images/status_flag_yellow.gif) left center no-repeat}div.tamperpoolstatus thead tr.columnhead td .redflag{background:url(../images/status_flag_red.gif) left center no-repeat}div.tamperpoolstatus thead tr.columnhead td .activedevice,div.tamperpoolstatus thead tr.columnhead td .failsafefaultdevice,div.tamperpoolstatus thead tr.columnhead td .impaireddevice,div.tamperpoolstatus thead tr.columnhead td .maintenancedevice,div.tamperpoolstatus thead tr.columnhead td .offlinedevice,div.tamperpoolstatus thead tr.columnhead td .replacementdevice,div.tamperpoolstatus thead tr.columnhead td .standbydevice,div.tamperpoolstatus thead tr.columnhead td .unknowndevice,div.tamperpoolstatus thead tr.columnhead td .unreachabledevice{display:block;width:expression("1%");padding:2px 0 2px 27px}div.tamperpoolstatus thead tr.columnhead td .activedevice{background:url(../images/status_filter_device_active.png) left center no-repeat}div.tamperpoolstatus thead tr.columnhead td .standbydevice{background:url(../images/status_filter_device_standby.png) left center no-repeat}div.tamperpoolstatus thead tr.columnhead td .failsafefaultdevice{background:url(../images/status_filter_device_failsafe_fault.png) left center no-repeat}div.tamperpoolstatus thead tr.columnhead td .offlinedevice{background:url(../images/status_filter_device_offline.png) left center no-repeat}div.tamperpoolstatus thead tr.columnhead td .forcedofflinedevice{display:block;width:expression("1%");padding:2px 0 2px 27px;background:url(../images/status_filter_device_forcedoffline.png) left center no-repeat}div.tamperpoolstatus thead tr.columnhead td .unknowndevice{background:url(../images/status_filter_device_present_unknown.png) left center no-repeat}div.tamperpoolstatus thead tr.columnhead td .impaireddevice{background:url(../images/status_filter_device_impaired.gif) left center no-repeat}div.tamperpoolstatus thead tr.columnhead td .maintenancedevice{background:url(../images/status_filter_device_maint.gif) left center no-repeat}div.tamperpoolstatus thead tr.columnhead td .replacementdevice{background:url(../images/status_filter_device_replacement.gif) left center no-repeat}div.tamperpoolstatus thead tr.columnhead td .unreachabledevice{background:url(../images/status_filter_device_unreachable.gif) left center no-repeat}div.tamperpoolstatus thead tr.columnhead td .available,div.tamperpoolstatus thead tr.columnhead td .offline,div.tamperpoolstatus thead tr.columnhead td .unavailable,div.tamperpoolstatus thead tr.columnhead td .unknown{display:block;width:expression("1%");padding-top:1px;padding-left:20px}div.tamperpoolstatus thead tr.columnhead td .available{background:url(../images/status_circle_green.png) left center no-repeat}div.tamperpoolstatus thead tr.columnhead td .unavailable{background:url(../images/status_triangle_yellow.png) left center no-repeat}div.tamperpoolstatus thead tr.columnhead td .offline{background:url(../images/status_diamond_red.png) left center no-repeat}div.tamperpoolstatus thead tr.columnhead td .unknown{background:url(../images/status_square_blue.png) left center no-repeat}div.tamperpoolstatus table.head td.wizardtext{padding-top:10px}div.tamperpoolstatus table.tablefoot{width:100%}div.tamperpoolstatus table.tablefoot td{vertical-align:top}div.tamperpoolstatus table.tablefoot div{padding:3px 0 20px}div.tamperpoolstatus table.tablefoot div.buttons{float:left}div.tamperpoolstatus table.tablefoot div.buttons input[type=button],div.tamperpoolstatus table.tablefoot div.buttons input[type=submit]{padding:0 5px}div.tamperpoolstatus table.tablefoot div.pagecontrols{float:right}');

   var poolStatuses = {}
   var oldMessage = $(parent.top.document).find("div#message div#messagetype div#messagetext").text();

   // Check when the loading screen for pools has disappears and then show a member statuses.
   var statusInterval = setInterval(function(){
       if(!$(parent.top.document).find("div#message").is(":visible")){
           $(parent.top.document).find("div#message div#messagetype div#messagetext").text("Loading member statuses...");
           $(parent.top.document).find("div#message").show();
           clearInterval(statusInterval);
       }
   } , 100);

   $.ajax({
       url: "https://" + window.location.host + "/tmui/Control/jspmap/tmui/locallb/pool/stats.jsp?SearchString=*&",
       type: "GET",
       success: function(response) {

           $(response).find("tbody#list_body tr")
           .filter(function() {
               return this.id.match(/\/.+\//);
           })
           .each(function(){

               var poolName = this.id.replace(/_member_row_[0-9]+$/i, "");

               if(!(poolName in poolStatuses)){
                   poolStatuses[poolName] = {};
               }

               var memberName = $(this).find("td").eq(3).text().trim();
               var statusIcon = $(this).find("td").eq(1).find("img").attr("src");
               var title = $(this).find("td").eq(1).find("img").attr("title");

               poolStatuses[poolName][memberName] = { "icon": statusIcon, "title": title };

           });

           $("tbody#list_body tr").each(function(){

               var poolName = $(this).find("td").eq(2).find("a").attr("href").replace(/.+name=/i, "");
               var existingIcons = [];

               if(poolName in poolStatuses){

                   var memberStatuses = poolStatuses[poolName];

                   for(var memberStatus in memberStatuses){
                       if(existingIcons.indexOf(memberStatuses[memberStatus]["icon"]) === -1){
                           existingIcons.push(memberStatuses[memberStatus]["icon"]);
                       }
                   }

                   if(existingIcons.length > 1){

                       var html = "<div data-poolname=\"" + poolName + "\" class=\"tamperpoolstatus\" style=\"margin-left:21px;margin-bottom:15px;\">";

                       for(var i = 0; i < existingIcons.length; i++){

                           iconURL = existingIcons[i].replace(/\/.*_/i, "/tmui/tmui/skins/Default/images/status_circle_");

                           switch (i){
                               case 0:
                                   html += "<div style=\"z-index:1;position:absolute;max-width:6.7px;overflow:hidden;\"><img src=\"" + iconURL + "\"/></div>"
                                   break;
                               case 1:
                                   html += "<div style=\"z-index:1;position:absolute;left:6.7px;max-width:6.5px;overflow:hidden;direction:rtl;\"><img src=\"" + iconURL + "\"/></div>"
                                   break;
                               case 2:
                                   html += "<div style=\"z-index:2;position:absolute;max-height:7.5px;left:0.2px;overflow:hidden;\"><img src=\"" + iconURL + "\"/></div>"
                                   break;
                               case 3:
                                   html += "<div style=\"z-index:4;position:absolute;max-width:6.5px;max-height:7.5px;overflow:hidden;\"><img src=\"/tmui/tmui/skins/Default/images/status_circle_blue.png\"/></div>"
                                   break;
                           }
                       }

                       html += "</div>";

                       $(this).find("td").eq(1).html(html);

                   } else {
                       var html = "<div data-poolname=\"" + poolName + "\" style=\"position:relative;padding-top:1px\"><img src=\"" + existingIcons + "\"/></div>"
                       $(this).find("td").eq(1).html(html);
                   }

                   $(this).find("td").eq(1).find("div").on("mouseover", function(){
                       poolName = $(this).attr("data-poolname");

                       if(poolName in poolStatuses){

                           var table = "<div class=\"tamperpoolstatus\"><table class=\"list\" style=\"opacity:1\"><thead id=\"list_header\"><tr class=\"columnhead\"><td></td><td>Member</td><td>Status</td></tr></thead><tbody>";
                           memberStatuses = poolStatuses[poolName];

                           var i = 0;

                           for(member in memberStatuses){
                               table += "<tr class=\"color" + ((i%2)+1) + "\"><td align=\"center\"><img src=\"" + memberStatuses[member].icon + "\"/></td><td>" + member + "</td><td>" + memberStatuses[member].title + "</td></tr>";
                               i++;
                           }

                           table += "</tbody></table></div>";

                           $(this).balloon({ position: "right", css: { whitespace: "nowrap", boxShadow: null, opacity: "1", padding: "0px", border: "0px", background: "rgba(0, 0, 255,1)" }, minLifetime: 0, tipSize:0, showDuration: 0, hideDuration: 0, contents: table });
                       }
                   });

                   //For some reason I need to trigger this at least one ahead of time in order to get the popup to show on the first attempt
                   $(this).find("td").eq(1).find("div").trigger("mouseover");
                   $(this).find("td").eq(1).find("div").trigger("mouseout");

               }
           })

           $(parent.top.document).find("div#message").fadeOut(function(){
               $(parent.top.document).find("div#message div#messagetype div#messagetext").text(oldMessage);
           });

       }
   })

}


function improvePoolProperties(){

   // Increase the select box sizes
   $("#monitor_rule").attr("size", MonitorCount);
   $("#available_monitor_select").attr("size", MonitorCount);

   // Add double click feature
   addDoubleClick("monitor_rule", "available_monitor_select_button");
   addDoubleClick("available_monitor_select", "monitor_rule_button");

}

function improvePoolCreation(){

   // Increase the select box sizes
   $("#monitor_rule").attr("size", MonitorCount);
   $("#available_monitor_select").attr("size", MonitorCount);

   // Add double click feature
   addDoubleClick("monitor_rule", "available_monitor_select_button");
   addDoubleClick("available_monitor_select", "monitor_rule_button");

   // Set the default pool name suffix
   $("#pool_name").find("input[name=name]").attr("value", DefaultPoolName);

   // Set the default action on pool down value
   $("#action_on_service_down").find("option[value=\"" + DefaultActionOnPoolDown + "\"]").attr("SELECTED", "");

   // Set the default LB Method
   $("#lb_mode").find("option[value=\"" + DefaultLBMethod + "\"]").attr("SELECTED", "");

   // If configured, choose node as default when selecting pool members
   if(ChooseNodeAsDefault){
       if(majorVersion === "11"){
           $("#member_address_radio_address").attr("unchecked","");
           $("#member_address_radio_node").attr("checked","");
           $("#member_address_radio_node").click();
       } else if(["12", "13", "14"].indexOf(majorVersion) != -1){
           $("tr#member_address_selection td input").eq(0).attr("unchecked", "");
           $("tr#member_address_selection td input").eq(4).attr("checked", "");
           $("tr#member_address_selection td input").eq(4).click();
       }
   }

}

function addHTTPMonitorSuffix(){
   if($("select[name=mon_type]").find(":selected").text().trim() == "HTTP"){

       var monitorname = $("input[name=monitor_name]").attr("value");

       if($("input[name=monitor_name]").length && monitorname == "") {
           $("input[name=monitor_name]").attr("value", HttpMonitorSuffix);
       } else if ($("input[name=monitor_name]").length && !(endsWith(monitorname, HttpMonitorSuffix))) {
           monitorname = monitorname + HttpMonitorSuffix;
           $("input[name=monitor_name]").attr("value", monitorname);
       }
   }
}

// Adds monitor test strings to the pool member details
function improvePoolMemberProperties(){

   if($("#member_address td").next().length && $("#member_port td").next().length){

       // Add double click feature
       addDoubleClick("monitor_rule", "available_monitor_select_button");
       addDoubleClick("available_monitor_select", "monitor_rule_button");

       //Add global style
       var css = `a.monitortest {  position: relative;  display: inline;  color:#000000;}
               a.monitortest p {  position: absolute;  color: #000;  top:-50px;  left:-55px;
               background: #f7f6f5;  border: 1px solid #000;  padding-left:5px;  padding-right:5px;
               padding-top:2px;  padding-bottom:0px;  height: 30px;  text-align: center;
               visibility: hidden;  border-radius: 2px;  font-size:12px;  font-weight:bold; }
               a:hover.monitortest p {  visibility: visible;  bottom: 30px;  z-index: 999; }
               .monitorcopybox { width:140px;font-weight:normal;font-size:10px;margin-bottom:1px;}
               button.monitortestbutton { font-size:12px; }`;

       addGlobalStyle(css);

       var ip = $("#member_address td.settings").text().trim();
       var port = $("#member_port td.settings").text().trim();

       $('#general_table tbody tr td.settings').not('tr#member_health_monitors_status').each(function(){
           $(this).attr("colspan", 2);
       });

       $('#health_monitor_table tbody tr').not(".monitorheaderrow").each(function(key,value){

           var monitorurl = $(value).find('td a').attr("href");

           $.ajax({
               url: "https://" + window.location.host + monitorurl,
               type: "GET",
               ip: ip,
               port: port,
               success: function(response) {

                   "use strict";

                   var type = "";
                   var sendstring;

                   if($(response).find("#monitor_send_string").length){

                       sendstring = $(response).find("#monitor_send_string").text().trim();
                       type = $(response).find("#div_general_table tbody tr td:contains('Type')").next().text().trim();

                   } else if ($(response).find("#div_configuration_table table tbody tr td:contains('Send String')")) {

                       // Default monitors does not have the same page structure as the normal ones. Needs special treatment.
                       sendstring = $(response).find("#div_configuration_table table tbody tr").find("td:contains('Send String')").next().text().trim();
                       type = $(response).find("#general_table tbody tr").find("td:contains('Type')").next().text().trim();

                   }

                   if(type == "HTTP" || type == "HTTPS"){

                       var commands = getMonitorRequestParameters(sendstring, type, ip, port);

                       var html = "";

                       for(var c in commands.commands){

                           html += `<a href="javascript:void(0);" class="monitortest">
                                       <input type="button" class="monitortestbutton" value="` + c + `"/>
                                       <p>` + commands.commands[c].title + `(CRTL+C)
                                       <br>
                                       <input id="` + c.toLowerCase() + `link" class="monitorcopybox" type="text" value='` + commands.commands[c].string + `'>
                                       </p>
                                   </a>`;
                       }

                       $(value).append("<td valign=\"middle\">" + html + " </td>");

                   } else {
                       $(value).append("<td valign=\"middle\" class=\"monitortests\">N/A</td>");
                   }


               },
               async: false
           });
       });

       //Attach an onmouseover function which focuses and selects the text
       if($('.monitortest').length){
           $('.monitortest').mouseover(function(){
               $(this).find("p input").focus();
               $(this).find("p input").select();
               var inputstring = $(this).find('p input').attr('value');
               $(this).attr("href", "javascript:prompt('The command','" + inputstring.replace(/\'/g,"\\'") + "')");
           });
       }

       //Remove the parent padding first
       $('#health_monitor_table').parent().css('padding','0px');
       //Add a row with headers
       $('#health_monitor_table tbody tr:first').before('<tr class="monitorheaderrow"><td class="monitorheadercell">Monitors</td><td class="monitorheadercell">Monitor tests</td></tr>');
       //Make the headers bold
       $('#health_monitor_table tbody tr.monitorheaderrow td').css({
           'font-weight' : 'bold',
           'border-right' : '1px solid #dddddd'
       });
       //Add padding
       $('#health_monitor_table tr td').css({
           'padding' : '5px'
       });
       $('#health_monitor_table tr td').not('.monitorheadercell').css({
           'border-right' : '1px solid #dddddd',
           'border-top' : '1px solid #dddddd',
       });

       $('#health_monitor_table tr td.monitortests').css('text-align','center');

   }

}

function getMonitorRequestParameters(sendstring, type, ip, port){

   "use strict";
   var headers = [];
   var protocol = "";

   var commandObj = {
       "commands": {
           "HTTP": {
               "title": "",
               "command": ""
           },
           "Curl": {
               "title": "",
               "command": ""
           },
           "Netcat": {
               "title": "",
               "command": ""
           }
       },
       "success": true
   }

   var sendstringarr = sendstring.split(" ");
   var verb = sendstringarr[0];
   var uri = sendstringarr[1].replace("\\r\\n", "");

   if (/^HTTP[S]?$/.test(type)){
       protocol = type.toLowerCase();
   }

   //So far we only support HTTP GET request
   if( verb === "GET" || verb === "HEAD"){

       //Parse for headers
       var headersarr = sendstring.split('\\r\\n');
       var i;

       if(headersarr.length > 2){

           for(i in headersarr){

               var header = headersarr[i];

               if(header.indexOf(":") >= 0){
                   if(header.split(":").length == 2){
                       headers.push(header);
                   }
               }
           }
       }

       var commandstring = 'curl -vvv';

       if (verb === "HEAD"){
           commandstring += " -I"
       }

       if(headers.length > 0){
           for(i in headers){
              var headerarr = headers[i].split(":");
              var headername = headerarr[0].trim();
              var headervalue = headerarr[1].trim();

              headervalue = headervalue.replace(/\"/g,'\\&quot;');
              commandstring += ' --header &quot;' + headername + ':' + headervalue + '&quot;';
           }
       }

       commandstring += ' ' + protocol + '://' + ip + ':' + port + uri

       commandObj.commands.Curl.title = "Curl Command";
       commandObj.commands.Curl.string = commandstring;

       commandObj.commands.Netcat.title = "Netcat Command";
       commandObj.commands.Netcat.string = "echo -ne \"" + sendstring + "\" | nc " + ip + " " + port;

       commandObj.commands.HTTP.title = "HTTP Link";
       commandObj.commands.HTTP.string = protocol + '://' + ip + ':' + port + uri;

   } else {
       commandObj.success = false;
   }

   return commandObj;
}


/**************************************************************************
*
*                       Client SSL Profile Improvements
*
**************************************************************************/

function improveClientSSLProfileCreation(){

   if(defaultClientSSLParentProfile !== ""){
       setTimeout(function(){
           $('select#parent_profile_name').val(defaultClientSSLParentProfile);
           $('select#parent_profile_name').trigger("change");

       }, 1000);

   }

   $("input[name='certificate_name']").on("keyup", function(){
       $("input[name='common_name']").val($(this).val().replace(/^star\./g, "*."));
   });

   setTimeout(function(){
       $("select[name='issuer']").val("Certificate Authority");
       $("select[name='issuer']").trigger("change");
   }, 500);

}


function improveCertKeyChainSelection(){

   $('input[name="cert_key_chain_override"]').on("click", matchCertAndKey);

   $('input[name="add_modal_button"]').on("mouseup", function(){
       setTimeout(function(){

           var currentPartition = getCookie("F5_CURRENT_PARTITION");
           var profileName = $("input[name='profile_name']").val();

           if($("select#cert option[value='/" + currentPartition + "/" + profileName + ".crt']").length > 0){
               $('select#cert').val("/" + currentPartition + "/" + profileName + ".crt");
               $('select#key').val("/" + currentPartition + "/" + profileName + ".key");
           } else if ($("select#cert option[value='/Common/" + profileName + ".crt']").length > 0){
               $('select#cert').val("/Common/" + profileName + ".crt");
               $('select#key').val("/Common/" + profileName + ".key");
           }

           $('select#chain').val(defaultChain)

       }, 500);
   });

}

function matchCertAndKey(){

   $('select#chain').val(defaultChain)

   $('select#cert').on("change", function(){

       var certName = $(this).val();
       var probableKeyName = certName.replace(/\.crt$/, ".key");

       $('select#key').val(probableKeyName);

       if(defaultChain !== ""){
           $('select#chain').val(defaultChain)
       }

   });
}

/**************************************************************************
*
*              SSL certificate creation improvements
*
**************************************************************************/

function addCSRDropDownMenu(){

   //A certificate is being created and the default certificate signing setting has been enabled
   var csrdropdown = '<select id="csrdropdownmenu">';

   for(var option in csroptions){
       csrdropdown += '<option value="' + option + '">' + csroptions[option]["OptionName"] + '</option>';
   }

   $('#configuration_table tbody').append('<tr><td class="label required">Certificate type</td><td class="settings">' + csrdropdown + '</td></tr>')

   $('#configuration_table tbody tr td #csrdropdownmenu').change(function() {

       //Change to Certificate authority
       $('#certificate_table tbody tr td select[name=issuer]').val("Certificate Authority");

       //Reflect the changes to the form using the in build function
       $('#certificate_table tbody tr td select[name=issuer]').trigger("onchange");

       //Get the options for the currently selected certificate and populate the table
       var selectedcsroption = csroptions[this.value];

       //Populate the common name
       $('#certificate_table tbody tr td input[name=common_name]').val(selectedcsroption["CommonName"])
       $('#certificate_table tbody tr td input[name=division]').val(selectedcsroption["Division"])
       $('#certificate_table tbody tr td input[name=organization]').val(selectedcsroption["Organization"])
       $('#certificate_table tbody tr td input[name=locality]').val(selectedcsroption["Locality"])
       $('#certificate_table tbody tr td input[name=state_or_province]').val(selectedcsroption["StateProvince"])
       $('#certificate_table tbody tr td select[name=country_select]').val(selectedcsroption["Country"])
       $('#certificate_table tbody tr td input[name=email_address]').val(selectedcsroption["Email"])
       $('#certificate_table tbody tr td input[name=subject_alternative_name]').val(selectedcsroption["SubjectAlt"])

       //Update the country variable using the in build script
       $('#certificate_table tbody tr td select[name=country_select]').trigger("onchange");
   });

   //Set the default value
   setTimeout(function(){
       $('#configuration_table tbody tr td #csrdropdownmenu').trigger("change");
   }, 500);
}


/**************************************************************************
*
*                       Generic functions
*
**************************************************************************/

function makeCurrentPartitionObjectsBold(){
   //Get the current partition
   var currentpartition = getCookie("F5_CURRENT_PARTITION")

   $("tbody#list_body tr td a").filter(function(){
       return $(this).attr("href").indexOf("/" + currentpartition + "") >= 0
   }).each(function(){
       $(this).css('font-weight', 700);
   });
}

/**************************************************************************
*
*                       Helper functions
*
**************************************************************************/

// Used to in cases where jQuery caches the selector at the begining of the script.
function triggerEvent(ev, el){
   "use strict";

   var event = document.createEvent('HTMLEvents');
   event.initEvent(ev, true, true);
   el.dispatchEvent(event);

}


function log(s, c = "black"){
   console.log("%c " + s, "color: " + c);
}

function endsWith(str, suffix) {
   return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

// Credit to Michael Jenkins for this one.
// https://github.com/jangins101/
function addDoubleClick(el, btn) {
   $("#" + el).dblclick(function() {  $("#" + btn).click(); });
}

//Taken from sourceforge
function addGlobalStyle(css) {

   var head, style;
   head = document.getElementsByTagName('head')[0];
   if (!head) { return; }
   style = document.createElement('style');
   style.type = 'text/css';
   style.innerHTML = css;
   head.appendChild(style);

}

//Get a cookie value. Used to get the current partition
//Shamelessly stolen from https://gist.github.com/thoov/984751

function getCookie(cname) {
   var name = cname + "=";
   var ca = document.cookie.split(';');
   for(var i=0; i<ca.length; i++) {
       var c = ca[i];
       while (c.charAt(0)==' ') c = c.substring(1);
       if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
   }
   return "";
}
function setCookie(name,value,days) {
   var expires;
   if (days) {
       var date = new Date();
       date.setTime(date.getTime()+(days*24*60*60*1000));
       expires = "; expires="+date.toGMTString();
   }
   else expires = "";
   document.cookie = name+"="+value+expires+"; path=/";
}

function deleteCookie(name) {
   setCookie(name,"",-1);
}

function replaceCookie(name, value, days){
   deleteCookie(name);
   setCookie(name, value, days);
}

function getUrlVars(){

   var vars = [], hash;
   var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

   for(var i = 0; i < hashes.length; i++){
       hash = hashes[i].split('=');
       vars.push(hash[0]);
       vars[hash[0]] = hash[1];
   }

   return vars;
}

//Tests if browser uri contains string
function uriContains(s) {
   "use strict";
   var uri = (document.location.pathname + document.location.search);
   return uri.indexOf(s) >= 0;
}
