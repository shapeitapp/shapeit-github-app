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


exports.trackedIssuesQuery = trackedIssuesQuery
exports.getIssue = trackedIssuesQuery
exports.updateIssueMutation = updateIssueMutation
exports.findCommentsQuery = findCommentsQuery
exports.createCommentMutation = createCommentMutation
exports.itemProjectQuery = itemProjectQuery