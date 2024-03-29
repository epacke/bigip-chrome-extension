

/**************************************************************************
*
*                       Client SSL Profile Improvements
*
**************************************************************************/

function improveClientSSLProfileCreation(){

    if(defaultClientSSLParentProfile !== ""){
        setTimeout(function(){
            $('select#parent_profile_name').val(defaultClientSSLParentProfile);
            $('select#parent_profile_name').trigger("change");
 
        }, 1000);
 
    }
 
    $("input[name='certificate_name']").on("keyup", function(){
        $("input[name='common_name']").val($(this).val().replace(/^star\./g, "*."));
    });
 
    setTimeout(function(){
        $("select[name='issuer']").val("Certificate Authority");
        $("select[name='issuer']").trigger("change");
    }, 500);
 
 }
 
 function improveCertKeyChainSelection(){
 
    $('input[name="cert_key_chain_override"]').on("click", matchCertAndKey);
 
    $('input[name="add_modal_button"]').on("mouseup", function(){
        setTimeout(function(){
 
            var currentPartition = getCookie("F5_CURRENT_PARTITION");
            var profileName = $("input[name='profile_name']").val();
 
            if($("select#cert option[value='/" + currentPartition + "/" + profileName + ".crt']").length > 0){
                $('select#cert').val("/" + currentPartition + "/" + profileName + ".crt");
                $('select#key').val("/" + currentPartition + "/" + profileName + ".key");
            } else if ($("select#cert option[value='/Common/" + profileName + ".crt']").length > 0){
                $('select#cert').val("/Common/" + profileName + ".crt");
                $('select#key').val("/Common/" + profileName + ".key");
            }
 
            $('select#chain').val(defaultChain)
 
        }, 500);
    });
 
 }
 
 function matchCertAndKey(){
 
    $('select#chain').val(defaultChain)
 
    $('select#cert').on("change", function(){
 
        var certName = $(this).val();
        var probableKeyName = certName.replace(/\.crt$/, ".key");
 
        $('select#key').val(probableKeyName);
 
        if(defaultChain !== ""){
            $('select#chain').val(defaultChain)
        }
 
    });
 }
 
 /**************************************************************************
 *
 *              SSL certificate creation improvements
 *
 **************************************************************************/
 
 function addCSRDropDownMenu(){
 
    //A certificate is being created and the default certificate signing setting has been enabled
    var csrdropdown = '<select id="csrdropdownmenu">';
 
    for(var option in csroptions){
        csrdropdown += '<option value="' + option + '">' + csroptions[option]["OptionName"] + '</option>';
    }
 
    $('#configuration_table tbody').append('<tr><td class="label required">Certificate type</td><td class="settings">' + csrdropdown + '</td></tr>')
 
    $('#configuration_table tbody tr td #csrdropdownmenu').change(function() {
 
        //Change to Certificate authority
        $('#certificate_table tbody tr td select[name=issuer]').val("Certificate Authority");
 
        //Reflect the changes to the form using the in build function
        $('#certificate_table tbody tr td select[name=issuer]').trigger("onchange");
 
        //Get the options for the currently selected certificate and populate the table
        var selectedcsroption = csroptions[this.value];
 
        //Populate the common name
        $('#certificate_table tbody tr td input[name=common_name]').val(selectedcsroption["CommonName"])
        $('#certificate_table tbody tr td input[name=division]').val(selectedcsroption["Division"])
        $('#certificate_table tbody tr td input[name=organization]').val(selectedcsroption["Organization"])
        $('#certificate_table tbody tr td input[name=locality]').val(selectedcsroption["Locality"])
        $('#certificate_table tbody tr td input[name=state_or_province]').val(selectedcsroption["StateProvince"])
        $('#certificate_table tbody tr td select[name=country_select]').val(selectedcsroption["Country"])
        $('#certificate_table tbody tr td input[name=email_address]').val(selectedcsroption["Email"])
        $('#certificate_table tbody tr td input[name=subject_alternative_name]').val(selectedcsroption["SubjectAlt"])
 
        //Update the country variable using the in build script
        $('#certificate_table tbody tr td select[name=country_select]').trigger("onchange");
    });
 
    //Set the default value
    setTimeout(function(){
        $('#configuration_table tbody tr td #csrdropdownmenu').trigger("change");
    }, 500);
 }
 