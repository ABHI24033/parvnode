const express=require('express');
const router=express.Router();
const multer=require('multer');
// const path=require('path')
const xlsx=require('xlsx');
const EmployeeData = require('../models/EmployeeData');


const upload = multer({ storage:  multer.memoryStorage()  });

router.post('/upload_data/:id', upload.single('file'), async (req, res) => {
  
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }
  
    try {
      // Read the Excel file
      const {id}=req.params;
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
  
      // Convert the Excel data to JSON
      const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  
      // Extract headers and rows
      const headers = jsonData[0];
      const rows = jsonData.slice(1);
  
      // Convert rows to objects using headers
      const data = rows.map((row) => {
        const obj = {
          employee_id:id,
        };
        headers.forEach((header, idx) => {
          obj[header] = row[idx];
        });
        return obj;
      });
      // console.log(data);
      // Insert the data into MongoDB
      await EmployeeData.insertMany(data);
  
      res.status(200).send('Data uploaded and stored successfully');
    } catch (error) {
      console.error('Error processing file:', error);
      res.status(500).send('Internal Server Error');
    }
  });
// router.post('/upload_data/:id', upload.single('file'), async (req, res) => {
  
//     if (!req.file) {
//       return res.status(400).send('No file uploaded');
//     }
  
//     try {
//       // Read the Excel file
//       const {id}=req.params;
//       const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
//       const sheetName = workbook.SheetNames[0];
//       const sheet = workbook.Sheets[sheetName];
  
//       // Convert the Excel data to JSON
//       const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  
//       // Extract headers and rows
//       const headers = jsonData[0];
//       const rows = jsonData.slice(1);
  
//       // Convert rows to objects using headers
//       const data = rows.map((row) => {
//         const obj = {
//           employee_id:id,
//         };
//         headers.forEach((header, idx) => {
//           obj[header] = row[idx];
//         });
//         return obj;
//       });
//       // console.log(data);
//       // Insert the data into MongoDB
//       await EmployeeData.insertMany(data);
  
//       res.status(200).send('Data uploaded and stored successfully');
//     } catch (error) {
//       console.error('Error processing file:', error);
//       res.status(500).send('Internal Server Error');
//     }
//   });

router.post("/add_sheet_link/:id",async(req,res)=>{
  const {id}=req.params;
  try {
    const {url}=req?.body;
    const postData=await new EmployeeData({
      sheeet_url:url,
      employee_id:id,
    });
    await postData.save();
    res.status(201).json({message:"link posted"});
  } catch (error) {
    res?.status.json({message:'Internal Server Error'});
  }
})

  router.get('/get_sheet_link', async (req, res) => { 
    try {
        const data = await EmployeeData.find({});
        res.status(200).json(data);
    } catch (error) {
        res.status(400).json("No data found")
    }
  });
  
// export default router;
module.exports=router;