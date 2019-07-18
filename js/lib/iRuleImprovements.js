
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