const sql = require('mssql');
const dbConfig = require('../config/db.config');

async function getProfile(EmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT * FROM EmpProfileTable WHERE EmpID=@EmpID AND CompanyID=@CompanyID');
  return result.recordset[0];
}

async function updateProfile(EmpID, CompanyID, profileData) {
  // update statement for allowed profile fields
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .input('Name', sql.VarChar(100), profileData.Name)
    .input('DOB', sql.Date, profileData.DOB)
    .input('Grade', sql.Int, profileData.Grade)
    .query('UPDATE EmpProfileTable SET Name=@Name, DOB=@DOB, Grade=@Grade WHERE EmpID=@EmpID AND CompanyID=@CompanyID');
}

async function uploadPhoto(EmpID, CompanyID, photo) {
  const pool = await sql.connect(dbConfig);
  console.log(photo);
  await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .input('photo', sql.VarBinary(sql.MAX), photo)
    .query(`MERGE INTO EmpProfilePhotoTable AS target
            USING (SELECT @EmpID AS EmpID, @CompanyID AS CompanyID, @photo AS photo) AS source
            ON target.EmpID = source.EmpID AND target.CompanyID = source.CompanyID
            WHEN MATCHED THEN
                UPDATE SET target.photo = source.photo
            WHEN NOT MATCHED THEN
                INSERT (EmpID, CompanyID, photo)
                VALUES (source.EmpID, source.CompanyID, source.photo);
            `);
}

async function getPhoto(EmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT photo FROM EmpProfilePhotoTable WHERE EmpID=@EmpID AND CompanyID=@CompanyID');
  return result.recordset[0]?.photo;
}

async function deletePhoto(EmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('UPDATE EmpProfilePhotoTable SET photo=NULL WHERE EmpID=@EmpID AND CompanyID=@CompanyID');
}

async function getEmploymentSummary(EmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT EmpID, DOJ, Position, Grade, ManagerEmpID FROM EmpProfileTable WHERE EmpID=@EmpID AND CompanyID=@CompanyID');
  return result.recordset[0];
}

async function getPersonalInfo(EmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT EmpID, Name, DOB FROM EmpProfileTable WHERE EmpID=@EmpID AND CompanyID=@CompanyID');
  return result.recordset[0];
}

async function updatePersonalInfo(EmpID, CompanyID, personalInfo) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .input('Name', sql.VarChar(100), personalInfo.Name)
    .input('DOB', sql.Date, personalInfo.DOB)
    .query(`UPDATE EmpProfileTable SET Name=@Name, DOB=@DOB WHERE EmpID=@EmpID AND CompanyID=@CompanyID`);
}

async function getContactInfo(EmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT EmpID, contact, email, address FROM EmpProfileTable WHERE EmpID=@EmpID AND CompanyID=@CompanyID');
  return result.recordset[0];
}

async function updateContactInfo(EmpID, CompanyID, contactInfo) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .input('contact', sql.VarChar(15), contactInfo.contact)
    .input('email', sql.VarChar(50), contactInfo.email)
    .input('address', sql.VarChar(100), contactInfo.address)
    .query('UPDATE EmpProfileTable SET contact=@contact, email=@email, address=@address WHERE EmpID=@EmpID AND CompanyID=@CompanyID');
}

async function getProfileSummary(EmpID, CompanyID) {
  // Return a mix of personal & employment info
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT EmpID, Name, DOB, DOJ, Position, Grade, ManagerEmpID FROM EmpProfileTable WHERE EmpID=@EmpID AND CompanyID=@CompanyID');
  return result.recordset[0];
}

async function getCalendar(EmpID, CompanyID) {
  // Sample: Collect leave, business trip, and flight ticket requests for the user
  const pool = await sql.connect(dbConfig);
  const leaves = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT FromDate, ToDate, Type, Status FROM LeaveReqTable WHERE EmpID=@EmpID AND CompanyID=@CompanyID');
  const trips = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT StartDate, EndDate, Location, status FROM BusinessTripReqTable WHERE EmpID=@EmpID AND CompanyID=@CompanyID');
  return {
    leaves: leaves.recordset,
    trips: trips.recordset
  };
}

module.exports = {
  getProfile,
  updateProfile,
  uploadPhoto,
  getPhoto,
  deletePhoto,
  getEmploymentSummary,
  getPersonalInfo,
  updatePersonalInfo,
  getContactInfo,
  updateContactInfo,
  getProfileSummary,
  getCalendar
};
