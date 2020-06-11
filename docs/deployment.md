---
Area: Audit everywhere
PageTitle : Deploy and configure of Audit everywhere from a Zip file
Author: JF Trianda
date: 11/06/2020
---

# Deploy and configure of **Audit everywhere** from a Zip file

## Pre Requisite

To deploy and use Audit everywhere you need:

- HOPEX V3 CP4 minimum
- Install **HOPEX Graphql**. You can download it from [HOPEX store](https://community.mega.com/t5/HOPEX-Store/GraphQL-REST-API/td-p/21381).
- **HTTPS** is mandatory since **Audit everywhere** is a [PWA](https://developers.google.com/web/ilt/pwa/introduction-to-progressive-web-app-architectures).
- [URL Rewrite](https://www.iis.net/downloads/microsoft/url-rewrite)  Extension for IIS
- Browser minimum version [please check](https://caniuse.com/#feat=serviceworkers)

## Deploy on IIS

> **:exclamation: Caution**
>
> The url of the application should end with **audit-everywhere**
>

Copy the content of the `Zip file` to `C:\inetpub\wwwroot\audit-everywhere`

## Configuration file

Create the application configuration file **config.json**. Copy `C:\inetpub\wwwroot\audit-everywhere\config\config.json.example` to `C:\inetpub\wwwroot\audit-everywhere\config\config.json`

- Set **ROOT_API** to the root url of HOPEX no leading HOPEX no leading **/**. For instance `https://myHopexRootURL.mycompany.com` will be the **ROOT_API** if  `https://myHopexRootURL.mycompany.com/hopex` is the URL of HOPEX.
- The **environmentId** is the absolute identifier of the production environment you can get it form the megasite.ini and convert it.
- The **repositoryId** is the absolute identifier of the repository you can get it form the megaenv.ini and convert it.
- The **profileId** is the absolute identifier of the profile the default value is the absolute identifier of the profile **Auditor**.
- Set the **client_secret** according HOPEX configuration.
- The **validatedStatus** defines the list of statuses of a read only activity, each status being separated by the character '|'. If you change the list, do not forget to add **localyvalidated** status given by the application when tap on complete activity.
- The **unvalidatedStatus** defines the list of the statuses of an editable activity, each status being separated by the character '|'.
- The **connectivity url** can be set to `https://myHopexRootURL.mycompany.com/audit-everywhere/img/px.gif` to avoid cross-site warning, if `https://myHopexRootURL.mycompany.com` is the ROOT_API.

 ```json
{
  "ROOT_API": "",                     "Comment of ROOT_API":     " root url of HOPEX no leading HOPEX no leading /",
  "environmentId": "",                "Comment of environmentId":" Absolute identifier of the environment see megasite.ini and convert it",
  "repositoryId": "",                 "Comment of repositoryId": " Absolute identifier of the repository  see megaenv.ini and convert it",
  "profileId": "tWisjijuFnES",        "Comment of profileId":    " Absolute identifier of the Auditor profile by default tWisjijuFnES",
  "client_id": "hopexapi",            "Comment of client_id":    " Authentication Client Id",
  "client_secret": "secret",          "Comment of client_secret":" Authentication Client secret Set the secret of hopexapi check HOPEX configuration",
  "title": "Audit Everywhere",
  "validatedStatus": "tobevalidated|validated|closed|localyvalidated", "Comment of validatedStatus": "List of statuses of a read only activity, each status being separated by the character '|'",
  "unvalidatedStatus": "created|tobereviewed",    "Comment of unvalidatedStatus":"List of the statuses of an editable activity, each status being separated by the character '|'",
  "documentCategory": "g4InWZSRGDBB",             "Comment of documentCategory":  "IdAbs of document Category: audit evidences",
  "documentPattern": "KoQoM0jRGLZH",              "Comment of DocumentPattern":   "IdAbs of document Pattern: audit evidences",
  "impacts": [ "VeryLow","Low", "Medium", "High", "VeryHigh" ],
  "cascadeOnDelete": true,             "Comment of cascadeOnDelete": "Either delete operation should work in cascade or not",
  "connectivity": {
    "url": "https://www.google.com/images/phd/px.gif", "Comment of url":         "URL to ping in order to determine the network connectivity",
    "timeToCount": "3",        "Comment of timeToCount": "The number of time we repeat the operation",
    "threshold": "3000",       "Comment of threshold":   "The threshold at which we decide to be offline",
    "interval": "20000",       "Comment of interval":    "The time between each repetition"
  },
  "API_timeout": 6000,         "Comment of API_timeout":  " Limit of time in ms, where the application switches to offline mode 0 will ignore",
  "ASYNC_timeout": 6000,       "Comment of ASYNC_timeout":  " Limit of time in ms, where the API waits to give a response or a job ID",
  "synchroInterval" : 6000,    "Comment of synchroInterval":"Time, in ms, between two synchronization with the server HOPEX",
  "toast": {
    "actionTextColor": "black",
    "errorColor": "#EE2665",
    "successColor": "#31B672"
  }
}

 ```

 ---

## Configuration for HOPEX V3

As a reminder Audit everywhere is compatible since HOPEX V3CP4. For HOPEX V3 versions there is more recommendation:

- Have a separate backend to set up MTA (Multi Thread Apartment) for HOPEX backend
- Set up MTA in the megasite.ini on this specific machine

```ini
[System]
SPROCoThreadModel=2

[Debug]
LogSPROCoThreadModel=1
```

---

## User guide

[Audit Everywhere quick start guide](README.md)
