# Deploy and configure of **Audit everywhere** from a Zip file

## pre requisite

to deploy and use Audit everywhere

- HOPEX V3 CP4 minimum
- Install **HOPEX Graphql**. You can download it from [HOPEX store](https://community.mega.com/t5/HOPEX-Store/GraphQL-REST-API/td-p/21381).
- **HTTPS** is mandatory since **Audit everywhere** is a [PWA](https://developers.google.com/web/ilt/pwa/introduction-to-progressive-web-app-architectures).
- Browser minimum version [please check](https://caniuse.com/#feat=serviceworkers)

## Deploy on IIS  

Copy the content of the `Zip file` to `C:\inetpub\wwwroot\audit-everywhere`

>[!IMPORTANT]
>The url of the application should end with **audit-everywhere**
>

You need to install IIS URL Rewrite Extension, so, go to <https://www.iis.net/downloads/microsoft/url-rewrite>, download and install (with MS Web Platform Installer).

check the `web.config`

 ```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
    <rewrite>
      <rules>
        <rule name="Handle History Mode and custom 404/500" stopProcessing="true">
            <match url="(.*)" />
            <conditions logicalGrouping="MatchAll">
              <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
              <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            </conditions>
          <action type="Rewrite" url="index.html" />
        </rule>
      </rules>
    </rewrite>
      <httpErrors>
          <remove statusCode="404" subStatusCode="-1" />
          <remove statusCode="500" subStatusCode="-1" />
          <error statusCode="404" path="/survey/notfound" responseMode="ExecuteURL" />
          <error statusCode="500" path="/survey/error" responseMode="ExecuteURL" />
      </httpErrors>
      <modules runAllManagedModulesForAllRequests="true"/>
    </system.webServer>
</configuration>
```

[!code-xml[web.config](..\public\web.config)]

## Configuration file

create the application configuration file **config.json**. Copy `C:\inetpub\wwwroot\audit-everywhere\config\config.json.example` to `C:\inetpub\wwwroot\audit-everywhere\config\config.json`

- Set **ROOT_API** to the root url of HOPEX no leading HOPEX no leading /.
- **environmentId** is the absolute identifier of the production environment you can get it form the megasite.ini and convert it.
- **repositoryId** is the absolute identifier of the repository you can get it form the megaenv.ini and convert it.
- **profileId** is the absolute identifier of the profile the default value is the absolute identifier of the profile **Auditor**.
- Set the **client_secret** according HOPEX configuration.
- **validatedStatus** define the status where an activity is read only.
if you change the list, do not forget to add **localyvalidated** status given by the application when tap on complete activity.
- The **connectivity url** can be set to `https://ROOT_API/audit-everywhere/img/px.gif` to avoid cross-site warning.

 ```json
{
  "ROOT_API": "",                                      "Comment of ROOT_API":     " root url of HOPEX no leading HOPEX no leading /",
  "API_timeout": 6000,                                 "Comment of API_timeout":  " Limit of time in ms, where the application switches to offline mode 0 will ignore",
  "ASYNC_timeout": 6000,                               "Comment of API_timeout":  " Limit of time in ms, where the API waits to give a response or a job ID",
  "environmentId": "",                                 "Comment of environmentId":" Absolute identifier of the environment see megasite.ini and convert it",
  "repositoryId": "",                                  "Comment of repositoryId": " Absolute identifier of the repository  see megaenv.ini and convert it",
  "profileId": "tWisjijuFnES",                         "Comment of profileId":    " Absolute identifier of the Auditor profile",
  "client_id": "hopexapi",                             "Comment of client_id":    " Authentication Client Id",
  "client_secret": "secret",                           "Comment of client_secret":" Authentication Client secret Set the secret of hopexapi check HOPEX configuration",
  "title": "Audit Everywhere",
  "validatedStatus": "tobevalidated|validated|closed|localyvalidated", "Comment of validatedStatus":" Values to be separated by the '|' character, localyvalidated manage the local completion",
  "unvalidatedStatus": "created|tobereviewed",         "Comment of unvalidatedStatus":" Values to be separated by the '|' character",
  "documentCategory": "g4InWZSRGDBB",                  "Comment of documentCategory":  "IdAbs of document Category: audit evidences",
  "documentPattern": "KoQoM0jRGLZH",                   "Comment of DocumentPattern":   "IdAbs of document Pattern: audit evidences",
  "impacts": [ "VeryLow","Low", "Medium", "High", "VeryHigh" ],
  "cascadeOnDelete": true,                             "Comment of cascadeOnDelete": "Either delete operation should work in cascade or not",
  "connectivity": {
    "url": "https://www.google.com/images/phd/px.gif", "Comment of url":         "URL to ping in order to determine the network connectivity",
    "timeToCount": "3",                                "Comment of timeToCount": "The number of time we repeat the operation",
    "threshold": "3000",                               "Comment of threshold":   "The threshold at which we decide to be offline",
    "interval": "20000",                               "Comment of interval":    "The time between each repetition"
  },
  "toast": {
    "actionTextColor": "black",
    "errorColor": "#EE2665",
    "successColor": "#31B672"
  }
}
 ```

[!code-json[config.json](..\public\config\config.json.example)]

## User guide

[Audit Everywhere quick start guide](README.md)
