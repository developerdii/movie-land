module.exports = {
    publicPath: process.env.NODE_ENV === 'production'
        ? ''
        : 'https://api.themoviedb.org/3/'
}