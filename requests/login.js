const { json } = require("express");
const firebase = require("firebase/app"),
    express = require('express');

// Add the Firebase products that you want to use
require("firebase/auth");
require("firebase/database");

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAP1WveZkyLo6rCwSnsNIJYTycZmEqGVwA",
    authDomain: "jobs-cv2.firebaseapp.com",
    databaseURL: "https://jobs-cv2-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "jobs-cv2",
    storageBucket: "jobs-cv2.appspot.com",
    messagingSenderId: "704414501420",
    appId: "1:704414501420:web:be1635e4d061c891fddf89",
    measurementId: "G-DH8CX6PYWH"
  };

const database = firebase.database();

const router = express.Router();

router.post('/', (request, response) => {
    console.log(request.body);
    database.ref('user').once('value').then(snapshot => {
        const data = snapshot.val();
        if (data) {
            console.log(data);
            if(request.body.email === data.username && request.body.password == data.password) {
            response.status(200).send(data);
            } else {
                response.status(404).send('User not found.')
            }
            
        } else {
            response.status(400).send("No stored user.");
        }
    });
});
module.exports = router;