const { handleNewPitch, handleNewScope, getProjectNodeItem } = require('./lib/onboarding')
const { parseIssueDescription, addScopeToBet, handleScopeCommand } = require('./lib/scopes')
const { handleProgress } = require('./lib/progress')

const ITEM_ISSUE_TYPE = "Issue"
const KIND_FIELD = "Kind"
const PITCH_KIND_LABEL = "Pitch"
const BET_KIND_LABEL = "Bet"

module.exports = (app) => {
  app.log.info("Yay, the app was loaded!")

  app.on(["issues.edited", "issues.opened"], async (context) => {
    const issueNumber = context.payload.issue.number
    const owner = context.payload.repository.owner.login
    const repo = context.payload.repository.name
    const issueNodeId = context.payload.issue.node_id
    const description = await parseIssueDescription(context)
    if (description) {
      await addScopeToBet(context, description)
      await handleNewScope(context, owner, repo, issueNodeId, issueNumber)
    }
  })

  app.on(["projects_v2_item.edited", "projects_v2_item.created"], async (context) => {
    const projectNodeId = context.payload.projects_v2_item.project_node_id
    const itemType = context.payload.projects_v2_item.content_type
    const itemNodeId = context.payload.projects_v2_item.node_id
    if (itemType === ITEM_ISSUE_TYPE) {
      const item = await getProjectNodeItem(context, projectNodeId, itemNodeId)
      const pitchType = item.fieldValues.nodes.find(item => item?.field?.name === KIND_FIELD && item?.name === PITCH_KIND_LABEL)
      const betType = item.fieldValues.nodes.find(item => item?.field?.name === KIND_FIELD && item?.name === BET_KIND_LABEL)
      const owner = item.content.repository.owner.login
      const repository = item.content.repository.name
      const issueNodeId = item.content.id
      const issueNumber = item.content.number
      if (pitchType || betType) {
        await handleNewPitch(context, owner, repository, issueNodeId, issueNumber)
      }
    }
  })

  app.on("issue_comment.created", async(context) => {
    const issueNumber = context.payload.issue.number
    const owner = context.payload.repository.owner.login
    const repo = context.payload.repository.name
    await handleProgress(context, owner, repo, issueNumber)
    await handleScopeCommand(context)
  })
};
