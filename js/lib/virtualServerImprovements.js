/**************************************************************************
*
*                        Virtual server improvements
*
**************************************************************************/

function improveVirtualServerProperties(){

    //  SSL Profile (client)
    addDoubleClick("selectedclientsslprofiles", "availableclientsslprofiles_button");
    addDoubleClick("availableclientsslprofiles", "selectedclientsslprofiles_button");

    //  SSL Profile (server)
    addDoubleClick("selectedserversslprofiles", "availableserversslprofiles_button");
    addDoubleClick("availableserversslprofiles", "selectedserversslprofiles_button");

    //  VLANs and Tunnels
    addDoubleClick("selected_vlans", "available_vlans_button");
    addDoubleClick("available_vlans", "selected_vlans_button");
}

function improveiRuleSelection(){

assignedrules = $("#assigned_rules").attr("size", iRulesCount);
rulereferences = $("#rule_references").attr("size", iRulesCount);

// Add double click feature
addDoubleClick("rule_references", "assigned_rules_button");
addDoubleClick("assigned_rules", "rule_references_button");

}

function improveVirtualServerResources(){
var selecteddefaultpool = $('input[name=default_pool_before]').val();
if(selecteddefaultpool != 'NO_SELECTION'){
    $('input[name=default_pool_before]').after('<a href="https://' + window.location.host + '/tmui/Control/jspmap/tmui/locallb/pool/properties.jsp?name=' + selecteddefaultpool + '"><input type="button" value="Show default pool"/></a>')
}
}
