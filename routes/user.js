const express = require("express");
const router = express.Router();

router.get("/videos", (req, res) => {
  const courses = [
    {
      name: "Web Development",
      items: [
        { id: "introduction" },
        { id: "css" },
        { id: "js" },
        { id: "nodejs" },
        { id: "mongodb" },
        { id: "tailwind" },
        { id: "hosting" },
        { id: "react" },
        { id: "redux" },
        { id: "nextjs" },
      ],
    },
    {
      name: "Competitive Programming",
      items: [
        { id: "cp" },
        { id: "basics" },
        { id: "array" },
        { id: "binarySearch" },
        { id: "recursion" },
        { id: "sorting" },
        { id: "linkedList" },
        { id: "stack" },
        { id: "greedy" },
        { id: "trees" },
        { id: "trie" },
        { id: "graph" },
        { id: "dp" },
      ],
    },
    { name: "Blockchain", items: [{ id: "Solidity" }] },
    { name: "AI/ML", items: [{ id: "ai" }] },
    { name: "Cyber Security", items: [{ id: "cyberSecurity" }] },
  ];

  res.render("user/Videos", { courses }); // Passing 'courses' to the Pug template
});

module.exports = router;
