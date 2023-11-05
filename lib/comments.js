const { findCommentsQuery, createCommentMutation } = require('./queries')

const addComment = async(context, owner, repo, issueNodeId, issueNumber, commentHeader, commentText) => {
    const data = await context.octokit.graphql(findCommentsQuery,
    {
        owner: owner,
        repo: repo,
        issueNumber: issueNumber
    })
    const comments = data['organization'].repository?.issue?.comments?.nodes
    const existingBotComment = comments.filter(comment => comment.body.includes(commentHeader))
    const variables = {
        input : {
        subjectId: issueNodeId,
        body: commentText
        }
    }
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

const findPreviousComment = async(context, header) => {
    // TODO Find any comment
}

const headerComment = (header) => {
    return `<!-- ShapeIt Bot Comment${header} -->`
}


exports.addComment = addComment