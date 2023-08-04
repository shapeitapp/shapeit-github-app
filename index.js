/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */
module.exports = (app) => {
  // Your code here
  app.log.info("Yay, the app was loaded!")
  const commentHeader = 'Thanks for creating a new pitch'
  const commentText = 'Thanks for creating a new pitch 🥳. You can now create or link existing scopes. To know how to link scopes, check out this guide: https://example.com'

  app.on("issues.labeled", async (context) => {
    if (context.payload.label?.name === 'pitch') {
       const query = `query($owner: String!, $repo: String!, $issueNumber: Int!) { 
        user(login: $owner) {
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
      const data = await context.octokit.graphql(query, 
      {
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        issueNumber: context.payload.issue.number
      })
      const comments = data?.user?.repository?.issue?.comments?.nodes
      const existingBotComment = comments.filter(comment => comment.body.includes(commentHeader))
      if (existingBotComment.length === 0) {
        const issueComment = context.issue({
          body: commentText,
        })
        return context.octokit.issues.createComment(issueComment)
      }
    }
  });

  app.on("issues.edited", async (context) => {
    console.log(context.payload)
    console.log("test")
  });

  app.on("projects_v2_item.edited", async (context) => {
    console.log(context.payload)
  })

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
