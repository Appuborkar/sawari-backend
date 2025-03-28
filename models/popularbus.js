// const express = require('express');
// const mongoose = require('mongoose');
// const app = express();
// app.use(express.json());

// // MongoDB schema for bus route data and user's recent trips
// const busRouteSchema = new mongoose.Schema({
//   source: String,
//   destination: String,
//   duration: String,
//   price: Number,
//   img: String,
// });
// const BusRoute = mongoose.model('BusRoute', busRouteSchema);

// const userSchema = new mongoose.Schema({
//   username: String,
//   email: String,
//   recentTrips: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BusRoute' }],
// });
// const User = mongoose.model('User', userSchema);

// // Get popular bus routes or user's recent trips
// app.get('/api/routes', async (req, res) => {
//   const user = await User.findById(req.user.id).populate('recentTrips');
//   const routes = user ? user.recentTrips : await BusRoute.find();
//   res.json(routes);
// });

// // Add a bus route to the user's recent trips
// app.post('/api/add-recent-trip', async (req, res) => {
//   const { userId, routeId } = req.body;
//   const user = await User.findById(userId);
//   if (user) {
//     user.recentTrips.push(routeId);
//     await user.save();
//     res.status(200).send('Recent trip added successfully');
//   } else {
//     res.status(404).send('User not found');
//   }
// });

// // mongoose.connect('mongodb://localhost/busbooking', { useNewUrlParser: true, useUnifiedTopology: true });
// app.listen(5000, () => console.log('Server running on http://localhost:5000'));
