

/**************************************************************************
*
*                       Data group list improvements
*
**************************************************************************/

function improveDataGroupListEditing(){
    //Increase the size of the lists
    $("select").not("#datagroup_type_select").attr("size", DatagroupListCount);
 
    //Add extra cell and buttons for bulk import
    $("table#records thead tr.tablehead td").after(`<td>
                                                        <div class="title">Bulk import text</div>
                                                    </td>
                                                    `);
    $("table#records tbody tr td.settings").after(`<td class="settings" id="dgbulkimport">
                                                    <textarea cols="60" rows="` + (DatagroupListCount + 8) + `" class="bulkcontent"/>
                                                    <br>
                                                    <input type="button" value="Merge the lists" id="bulkMerge"/>
                                                    <input type="button" value="Replace current list" id="bulkReplace"/>
                                                    <input type="button" value="Edit active list" id="bulkEdit"/>
                                                    <input type="button" value="Help" id="bulkHelp" onClick="window.open('https://loadbalancing.se/webui-tweaks-manual/#Data_group_list_editing','_blank')"/>
                                                    </td>
                                                    `
                                            )
 
 
    //Attach the functions to the buttons
 
    $("input#bulkMerge").on("click", function(){
 
        "use strict";
 
        //First get the data
        var importListArr = $("textarea.bulkcontent:visible").val().split("\n");
        var currentListArr = [];
        $("select:visible").last().find("option").each(function(){
            currentListArr.push($(this).text().trim())
        })
 
        //Create objects from the arrays
        var importObj = createDGListObject(importListArr);
        var currentObj = createDGListObject(currentListArr);
        var selectList = "";
 
        for(var key in importObj){
            var value = importObj[key];
            var optionValue = value === "" ? key : (key + "\\x0a" + value);
            var optionText = value === "" ? key : (key + " := " + value);
 
            if(!(key in currentObj)){
                selectList += "<option value=\"" + optionValue + "\" selected>"
                    + optionText + "</option>";
            }
        }
 
        $("select:visible").last().append(selectList);
 
        $("input#bulkEdit").prop("disabled", false);
        $("input#update").prop("disabled", false);
 
    })
 
    $("input#bulkReplace").on("click", function(){
 
        "use strict";
 
        //First get the data
        var importListArr = $("textarea.bulkcontent:visible").val().split("\n");
 
        //Create an object from the array
        var importObj = createDGListObject(importListArr);
 
        //Remove current options
        $("select:visible").last().find("option").remove();
 
        var selectList = "";
 
        for(var key in importObj){
 
            var value = importObj[key];
            var optionValue = value === "" ? key : (key + "\\x0a" + value);
            var optionText = value === "" ? key : (key + " := " + value);
 
            selectList += "<option value=\"" + optionValue + "\" selected>" + optionText + "</option>";
        }
 
        $("select:visible").last().append(selectList);
 
        $("input#bulkEdit").prop("disabled", false);
        $("input#update").prop("disabled", false);
    })
 
    $("input#bulkEdit").on("click", function(){
 
        var keyVals = []
 
        $("select:visible").last().find("option").each(function(){
            keyVals.push($(this).text().trim())
            $(this).remove();
        })
 
        $("input#bulkEdit").prop("disabled", true);
        $("input#update").prop("disabled", true);
        $("textarea.bulkcontent:visible").val(keyVals.join("\n"));
 
    })
 
 }
 
 function improveDataGroupListProperties(){
 
    $("input[name=string_input], input[name=string_pair_value], input#string_add_button").on("keyup change input focus click", function(){
 
        var key = $("input[name=string_input]").val();
        var value = $("input[name=string_pair_value]").val();
 
        var currentList = [];
 
        $('select#class_string_item option').each(function(){
            currentList.push($(this).val());
        })
 
        if(key.length){
 
            var listItem = "";
 
            if(value === ""){
                listItem = key;
            } else {
                listItem = key + "\\x0a" + value;
            }
 
            if(currentList.indexOf(listItem) === -1){
                $("input#update").prop("disabled", true);
            } else {
                $("input#update").prop("disabled", false);
            }
 
        } else if(dgbulkimport.length && currentList.length === 0){
 
            $("input#update").prop("disabled", true);
 
        } else {
 
            $("input#update").prop("disabled", false);
 
        }
 
    })
 
    $("input#edit_string").on("click", function(){
        $("input#update").prop("disabled", true);
    })
 }
 
 function validateDGObject(lines){
    //Validate that all records has one or no delimiter
    return !(lines.some(function(line){
        return (line.split(/\s*:=\s*/i).length > 2)
    }));
 }
 
 
 function createDGListObject(lines){
 
    var bulkImportObj = {}
 
    if(validateDGObject(lines)){
 
        //Creating object and ignoring duplicates
        lines.map(function(line){
 
            var lineArr = line.split(/\s*:=\s*/i)
            var key = lineArr[0];
            var value = lineArr[1] || "";
 
            if(!(key in bulkImportObj)){
                bulkImportObj[key] = value;
            }
 
        });
    }
 
    return bulkImportObj
 }
 