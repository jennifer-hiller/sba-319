import express from "express";
import Task from "../models/Task.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    if (req.query.status) {
      const { status } = req.query;
      const tasks = await Task.find({ status });
      res.status(200).json(tasks);
    } else {
      const tasks = await Task.find({});
      res.status(200).json(tasks);
    }
  } catch (e) {
    res.send(e).status(400);
  }
});

router.post("/", async (req, res) => {
  try {
    const assigner = await User.findById(req.body.createdBy);
    if (!assigner) return res.status(404).send("Assigner not found");
    const assignee = await User.findById(req.body.assignedTo);
    if (!assignee) return res.status(404).send("Assignee not found");
    const task = new Task(req.body);
    assigner.created.push(task._id);
    assignee.assigned.push(task._id);
    await task.save();
    await assigner.save();
    await assignee.save();
    res.status(201).json(task);
  } catch (e) {
    res.send(e).status(400);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("comments")
      .populate("assignedTo", "username")
      .populate("createdBy", "username");

    if (!task) return res.status(404).send("Task not found");
    res.status(200).json(task);
  } catch (e) {
    res.send(e).status(400);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!task) return res.status(404).send("Task not found");
    const assigner = await User.findById(task.createdBy);
    if (!assigner) return res.status(404).send("Assigner not found");
    const assignee = await User.findById(task.assignedTo);
    if (!assignee) return res.status(404).send("Assignee not found");
    assigner.created.pull(task._id);
    assignee.assigned.pull(task._id);
    await assigner.save();
    await assignee.save();
    const newAssigner = await User.findById(req.body.createdBy);
    if (!newAssigner) return res.status(404).send("Assigner not found");
    const newAssignee = await User.findById(req.body.assignedTo);
    if (!newAssignee) return res.status(404).send("Assignee not found");
    newAssigner.created.push(task._id);
    newAssignee.assigned.push(task._id);
    await newAssigner.save();
    await newAssignee.save();
    res.status(200).json(task);
  } catch (e) {
    res.send(e).status(400);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).send("Task not found");
    const assigner = await User.findById(task.createdBy);
    if (!assigner) return res.status(404).send("Assigner not found");
    const assignee = await User.findById(task.assignedTo);
    if (!assignee) return res.status(404).send("Assignee not found");
    assigner.created.pull(task._id);
    assignee.assigned.pull(task._id);
    await assigner.save();
    await assignee.save();
    res.status(200).json(task);
  } catch (e) {
    res.send(e).status(400);
  }
});

export default router;
