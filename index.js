const express=require("express")
const config = require('./models/config');
const cors = require("cors");
require("dotenv").config();
const path = require("path");

config();
const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ Parse URL-encoded data
app.use(cors());

app.use('/Profile', express.static('Profile'));
app.use('/api/auth',require('./routes/auth'));

// Search bus
const busRoutes = require("./routes/busroute");
const placeRoutes = require("./routes/placeRoute");

// Use Routes
app.use("/api/bus", busRoutes);
app.use("/api/place", placeRoutes);

app.get('/',(req,res)=>{
    
    res.send("Server is running on the port 5000")
}).listen(5000,()=>{
    console.log("Booking platform is ready to listen on port 5000")
});

