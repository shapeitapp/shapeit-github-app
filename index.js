const { handleNewPitch } = require('./lib/onboarding')
const { parseIssueDescription, addScopeToBet } = require('./lib/scopes')

module.exports = (app) => {
  app.log.info("Yay, the app was loaded!")

  app.on("issues.labeled", async (context) => {
    if (context.payload.label?.name === 'pitch') {
      handleNewPitch(context)
    }
  });

  app.on("issues.edited", async (context) => {
    // Disabled for now, as there is a bug to fix
    // const description = await parseIssueDescription(context)
    // if (description) {
    //   await addScopeToBet(context, description)
    // }
  })

  app.on("projects_v2_item.edited", async (context) => {
    console.log(context.payload)
  })
};
