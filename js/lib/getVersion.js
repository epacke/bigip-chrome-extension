// Since all logic is done through the iframe the extension icon never lights up
// To solve that this script was added to match the main frame of the f5 web ui

(async function (){

    await waitForSelector("div#deviceid div span", 500, 5);

    var versionInfo = $("div#deviceid div span").attr("title");
    var version = versionInfo.split(" ")[1];
    var majorVersion = version.split(".")[0];

    await setStorage("majorVersion", {majorVersion: majorVersion});

})();