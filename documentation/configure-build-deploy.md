# Configure, build and deploy **Audit everywhere**

Pre requisite on the build platform

- Install [node.js](https://nodejs.org/en/download/)
- Install [Vue.js](https://cli.vuejs.org/guide/installation.html)

Pre requisite to deploy and use Audit everywhere

- You need to install **HOPEX Graphql** module you can download it from [HOPEX store](https://community.mega.com/t5/HOPEX-Store/GraphQL-REST-API/td-p/21381).
- **HTTPS** protocol is mandatory since **Audit everywhere** is a [PWA](https://developers.google.com/web/ilt/pwa/introduction-to-progressive-web-app-architectures).
- [IIS URL Rewrite Extension](https://www.iis.net/downloads/microsoft/url-rewrite), download and install (with MS Web Platform Installer).

## Configure Audit Everywhere

You can configure most of the application parameters before the build.

### Configuration file

To configure the application in the `public/config` copy the `config.json.example` to `config.json`

- Set **ROOT_API** to the root url of HOPEX no leading HOPEX no leading /.
- **environmentId** is the absolute identifier of the production environment you can get it form the megasite.ini and convert it.
- **repositoryId** is the absolute identifier of the repository you can get it form the megaenv.ini and convert it.
- **profileId** is the absolute identifier of the profile the default value is the absolute identifier of the profile **Auditor**.
- Set the **client_secret** according HOPEX configuration.

 ```json
{
  "ROOT_API": "",                                      "Comment of ROOT_API":     " root url of HOPEX no leading HOPEX no leading /",
  "API_timeout": 6000,                                 "Comment of API_timeout":  " Limit of time in ms, where the application switches to offline mode 0 will ignore",
  "environmentId": "",                                 "Comment of environmentId":" Absolute identifier of the environment see megasite.ini and convert it",
  "repositoryId": "",                                  "Comment of repositoryId": " Absolute identifier of the repository  see megaenv.ini and convert it",
  "profileId": "tWisjijuFnES",                         "Comment of profileId":    " Absolute identifier of the Auditor profile",
  "grant_type": "password",                            "Comment of grant_type":   " Authentication parameter",
  "scope": "hopex offline_access openid read write",   "Comment of scope":        " Authentication scope",
  "client_id": "hopexapi",                             "Comment of client_id":    " Authentication Client Id",
  "client_secret": "secret",                           "Comment of client_secret":" Authentication Client secret Set the secret of hopexapi check HOPEX configuration",
  "title": "Audit Everywhere",
  "validatedStatus": "tobevalidated|validated|closed", "Comment of validatedStatus":" Values to be separated by the '|' character",
  "unvalidatedStatus": "",                             "Comment of unvalidatedStatus":" Values to be separated by the '|' character",
  "impacts": [ "VeryLow","Low", "Medium", "High", "VeryHigh" ],
  "toast": {
    "actionTextColor": "black",
    "errorColor": "#EE2665",
    "successColor": "#31B672"
  }
}
 ```

[!code-json[config.json](../public/config/config.json.example)]

### Application virtual folder

By default the application is configure to be deploy under : `https://ROOT_API/audit-everywhere`

To modify this virtual folder in the  `vue.config.js` file modify the `publicPath`.

```js
module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/audit-everywhere/' : '/HOPEX-audit-mission/',
  pwa: {
```

[!code-js[vue.config.js](../vue.config.js)]

See [Configuration Reference](https://cli.vuejs.org/config).

## Build Audit Everywhere

On a command prompt run the following command in the application folder to build the application

```powershell
npm install
npm run build
```

The result of the build will be on the `dist` folder. it is ready to be deploy on your production server.

It will contain the config.json in `dist/public/config`, you can also change some configuration in this file after the build.

## Deploy Audit Everywhere on IIS  

Copy the content of the `dist` folder to `C:\inetpub\wwwroot\audit-everywhere`

check the `web.config` to match IIS URL Rewrite Extension needs.

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

## Command details

### Project setup

```bash
npm install
```

### Compiles and hot-reloads for development

```bash
npm run serve
```

### Compiles and minifies for production

```bash
npm run build
```

### Run your tests

```bash
npm run test
```

### Lints and fixes files

```bash
npm run lint
```

### Run your unit tests

```bash
npm run test:unit
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).
