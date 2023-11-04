const { handleNewPitch, getProjectNodeItem } = require('./lib/onboarding')
const { parseIssueDescription, addScopeToBet } = require('./lib/scopes')

const ITEM_ISSUE_TYPE = "Issue"
const KIND_FIELD = "Kind"
const PITCH_KIND_LABEL = "Pitch"
const BET_KIND_LABEL = "Bet"

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
    console.log(`projects_v2_item.edited triggered`)

    const projectNodeId = context.payload.projects_v2_item.project_node_id
    const itemType = context.payload.projects_v2_item.content_type
    const itemNodeId = context.payload.projects_v2_item.node_id
    if (itemType === "Issue") {
      const item = await getProjectNodeItem(context, projectNodeId, itemNodeId)
      const pitchType = item.fieldValues.nodes.find(item => item?.field?.name === KIND_FIELD && item?.name === PITCH_KIND_LABEL)
      const betType = item.fieldValues.nodes.find(item => item?.field?.name === KIND_FIELD && item?.name === BET_KIND_LABEL)
      const owner = item.content.repository.owner.login
      const repository = item.content.repository.name
      const issueNodeId = item.content.id
      const issueNumber = item.content.number
      console.log(owner, repository, issueNodeId)
      if (pitchType || betType) {
        console.log("That's a pitch or a Bet")
        await handleNewPitch(context, owner, repository, issueNodeId, issueNumber)
      }
      console.log(`item`, item)
    } else {
      console.log("Not an issue")
    }
  })
};
