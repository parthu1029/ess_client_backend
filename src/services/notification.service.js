const { pool } = require('../config/database');
const sql = require('mssql');

exports.getNotifications = async (empId, filters = {}) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    request.input('limit', sql.Int, filters.limit || 20);
    request.input('offset', sql.Int, (filters.page - 1) * filters.limit || 0);
    
    let query = `
        SELECT 
            NotificationID,
            Title,
            Content,
            Type,
            Priority,
            Status,
            CreatedDate,
            ReadDate,
            ScheduledFor,
            SenderEmpID,
            (SELECT Name FROM EmpProfileTable WHERE EmpID = n.SenderEmpID) as SenderName
        FROM NotificationTable n
        WHERE EmpID = @empId
    `;
    
    if (filters.type) {
        request.input('type', sql.VarChar(20), filters.type);
        query += ` AND Type = @type`;
    }
    
    if (filters.status) {
        request.input('status', sql.VarChar(15), filters.status);
        query += ` AND Status = @status`;
    }
    
    query += ` ORDER BY CreatedDate DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
    
    const result = await request.query(query);
    
    // Get total count for pagination
    const countRequest = pool.request();
    countRequest.input('empId', sql.VarChar(30), empId);
    
    let countQuery = `SELECT COUNT(*) as Total FROM NotificationTable WHERE EmpID = @empId`;
    
    if (filters.type) {
        countRequest.input('type', sql.VarChar(20), filters.type);
        countQuery += ` AND Type = @type`;
    }
    
    if (filters.status) {
        countRequest.input('status', sql.VarChar(15), filters.status);
        countQuery += ` AND Status = @status`;
    }
    
    const countResult = await countRequest.query(countQuery);
    
    return {
        notifications: result.recordset,
        pagination: {
            total: countResult.recordset[0].Total,
            page: filters.page || 1,
            limit: filters.limit || 20,
            totalPages: Math.ceil(countResult.recordset[0].Total / (filters.limit || 20))
        }
    };
};

exports.getUnreadNotifications = async (empId) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    
    const result = await request.query(`
        SELECT 
            NotificationID,
            Title,
            Content,
            Type,
            Priority,
            CreatedDate,
            SenderEmpID,
            (SELECT Name FROM EmpProfileTable WHERE EmpID = n.SenderEmpID) as SenderName
        FROM NotificationTable n
        WHERE EmpID = @empId AND Status = 'unread'
        ORDER BY Priority DESC, CreatedDate DESC
    `);
    
    return {
        unreadCount: result.recordset.length,
        notifications: result.recordset
    };
};

exports.markAsRead = async (notificationId, empId) => {
    const request = pool.request();
    request.input('notificationId', sql.Int, notificationId);
    request.input('empId', sql.VarChar(30), empId);
    
    await request.query(`
        UPDATE NotificationTable 
        SET Status = 'read', ReadDate = GETDATE()
        WHERE NotificationID = @notificationId AND EmpID = @empId
    `);
};

exports.markAllAsRead = async (empId) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    
    const result = await request.query(`
        UPDATE NotificationTable 
        SET Status = 'read', ReadDate = GETDATE()
        WHERE EmpID = @empId AND Status = 'unread'
    `);
    
    return result.rowsAffected[0];
};

exports.deleteNotification = async (notificationId, empId) => {
    const request = pool.request();
    request.input('notificationId', sql.Int, notificationId);
    request.input('empId', sql.VarChar(30), empId);
    
    await request.query(`
        DELETE FROM NotificationTable 
        WHERE NotificationID = @notificationId AND EmpID = @empId
    `);
};

exports.createNotification = async (notificationData) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), notificationData.targetEmpId);
    request.input('senderEmpId', sql.VarChar(30), notificationData.senderEmpId);
    request.input('title', sql.VarChar(200), notificationData.title);
    request.input('content', sql.VarChar(1000), notificationData.content);
    request.input('type', sql.VarChar(20), notificationData.type);
    request.input('priority', sql.VarChar(10), notificationData.priority || 'medium');
    request.input('scheduledFor', sql.DateTime, notificationData.scheduledFor);
    
    const result = await request.query(`
        INSERT INTO NotificationTable 
        (EmpID, SenderEmpID, Title, Content, Type, Priority, Status, CreatedDate, ScheduledFor)
        VALUES 
        (@empId, @senderEmpId, @title, @content, @type, @priority, 'unread', GETDATE(), @scheduledFor);
        SELECT SCOPE_IDENTITY() as NotificationID;
    `);
    
    return result.recordset[0].NotificationID;
};

exports.broadcastNotification = async (broadcastData) => {
    // Get target employees based on groups
    const targetEmployees = await this.getTargetEmployees(
        broadcastData.targetGroups,
        broadcastData.excludeEmpIds
    );
    
    let sentCount = 0;
    let failedCount = 0;
    
    for (const empId of targetEmployees) {
        try {
            await this.createNotification({
                targetEmpId: empId,
                senderEmpId: broadcastData.senderEmpId,
                title: broadcastData.title,
                content: broadcastData.content,
                type: broadcastData.type,
                priority: broadcastData.priority
            });
            sentCount++;
        } catch (error) {
            console.error(`Failed to send notification to ${empId}:`, error);
            failedCount++;
        }
    }
    
    return { sentCount, failedCount };
};

exports.getTargetEmployees = async (targetGroups, excludeEmpIds = []) => {
    const request = pool.request();
    let conditions = [];
    
    for (const group of targetGroups) {
        if (group === 'all') {
            conditions.push('1=1');
        } else if (group === 'managers') {
            conditions.push('EmpID IN (SELECT DISTINCT ManagerEmpID FROM EmpProfileTable WHERE ManagerEmpID IS NOT NULL)');
        } else if (group.startsWith('department:')) {
            const dept = group.split(':')[1];
            request.input(`dept_${dept}`, sql.VarChar(50), dept);
            conditions.push(`Department = @dept_${dept}`);
        } else if (group.startsWith('grade:')) {
            const grade = group.split(':')[1];
            if (grade.endsWith('+')) {
                const minGrade = parseInt(grade.replace('+', ''));
                request.input(`minGrade_${minGrade}`, sql.Int, minGrade);
                conditions.push(`Grade >= @minGrade_${minGrade}`);
            } else {
                request.input(`grade_${grade}`, sql.Int, parseInt(grade));
                conditions.push(`Grade = @grade_${grade}`);
            }
        }
    }
    
    let query = `
        SELECT DISTINCT EmpID 
        FROM EmpProfileTable 
        WHERE Status = 'Active' AND (${conditions.join(' OR ')})
    `;
    
    if (excludeEmpIds.length > 0) {
        const excludeParams = excludeEmpIds.map((id, index) => {
            const paramName = `exclude_${index}`;
            request.input(paramName, sql.VarChar(30), id);
            return `@${paramName}`;
        });
        query += ` AND EmpID NOT IN (${excludeParams.join(',')})`;
    }
    
    const result = await request.query(query);
    return result.recordset.map(row => row.EmpID);
};

exports.getAllNotifications = async (filters = {}) => {
    const request = pool.request();
    request.input('limit', sql.Int, filters.limit || 50);
    request.input('offset', sql.Int, (filters.page - 1) * filters.limit || 0);
    
    let query = `
        SELECT 
            n.NotificationID,
            n.EmpID,
            e.Name as EmployeeName,
            n.SenderEmpID,
            s.Name as SenderName,
            n.Title,
            n.Content,
            n.Type,
            n.Priority,
            n.Status,
            n.CreatedDate,
            n.ReadDate
        FROM NotificationTable n
        JOIN EmpProfileTable e ON n.EmpID = e.EmpID
        LEFT JOIN EmpProfileTable s ON n.SenderEmpID = s.EmpID
        WHERE 1=1
    `;
    
    if (filters.type) {
        request.input('type', sql.VarChar(20), filters.type);
        query += ` AND n.Type = @type`;
    }
    
    if (filters.status) {
        request.input('status', sql.VarChar(15), filters.status);
        query += ` AND n.Status = @status`;
    }
    
    if (filters.startDate) {
        request.input('startDate', sql.DateTime, filters.startDate);
        query += ` AND n.CreatedDate >= @startDate`;
    }
    
    if (filters.endDate) {
        request.input('endDate', sql.DateTime, filters.endDate);
        query += ` AND n.CreatedDate <= @endDate`;
    }
    
    query += ` ORDER BY n.CreatedDate DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
    
    const result = await request.query(query);
    return result.recordset;
};

