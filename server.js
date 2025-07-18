import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import postsRouter from "./routes/posts.js";

const app = express();
const port = process.env.PORT || 3000;

// __dirname workaround for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// In-app API endpoint
app.use("/posts", postsRouter); // backend API now served directly

// Main page rendering
app.get("/", async (req, res) => {
  try {
    const response = await axios.get("http://localhost:" + port + "/posts");
    res.render("index.ejs", { posts: response.data });
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts" });
  }
});

// New post form
app.get("/new", (req, res) => {
  res.render("modify.ejs", { heading: "New Post", submit: "Create Post" });
});

// Edit post form
app.get("/edit/:id", async (req, res) => {
  try {
    const response = await axios.get(
      `http://localhost:${port}/posts/${req.params.id}`
    );
    res.render("modify.ejs", {
      heading: "Edit Post",
      submit: "Update Post",
      post: response.data,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching post" });
  }
});

// Create post
app.post("/api/posts", async (req, res) => {
  try {
    await axios.post(`http://localhost:${port}/posts`, req.body);
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: "Error creating post" });
  }
});

// Update post
app.post("/api/posts/:id", async (req, res) => {
  try {
    await axios.patch(
      `http://localhost:${port}/posts/${req.params.id}`,
      req.body
    );
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: "Error updating post" });
  }
});

// Delete post
app.get("/api/posts/delete/:id", async (req, res) => {
  try {
    await axios.delete(`http://localhost:${port}/posts/${req.params.id}`);
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: "Error deleting post" });
  }
});

// Start app
app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
});
