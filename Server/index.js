const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");

const app = express();

app.use(cors());
app.use(express.json());

console.log("MONGO_URI:", process.env.MONGO_URI);


mongoose.connect("mongodb://localhost:27017")
.then(() => {
    console.log("MongoDB Connected Successfully");
})
.catch((err) => {
    console.log("MongoDB Connection Error:");
    console.log(err.message);
});



app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);

app.get("/", (req, res) => {
    res.send("SDAS Backend Running");
});

const PORT = process.env.PORT || 3000;
 
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
