// Get data from storage
async function setStorage(key, obj){
    return new Promise((resolve, reject) => {
        try {
            let value = JSON.stringify(obj);
            let item = {};
            item[key] = value;
            chrome.storage.local.set(item, function() {
                resolve();
            });
        } catch (e){
            reject(e);
        }
    })    
}