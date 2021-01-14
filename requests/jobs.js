const { response, json } = require("express");
const firebase = require("firebase/app"),
express = require('express');
const xl = require('excel4node');
const fs = require('fs');
global.XMLHttpRequest = require("xhr2");

// Add the Firebase products that you want to use
require("firebase/auth");
require("firebase/database");
require("firebase/storage");

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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const database = firebase.database();
const tableName = 'jobs'

const router = express.Router();

router.get('/', (request, response) => {
  database.ref('jobs').orderByChild('order_in_list').once('value').then(snapshot => {
    const jobs = snapshot.val();
    let jobsOrdered = [];
    jobs.forEach(element => { jobsOrdered.push(element) });

    jobsOrdered.sort(function (a, b) {
      return a.order_in_list - b.order_in_list;
    });
    if (jobs) {
      response.status(200).send(jobsOrdered);
    } else {
      response.status(400).send("No Jobs.");
    }
  });
})

router.get('/:id', (request, response) => {
  const ID = parseInt(request.params.id);
  database.ref('jobs').orderByChild('id').once('value').then(snapshot => {
    const jobList = snapshot.val();
    if (jobList[ID]) {
      response.status(200).send(jobList[ID]);
    } else {
      response.status(400).send("No job with ID: " + ID);
    }
  });
});

router.delete('/:id', (req, res) => {
  database.ref("jobs").child(req.params.id).remove();
  res.send('deleted ' + req.params.id);
});


