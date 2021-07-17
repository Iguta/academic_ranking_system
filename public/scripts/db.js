 class Database {
     constructor() {
         const sqlite3 = require('sqlite3').verbose();
         this.db = new sqlite3.Database('../../nodeDatabase.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
             if (err) {
                 console.log(err.message);
             } else {
                 console.log("Connected to nodedatabase...\n");
             }
         });
         this.db.exec('PRAGMA foreign_keys = ON;', (error) => {
             if (error) {
                 console.log("Pragma statement did not work");
             } else if (!error) {
                 console.log("Foreign key enforcement is ON");
             };
         });
         let sqlCreatePersonalInfor = `CREATE TABLE IF NOT EXISTS personalInformation(
            studentId int(5) NOT NULL,
            lastName varChar(30) NOT NULL,
            firstName varChar(30) NOT NULL,
            PRIMARY KEY(studentId)
            )`;
         let sqlCreateStudentMarks = `CREATE TABLE IF NOT EXISTS studentMarks(
                studentId int NOT NULL,
                Maths INT UNSIGNED NOT NULL,
                English INT UNSIGNED NOT NULL,
                Kiswahili INT UNSIGNED NOT NULL,
                Science INT UNSIGNED NOT NULL,
                GHC_CRE INT UNSIGNED NOT NULL,
                PRIMARY KEY(studentId),
                FOREIGN KEY (studentId) REFERENCES personalInformation(studentId) ON DELETE CASCADE
                )`;
         let personalPromise = this.helperFunc(sqlCreatePersonalInfor);
         personalPromise.then((message) => {
                 // console.log(message);
             },
             (error) => {
                 console.log(error);
             });
         let studentPromise = this.helperFunc(sqlCreateStudentMarks);
         studentPromise.then((message) => {
                 // console.log(message + '\n' + 'a student was created');
             },
             (error) => {
                 console.log(error);
             });
     };
     helperFunc(sqlQuery) {
         let arrRes = [];
         return new Promise((resolve, reject) => {
             this.db.run(sqlQuery, [], (error, rows) => {
                 if (error) {
                     reject(error.message);
                 } else if (!error) {
                     resolve('Operation was successful');
                 };
             });
         });
     };

     insertingIntoPersonalInfor(studentId, firstName, lastName) {
         let sqlInsertPersonalInformation = `INSERT INTO personalInformation(studentId, firstName, lastName)
        VALUES (${studentId}, '${firstName}', '${lastName}')`;
         return new Promise((resolve, reject) => {
             this.db.run(sqlInsertPersonalInformation, [], (error, rows) => {
                 if (error) {
                     reject(error.message);
                 } else if (!error) {
                     resolve(`Personal Details Entry for studentId:${studentId} were entered into the Database`);
                 };
             });
         });
     };
     insertingIntoStudentMarks(studentId, maths, english, kiswahili, science, GHC_CRE) {
         let sqlInsertMarks = `INSERT INTO studentMarks (studentId, Maths, English, Kiswahili, Science, GHC_CRE)
        VALUES(${studentId}, ${maths}, ${english}, ${kiswahili}, ${science}, ${GHC_CRE});`
         return new Promise((resolve, reject) => {
             this.db.run(sqlInsertMarks, [], (error, rows) => {
                 if (error) {
                     reject(error.message);
                 } else if (!error) {
                     resolve(`Marks Entry for studentId:${studentId} were entered into the Database`);
                 };
             });
         });
     };
     updatePersonalInfor(studentId, param, value) {
         let sqlUpdatePersonalInfor = `UPDATE personalInformation 
        SET ${param} = '${value}'
        WHERE studentId=${studentId}`;
         return new Promise((resolve, reject) => {
             this.db.run(sqlUpdatePersonalInfor, [], (error, rows) => {
                 if (error) {
                     reject(error.message);
                 } else if ((!error) && (this.db.exec('SELECT changes()', (err) => {}))) {
                     resolve('Update was successful!!');
                 } else {
                     reject('You cannot update a value whose entry does not exist!!');
                 }
             });
         });
     };
     updateStudentsMarks(studentId, param, value) {
         let sqlUpdateStudentsMarks = `UPDATE studentMarks
        SET ${param}=${value}
        WHERE studentId=${studentId};`
         return new Promise((resolve, reject) => {
             this.db.run(sqlUpdateStudentsMarks, [], (error, rows) => {
                 // console.log("This will most likely print last!!");
                 if (error) {
                     reject();
                 } else if (!error) {
                     resolve(`Update of studentId:${studentId} was successful!!`);
                 };
             });
         });
     };
     searchingStudent(studentId, tableName) {
         let sqlSearch = `SELECT * FROM ${tableName} 
        WHERE studentId=${studentId}`;
         return new Promise((resolve, reject) => {
             this.db.get(sqlSearch, [], (error, row) => {
                 if (error) {
                     reject(error.message);
                 } else if (!row) {
                     resolve(`No student of student ID ${studentId} was found`);
                 } else if (row) {
                     resolve(row);
                 }
             })
         })
     }
     deletingStudent(studentId, tableName) {
         let sqldelete = `DELETE FROM ${tableName}
            WHERE studentId=${studentId}`;
         return new Promise((resolve, reject) => {
             this.db.run(sqldelete, [], (error, rows) => {
                 if (error) {
                     reject(error.message);
                 } else if (!error) {
                     resolve(`Entry of student ID ${studentId} was deleted`);
                 }
             })
         })
     };

     resultSheet() {
         let sqlResultSheet = `SELECT personalInformation.studentId, studentMarks.Maths, personalInformation.firstName,personalInformation.lastName, studentMarks.English, studentMarks.Kiswahili, studentMarks.Science, studentMarks.GHC_CRE,
        studentMarks.Maths+studentMarks.English+studentMarks.Kiswahili+studentMarks.Science+studentMarks.GHC_CRE as AverageMarks
        FROM personalInformation
        INNER JOIN studentMarks
        WHERE personalInformation.studentId=studentMarks.studentId
        ORDER BY AverageMarks DESC`;
         let arrRes = [];
         return new Promise((resolve, reject) => {
             this.db.all(sqlResultSheet, [], (error, rows) => {
                 // console.log("This will most likely print last!!");
                 if (error) {
                     throw error;
                     reject();
                 } else if (rows) {
                     for (let i = 0; i < rows.length; i++) {
                         arrRes[i] = rows[i];
                         // console.log(arrRes[i]);
                     };
                     resolve(arrRes);
                 };
             });
         });
         // return this.helperFunc(sqlResultSheet);
     };

     topThree() {
         let arrRes = [];
         let sqlTopThree = `SELECT personalInformation.studentId, studentMarks.Maths, personalInformation.firstName,personalInformation.lastName, studentMarks.English, studentMarks.Kiswahili, studentMarks.Science, studentMarks.GHC_CRE,
        studentMarks.Maths+studentMarks.English+studentMarks.Kiswahili+studentMarks.Science+studentMarks.GHC_CRE as AverageMarks
        FROM personalInformation
        INNER JOIN studentMarks
        WHERE personalInformation.studentId=studentMarks.studentId
        ORDER BY AverageMarks DESC
        LIMIT 3`;
         return new Promise((resolve, reject) => {
             this.db.all(sqlTopThree, [], (error, rows) => {
                 // console.log("This will most likely print last!!");
                 if (error) {
                     throw error;
                     reject();
                 } else if (rows) {
                     for (let i = 0; i < rows.length; i++) {
                         arrRes[i] = rows[i];
                         // console.log(arrRes[i]);
                     };
                     resolve(arrRes);
                 };
             });
         });
         // return 0;
         // return this.helperFunc(sqlTopThree);
     };
 };

 module.exports = { Database };