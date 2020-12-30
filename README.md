# AudioStation Action

### Prerequisites
1. Node.js and NPM
    + recommend installing using [nvm for Linux/Mac](https://github.com/creationix/nvm) and [nvm-windows for Windows](https://github.com/coreybutler/nvm-windows)
1. Install the [Firebase CLI](https://developers.google.com/assistant/conversational/deploy-fulfillment)
    + We recommend using MAJOR version `8`, `npm install -g firebase-tools@^8.0.0`
    + Run `firebase login` with your Google account
    
### Setup
#### Actions Console
1. From the [Actions on Google Console](https://console.actions.google.com/), **New project** > **Create project** > under **What kind of Action do you want to build?** > **Custom** > **Blank project**

#### Actions CLI
1. Install the [Actions CLI](https://developers.google.com/assistant/actionssdk/gactions)
1. Navigate to `sdk/settings/settings.yaml`, and replace `<PROJECT_ID>` with your project ID
1. Navigate to the `sdk/` directory by running `cd sdk` from the root directory of this project.
1. Run `gactions login` to login to your account.
1. Run `gactions push` to push your project.
1. Run `gactions deploy preview` to deploy the project.

#### Environment Variables
1. Go the to google [cloud console](https://console.cloud.google.com/).
1. Select the project that this action is setup within.
1. Select the cloud function that is deployed from the google actions console.
1. Edit the clou function 
1. Within the Variables, Networking and Advanced Settings area select Anvironment Variables.
1. Enter a new variable named API_HOST and enter the domain name of the server that runs AudioStation i.e. xyz.synology.me 

[Article on how this came about](https://racineennis.ca/2020/12/20/AudioStation-GoogleAssistant-integration)