import express from 'express';
const router = express.Router();
import {getTags, createTag} from '../controllers/tags.controller.js';

router.get('/tags', getTags);
router.post('/tags', createTag);

export default router;
