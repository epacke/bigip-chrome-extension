
// Define the types to search for and their patterns
var ltmLogPatterns = [
    new function(){
        this.name = 'Pool failures';
        this.enabled = true;
        this.isMatching = function(event){
            return(/^Pool.+monitor status down/.test(event.logEvent))
        }
    },
    new function(){
        this.name = 'Node failures';
        this.enabled = true;
        this.isMatching = function(event){
            return(/^Node.+monitor status down/.test(event.logEvent));
        }
    },
    new function(){
        this.name = 'Errors';
        this.enabled = true;
        this.isMatching = function(event){
            return(event.logLevel === 'error');
        }
    },
    new function(){
        this.name = 'Warnings';
        this.enabled = true;
        this.isMatching = function(event){
            return(event.logLevel === 'warning');
        }
    },
    new function(){
        this.name = 'TCL Errors';
        this.enabled = true;
        this.isMatching = function(event){
            return(/^TCL error/.test(event.logEvent));
        }
    },
    new function(){
        this.name = 'Aggressive Mode';
        this.enabled = true;
        this.isMatching = function(event){
            return(/aggressive mode activated/.test(event.logEvent));
        }
    },
    new function(){
        this.name = 'Address Conflicts';
        this.enabled = true;
        this.isMatching = function(event){
            return(/address conflict detected for/.test(event.logEvent));
        }
    }
]


function startLTMLogFetcher() {
    initiateLTMLogStatistics();
}


/*
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

                let debugTable = []
                $(response).find("table.list tbody tr").each(function(){
 
                    var message = {}
 
                    var columns = $(this).find("td");
 
                    message.timeStamp = $(columns[0]).text().trim();
                    message.logLevel = $(columns[1]).text().trim();
                    message.host = $(columns[2]).text().trim();
                    message.service = $(columns[3]).text().trim();
                    message.statusCode = $(columns[4]).text().trim();
                    message.logEvent = $(columns[5]).text().trim();
                    
                    debugTable.push(message)
                    var data = "";
                    for(var i in message){
                        data += message[i]
                    }
 
                    if(!(data in logDatabase)){
                        logDatabase.content[data] = message
                    }
 
                    logDatabase.lastSynced = new Date();
                })

                console.table(debugTable)
 
                updateLTMLogStatistics(getLTMLogStatisticsSummary(logDatabase));
                localStorage.setItem("ltmLog", JSON.stringify(logDatabase));
            }
 
        })
    }
 
    fetchLTMLog();
    setInterval(fetchLTMLog, ltmLogCheckInterval*1000);
 }
 
 */

 
 // Initiates the div that holds the statistics
 function initiateLTMLogStatistics(){
 
    var topFrame = $(parent.top.document);
 
    if(topFrame.find('div.ltmLogStats').length == 0){
 
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
 
        for(var pattern of ltmLogPatterns){
 
            if(parameterList.length == 2){
                html += `<div class="ltmLogStats" id="ltmLogStats">${parameterList.join("")}</div>`;
                parameterList = [];
            }
 
            parameterList.push(`
                    <div class="" id="logStats${pattern.name.replace(/ +/,'')}">
                        <label>${pattern.name}:</label>
                        <span>Loading...</span>
                    </div>`
            );
        }
 
        if(parameterList.length != 0){
            html += `<div class="ltmLogStats">${parameterList.join("")}</div>`;
        }
 
        topFrame.find("div#userinfo").last().after(html);
 
    }
 
 }

 
/*
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
 
    // Initiate an object with enabled functions as key and a value of 0
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

            if(f.enabled && f.isMatching(event)){
                summary[functionName]++;
            }

        }
 
    }
 
    return(summary);
 
 }
 */