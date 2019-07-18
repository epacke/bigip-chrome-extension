/**************************************************************************
*
*                        Pool improvements
*
**************************************************************************/

async function getURL(url){

    return new Promise((resolve, reject) => {
        $.ajax({

            url: url,
            type: "GET",
            success: response => resolve(response),
            error: e => reject(e)
        })
    })

}

// Check when the loading screen for pools has disappears and then show a member statuses.
async function showLoadingMessage(message){

    let messageDiv = $(parent.top.document).find("div#message");

    return new Promise((resolve, reject) => {
        var statusInterval = setInterval(function(){
        
            if(!(messageDiv.is(":visible"))){
                console.log(messageDiv);
                messageDiv.html(`
                    <div id="messagetype" class="type loading"><div class="indicator"></div>
                    <div id="messagetitle" class="title">Loading...</div>
                    <div id="messagetext" class="text">${message}</div></div>
                `)
                messageDiv.show();
                clearInterval(statusInterval);
                resolve();
            }
        }, 100);
    })
    

}

async function improvePoolList(){

    var poolStatuses = {}
    
    let messageDiv = $(parent.top.document).find("div#message");

    await showLoadingMessage("Loading member statuses...");
    var response = await getURL("https://" + window.location.host + "/tmui/Control/jspmap/tmui/locallb/pool/stats.jsp?SearchString=*&");

    messageDiv.fadeOut()

    $(response).find("tbody#list_body tr")
        .filter(function() {
            return /\/.+\//.test(this.id);
        })
        .each(function(){

            var poolName = this.id.replace(/_member_row_[0-9]+$/, "");

            if(!(poolName in poolStatuses)){
                poolStatuses[poolName] = {};
            }

            let columns = $(this).find("td");
            let memberName = columns.eq(3).text().trim();
            let statusIconCell = columns.eq(1).find("img")
            let statusIconSrc = statusIconCell.attr("src");
            let title = statusIconCell.attr("title");
            let totalConnections = parseInt(columns.eq(11).text());

            poolStatuses[poolName][memberName] = { "icon": statusIconSrc, "title": title, "totalConnections": totalConnections };

        });
 
            $("tbody#list_body tr").each(function(){
                
                let poolRow = $(this);
                let poolColumns = poolRow.find("td")
                let poolName = poolColumns.eq(2).find("a").attr("href").replace(/.+name=/i, "");
                let poolIconCell = poolColumns.eq(1);

                let existingIcons = [];
 
                if(poolName in poolStatuses){
 
                    var memberStatuses = poolStatuses[poolName];
 
                    for(var memberStatus in memberStatuses){
                        if(existingIcons.indexOf(memberStatuses[memberStatus]["icon"]) === -1){
                            existingIcons.push(memberStatuses[memberStatus]["icon"]);
                        }
                    }
 
                    if(existingIcons.length > 1){
 
                        var poolStatusIconHTML = `<div data-poolname="${poolName}" class="tamperpoolstatus" style="margin-left:21px;margin-bottom:15px;">`;
 
                        for(var i = 0; i < existingIcons.length; i++){
 
                            let iconURL = existingIcons[i].replace(/\/.*_/i, '/tmui/tmui/skins/Default/images/status_circle_');
                            
                            // Boy is this a hack
                            // It adds the different icon states in different layers depending on how many different pool states there are

                            switch (i){
                                case 0:
                                    poolStatusIconHTML += `<div style="z-index:1;position:absolute;max-width:6.7px;overflow:hidden;"><img src="${iconURL}"/></div>`;
                                    break;
                                case 1:
                                    poolStatusIconHTML += `<div style="z-index:1;position:absolute;left:6.7px;max-width:6.5px;overflow:hidden;direction:rtl;"><img src="${iconURL}"/></div>`;
                                    break;
                                case 2:
                                    poolStatusIconHTML += `<div style="z-index:2;position:absolute;max-height:7.5px;left:0.2px;overflow:hidden;"><img src="${iconURL}"/></div>`;
                                    break;
                                case 3:
                                    poolStatusIconHTML += '<div style="z-index:4;position:absolute;max-width:6.5px;max-height:7.5px;overflow:hidden;"><img src="/tmui/tmui/skins/Default/images/status_circle_blue.png"/></div>';
                                    break;
                            }
                        }
 
                        poolStatusIconHTML += '</div>';
                        
                        poolIconCell.html(poolStatusIconHTML);
 
                    } else {
                        var poolStatusIconHTML = `<div data-poolname="${poolName}" style="position:relative;padding-top:1px"><img src="${existingIcons}"/></div>`;
                        poolIconCell.html(poolStatusIconHTML);
                    }
 
                    poolIconCell.find('div').on('mouseover', function(){
                        poolName = $(this).attr("data-poolname");
 
                        if(poolName in poolStatuses){
 
                            var table = '<div class="tamperpoolstatus"><table class="list" style="opacity:1"><thead id="list_header"><tr class="columnhead"><td></td><td>Member</td><td>Status</td></tr></thead><tbody>';
                            memberStatuses = poolStatuses[poolName];
 
                            var i = 0;
 
                            for(member in memberStatuses){
                                table += `<tr class="color${((i%2)+1)}"><td align="center"><img src="${memberStatuses[member].icon}"/></td><td>${member}</td><td>${memberStatuses[member].title}</td></tr>`;
                                i++;
                            }
 
                            table += '</tbody></table></div>';
 
                            $(this).balloon({ position: 'right', css: { whitespace: 'nowrap', boxShadow: null, opacity: '1', padding: '0px', border: '0px', background: 'rgba(0, 0, 255,1)' }, minLifetime: 0, tipSize:0, showDuration: 0, hideDuration: 0, contents: table });
                        }
                    });
 
                    // For some reason I need to
                    // * Trigger this at least one ahead of time in order to get the popup to show on the first attempt
                    // * Not cache the jQuery selector or it will show the state of the last pool
                    $(this).find('td').eq(1).find('div').trigger('mouseover');
                    $(this).find('td').eq(1).find('div').trigger('mouseout');
 
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
 