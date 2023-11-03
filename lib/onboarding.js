const findCommentsQuery = (orgOrUser) => `query($owner: String!, $repo: String!, $issueNumber: Int!) { 
  ${orgOrUser}(login: $owner) {
    repository(name: $repo) {
      issue(number: $issueNumber) {
        id
        comments(first: 100) {
          nodes {
            id
            body
          }
        }
      }
    }
  }
}`


const  handleNewPitch  = async(context) => {
    const commentHeader = 'Thanks for creating a new pitch'
    const commentText = 'Thanks for creating a new pitch 🥳. You can now create or link existing scopes. To know how to link scopes, check out this guide: https://example.com'
    const orgOrUser = context.payload.organization ? 'organization' : 'user'
    const data = await context.octokit.graphql(findCommentsQuery(orgOrUser), 
    {
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
      issueNumber: context.payload.issue.number
    })
    const comments = data[orgOrUser].repository?.issue?.comments?.nodes
    const existingBotComment = comments.filter(comment => comment.body.includes(commentHeader))
    if (existingBotComment.length === 0) {
      const issueComment = context.issue({
        body: commentText,
      })
      return context.octokit.issues.createComment(issueComment)
    }
}


exports.handleNewPitch = handleNewPitch