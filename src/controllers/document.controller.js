const documentService = require('../services/documentService');

exports.uploadDocument = async (req, res) => {
    try {
        const { empId } = req.params;
        const { documentType } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const documentId = await documentService.uploadDocument(empId, {
            type: documentType,
            fileName: req.file.originalname,
            fileBuffer: req.file.buffer, // Multer buffer
            fileSize: req.file.size,
            mimeType: req.file.mimetype
        });
        
        res.json({ 
            message: 'Document uploaded successfully',
            documentId: documentId
        });
    } catch (error) {
        console.error('Document upload error:', error);
        res.status(500).json({ error: 'Failed to upload document' });
    }
};

exports.getAllDocuments = async (req, res) => {
    try {
        const { empId } = req.params;
        const documents = await documentService.getAllDocuments(empId);
        res.json(documents);
    } catch (error) {
        console.error('Documents fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
};

exports.downloadDocument = async (req, res) => {
    try {
        const { empId, docId } = req.params;
        
        const document = await documentService.downloadDocument(empId, docId);
        
        res.set({
            'Content-Type': document.mimeType,
            'Content-Disposition': `attachment; filename="${document.fileName}"`,
            'Content-Length': document.fileSize
        });
        
        res.send(document.fileContent);
    } catch (error) {
        console.error('Document download error:', error);
        res.status(500).json({ error: 'Failed to download document' });
    }
};

exports.deleteDocument = async (req, res) => {
    try {
        const { empId, docId } = req.params;
        
        const deleted = await documentService.deleteDocument(empId, docId);
        
        if (!deleted) {
            return res.status(404).json({ error: 'Document not found' });
        }
        
        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Document delete error:', error);
        res.status(500).json({ error: 'Failed to delete document' });
    }
};
