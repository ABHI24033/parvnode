const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const fs = require("fs");
const { uploadImageAndGetUrl, deleteFilefromfirebase } = require("../utils/firebase");
const BusinessLoanForm = require('../models/BusinessLoanForm');
const { sendLoanStatusEmail } = require('../utils/nodemailer');


let fileName;

// Ensure the 'uploads' directory exists
const uploadsPath = path.join(__dirname, '..', 'temp');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'parvmultiservices@gmail.com',
    pass: 'bijfijgfloicmwhn',
  },
});


const storageimage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsPath);
  },
  filename: function (req, file, callback) {
    var randomNumber = Math.floor(1000 + Math.random() * 9000);
    fileName = file.originalname + randomNumber;
    const filename = fileName;
    callback(null, filename);
  },
});


const upload = multer({ storage: storageimage });



router.post("/businessLoanForm", async (req, res) => {

  try {
    // Extact data from req.body
    const {
      dividendArr,
      dividendArr1,
      formData,
      connector_id,
    } = req.body;

    const applicant_kyc = {
      // name: formData.name,
      // email: formData.email,
      // phone: formData.phone,
      // user_loan_type: formData.user_loan_type,
      // address: formData.address,
      // business_address: formData.business_address,
      // user_salaried: formData.employment_type,
      // monthly_salary: formData.monthly_salary,
      // yearly_income: formData.yearly_income

      // fname: formData.fname,
      // mname: formData.mname,
      // lname: formData.lname,
      // email: formData.email,
      // phone: formData.phone,
      // // address: formData.address,
      // // business_address: formData.business_address,
      // purpose_of_loan: formData.purpose_of_loan,
      // fathers_name: formData.fathers_name,
      // mothers_name: formData.mothers_name,
      // marital_status: formData.marital_status,
      // spouse_name: formData.spouse_name,
      // alternate_number: formData.alternate_number,
      // date_of_birth: formData.date_of_birth,
      // pancard_number: formData.pancard_number,
      // permanent_address: formData.permanent_address,
      // residential_address: formData.residential_address,
      // landmark: formData.landmark,
      // village: formData.village,
      // city: formData.city,
      // state: formData.state,
      // pincode: formData.pincode,

      fname: formData?.fname,
      mname: formData?.mname,
      lname: formData?.lname,
      email: formData?.email,
      phone: formData?.phone,
      alternate_number: formData?.alternate_number,
      dob: formData?.dob,
      gender: formData?.gender,
      marital_status: formData?.marital_status,
      spouse_name: formData?.spouse_name,
      father_name: formData?.father_name,
      mother_name: formData?.mother_name,
      house_name: formData?.house_name,
      street_name: formData?.street_name,
      city_name: formData?.city_name,
      landmark: formData?.landmark,
      district: formData?.district,
      state: formData?.state,
      pincode: formData?.pincode,

      present_house_name: formData?.present_house_name,
      present_street_name: formData?.present_street_name,
      present_city_name: formData?.present_city_name,
      present_landmark: formData?.present_landmark,
      present_district: formData?.present_district,
      present_state: formData?.present_state,
      present_pincode: formData?.present_pincode,
    }

    const co_applicant_kyc = {
      co_name: formData?.co_name,
      co_date_of_birth: formData?.co_date_of_birth,
      occupation: formData?.occupation,
      co_relation: formData?.co_relation,
    }
    const business_details = {
      loan_purpose: formData?.loan_purpose,
      company_name: formData?.company_name,
      business_register_year: formData?.business_register_year,
      registration_documents: formData?.registration_documents,
      business_turnover: formData?.business_turnover,
      file_itr: formData?.file_itr,
      property_mortgage: formData?.property_mortgage,
      property_location: formData?.property_location,
      property_owner: formData?.property_owner,
      property_documents: formData?.property_documents,
    }
    // Create a new user document
    // const random = Math.floor(Math.random() * 100).toString();
    // const newDate = new Date().getTime().toString();
    // const lastFourDigit = newDate.slice(0, -7);
    // const application_no = `PARV${random}${lastFourDigit}`;

    const latestSubmission = await BusinessLoanForm.find().sort({ _id: -1 }).limit(1);

    // let nextApplicationNumber = 'PARVHL0001'; // Initial application number
    let nextApplicationNumber; // Initial application number

    if (latestSubmission[0]?.application_no) {
      const lastNumber = parseInt(latestSubmission[0].application_no.substring(6)); // Extract number part
      nextApplicationNumber = 'PARVBL' + String('0000' + (lastNumber + 1)).slice(-4); // Increment and format
    } else {
      nextApplicationNumber = 'PARVBL0001';
    }

    const newForm = new BusinessLoanForm({
      userID: formData.userID,
      applicant_banking_details: dividendArr || [],
      loan_history: dividendArr1 || [],
      applicant_kyc: applicant_kyc,
      co_applicant_kyc: co_applicant_kyc,
      business_details,
      connector_id,
      loan_status: "received",
      application_no: nextApplicationNumber,
    });

    // Save the new user document
    await newForm.save();

    res.status(200).send({ id: newForm._id });
  } catch (error) {
    console.error('Error creating new user:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.post('/businessformUploadfiles/:id',
  // upload.any(),
  upload.fields([
    { name: "adhar_front", maxCount: 1 },
    { name: "adhar_back", maxCount: 1 },
    { name: "pancard", maxCount: 1 },
    { name: "applicant_photo", maxCount: 1 },
    // { name: "bank_statement", maxCount: 1 }, 
    { name: "address_proof", maxCount: 1 },
    //business documents
    { name: "business_electricity_bill", maxCount: 1 },
    { name: "shop_pic", maxCount: 1 },
    { name: "shop_inside_pic", maxCount: 1 },
    { name: "business_registration", maxCount: 1 },
    { name: 'itr1', maxCount: 1 },
    { name: "itr2", maxCount: 1 },
    { name: "other1", maxCount: 1 },
    { name: "other2", maxCount: 1 },
    { name: 'other3', maxCount: 1 },
    //property documents
    { name: 'khatiyan', maxCount: 1 },
    { name: 'mutation', maxCount: 1 },
    { name: 'rashid', maxCount: 1 },
    { name: 'lpc', maxCount: 1 },
    { name: 'property_front_pic', maxCount: 1 },
    { name: 'property_map', maxCount: 1 },
    { name: 'property_video', maxCount: 1 },
    { name: 'chain_deed', maxCount: 1 },
    //co_Applicant 
    { name: 'co_adhar_front', maxCount: 1 },
    { name: 'co_adhar_back', maxCount: 1 },
    { name: 'co_pancard', maxCount: 1 },
    { name: 'co_applicant_photo', maxCount: 1 },

  ]),
  async (req, res) => {

    console.log(req.files);
    try {
      const formid = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(formid)) {
        return res.status(400).send('Invalid formid');
      }

      // Find the user by its _id
      const form = await BusinessLoanForm.findById(formid);

      if (!form) {
        return res.status(404).send('form does not found');
      }

      const uploadPromises = [];
      for (const fieldName in req.files) {
        const files = req.files[fieldName];
        for (const file of files) {
          // console.log("file :-", file);
          const random = Math.random().toString().substr(2, 6);
          const destinationFileName = `businessloan/${random}${file.originalname}`;
          const uploadfile = await uploadImageAndGetUrl(file?.path, destinationFileName);

          // uploadPromises.push(abhi);
          uploadPromises.push({ fieldName: fieldName, url: uploadfile, path: destinationFileName });

          fs.unlink(file.path, (err) => {
            if (err) {
              console.error('Error deleting file:', err);
            } else {
              console.log('File deleted successfully:');
            }
          })
        }
      }
      // Wait for all the files to be uploaded to S3
      const uploadedPromises = await Promise.all(uploadPromises);

      // Update the form document with S3 file details and save
      for (const uploadedFile of uploadedPromises) {
        console.log("uploaded File ::::", uploadedFile.url);
        form.files.push({
          fieldName: uploadedFile.fieldName, // replace with your field name
          url: uploadedFile.url,
          path: uploadedFile.path, // S3 file URL
        });
      }
      await form.save();
      console.log(form);
      let mailOptions = {
        from: 'parvmultiservices@gmail.com', // Sender address
        to: form?.applicant_kyc?.email,                // List of recipients
        subject: 'Business Loan Application Received',    // Subject line
        // text: `Dear ${form?.applicant_kyc?.fname} ${form?.applicant_kyc?.mname} ${form?.applicant_kyc?.lname},\n\nThank you for applying for a business loan with Parv Finance. We have successfully received your application.\n\nOur team is currently reviewing your application, and we will get back to you within the next 3-5 business days. If we need any additional information, we will contact you via this email address.\n\nThank you for choosing Parv Finance.\n\nBest regards,\nParv Finance Team`,
        html: `<h3>Dear ${form?.applicant_kyc?.fname} ${form?.applicant_kyc?.mname} ${form?.applicant_kyc?.lname},</h3><p>Thank you for applying for a business loan with Parv Finance. We have successfully received your application. Your appliaction number is : <b>${form?.application_no}</b></p><p>Our team is currently reviewing your application, and we will get back to you within the next 3-5 business days. If we need any additional information, we will contact you via this email address.</p><p>Thank you for choosing Parv Finance.</p><p>Best regards,<br>Parv Finance Team</p>`
      };

      // Send mail with defined transport object
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      });

      res.status(200).send({ message: "Form submitted successfully", id: formid });
    } catch (error) {
      console.error('Error adding files to user:', error);
      res.status(500).send('Internal Server Error');
    }
  });
