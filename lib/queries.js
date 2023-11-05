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

const findCommentsQuery = `query($owner: String!, $repo: String!, $issueNumber: Int!, $after: String) { 
    organization(login: $owner) {
        repository(name: $repo) {
        issue(number: $issueNumber) {
            id
            comments(first: 100, after: $after) {
              nodes {
                id
                body
                author {
                  login
                }
              }
            pageInfo {
              hasNextPage
              endCursor
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

const updateCommentMutation = `mutation ($input: UpdateIssueCommentInput!) {
  updateIssueComment(input: $input) {
      clientMutationId
  }
}`

const minimizeCommentMutation = `mutation ($input: MinimizeCommentInput!) {
  minimizeComment(input: $input) {
      clientMutationId
  }
}`

const itemProjectQuery =  `query($projectNodeId: ID!) {
  node(id: $projectNodeId) {
   ... on ProjectV2 {
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
}`

exports.trackedIssuesQuery = trackedIssuesQuery
exports.getIssue = trackedIssuesQuery
exports.updateIssueMutation = updateIssueMutation
exports.findCommentsQuery = findCommentsQuery
exports.createCommentMutation = createCommentMutation
exports.itemProjectQuery = itemProjectQuery
exports.updateCommentMutation = updateCommentMutation
exports.minimizeCommentMutation = minimizeCommentMutation