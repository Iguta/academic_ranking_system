const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const db = require('./scripts/db.js');
// import Database from './scripts/db.js'
const dbObj = new db.Database();
//create your server
const app = express();
const portno = 8082;
const localhost = '127.0.0.1';
const path = __dirname.replace(/\\/g, '/');
// console.log(`path: ${path}`);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('assets'));
app.use(express.static('scripts'));
app.set('view engine', 'ejs');


let feedback = null;
app.get('/', (req, res) => {
    res.render('index', { feedback: feedback });
});

app.get('/create.html', (req, res) => {
    res.render('create');
});
app.post('/post-create-student-details-form', (req, res) => {
    const createPromise = dbObj.insertingIntoPersonalInfor(req.body.studentId, req.body.firstName, req.body.lastName);
    createPromise.then(
        (message) => {
            res.send(message);
        },
        (err) => {
            res.send(err)
        }
    );
});
app.get('/update-personalInfor.html', (req, res) => {
    res.render('updatePersonal');
});
app.post('/post-update-personal-infor', (req, res) => {
    let studentId = parseInt(req.body.studentId);
    let value = req.body.nameUpdateValue;
    let param;

    if (req.body.field == 'first name') {
        param = "firstName";
    } else if (req.body.field == 'last name') {
        param = "lastName";
    };
    let myPromise = dbObj.updatePersonalInfor(studentId, param, value);
    myPromise.then(
        (message) => {
            res.send(message);
        },
        (error) => {
            res.send(error);
        }
    );
});

app.get('/enter-student-marks.html', (req, res) => {
    res.render('studentsMarks');
});

app.post('/post-students-marks', (req, res) => {
    const studentId = parseInt(req.body.studentId);
    const Maths = parseInt(req.body.Maths);
    const English = parseInt(req.body.English);
    const Kiswahili = parseInt(req.body.Kiswahili);
    const Science = parseInt(req.body.Science);
    const GHC_CRE = parseInt(req.body.GHC_CRE);
    let createPromise = dbObj.insertingIntoStudentMarks(studentId, Maths, English, Kiswahili, Science, GHC_CRE);
    createPromise.then(
        (message) => {
            res.send(message);
        },
        (err) => {
            res.send(err)
        }
    );
});
app.get('/update-student-marks.html', (req, res) => {
    res.render('updateStudentsMarks');
});
app.post('/post-update-students-marks', (req, res) => {
    const studentId = parseInt(req.body.studentId);
    const subject = req.body.subject;
    const value = parseInt(req.body.marks);
    let updatePromise = dbObj.updateStudentsMarks(studentId, subject, value);
    updatePromise.then(
        (mess) => {
            res.send(mess);
        },
        (err) => {
            res.send(err);
        }
    );
});
app.get('/delete.html', (req, res) => {
    // feedback = req.url;
    res.render('delete');
});

app.post('/post-delete', (req, res) => {
    let tableName;
    const studentId = req.body.studentId;
    if (req.body.entryToDelete === "Student's Personal Infor") {
        tableName = "personalInformation"
    } else if (req.body.entryToDelete === "Student's Marks") {
        tableName = "studentMarks"
    }
    let promiseDelete = dbObj.deletingStudent(studentId, tableName);
    promiseDelete.then(
        (message) => { res.send(message) },
        (err) => { res.send(err) }
    );
});

app.get('/search.html', (req, res) => {
    res.render('search');
});
app.post('/post-search', (req, res) => {
    const studentId = req.body.studentId;
    let tableName;
    if (req.body.optionToSearch === "students personal Infor") {
        tableName = "personalInformation"
    } else if (req.body.optionToSearch === "student marks") {
        tableName = "studentMarks"
    }
    let searchPromise = dbObj.searchingStudent(studentId, tableName);
    searchPromise.then(
        (message) => { res.send(message) },
        (error) => { res.send(error) }
    );
});

app.get('/top-three.html', (req, res) => {
    let myRes = dbObj.topThree();
    myRes.then(
        (arrRes) => {
            res.render('top-three', { data: arrRes });
        },
        () => console.log("ERROR:")
    );
});

app.get('/result-sheet.html', (req, res) => {
    let myRes = dbObj.resultSheet();
    myRes.then(
        (arrRes) => {
            res.render('result-sheet', { data: arrRes });
        },
        (error) => {
            console.log(`ERROR: ${error}`);
        }
    );
});
app.listen(portno, () => {
    const date = new Date();
    console.log(`Server listening at ${localhost}:${portno} \nat ${date.getHours()}:${date.getMinutes()}`);
});