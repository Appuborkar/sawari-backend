const express=require("express")
const config = require('./models/config');
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const process = require('process');

config();
const app = express()
// CORS Configuration
const corsOptions = {
    origin: "http://localhost:3000", // Allow only the frontend URL
    credentials: true, 
  };
  
  app.use(cors(corsOptions));
  

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/Profile', express.static(path.join(__dirname, 'Profile')));

app.use('/api/auth',require('./routes/auth'));

const busRoutes = require("./routes/busroute");
const placeRoutes = require("./routes/placeRoute");
const bookingRoutes = require("./routes/bookingRoute");
const adminRoutes= require("./routes/adminRoute");

// Use Routes
app.use("/api/bus", busRoutes);
app.use("/api/place", placeRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT ||5000;
app.get('/',(req,res)=>{
    res.send("Server is running on the port 5000")
}).listen(PORT,()=>{
    console.log("Booking platform is ready to listen on port 5000")
});

