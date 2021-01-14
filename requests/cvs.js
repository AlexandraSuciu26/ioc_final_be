const { json } = require("express");
const firebase = require("firebase/app"),
express = require('express');
const { route } = require("./jobs");

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


const tableName = 'cvs'

const database = firebase.database();

const router = express.Router();

router.get('/', (request, response) => {
  database.ref('cvs').once('value').then(snapshot => {
    const cvs = snapshot.val();
    if (cvs) {
      response.status(200).send(cvs);
    } else {
      response.status(400).send("No CVs.");
    }
  });
});

router.get('/:id', (request, response) => {
  const ID = parseInt(request.params.id);
  database.ref('cvs').orderByChild('id').once('value').then(snapshot => {
      const cvList = snapshot.val();
      if (cvList[ID]) {
          response.status(200).send(cvList[ID]);
      } else {
          response.status(400).send("No cv with ID: " + ID);
      }
  });
});

router.get('/forjob/:id', (request, response) => {
  let jobID = parseInt(request.params.id);

  database.ref('cvs').once('value').then(snapshot => {
    const cvList = snapshot.val();
    let ok = false;
    if (cvList) {
      let answer = '[';
      cvList.forEach(element => {
        if (element.job_id == jobID) {
          ok = true;
          const elem = JSON.stringify(element);
          answer = answer.concat(elem + ',');
        }
      });
      if (ok) {
        answer = JSON.parse(answer.replace(/.$/, ']'));
        response.status(200).send(answer);
      } else {
        response.status(400).send("No cvs for this job.");
      }
      
    }
  });
});


router.delete('/:id', (req, res) => {
  database.ref('cvs').child(req.params.id).remove();
  res.send('ok');
});

router.put('/:id', async (req, res) => {
  const ref = firebase.storage().ref('');
  var base64Data = req.body.img.replace(/^data:image\/jpeg;base64,/, "");
  const name = new Date();
  var metadata = {
    contentType: 'image/jpeg'
  };
  let buffer=Buffer.from(base64Data,'base64')
  var uploadTask=firebase.storage().ref().child(name+".jpg").put(buffer , metadata);
  var c=await uploadTask.then(snapshot => {
    return snapshot.ref.getDownloadURL();   // Will return a promise with the download link
  }).then(downloadURL => {
  return downloadURL;
  });
  let id = parseInt(req.params.id);
  if (!req.body) {
    res.status(400).send("Not enough data in the body!");
  } else {
    database.ref('cvs').orderByChild('id').equalTo(id).limitToFirst(1).once('value').then(snapshot => {
      const cv = snapshot.val();
      if (cv) {
        let cvObject = firebase.database().ref('cvs/' + id);
        cvObject.child("photo_id").set(c);
        cvObject.child("name").set(req.body.name);
        cvObject.child("age").set(req.body.age);
        cvObject.child("education").set(req.body.education);
        cvObject.child("sex").set(req.body.sex);
        cvObject.child("professional").set(req.body.professional);
        res.status(200).send('ok');
      } else {
        res.status(400).send("Not found.");
      }
    });
  }
});

router.get('/:id/photo', (request, response) => {
  var cvId = parseInt(request.params.id);

  if (cvId > 0) {
    database.ref('cvs').orderByChild('id').once('value').then(snapshot => {
      const cv = snapshot.val();

      if (cv[cvId]) {
        response.status(200).send('' + cv[cvId].photo_id);

      } else {
        response.status(400).send("Not found.");
      }
    });
  } else {
    response.status(500).send('Bad request.');
  }
});

router.post('/add', async (req, res) => {
  const ref = firebase.storage().ref('');
  var base64Data = req.body.img.replace(/^data:image\/jpeg;base64,/, "");
  const name = new Date();
  var metadata = {
    contentType: 'image/jpeg'
  };
  let buffer=Buffer.from(base64Data,'base64')
  var uploadTask=firebase.storage().ref().child(name+".jpg").put(buffer , metadata);
  var c=await uploadTask.then(snapshot => {
    return snapshot.ref.getDownloadURL();   // Will return a promise with the download link
}).then(downloadURL => {
  return downloadURL;
});

console.log(c);


  let maxID = 0;
  let txt = JSON.stringify(req.body);
  database.ref('cvs').once('value').then(snapshot => {
    const cvList = snapshot.val();
    if (cvList) {
      cvList.forEach(element => {
        if (element.id > maxID) {
          maxID = element.id;
        }
      });
    }
    maxID = parseInt(maxID) + 1
    txt = txt.replace(/.$/, ', "id":' + maxID + ', "photo_id":"'+c+'"}')
    object = JSON.parse(txt);
    database.ref('cvs/' + maxID).set(object);
    res.send('ok');
  });
});


router.post('/test3' , (request , response)=>{
  const body = request.body;
  
  //var base64Data = request.body.img.replace(/^data:image\/jpeg;base64,/, "");
  //require("fs").writeFile("out.jpg", base64Data, 'base64', function(err) {
    //console.log(err);
  //});

  var metadata = {
    contentType: 'image/jpeg'
  };

  let buffer=Buffer.from(request.body.img,'base64');
  var uploadTask=firebase.storage.ref().child("Dragos").put(buffer , metadata);
  uploadTask.snapshot.ref.getDownloadURL().then(url =>{
    console.log(url);
  });
  console.log(buffer);
  
})



router.post("/test2", (req , res)=>{
  let pictureURL
  const image = req.body.image
  const mimeType = image.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)[1]
  const fileName = req.body.file
  //trim off the part of the payload that is not part of the base64 string
  const base64EncodedImageString = image.replace(/^data:image\/\w+;base64,/, '')
  const imageBuffer = Buffer.from(base64EncodedImageString, 'base64');
  const bufferStream = new stream.PassThrough();
  bufferStream.end(imageBuffer);
  // Define file and fileName
  const file = bucket.file('images/' + fileName);
  bufferStream.pipe(file.createWriteStream({
      metadata: {
      contentType: mimeType
      },
      public: true,
      validation: "md5"
  }))
      .on('error', function (err) {
      console.log('error from image upload', err);
      })
      .on('finish', function () {
        // The file upload is complete.
        file.getSignedUrl({
        action: 'read',
        expires: '03-09-2491'
      }).then(signedUrls => {
        // signedUrls[0] contains the file's public URL
          pictureURL = signedUrls[0]
        });
    });
})


router.post("/test" , (req , res)=>{
  const ref = firebase.storage().ref();
  var base64Data = request.body.img.replace(/^data:image\/jpeg;base64,/, "");
 

  const name = new Date() + '-' + file.name;
  const task = ref.child(name).putString(base64Data, "base64", {contentType:'image/jpg'});
  console.log("asdasd");
})

router.post('/swap',async (request,response)=>{
  const id1=request.body.id1;
  const id2=request.body.id2;
  console.log(id1, id2 , "msg");
  let cv1;
  await database.ref('cvs').orderByChild(id1).once('value').then(snapshot => {
  cv1 = snapshot.val();
  });
  consoele.log(cv1);
  
});


module.exports = router;