router.put('/update_business_doc/:id',
  // upload.any(),
  upload.fields([
    { name: "adhar_front", maxCount: 1 },
    { name: "adhar_back", maxCount: 1 },
    { name: "pancard", maxCount: 1 },
    { name: "applicant_photo", maxCount: 1 },
    // { name: "bank_statement", maxCount: 1 }, 
    { name: "address_proof", maxCount: 1 },
    //business documents
    { name: "business_electricity_bill", maxCount: 1 },
    { name: "shop_pic", maxCount: 1 },
    { name: "shop_inside_pic", maxCount: 1 },
    { name: "business_registration", maxCount: 1 },
    { name: 'itr1', maxCount: 1 },
    { name: "itr2", maxCount: 1 },
    { name: "other1", maxCount: 1 },
    { name: "other2", maxCount: 1 },
    { name: 'other3', maxCount: 1 },
    //property documents
    { name: 'khatiyan', maxCount: 1 },
    { name: 'mutation', maxCount: 1 },
    { name: 'rashid', maxCount: 1 },
    { name: 'lpc', maxCount: 1 },
    { name: 'property_front_pic', maxCount: 1 },
    { name: 'property_map', maxCount: 1 },
    { name: 'property_video', maxCount: 1 },
    { name: 'chain_deed', maxCount: 1 },
    //co_Applicant 
    { name: 'co_adhar_front', maxCount: 1 },
    { name: 'co_adhar_back', maxCount: 1 },
    { name: 'co_pancard', maxCount: 1 },
    { name: 'co_applicant_photo', maxCount: 1 },

  ]),
  async (req, res) => {

    try {
      const formid = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(formid)) {
        return res.status(400).send('Invalid formid');
      }

      // Find the user by its _id
      const form = await BusinessLoanForm.findById(formid);

      if (!form) {
        return res.status(404).send('form does not found');
      }

      const uploadPromises = [];
      for (const fieldName in req.files) {
        const files = req.files[fieldName];
        const filtered = form?.files?.filter((item) => item?.fieldName === fieldName);

        if (filtered) {
          await deleteFilefromfirebase(filtered[0]?.path);
        }
        form?.files?.splice(form?.files?.findIndex((item) => item?.fieldName === fieldName), 1);

        for (const file of files) {
          // console.log("file :-", file);
          const random = Math.random().toString().substr(2, 6);
          const destinationFileName = `businessloan/${random}${file.originalname}`;
          const uploadfile = await uploadImageAndGetUrl(file?.path, destinationFileName);

          // uploadPromises.push(abhi);
          uploadPromises.push({ fieldName: fieldName, url: uploadfile, path: destinationFileName });

          fs.unlink(file.path, (err) => {
            if (err) {
              console.error('Error deleting file:', err);
            } else {
              console.log('File deleted successfully:');
            }
          })
        }
      }
      // Wait for all the files to be uploaded to S3
      const uploadedPromises = await Promise.all(uploadPromises);

      // Update the form document with S3 file details and save
      for (const uploadedFile of uploadedPromises) {
        console.log("uploaded File ::::", uploadedFile.url);
        form.files.push({
          fieldName: uploadedFile.fieldName, // replace with your field name
          url: uploadedFile.url,
          path: uploadedFile.path,
        });
      }
      await form.save();
      res.status(200).send({ message: "Form submitted successfully", id: formid });
    } catch (error) {
      console.error('Error adding files to user:', error);
      res.status(500).send('Internal Server Error');
    }
  });
