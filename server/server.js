const express = require("express");
const cors = require("cors");

const scanRoutes = require("./routes/scanRoutes");
const pdfRoutes = require("./routes/pdfRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", scanRoutes);
app.use("/api", pdfRoutes);

app.get("/", (req, res) => {
  res.send("SEO Scanner Backend Running");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});