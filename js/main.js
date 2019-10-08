//Make sure that the extensions jQuery does not tamper with F5's scripts
this.$ = this.jQuery = jQuery.noConflict(true);

//Declare global ajax queue limit
var tamperDataGroupLists = new Array();
var detectedarr = [];

var poolStatuses;

var logDatabase;

var majorVersion = null;

debug("Waiting for version info");
waitForStorageKey('majorVersion').then(async () => {
    
    let version = await getStorage('majorVersion')
    
    debug("Got version info.");
    majorVersion = version.majorVersion;

    initiateBaloon();

    for(var i in enhancementFunctions){
    
        var f = enhancementFunctions[i];
        if(f.applicable()){
            f.enhance();
        }

    }

})

