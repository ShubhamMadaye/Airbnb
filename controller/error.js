
exports.pageNotFound = (req, res) => {
    res.status(404).render('error404', { pageTitle: 'Page Not Found', currentPage: '404' });
};