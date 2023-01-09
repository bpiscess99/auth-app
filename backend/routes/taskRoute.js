const express = require('express');
const Task = require("../models/taskModel");
const router = express.Router();
const { createTask, getTasks, getTask, deleteTask, updateTask, singleUpdateTask,} = require('../controllers/taskController');


router.post("/", createTask);
router.get("/", getTasks);
router.get("/:id", getTask);
router.delete("/:id", deleteTask);
router.put("/:id", updateTask);
router.patch("/:id", singleUpdateTask);




module.exports = router;