router.get("/getAllBusinessLoanForms/:id", async (req, res) => {
  try {
    const goldloanform = await BusinessLoanForm.findById(req?.params?.id);
    res.status(200).send({ data: goldloanform });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
router.get("/getAllBusinessLoanForms", async (req, res) => {
  const page = parseInt(req?.query?.page) || 1;
  const limit = parseInt(req?.query?.limit) || 10;
  try {
    const businessLoanForm = await BusinessLoanForm.find()
      .sort({ _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const count = await BusinessLoanForm.countDocuments();
    res.status(200).send({
      data: businessLoanForm,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
router.put("/update_businessLoan/:id", async (req, res) => {
  try {

    const { id } = req.params;
    await BusinessLoanForm.findByIdAndUpdate(id, req?.body, { new: true })

    res.status(200).json({ Message: "updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ Message: "Internal server Erroe", error });
  }
});
router.put('/change_business_status/:id', async (req, res) => {
  const itemId = req.params.id;
  const { status } = req.body;
  try {
    // Find the item by ID and update the 'approved' field to true
    const updatedItem = await BusinessLoanForm.findByIdAndUpdate(itemId, { loan_status: status }, { new: true });

    if (!updatedItem) {
      return res.status(404).json({ message: `Item with ID ${itemId} not found.` });
    }
    const form = await BusinessLoanForm.findById(itemId);
    sendLoanStatusEmail(form?.applicant_kyc?.email, form?._id, form?.loan_status);
    res.status(200).json(updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.put('/add_businessloan_remark/:id', async (req, res) => {
  const { id } = req?.params;
  const { remark } = req?.body;
  try {
    const addremark = await BusinessLoanForm?.findByIdAndUpdate(id, { remarks: remark }, { new: true });
    if (!addremark) {
      return res.status(404).json({ message: `Item with ID ${itemId} not found.` });
    }
    // await addremark.save();
    res.status(200).json({ message: "Remark added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server Error" });
  }
});
router.delete("/deletebusinessloan/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const Data = await BusinessLoanForm.findById(id);
    Data.files.forEach(async (file) => {
      const filepath = file?.path;
      await deleteFilefromfirebase(filepath);
    });
    await BusinessLoanForm.findByIdAndDelete(id);
    res.status(200).json({ message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;