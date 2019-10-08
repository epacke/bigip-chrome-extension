class LTMLogStatistics {

    constructor (patterns){
        this.logEvents = [];
        this.patterns = patterns.filter((p) => { return p.enabled})
        this.initiateLTMLogStatistics();
    }

     // Initiates the div that holds the statistics
    initiateLTMLogStatistics(){
        
        let topFrame = $(parent.top.document);
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

        for(var pattern of this.patterns){

            if(parameterList.length == 2){
                html += `<div class="ltmLogStats" id="ltmLogStats">${parameterList.join("")}</div>`;
                parameterList = [];
            }

            parameterList.push(`
                    <div class="" id="logStats${pattern.statsName}">
                        <label>${pattern.name}:</label>
                        <span id="logstats-${pattern.statsName}">Loading...</span>
                    </div>`
            );
        }

        if(parameterList.length != 0){
            html += `<div class="ltmLogStats">${parameterList.join("")}</div>`;
        }

        topFrame.find("div#userinfo").last().after(html);
    
    }

    // Fetches the log data from the logs section of the UI
    async readLog(){
        let logContent = await $.ajax('/tmui/Control/jspmap/tmui/system/log/list_ltm.jsp',{
            success: data => {
                return data
            }
        });
        this.parseLogContent(logContent);
    }

    // Parses the log data into an array of dictionary items
    // Items stored in this.logEvents

    parseLogContent(logContent) {

        let columnIndexToName = {
            0: 'timeStamp',
            1: 'logLevel',
            2: 'host',
            3: 'service',
            4: 'statusCode',
            5: 'event'
        }

        let logTableBody = $(logContent).find('div#section_div table tbody#list_body');
        logTableBody.find('tr').each((index, row) => {
            let entry = {};
            $(row).find('td').each((index, column) => {
                let columnContent = column.innerText.trim();
                entry[columnIndexToName[index]] = columnContent;
            });
            this.logEvents.push(entry);
        });
    }

    // Updates the stats at the top frame
    updateStats(stats){
        let topFrame = $(parent.top.document);
        for(let s in stats){
            topFrame.find(`span#logstats-${s}`).text(stats[s]).fadeOut(500).fadeIn(500);
        }
    }

    // 1. Reads the log
    // 2. Updates the log data
    // 3. Generates stats based on the patterns
    // 4. Updates the stats

    async generateStats(){

        await this.readLog();

        let stats = {};
        for(let pattern of this.patterns){
            stats[pattern.statsName] = 0;
        }

        for(let event of this.logEvents){
            for(let pattern of this.patterns){
                if(pattern.isMatching(event)){ stats[pattern.statsName]++ };
            }
        }

        this.updateStats(stats);
    }
    
}

// These are the patterns that is used to generate the stats
// name: Friendly name of the pattern. Used to describe the statistic in ie. labels
// statsName: Used in conjunction with creating dynamic css selectors, ie the span id that holds the stat
// enabled: If the patterns is active or not
// isMatching: A function that takes an event and returns true or false depending if the event matches the pattern or not
let ltmStatsPatterns = [
    {
        name: 'Pool failures',
        statsName: 'pool-failures',
        enabled: true,
        isMatching: function(event){
            return(/^Pool.+monitor status down/.test(event.event))
        }
    },
    {
        name: 'Node failures',
        statsName: 'node-failures',
        enabled: true,
        isMatching: function(event){
            return(/^Node.+monitor status down/.test(event.event));
        }
    },
    {
        name: 'Errors',
        statsName: 'errors',
        enabled: true,
        isMatching: function(event){
            return(event.logLevel === 'error');
        }
    },
    {
        name: 'Warnings',
        statsName: 'warnings',
        enabled: true,
        isMatching: function(event){
            return(event.logLevel === 'warning');
        }
    },
    {
        name: 'TCL Errors',
        statsName: 'tcl-errors',
        enabled: true,
        isMatching: function(event){
            return(/^TCL error/.test(event.logEvent));
        }
    },
    {
        name: 'Aggressive Mode',
        statsName: 'aggressive-mode',
        enabled: true,
        isMatching: function(event){
            return(/aggressive mode activated/.test(event.logEvent));
        }
    },
    {
        name: 'Address Conflicts',
        statsName: 'address-conflicts',
        enabled: true,
        isMatching: function(event){
            return(/address conflict detected for/.test(event.logEvent));
        }
    }
]

async function startLogStatistics(){

    let topFrame = $(parent.top.document);
    
    // Only initiate the stats and start the parser if the logStats div does not exist
    if(topFrame.find('div.ltmLogStats').length == 0){
        let LTMLogs = new LTMLogStatistics(ltmStatsPatterns);
        await LTMLogs.readLog();
        setInterval(function(){
            LTMLogs.generateStats();
        }, 30000);
    }
    
}

startLogStatistics();