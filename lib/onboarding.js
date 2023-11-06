const { getIssue, itemProjectQuery } = require('./queries')
const { addComment, headerComment } = require('./comments')
const { matchRelatedIssue } = require('./scopes')


const  handleNewPitch  = async(context, owner, repo, issueNodeId, issueNumber) => {
    const commentHeader = 'pitch'
    const commentText = `Thanks for creating a new pitch 🥳. You can now create or link existing scopes.
You can create new scopes in two different ways:

**Option 1**
1. Edit the Pitch or Bet issue
2. Add your scope under the scope section

See this [example](https://github.com/asyncapi/studio/issues/748)

**Option 2**
1. Create a new issue
2. Add this keywork in the description \`related to #ISSUE_BET_NUMBER\`

See this [example](https://github.com/asyncapi/studio/issues/755)
    `
    await addComment(context, owner, repo, issueNodeId, issueNumber, commentHeader, commentText)
}

const getProjectNodeItem = async(context, projectNodeId, itemNodeId) => {
  const data = await context.octokit.graphql(itemProjectQuery,
  {
    projectNodeId: projectNodeId
  })
  const items =  data.node.items.nodes
  const nodeItem = items.find(item => item.id === itemNodeId)
  return nodeItem
}

const handleNewScope = async(context, owner, repo, issueNodeId, issueNumber) => {
  const commentHeader = 'scope'
  const commentText = `Thanks for creating a new scope 🥳. You can now communicate your progress
To do so, you have to leave a comment in the issue or pull request with the following syntax::

\`\`\`/progress <percentage> [message]\`\`\`

or

\`\`\`
/progress <percentage>

A multiline message.
It supports Markdown.
\`\`\`

Example

\`\`\`
/progress 50
A few notes:
* We got this figured out :tada:
* We\'re going to use [this library](#link-to-website) to avoid losing time implementing this algorithm.
* We decided to go for the quickest solution and will improve it if we got time at the end of the cycle.
\`\`\`
    `
  if (matchRelatedIssue(context, context.payload.issue.body)) {
    await addComment(context, owner, repo, issueNodeId, issueNumber, commentHeader, commentText)
  }
}


exports.handleNewPitch = handleNewPitch
exports.getProjectNodeItem = getProjectNodeItem
exports.handleNewScope = handleNewScope