

function startLTMLogFetcher(){

    //Check if the database contains anything
    if(typeof(logDatabase) === "undefined"){
        var rawData = localStorage.getItem("ltmLog") || "{\"content\":{},\"lastSynced\":null}";
        logDatabase = JSON.parse(rawData);
        //updateLTMLogStatistics(getLTMLogStatisticsSummary(logDatabase));
        initiateLTMLogStatistics();
    }
 
    if(logDatabase.lastSynced){
        var lastSynced = new Date(logDatabase.lastSynced);
        var now = new Date();
        var seconds = (now.getTime() - lastSynced.getTime()) / 1000;
    }
 
    var fetchLTMLog = function(){
        $.ajax({
            url: "https://" + window.location.host + "/tmui/Control/jspmap/tmui/system/log/list_ltm.jsp",
            type: "GET",
            success: function(response) {
                $(response).find("table.list tbody tr").each(function(){
 
                    var message = {}
 
                    var row = $(this).find("td");
 
                    message.timeStamp = $(row[0]).text().trim();
                    message.logLevel = $(row[1]).text().trim();
                    message.host = $(row[2]).text().trim();
                    message.service = $(row[3]).text().trim();
                    message.statusCode = $(row[4]).text().trim();
                    message.logEvent = $(row[5]).text().trim();
 
                    var data = "";
                    for(var i in message){
                        data += message[i]
                    }
 
                    if(!(data in logDatabase)){
                        logDatabase.content[data] = message
                    }
 
                    logDatabase.lastSynced = new Date();
                })
 
                updateLTMLogStatistics(getLTMLogStatisticsSummary(logDatabase));
                localStorage.setItem("ltmLog", JSON.stringify(logDatabase));
            }
 
        })
    }
 
    fetchLTMLog();
    setInterval(fetchLTMLog, ltmLogCheckInterval*1000);
 }
 
 function initiateLTMLogStatistics(){
 
    var topFrame = $(parent.top.document);
 
    if(topFrame.find("div.ltmLogStats").length == 0){
 
        var styleTag = $(`<style>
                                .ltmLogStats {
                                    float: left;
                                    padding: 0 15px;
                                    border-right: 1px dotted #444;
                                    margin: 0;
                                }
                        </style>`);
 
        topFrame.find('html > head').append(styleTag);
        var html = ``;
 
        var parameterList = [];
 
        for(var i in ltmLogPatterns){
 
            if(parameterList.length == 2){
                html += `<div class="ltmLogStats" id="ltmLogStats">` + parameterList.join("") + `</div>`
                parameterList = [];
            }
 
            parameterList.push(`
                    <div class="" id="logStats` + i + `">
                        <label>` + ltmLogPatterns[i].name + `:</label>
                        <span>Loading...</span>
                    </div>`
            );
        }
 
        if(parameterList.length != 0){
            html += `<div class="ltmLogStats">` + parameterList.join("") + `</div>`
        }
 
        topFrame.find("div#userinfo").last().after(html);
 
    }
 
 }
 
 function updateLTMLogStatistics(summary){
 
    var topFrame = $(parent.top.document);
 
    if(topFrame.find("div.ltmLogStats").length != 0){
 
        var i = 0
        for(var stats in summary){
            var statsSpan = topFrame.find("div#logStats" + stats + " span");
            statsSpan.fadeOut(300);
            statsSpan.html(summary[stats]);
            statsSpan.fadeIn(300);
        }
 
    }
 
 }
 
 function getLTMLogStatisticsSummary(logDatabase){
 
    var summary = {};
    var events = logDatabase.content;
 
    for(var f in ltmLogPatterns){
        var logTest = ltmLogPatterns[f];
        if(logTest.enabled){
            summary[f] = 0;
        }
    }
 
    for(var i in events){
 
        var event = events[i];
 
        for(functionName in ltmLogPatterns){
 
            var f = ltmLogPatterns[functionName];
            if(f.isMatching(event)){
                summary[functionName]++;
            }
        }
 
    }
 
    return(summary);
 
 }
 