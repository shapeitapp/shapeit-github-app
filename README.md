# shapeit-github-app

> This Github is built with [Probot](https://github.com/probot/probot)

## Setup

`.env` file is required

```
WEBHOOK_PROXY_URL=https://smee.io/XXXX
APP_ID=XXXX
PRIVATE_KEY_PATH=./private-key.pem
WEBHOOK_SECRET=XXXX
GITHUB_CLIENT_ID=XXX
GITHUB_CLIENT_SECRET=XXXX
```

`WEBHOOK_PROXY_URL` is only required in local dev.

To create a Github app visit : https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/registering-a-github-app


```sh
# Install dependencies
npm install

# Run the bot
npm start
```
