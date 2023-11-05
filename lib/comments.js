const { findCommentsQuery, createCommentMutation, updateCommentMutation, minimizeCommentMutation } = require('./queries')

const addComment = async(context, owner, repo, issueNodeId, issueNumber, commentHeader, commentText) => {
    const previousComment = await findPreviousComment(context, owner, repo, issueNumber, commentHeader)
    const commentWithHeader = `${commentText}\n${headerComment(commentHeader)}`
    const variables = {
        input : {
            subjectId: issueNodeId,
            body: commentWithHeader
        }
    }

    if (previousComment === null) {
        try {
            await context.octokit.graphql(createCommentMutation, variables)
            return true
        } catch (error) {
            console.log(`Failed mutation for issue #${issueNodeId}`, error)
            return false
        }
    }
}

const findPreviousComment = async(context, owner, repo, issueNumber, search, includeBots = true) => {
    let after = null
    let hasNextPage = true
    let comments = []
    let existingBotComment = null

    while (hasNextPage) {
        let data = await context.octokit.graphql(findCommentsQuery,
        {
            owner: owner,
            repo: repo,
            issueNumber: issueNumber,
            after: after
        })
        comments = data['organization'].repository?.issue?.comments?.nodes
        hasNextPage = data['organization'].repository?.issue?.comments?.pageInfo?.hasNextPage ?? false
        after = data['organization'].repository?.issue?.comments?.pageInfo?.endCursor
        existingBotComment = comments.find(comment => comment.body.includes(search))
        if (existingBotComment) {
            if (!includeBots && existingBotComment?.author?.login.includes('-bot')) {
                continue
            }
            return existingBotComment
        }
    }
    return null
}

const headerComment = (header) => {
    return `<!-- ShapeIt Bot Comment ${header} -->`
}

const updateComment = async(context, commentNodeId, newBody) => {
    const variables = {
        input : {
            id: commentNodeId,
            body: newBody
        }
    }
    try {
        await context.octokit.graphql(updateCommentMutation, variables)
    } catch (error) {
        console.log(`Failed mutation for comment ${commentNodeId}`, error)
    }
}

const minimizeComment = async(context, commentNodeId) => {
    const variables = {
        input : {
            subjectId: commentNodeId,
            classifier: 'DUPLICATE'
        }
    }
    try {
        await context.octokit.graphql(minimizeCommentMutation, variables)
    } catch (error) {
        console.log(`Failed mutation for comment ${commentNodeId}`, error)
    }
}



exports.addComment = addComment
exports.updateComment = updateComment
exports.headerComment = headerComment
exports.findPreviousComment = findPreviousComment
exports.minimizeComment = minimizeComment