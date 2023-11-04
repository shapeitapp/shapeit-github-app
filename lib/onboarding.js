const findCommentsQuery =  `query($owner: String!, $repo: String!, $issueNumber: Int!) { 
  organization(login: $owner) {
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

const createCommentMutation = `mutation ($input: AddCommentInput!) {
  addComment(input: $input) {
    clientMutationId
  }
}`



const itemProjectQuery = (orgOrUser, projectNodeId) => `query($owner: String!) {
  ${orgOrUser}(login: $owner) {
    projectsV2(query: "id:${projectNodeId}", first:1) {
      nodes{
        id
        number
        title
        items(first: 100) {
          nodes {
            id
            fieldValues(first:100) {
              nodes {
                ... on ProjectV2ItemFieldSingleSelectValue {
                  field {
                    ... on ProjectV2SingleSelectField {
                      name
                    }
                  }
                  name
                }
              }
            }
            content {
              ... on Issue {
                id
                title
                number
                repository {
                  name
                  isInOrganization
                  owner {
                    login
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}`



const  handleNewPitch  = async(context, owner, repo, issueNodeId, issueNumber) => {
    const commentHeader = 'Thanks for creating a new pitch'
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
    const data = await context.octokit.graphql(findCommentsQuery,
    {
      owner: owner,
      repo: repo,
      issueNumber: issueNumber
    })
    const comments = data['organization'].repository?.issue?.comments?.nodes
    console.log(`comments`, comments)
    const existingBotComment = comments.filter(comment => comment.body.includes(commentHeader))
    const variables = {
      input : {
        subjectId: issueNodeId,
        body: commentText
      }
    }
    console.log(`variables`, variables)
    if (existingBotComment.length === 0) {
      try {
        await context.octokit.graphql(createCommentMutation, variables)
        console.log("Comment Added")
        return true
      } catch (error) {
        console.log(`Failed mutation for issue #${issueNodeId}`, error)
        return false
      }
    }
}

const getProjectNodeItem = async(context, projectNodeId, itemNodeId) => {
  const orgOrUser = context.payload.organization ? 'organization' : 'user'
  const data = await context.octokit.graphql(itemProjectQuery(orgOrUser, projectNodeId),
  {
    owner: context.payload.organization.login
  })
  const items =  data[orgOrUser].projectsV2.nodes[0]?.items.nodes
  const nodeItem = items.find(item => item.id === itemNodeId)
  return nodeItem
}


exports.handleNewPitch = handleNewPitch
exports.getProjectNodeItem = getProjectNodeItem