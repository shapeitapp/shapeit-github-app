const isScope = (body) => {
    const regexSimple = /(Related\sto\s+(\S+)?#(\d+))/
    const match = regexSimple.exec(body)
    return !(!match)
}

exports.isScope = isScope