const Issue = require("../models/Issue");
const Assignment = require("../models/Assignment");
const { matchVolunteers } = require("../utils/matchEngine");


// 🟢 CREATE ISSUE (Admin only)
exports.createIssue = async (req, res) => {
  try {
    const { title, description, type, urgency, location } = req.body;

    const issue = await Issue.create({
      title,
      description,
      type,
      urgency,
      location,
    });

    res.status(201).json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 🟢 GET ALL ISSUES
exports.getIssues = async (req, res) => {
  try {
    const issues = await Issue.find();
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 🟢 GET SINGLE ISSUE
exports.getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 🟢 UPDATE ISSUE
exports.updateIssue = async (req, res) => {
  try {
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after" }
    );

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 🟢 DELETE ISSUE
exports.deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.json({ message: "Issue deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 🤖 MATCH + ASSIGN (MAIN FEATURE)
exports.matchAndAssign = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    const matches = await matchVolunteers(issue);

    const assignments = [];

    for (let m of matches) {
      const assignment = await Assignment.create({
        issueId: issue._id,
        volunteerId: m.volunteer._id,
      });

      assignments.push(assignment);
    }

    res.json({
      message: "Volunteers assigned successfully",
      matches,
      assignments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};