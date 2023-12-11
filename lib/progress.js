const { findPreviousComment, headerComment, updateComment, minimizeComment } = require('./comments')

//@samz updated progress to 60% Screenshot 2023-07-05 at 11 51 11 on June 30, 2023 (and the description below if any)

const handleProgress = async(context, owner, repo, issueNumber) => {
    // const searchComment = await findPreviousComment(context, owner, repo, issueNumber, '/progress', false)
    const comment = context.payload.comment
    if (comment.body.includes('/progress') && !comment.user.login.endsWith('[bot]')) {
        const commentNodeId = context.payload.comment.node_id
        const author = comment.user.login
        const progress = _getPercentage(comment.body)
        const status = _getStatus(comment.body)
        const date = new Date(comment.created_at).toUTCString()
        const commentText = `🚀 @${author} updated progress to **${progress}%** on _${date}_:\n${status}`
        const commentWithHeader = `${commentText}\n${headerComment('scope')}`
        const botCommentToUpdate = await findPreviousComment(context, owner, repo, issueNumber, headerComment('scope'))
        await updateComment(context, botCommentToUpdate.id, commentWithHeader)
        await minimizeComment(context, commentNodeId)
    }
}

const handleAtRisk = async(context, owner, repo, issueNumber) => {
    const comment = context.payload.comment
    if (comment.body.includes('/at-risk') && !comment.user.login.endsWith('[bot]')) {
        const commentNodeId = context.payload.comment.node_id
        const author = comment.user.login
        const details = _getAtRiskDetails(comment.body)
        const date = new Date(comment.created_at).toUTCString()
        const commentText = `⚠️ @${author} marked this issue at risk on _${date}_:\n\n> **Reason**:${details}`
        const commentWithHeader = `${commentText}\n${headerComment('scope')}`
        const botCommentToUpdate = await findPreviousComment(context, owner, repo, issueNumber, headerComment('scope'))
        await updateComment(context, botCommentToUpdate.id, commentWithHeader)
        await minimizeComment(context, commentNodeId)
    }
}

function _getPercentage(comment = '') {
    const matches = comment.match(/^\/progress[\s]+([\d]+)/)
    if (matches && matches.length === 2) {
      let result = Number(matches[1])
      if (Number.isNaN(result)) return null
      if (result < 0) return 0
      if (result > 100) return 100
      return result
    }
    return null
}

function _getStatus(comment = '') {
    const matches = comment.match(/^\/progress[\s]+[\d\n]+(.*)/s)
    if (matches && matches.length === 2) return matches[1]
    return null
}

function _getAtRiskDetails(comment = '') {
    const matches = comment.match(/^\/at-risk[\s]+(.*)/s)
    if (matches && matches.length === 2) return matches[1]
    return null
}
  

exports.handleProgress = handleProgress
exports.handleAtRisk = handleAtRisk