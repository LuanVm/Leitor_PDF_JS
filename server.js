const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const dataBuffer = fs.readFileSync(req.file.path);
        const data = await pdfParse(dataBuffer);

        const extractedData = extractData(data.text);
        const excelPath = await createExcelFromData(extractedData);

        res.download(excelPath, 'ExtractedData.xlsx', (err) => {
            if (err) {
                console.error(err);
            }

            // Cleanup uploaded file and generated Excel file
            fs.unlinkSync(req.file.path);
            fs.unlinkSync(excelPath);
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to process file' });
    }
});

function extractData(text) {
    // Simulação da extração de dados com base no texto do PDF
    return {
        numero_acesso: '1234567890',
        minutagem_local: '100',
        minutagem_longa_distancia: '50',
        quantidade_dados_utilizada: '1GB',
        sms: '10',
        valor_linha: '50.00',
        a_cobrar: '0.00',
        parcelas_aparelho: '20.00'
    };
}

async function createExcelFromData(data) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('ExtractedData');

    worksheet.columns = [
        { header: 'ACESSO', key: 'numero_acesso' },
        { header: 'MINUTAGEM LOCAL', key: 'minutagem_local' },
        { header: 'MINUTAGEM LONGA DISTÂNCIA', key: 'minutagem_longa_distancia' },
        { header: 'QUANTIDADE DE DADOS UTILIZADA', key: 'quantidade_dados_utilizada' },
        { header: 'SMS', key: 'sms' },
        { header: 'VALOR DA LINHA', key: 'valor_linha' },
        { header: 'A COBRAR', key: 'a_cobrar' },
        { header: 'PARCELAS DE APARELHO', key: 'parcelas_aparelho' }
    ];

    worksheet.addRow(data);

    const excelPath = path.join(__dirname, 'uploads', 'ExtractedData.xlsx');
    await workbook.xlsx.writeFile(excelPath);

    return excelPath;
}

const PORT = process.env.PORT || 3000; // Porta alternativa configurada
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
