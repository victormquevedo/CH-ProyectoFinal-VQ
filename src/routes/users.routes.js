import express from 'express';
import { convertUser, uploadDocuments, getUsers, removeInactiveUsers, removeUser } from '../controllers/users.controllers.js';
import uploader from '../middlewares/uploader.js';

const router = express.Router();

router.post('/premium/:uid', convertUser);
router.post('/:uid/documents', uploader.array('documents'), uploadDocuments);
router.get('/', getUsers);
router.delete('/:minutes?', removeInactiveUsers);
router.delete('/user/:uid', removeUser);

export default router;