router.put('/:id', (req, res) => {
  console.log("am ajuns");
  let id = parseInt(req.params.id);
  console.log(id);  
  if (!req.body) {
    res.status(400).send("Description and/or name not provided in the body!");
  } else {
    database.ref('jobs').orderByChild('id').equalTo(id).limitToFirst(1).once('value').then(snapshot => {
      const job = snapshot.val();
      if (job) {
        let jobObject = firebase.database().ref('jobs/' + id);
        jsonText = JSON.stringify(req.body).replace(/\"/g, '').replace('{', '').replace('}', '').split(',')
        jsonText.forEach(element => {
          field = element.split(':')[0];
          data = element.split(':')[1];
          jobObject.child(field).set(data);
        });
        res.status(200).send('ok');
      } else {
        res.status(400).send("Not found.");
      }
    });
  }
});

router.post('/add', (request, response) => {
  let maxID = 0;
  let txt = JSON.stringify(request.body);
  database.ref('jobs').once('value').then(snapshot => {
    const cvList = snapshot.val();
    if (cvList) {
      cvList.forEach(element => {
        if (element.id > maxID) {
          maxID = element.id;
        }
      });
    }
    maxID = parseInt(maxID) + 1
    txt = txt.replace(/.$/, ', "id":' + maxID + '}')
    object = JSON.parse(txt);
    database.ref('jobs/' + maxID).set(object);
    response.send('ok');
  });
});



router.post("/excel" , (req , res) =>{
  const wb = new xl.Workbook();
  const ws = wb.addWorksheet('Rezultate');
  const headingColumnNames = [
    "Momentul Completarii",
    "Participant",
    "Varsta(ani)",
    "Sex",
    "Educatie",
    "Statut",
    "Daca este cu statut angajat, atunci:",
    "Post",
    "CV",
    "A.1.interesant",
    "A.2.exaltat",
    "A.3.puternic",
    "A.4.entuziasmat",
    "A.5.mandru",
    "A.6.alert",
    "A.7.inspirat",
    "A.8.determinat",
    "A.9.atent",
    "A.10.activ",
    "A.11.stresat",
    "A.12.suparat",
    "A.13.vinovat",
    "A.14.infricosat",
    "A.15.ostil",
    "A.16.iritabil",
    "A.17.rusinat",
    "A.18.agitat",
    "A.19.nervos",
    "A.20.speriat",
    "B.1.angajabila",
    "B.2.placuta",
    "B.3.agreabila",
    "B.4.onesta",
    "B.5.muncitoare",
    "B.6.inteligenta",
    "B.7.dinamica",
    "B.8.are fata atractiva",
    "C.Aţi angaja această persoană pentru postul respectiv",
    "De ce?",
    "Alegere finala a postul descris"
  ]

  //Write Column Title in Excel file
  let headingColumnIndex = 1;
  headingColumnNames.forEach(heading => {
      ws.cell(1, headingColumnIndex).string(heading)
    headingColumnIndex++;
  });
  // //Write Data in Excel file
  let rowIndex = 2;
  database.ref().once('value').then(snapshot => {
    const results = snapshot.val();
    if (!results) return;
    
    results['rezultate'].forEach(person => {
      if (!person) return;
      person['jobs'].forEach(job => {
        job['cvs'].forEach(cv => {
          ws.cell(rowIndex, 1).string(person['momentul_completarii']);
          ws.cell(rowIndex, 2).number(person['person_id']);
          ws.cell(rowIndex, 3).number(person['varsta']);
          ws.cell(rowIndex, 4).string(person['sex']);
          ws.cell(rowIndex, 5).string(person['educatie']);
          ws.cell(rowIndex, 6).string(person['statut']);
          ws.cell(rowIndex, 7).string(person['daca_angajat']);
            const jobs = results['jobs'];
            if (!jobs) return;
            jobs.forEach(Job => {
              if (Job['order_in_list'] == job['job_id']) {
                ws.cell(rowIndex, 8).string(Job['name']);
                wb.write('Rezultate.xlsx');
              }
            });
          ws.cell(rowIndex, 9).number(cv['cv_id']);
          ws.cell(rowIndex, 10).number(cv['a']['a1_interesat']);
          ws.cell(rowIndex, 11).number(cv['a']['a2_exaltat']);
          ws.cell(rowIndex, 12).number(cv['a']['a3_puternic']);
          ws.cell(rowIndex, 13).number(cv['a']['a4_entuziasmat']);
          ws.cell(rowIndex, 14).number(cv['a']['a5_mandru']);
          ws.cell(rowIndex, 15).number(cv['a']['a6_alert']);
          ws.cell(rowIndex, 16).number(cv['a']['a7_inspirat']);
          ws.cell(rowIndex, 17).number(cv['a']['a8_determinat']);
          ws.cell(rowIndex, 18).number(cv['a']['a9_atent']);
          ws.cell(rowIndex, 19).number(cv['a']['a10_activ']);
          ws.cell(rowIndex, 20).number(cv['a']['a11_stresat']);
          ws.cell(rowIndex, 21).number(cv['a']['a12_suparat']);
          ws.cell(rowIndex, 22).number(cv['a']['a13_vinovat']);
          ws.cell(rowIndex, 23).number(cv['a']['a14_infricosat']);
          ws.cell(rowIndex, 24).number(cv['a']['a15_ostil']);
          ws.cell(rowIndex, 25).number(cv['a']['a16_iritabil']);
          ws.cell(rowIndex, 26).number(cv['a']['a17_rusinat']);
          ws.cell(rowIndex, 27).number(cv['a']['a18_agitat']);
          ws.cell(rowIndex, 28).number(cv['a']['a19_nervos']);
          ws.cell(rowIndex, 29).number(cv['a']['a20_speriat']);
          ws.cell(rowIndex, 30).number(cv['b']['b1_angajabil']);
          ws.cell(rowIndex, 31).number(cv['b']['b2_placut']);
          ws.cell(rowIndex, 32).number(cv['b']['b3_agreabil']);
          ws.cell(rowIndex, 33).number(cv['b']['b4_onest']);
          ws.cell(rowIndex, 34).number(cv['b']['b5_muncitor']);
          ws.cell(rowIndex, 35).number(cv['b']['b6_inteligent']);
          ws.cell(rowIndex, 36).number(cv['b']['b7_dinamic']);
          ws.cell(rowIndex, 37).number(cv['b']['b8_fata']);
          ws.cell(rowIndex, 38).string(cv['c']['ar_angaja']);
          ws.cell(rowIndex, 39).string(cv['c']['motiv']);
          ws.cell(rowIndex, 40).number(job['alegere_finala']);
          wb.write('Rezultate.xlsx');
          rowIndex++;
        });
      });
    });
  });
  let buff = fs.readFileSync('Rezultate.xlsx');
  let base64data = buff.toString('base64');

  res.send(base64data);
})


router.post("/test" , async (req , res)=>{
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

  const data={
    photo_id :c
  };

  firebase.database('jobs').set(data, (err)=>{
    console.log(err);
  })
 
});


module.exports = router;