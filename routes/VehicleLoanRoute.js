const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const fs = require('fs');
const { uploadImageAndGetUrl, deleteFilefromfirebase } = require("../utils/firebase");
const VehicleLoanForm = require("../models/VehicleLoanForm");
const { sendLoanStatusEmail } = require("../utils/nodemailer");


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'parvmultiservices@gmail.com',
    pass: 'bijfijgfloicmwhn',
  },
});
let fileName;
const uploadsPath = path.join(__dirname, '..', 'temp');
const storageimage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsPath);
  },
  filename: function (req, file, callback) {
    fileName = file.originalname;
    const filename = fileName;
    callback(null, filename);
  },
});
const upload = multer({ storage: storageimage });

router.post("/vehicle_loan", async (req, res) => {
  try {
    // Extact data from req.body
    const { dividendArr, dividendArr1, dividendArr2, dividendArr3, formData, connector_id } =
      req.body;
    const {
      fname, mname, lname, email, phone, alternate_number, dob, gender, marital_status,
      spouse_name, father_name, mother_name, house_name, street_name, city_name, landmark,
      district, state, pincode, present_house_name,
      present_street_name,
      present_city_name,
      present_landmark,
      present_district,
      present_state,
      present_pincode,
      //home loan type
      home_loan_type,
      //vehicle -iinfo
      vehicle_loan_type,
      vehicle_profession_type,
      when_purchase_vehicle,
      vehicle_estimated_cost,
      loan_you_need,
      vehicle_file_itr,
      loan_check,
      employment_type,
      // Co_Application User 
      co_name,
      co_date_of_birth,
      occupation,
      co_relation,
      // business details
      loan_purpose,
      firm_name,
      business_register_year,
      registration_documents,
      business_turnover,
      file_itr,
      property_mortgage,
      property_location,
      property_owner,
      property_documents,
      //job details
      salary_slip,
      form16,
      job_experience,
      designation,
      current_salary,
      company_name,
      current_job_experience,
      office_building_name,
      office_street_name,
      office_city_name,
      office_landmark,
      office_district,
      office_state,
      office_pincode,
    } = formData;

    const applicant_kyc = {
      fname, mname, lname, email, phone, alternate_number, dob, gender, marital_status,
      spouse_name, father_name, mother_name, house_name, street_name, city_name,
      landmark, district, state, pincode, present_house_name, present_street_name,
      present_city_name, present_landmark, present_district, present_state,
      present_pincode,
    };
    // const home_loan_type=home_loan_type;
    const co_applicant_kyc = { co_name, co_date_of_birth, occupation, co_relation, };
    const business_details = { loan_purpose, firm_name, business_register_year, registration_documents, business_turnover, file_itr, property_mortgage, property_location, property_owner, property_documents, }
    const job_details = {
      salary_slip,
      form16,
      job_experience,
      designation,
      current_salary,
      company_name,
      current_job_experience,
      office_building_name,
      office_street_name,
      office_city_name,
      office_landmark,
      office_district,
      office_state,
      office_pincode,
    }
    const vehicle_info = {
      vehicle_loan_type,
      vehicle_profession_type,
      when_purchase_vehicle,
      vehicle_estimated_cost,
      loan_you_need,
      vehicle_file_itr,
      loan_check,
    }

    // const random= Math.floor(Math.random()*100).toString();
    // const newDate=new Date().getTime().toString();
    // const lastFourDigit=newDate.slice(0, -7);
    // const application_no=`PARV${random}${lastFourDigit}`;

    const latestSubmission = await VehicleLoanForm.find().sort({ _id: -1 }).limit(1);

    // let nextApplicationNumber = 'PARVHL0001'; // Initial application number
    let nextApplicationNumber; // Initial application number

    if (latestSubmission[0]?.application_no) {
      const lastNumber = parseInt(latestSubmission[0].application_no.substring(6)); // Extract number part
      nextApplicationNumber = 'PARVVL' + String('0000' + (lastNumber + 1)).slice(-4); // Increment and format
    } else {
      nextApplicationNumber = 'PARVVL0001';
    }

    // Create a new user document
    const newForm = new VehicleLoanForm({
      userID: formData.userID,
      applicant_banking_details: dividendArr || [],
      loan_history: dividendArr1 || [],
      business_details,
      employment_type,
      applicant_kyc,
      co_applicant_kyc,
      job_details,
      home_loan_type,
      vehicle_info,
      application_no: nextApplicationNumber,
      // seller_banking_details:dividendArr2 || [],
      connector_id,
      loan_status: "Received",
    });

    // Save the new user document
    await newForm.save();

    res.status(200).send({ id: newForm._id });
  } catch (error) {
    console.error("Error creating new user:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/vehicle_loan_uploadFiles/:id",
  upload.fields([
    { name: "adhar_front", maxCount: 1 },
    { name: "adhar_back", maxCount: 1 },
    { name: "pancard", maxCount: 1 },
    { name: "applicant_photo", maxCount: 1 },
    { name: "address_proof", maxCount: 1 },
    //business documents
    { name: "business_electricity_bill", maxCount: 1 },
    { name: "shop_pic", maxCount: 1 },
    { name: "shop_inside_pic", maxCount: 1 },
    { name: "business_registration", maxCount: 1 },
    { name: "itr1", maxCount: 1 },
    { name: "itr2", maxCount: 1 },
    { name: "other1", maxCount: 1 },
    { name: "other2", maxCount: 1 },
    { name: "other3", maxCount: 1 },
    // property details
    { name: 'khatiyan', maxCount: 1 },
    { name: 'mutation', maxCount: 1 },
    { name: 'rashid', maxCount: 1 },
    { name: 'lpc', maxCount: 1 },
    { name: 'property_front_pic', maxCount: 1 },
    { name: 'property_map', maxCount: 1 },
    { name: 'property_video', maxCount: 1 },
    { name: 'chain_deed', maxCount: 1 },
    //job details
    { name: "first_month_salary", maxCount: 1 },
    { name: "second_month_salary", maxCount: 1 },
    { name: "third_month_salary", maxCount: 1 },
    { name: "itr1", maxCount: 1 },
    { name: "itr2", maxCount: 1 },
    { name: "other1", maxCount: 1 },
    { name: "other2", maxCount: 1 },
    { name: "other3", maxCount: 1 },
    //co_applicnat details
    { name: "co_adhar_front", maxCount: 1 },
    { name: "co_adhar_back", maxCount: 1 },
    { name: "co_pancard", maxCount: 1 },
    { name: "co_applicant_photo", maxCount: 1 },
  ]),
  // upload.any(),
  async (req, res) => {
    // console.log(req.files);
    try {
      // const s3 = new AWS.S3();
      const formid = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(formid)) {
        return res.status(400).send("Invalid formid");
      }
      const form = await VehicleLoanForm.findById(formid);

      if (!form) {
        return res.status(404).send("Form does not found");
      }
      const uploadPromises = [];
      for (const fieldName in req.files) {
        const files = req.files[fieldName];
        for (const file of files) {
          // console.log("file :-", file);
          const random = Math.random().toString().substr(2, 6);
          const destinationFileName = `vehicleloan/${random}${file.originalname}`;
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
        // console.log("uploaded File ::::", uploadedFile.url);
        form.files.push({
          fieldName: uploadedFile.fieldName, // replace with your field name
          url: uploadedFile.url,
          // fileName: uploadedFile.Key.split('/').pop(), // get the filename from S3 key
          path: uploadedFile.path, // S3 file URL
          // originalFileName: uploadedFile.originalname, // or modify based on your requirements
        });
      }
      await form.save();
      let mailOptions = {
        from: 'parvmultiservices@gmail.com',
        // to: form?.applicant_kyc?.email, // replace with the applicant's email
        to: form?.applicant_kyc?.email, // replace with the applicant's email
        subject: ' Vehicle Loan Application Received',
        // text: `Dear ${form?.applicant_kyc?.fname} ${form?.applicant_kyc?.mname} ${form?.applicant_kyc?.lname},\n\nThank you for applying for a Vehicle loan with Parv Finance. We have successfully received your application.\n\nOur team is currently reviewing your application, and we will get back to you within the next 3-5 business days. If we need any additional information, we will contact you via this email address.\n\nThank you for choosing Parv Finance.\n\nBest regards,\nParv Finance Team`,
        html: `<h3>Dear ${form?.applicant_kyc?.fname} ${form?.applicant_kyc?.mname} ${form?.applicant_kyc?.lname},</h3><p>Thank you for applying for a Vehicle loan with Parv Finance. We have successfully received your application. Your appliaction number is : <b>${form?.application_no}</b></p><p>Our team is currently reviewing your application, and we will get back to you within the next 3-5 business days. If we need any additional information, we will contact you via this email address.</p><p>Thank you for choosing Parv Finance.</p><p>Best regards,<br>Parv Finance Team</p>`

      };

      await transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      })

      res.status(200).send({ message: "Form submitted successfully", id: formid });
    } catch (error) {
      console.error("Error adding files to user:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);
router.put("/update_vehicle_doc/:id",
  upload.fields([
    { name: "adhar_front", maxCount: 1 },
    { name: "adhar_back", maxCount: 1 },
    { name: "pancard", maxCount: 1 },
    { name: "applicant_photo", maxCount: 1 },
    { name: "address_proof", maxCount: 1 },
    //business documents
    { name: "business_electricity_bill", maxCount: 1 },
    { name: "shop_pic", maxCount: 1 },
    { name: "shop_inside_pic", maxCount: 1 },
    { name: "business_registration", maxCount: 1 },
    { name: "itr1", maxCount: 1 },
    { name: "itr2", maxCount: 1 },
    { name: "other1", maxCount: 1 },
    { name: "other2", maxCount: 1 },
    { name: "other3", maxCount: 1 },
    // property details
    { name: 'khatiyan', maxCount: 1 },
    { name: 'mutation', maxCount: 1 },
    { name: 'rashid', maxCount: 1 },
    { name: 'lpc', maxCount: 1 },
    { name: 'property_front_pic', maxCount: 1 },
    { name: 'property_map', maxCount: 1 },
    { name: 'property_video', maxCount: 1 },
    { name: 'chain_deed', maxCount: 1 },
    //job details
    { name: "first_month_salary", maxCount: 1 },
    { name: "second_month_salary", maxCount: 1 },
    { name: "third_month_salary", maxCount: 1 },
    { name: "itr1", maxCount: 1 },
    { name: "itr2", maxCount: 1 },
    { name: "other1", maxCount: 1 },
    { name: "other2", maxCount: 1 },
    { name: "other3", maxCount: 1 },
    //co_applicnat details
    { name: "co_adhar_front", maxCount: 1 },
    { name: "co_adhar_back", maxCount: 1 },
    { name: "co_pancard", maxCount: 1 },
    { name: "co_applicant_photo", maxCount: 1 },
  ]),
  // upload.any(),
  async (req, res) => {
    try {
      const formid = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(formid)) {
        return res.status(400).send("Invalid formid");
      }
      const form = await VehicleLoanForm.findById(formid);

      if (!form) {
        return res.status(404).send("Form does not found");
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
          const random = Math.random().toString().substr(2, 6);
          const destinationFileName = `vehicleloan/${random}${file.originalname}`;
          const uploadfile = await uploadImageAndGetUrl(file?.path, destinationFileName);

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
      const uploadedPromises = await Promise.all(uploadPromises);

      for (const uploadedFile of uploadedPromises) {
        form.files.push({
          fieldName: uploadedFile.fieldName, // replace with your field name
          url: uploadedFile.url,
          path: uploadedFile.path, // S3 file URL
        });
      }
      await form.save();

      res.status(200).send({ message: "Form submitted successfully", id: formid });
    } catch (error) {
      console.error("Error adding files to user:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.get("/get_all_vehicle_loan/:id", async (req, res) => {
  try {
    const { id } = req?.params;
    const salariedLoanForm = await VehicleLoanForm.findById(id);
    res.status(200).send({ data: salariedLoanForm });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get("/get_all_vehicle_loan", async (req, res) => {
  const page = parseInt(req?.query?.page) || 1;
  const limit = parseInt(req?.query?.limit) || 10;
  try {
    const personalLoanForm = await VehicleLoanForm.find()
      .sort({ _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const count = await VehicleLoanForm.countDocuments();
    res.status(200).send({
      data: personalLoanForm,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.put("/update_vehicleLoan/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await VehicleLoanForm.findByIdAndUpdate(id, req?.body, { new: true })

    res.status(200).json({ Message: "updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ Message: "Internal server Erroe", error });
  }
});

router.put('/vehicle_loan_status/:id', async (req, res) => {
  const itemId = req.params.id;
  const { status } = req?.body;
  try {
    const updatedItem = await VehicleLoanForm.findByIdAndUpdate(itemId, { loan_status: status }, { new: true });

    if (!updatedItem) {
      return res.status(404).json({ message: `Item with ID ${itemId} not found.` });
    }
    const user = await VehicleLoanForm.findById(itemId);
    sendLoanStatusEmail(user?.applicant_kyc?.email, user?._id, user?.loan_status);
    res.status(200).json(updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.put('/add_vehicleloan_remark/:id', async (req, res) => {
  const { id } = req?.params;
  const { remark } = req?.body;
  try {
    const addremark = await VehicleLoanForm?.findByIdAndUpdate(id, { remarks: remark }, { new: true });
    if (!addremark) {
      return res.status(404).json({ message: `Item with ID ${itemId} not found.` });
    }
    // await addremark.save();
    res.status(200).json({ message: "Remark added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server Error" });
  }
})

router.delete("/delete_vehicle_loan/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const Data = await VehicleLoanForm.findById(id);
    Data.files.forEach(async (file) => {
      const filepath = file?.path;
      const deletefromfirebase = await deleteFilefromfirebase(filepath);
      console.log("deletefromfirebase", deletefromfirebase);
    });
    await VehicleLoanForm.findByIdAndDelete(id);
    res.status(200).json({ message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
})





module.exports = router;