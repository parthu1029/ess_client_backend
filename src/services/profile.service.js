const sql = require('mssql');
const dbConfig = require('../config/db.config');

async function getProfile(EmpID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query('SELECT * FROM EmpProfileTable WHERE EmpID=@EmpID');
  return result.recordset[0];
}

async function updateProfile(EmpID, profileData) {
  // update statement for allowed profile fields
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('Name', sql.VarChar(100), profileData.Name)
    .input('DOB', sql.Date, profileData.DOB)
    .input('Grade', sql.Int, profileData.Grade)
    .query('UPDATE EmpProfileTable SET Name=@Name, DOB=@DOB, Grade=@Grade WHERE EmpID=@EmpID');
}

async function uploadPhoto(EmpID, photo) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('photo', sql.VarBinary(sql.MAX), photo)
    .query('UPDATE EmpProfileTable SET photo=@photo WHERE EmpID=@EmpID');
}

async function getPhoto(EmpID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query('SELECT photo FROM EmpProfileTable WHERE EmpID=@EmpID');
  return result.recordset[0]?.photo;
}

async function deletePhoto(EmpID) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query('UPDATE EmpProfileTable SET photo=NULL WHERE EmpID=@EmpID');
}

async function getEmploymentSummary(EmpID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query('SELECT EmpID, DOJ, Position, Grade, ManagerEmpID FROM EmpProfileTable WHERE EmpID=@EmpID');
  return result.recordset[0];
}

async function getPersonalInfo(EmpID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query('SELECT EmpID, Name, DOB FROM EmpProfileTable WHERE EmpID=@EmpID');
  return result.recordset[0];
}

async function updatePersonalInfo(EmpID, personalInfo) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('Name', sql.VarChar(100), personalInfo.Name)
    .input('DOB', sql.Date, personalInfo.DOB)
    .query('UPDATE EmpProfileTable SET Name=@Name, DOB=@DOB WHERE EmpID=@EmpID');
}

async function getContactInfo(EmpID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query('SELECT EmpID, contact, email, address FROM EmpProfileTable WHERE EmpID=@EmpID');
  return result.recordset[0];
}

async function updateContactInfo(EmpID, contactInfo) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('contact', sql.VarChar(15), contactInfo.contact)
    .input('email', sql.VarChar(50), contactInfo.email)
    .input('address', sql.VarChar(100), contactInfo.address)
    .query('UPDATE EmpProfileTable SET contact=@contact, email=@email, address=@address WHERE EmpID=@EmpID');
}

async function getProfileSummary(EmpID) {
  // Return a mix of personal & employment info
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query('SELECT EmpID, Name, DOB, DOJ, Position, Grade, ManagerEmpID FROM EmpProfileTable WHERE EmpID=@EmpID');
  return result.recordset[0];
}

async function getCalendar(EmpID) {
  // Sample: Collect leave, business trip, and flight ticket requests for the user
  const pool = await sql.connect(dbConfig);
  const leaves = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query('SELECT FromDate, ToDate, Type, Status FROM LeaveReqTable WHERE EmpID=@EmpID');
  const trips = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query('SELECT StartDate, EndDate, Location, status FROM BusinessTripReqTable WHERE EmpID=@EmpID');
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
