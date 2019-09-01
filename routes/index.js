const router = require('express').Router();

router.get('/', (req, res) => {
    res.render('index', { pageTitle: 'Bongo Cat', user: req.session.user || null });
});

router.get('/commands', (req, res) => {
    res.render('commands', { pageTitle: 'Bongo Cat', user: req.session.user || null });
});

router.get('*', function(req, res){
    res.status(404).render('404', { pageTitle: 'Bongo Cat', user: req.session.user || null });
    });

module.exports = router;