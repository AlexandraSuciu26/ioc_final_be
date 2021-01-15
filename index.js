const express = require('express'),
  jobRequests = require('./requests/jobs'),
  cvRequests = require('./requests/cvs'),
  loginRequest = require('./requests/login');
  var cors = require('cors')

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: false }));

app.use('/admin/jobs', jobRequests);
app.use('/admin/cvs', cvRequests);
app.use('/loginData',loginRequest);

app.listen(port, () => {
  console.log(`Started listening at http://localhost:${port}`)
});