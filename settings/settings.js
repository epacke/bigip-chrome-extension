/***************************************************************************************
                        Begin Config section
****************************************************************************************/

    /**************************************************************
    How many rules you want to see in the rule assignment window
    Default:
    iRulesCount = 40;
    ***************************************************************/

   var iRulesCount = 40;

   /**************************************************************
   How many monitors you want to show in the monitor selection
   Default:
   MonitorCount = 30;
   ***************************************************************/

   var MonitorCount = 30;

   /**************************************************************
   How many data group list entries to show
   Default:
   DatagroupListCount = 30;
   ***************************************************************/

   var DatagroupListCount = 30;

   /**************************************************************
   Set http monitor name default suffix
   Default:
   HttpMonitorSuffix = "";
   ***************************************************************/
   var HttpMonitorSuffix = "-http_monitor";

   /**************************************************************
   Set the default pool name
   Default:
   DefaultPoolName = "";
   ***************************************************************/
   var DefaultPoolName = "-[port]_pool";

   /**************************************************************
   Set the default action on pool down when creating pools
   Default:
   DefaultActionOnPoolDown = 0;
   Options:
   0 = None
   1 = Reject
   2 = Drop
   ***************************************************************/

   var DefaultActionOnPoolDown = 1;

   /**************************************************************
   Set the default action on pool down when creating pools
   Default = 0;
   Options:
   0 = Round Robin
   1 = Ratio (member)
   2 = Least Connections (member)
   3 = Observed (member)
   4 = Predictive (member)
   5 = Ratio (node)
   6 = Least connections (node)
   7 = Fastest (node)
   8 = Observed (node)
   9 = Predictive (node)
   10 = Dynamic Ratio (node)
   11 = Fastest (application)
   12 = Least sessions
   13 = Dynamic ratio (member)
   14 = Weighted Least Connections (member)
   15 = Weighted Least Connections (node)
   16 = Ratio (session)
   17 = Ratio Least connections (member)
   18 = Ratio Least connections (node)
   **************************************************************/

   var DefaultLBMethod = 4;

   /**************************************************************
   Choose Node List as default when creating pools
   Default:
   ChooseNodeAsDefault = 0;
   Options:
   0 = No
   1 = Yes
   **************************************************************/
   var ChooseNodeAsDefault = 1;

   /**************************************************************
   Add default certificate signing alternatives
   First one defined is always the default one
   This one is a bit tricky to format, look at the example carefully
   Options:
   false = No
   true = Yes
   Example that creates two options:
   var csroptions = {
               Company1: {
                   OptionName: 'Company 1',
                   CommonName: '[Example *.domain.com]',
                   Division: 'Stockholm office',
                   Organization: 'My Office address',
                   Locality: 'Stockholm',
                   StateProvince: 'Stockholm',
                   Country: 'SE',
                   Email: 'office@company.se',
                   SubjectAlt: ''
               }
           ,
               Company2: {
                   OptionName: 'Another company',
                   CommonName: '[Example *.domain.com]',
                   Division: 'Oslo office',
                   Organization: 'My Oslo Office address',
                   Locality: 'Oslo',
                   StateProvince: 'Oslo',
                   Country: 'NO',
                   Email: 'office@company.no',
                   SubjectAlt: ''
               }
           }
   **************************************************************/

   var csroptions = {
               "Company1": {
                   "OptionName": "Company 1",
                   "CommonName": "[Example *.domain.com]",
                   "Division": "Stockholm office",
                   "Organization": "My Office address",
                   "Locality": "Stockholm",
                   "StateProvince": "Stockholm",
                   "Country": "SE",
                   "Email": "office@company.se",
                   "SubjectAlt": ""
               }
           ,
               "Company2": {
                   "OptionName": "Another company",
                   "CommonName": "[Example *.domain.com]",
                   "Division": "Oslo office",
                   "Organization": "My Oslo Office address",
                   "Locality": "Oslo",
                   "StateProvince": "Oslo",
                   "Country": "NO",
                   "Email": "office@company.no",
                   "SubjectAlt": ""
               }
           }

    /*****************************************************************************
       Select this default chain certificate when creating client SSL profiles
       Default:
       defaultChain = "";
       defaultChain = "/Common/mychain.crt";
   *******************************************************************************/

   var defaultChain = "/Common/ca-bundle.crt";

    /*************************************************************************
       Chooses a default parent profile when creating client SSL profiles
       Default:
       defaultClientSSLParentProfile = "";
       defaultClientSSLParentProfile = "/Common/myParentProfile";
   ***************************************************************************/

   var defaultClientSSLParentProfile = "";

    /*************************************************************************
       Deactivate the choice to activate the Christmas theme altogether
       Default (allow the choice):
       allowChristmas = false;
       Don't allow the choice:
       allowChristmas = true;
   ***************************************************************************/

   var allowChristmas = true;

   /**************************************************************************
       How often should the script update the LTM log stats (in seconds)
       ltmLogCheckInterval = 30;
   **************************************************************************/

   var ltmLogCheckInterval = 30;
