const trackedIssuesQuery = (orgOrUser) =>  `query($owner: String!, $repo: String!, $issue: Int!) { 
  ${orgOrUser}(login: $owner) {
      repository(name: $repo) {
          issue(number: $issue) {
              id
              title
              body
              trackedIssues(first:100) {
                nodes {
                  number
                }
              }
          }
      }
  }
}`

const updateIssueMutation = `mutation ($input: UpdateIssueInput!) {
    updateIssue(input: $input) {
        clientMutationId
    }
}`

const parseIssueDescription = async(context) => {
    const regexSimple = /(Related\sto\s+(\S+)?#(\d+))/
    const description = context.payload.issue.body
    const match = regexSimple.exec(description)
    if (!match) {
      console.log("Nothing to do in this issue")
      return null
    }
    let result = null
    const repoFull = match[2] ? match[2] : context.payload.repository.full_name
    const owner = repoFull.split('/')[0]
    const repo = repoFull.split('/')[1]
    const issueNumber = Number(match[3])
    const repoUrl = `https://github.com/${repoFull}`
    const orgOrUser = context.payload.organization ? 'organization' : 'user'
    const variables = {
      owner,
      repo,
      issue: issueNumber
    }
    try {
      const data = await context.octokit.graphql(trackedIssuesQuery(orgOrUser), variables)
      const {body, id, trackedIssues} = data[orgOrUser].repository.issue
      result = {
        issueNumber,
        owner,
        repo,
        repoUrl,
        betIssueDescription: body,
        issueNodeId: id,
        trackedTasks : trackedIssues.nodes.map(issue => issue.number)
      }
    } catch (error) {
      console.log(`Failed query for issue #${issueNumber}`, error)
    }
    return result
}

const addScopeToBet = async(context, description) => {
    const { betIssueDescription, issueNodeId, trackedTasks } = description
    const regex = /###?\sScope([^-]+)((-\s+\[[\sX|x]\]\s*#?.+\s*)+)/
    const match = betIssueDescription.match(regex)
    const taskNumber = context.payload.issue.number
    if (!match) {
      console.log("Nothing to do in this issue")
      return false
    }
    const currentScope = match[2].trim()
    const newTask = `- [ ] #${taskNumber}`
    console.log(`description`, description, `trackedTasks`, trackedTasks, `taskNumber`, taskNumber)
    if (trackedTasks.includes(Number(taskNumber))) {
      console.log("This issue already exists")
      return false
    }
    const newScope = `${currentScope}\n${newTask}`
    const newBetDescription = betIssueDescription.replace(currentScope, newScope)
    const variables = {
        input : {
          id: issueNodeId,
          body: newBetDescription
        }
      };
    try {
      await context.octokit.graphql(updateIssueMutation, variables);
      console.log("Scope Added")
      return true
    } catch (error) {
      console.log(`Failed mutation for issue #${issueNodeId}`, error)
      return false
    }
}

exports.parseIssueDescription = parseIssueDescription
exports.addScopeToBet = addScopeToBet