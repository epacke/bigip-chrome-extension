// Get data from storage

async function getStorage(key){

    return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], function(result) {
            try {
                resolve(JSON.parse(result[key]));
            } catch (e){
                reject(e);
            }
        });
        
    })
}