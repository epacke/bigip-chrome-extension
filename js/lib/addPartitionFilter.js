
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
 