exports.deleteNotificationAdmin = async (notificationId) => {
    const request = pool.request();
    request.input('notificationId', sql.Int, notificationId);
    
    await request.query(`
        DELETE FROM NotificationTable WHERE NotificationID = @notificationId
    `);
};

exports.getNotificationSettings = async (empId) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    
    const result = await request.query(`
        SELECT 
            EmailNotifications,
            PushNotifications,
            SMSNotifications,
            LeaveNotifications,
            PayrollNotifications,
            AnnouncementNotifications,
            PerformanceNotifications
        FROM NotificationSettingsTable
        WHERE EmpID = @empId
    `);
    
    if (result.recordset.length === 0) {
        // Return default settings if none exist
        return {
            EmailNotifications: true,
            PushNotifications: true,
            SMSNotifications: false,
            LeaveNotifications: true,
            PayrollNotifications: true,
            AnnouncementNotifications: true,
            PerformanceNotifications: true
        };
    }
    
    return result.recordset[0];
};

exports.updateNotificationSettings = async (empId, settings) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    request.input('emailNotifications', sql.Bit, settings.EmailNotifications);
    request.input('pushNotifications', sql.Bit, settings.PushNotifications);
    request.input('smsNotifications', sql.Bit, settings.SMSNotifications);
    request.input('leaveNotifications', sql.Bit, settings.LeaveNotifications);
    request.input('payrollNotifications', sql.Bit, settings.PayrollNotifications);
    request.input('announcementNotifications', sql.Bit, settings.AnnouncementNotifications);
    request.input('performanceNotifications', sql.Bit, settings.PerformanceNotifications);
    
    // Use MERGE to insert or update
    await request.query(`
        MERGE NotificationSettingsTable AS target
        USING (SELECT @empId as EmpID) AS source
        ON target.EmpID = source.EmpID
        WHEN MATCHED THEN
            UPDATE SET 
                EmailNotifications = @emailNotifications,
                PushNotifications = @pushNotifications,
                SMSNotifications = @smsNotifications,
                LeaveNotifications = @leaveNotifications,
                PayrollNotifications = @payrollNotifications,
                AnnouncementNotifications = @announcementNotifications,
                PerformanceNotifications = @performanceNotifications,
                UpdatedDate = GETDATE()
        WHEN NOT MATCHED THEN
            INSERT (EmpID, EmailNotifications, PushNotifications, SMSNotifications, 
                   LeaveNotifications, PayrollNotifications, AnnouncementNotifications, 
                   PerformanceNotifications, CreatedDate)
            VALUES (@empId, @emailNotifications, @pushNotifications, @smsNotifications,
                   @leaveNotifications, @payrollNotifications, @announcementNotifications,
                   @performanceNotifications, GETDATE());
    `);
};

// Helper function for sending notifications (used by other modules)
exports.sendNotification = async (empId, title, content, type = 'info', priority = 'medium') => {
    return await this.createNotification({
        targetEmpId: empId,
        senderEmpId: 'SYSTEM',
        title,
        content,
        type,
        priority
    });
};
