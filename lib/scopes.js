const { trackedIssuesQuery, updateIssueMutation } = require('./queries')
const { minimizeComment } = require('./comments')

const parseIssueDescription = async(context) => {
    let resultMatch = null
    resultMatch = matchLocalIssue(context, context.payload.issue.body) || matchRemoteIssue(context.payload.issue.body)
    if (!resultMatch) {
      return null
    }
    const { issueNumber, owner, repo, local } = resultMatch
    const orgOrUser = context.payload.organization ? 'organization' : 'user'
    const variables = {
      owner,
      repo,
      issue: issueNumber
    }
    try {
      const data = await context.octokit.graphql(trackedIssuesQuery(orgOrUser), variables)
      const {body, id, trackedIssues} = data[orgOrUser].repository.issue
      return {
        issueNumber,
        owner,
        repo,
        betIssueDescription: body,
        issueNodeId: id,
        trackedTasks : trackedIssues.nodes.map(issue => issue.number),
        local
      }
    } catch (error) {
      console.log(`Failed query for issue #${issueNumber}`, error)
      return null
    }
}

const addScopeToBet = async(context, description) => {
  const { betIssueDescription, issueNodeId, issueNumber, trackedTasks, local } = description
  const regex = /###?\sScope([^-]+)((-\s+\[[\sX|x]\]\s*#?.+\s*)+)/
  const match = betIssueDescription.match(regex)
  const taskNumber = local ? `#${context.payload.issue.number}` : `${context.payload.issue.html_url}`
  if (!match) {
    return false
  }
  const currentScope = match[2].trim()
  const newTask = `- [ ] ${taskNumber}`
  if (currentScope.includes(newTask)) {
    return false
  }
  const newScope = `${currentScope}\n${newTask}`
  const newBetDescription = betIssueDescription.replace(currentScope, newScope)
  const variables = {
      input : {
        id: issueNodeId,
        body: newBetDescription
      }
  }
  try {
    await context.octokit.graphql(updateIssueMutation, variables)
    return true
  } catch (error) {
    console.log(`Failed mutation for issue #${issueNodeId}`, error)
    return false
  }
}

const handleScopeCommand = async(context) => {
  const comment = context.payload.comment
  const issueNodeId = context.payload.issue.node_id
  const body = context.payload.issue.body
  const regex = /###?\sScope([^-]+)((-\s+\[[\sX|x]\]\s*#?.+\s*)+)/
  const match = body.match(regex)
  const commentNodeId = context.payload.comment.node_id
  if (!match) {
    false
  }
  const currentScope = match[2].trim()

  if (comment.body.includes('/scope') && !comment.user.login.endsWith('[bot]')) {
      const parseCommand = _parseScopeCommand(context, comment.body)
      if (!parseCommand) {
        return false
      }
      const { operation, scopeTaskNumber,  uri, reason} = parseCommand
      const newTask = `- [ ] ${uri}`
      if (currentScope.includes(newTask) && operation === 'add') {
        return false
      }
      const newScope = `${currentScope}\n${newTask}`
      let newBody = body
      if (operation === 'add') {
        newBody = body.replace(currentScope, newScope)
      } else if (operation === 'remove') {
        newBody = body.replace(`${newTask}\r\n`, '')
        newBody = newBody.replace(`${newTask}\n`, '')
      }
      const variables = {
          input : {
            id: issueNodeId,
            body: newBody
          }
      }
      try {
        await context.octokit.graphql(updateIssueMutation, variables)
        await minimizeComment(context, commentNodeId)
        return true
      } catch (error) {
        console.log(`Failed mutation for issue #${issueNodeId}`, error)
        return false
      }
  }
}

const matchLocalIssue = (context, body) => {
  const regex = /(Related\sto\s+(\S+)?#(\d+))/
  const match = regex.exec(body)
  if (!match) {
    return false
  }
  const repoFull = match[2] ? match[2] : context.payload.repository.full_name
  const owner = repoFull.split('/')[0]
  const repo = repoFull.split('/')[1]
  const issueNumber = Number(match[3])
  return {
    issueNumber,
    owner,
    repo,
    local: true
  }
}

const matchRemoteIssue = (body) => {
  const regex = /Related\sto\s+https:\/\/(?:\S)*github\.com\/([\w,\-,\_]+)\/([\w,\-,\_]+)\/issues\/([\d]+)/
  const match = regex.exec(body)
  if (!match) {
    return false
  }
  return {
    issueNumber: Number(match[3]),
    owner: match[1],
    repo: match[2],
    local: false
  }
}

const matchRelatedIssue = (context, body) => {
  return matchLocalIssue(context, body) || matchRemoteIssue(body)
}

function _parseScopeCommand(context, comment = '') {
  const matches = comment.match(/^\/scope[\s]+(remove|add)[\s]+(?:#([\d]+))?(?:(https:\/\/(?:\S)*github\.com\/([\w,\-,\_]+)\/([\w,\-,\_]+)\/issues\/([\d]+)))?[\d\n\r]*(.*)/s)
  console.log(`comment`, comment)
  console.log(`matches -> `, JSON.stringify(matches, null, 4))
  if (matches && matches.length === 8) {
    if (matches[2]) {
      // match local issues
      return {
        operation: matches[1],
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        scopeTaskNumber: matches[2],
        reason: matches[7].replace('\r', '').replace('\n', '').trim(),
        uri: `#${matches[2]}`
      }
    }
    else {
      // match remote issues
      return {
        operation: matches[1],
        owner: matches[4],
        repo: matches[5],
        scopeTaskNumber: matches[6],
        reason: matches[7].replace('\r', '').replace('\n', '').trim(),
        uri: matches[3]
      }
    }
  }
  return null
}

exports.parseIssueDescription = parseIssueDescription
exports.addScopeToBet = addScopeToBet
exports.matchRelatedIssue = matchRelatedIssue
exports.handleScopeCommand = handleScopeCommand