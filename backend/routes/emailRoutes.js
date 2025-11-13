const express = require('express');
const { handleLandingSignup } = require('../controllers/emailController');

const router = express.Router();

router.post('/landing-signup', handleLandingSignup);

module.exports = router;



