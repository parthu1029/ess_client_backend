const { pool } = require('../config/database');
const sql = require('mssql');

exports.getAllAnnouncements = async () => {
    const request = pool.request();
    
    const result = await request.query(`
        SELECT AnnouncementID, Title, Content, Priority, CreatedDate, ValidUntil
        FROM AnnouncementTable
        WHERE ValidUntil >= GETDATE() OR ValidUntil IS NULL
        ORDER BY Priority DESC, CreatedDate DESC
    `);
    
    return result.recordset;
};

exports.addAnnouncement = async (announcementData) => {
    const request = pool.request();
    request.input('title', sql.VarChar(200), announcementData.title);
    request.input('content', sql.VarChar(1000), announcementData.content);
    request.input('priority', sql.VarChar(10), announcementData.priority || 'Medium');
    request.input('validUntil', sql.DateTime, announcementData.validUntil);
    
    await request.query(`
        INSERT INTO AnnouncementTable (Title, Content, Priority, ValidUntil, CreatedDate)
        VALUES (@title, @content, @priority, @validUntil, GETDATE())
    `);
};

exports.deleteAnnouncement = async (announcementId) => {
    const request = pool.request();
    request.input('id', sql.Int, announcementId);
    
    await request.query(`
        DELETE FROM AnnouncementTable WHERE AnnouncementID = @id
    `);
};
