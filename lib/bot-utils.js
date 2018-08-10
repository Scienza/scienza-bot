module.exports = {
    isAdmin(msg) {
        console.log('msg', msg)
        return false
    },
    formatDisplayName(first, last) {
        return last ? first + ' ' + last : first
    },
    formatUsername(username) {
        return username ? '@' + username : '(none)'
    },
    capitalise([s, ...tring]) {
        return s.toUpperCase() + tring.join('')
    }
}