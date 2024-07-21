const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const PersonalLoanForm = require('../models/PersonalLoanForm');
const fs = require("fs");
const { uploadImageAndGetUrl, deleteFilefromfirebase } = require("../utils/firebase");
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



router.post("/personalLoanForm", async (req, res) => {
    try {
        // Extact data from req.body
        const { dividendArr, dividendArr1, dividendArr2, dividendArr3, formData, connector_id } = req.body;

        const applicant_kyc = {
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
        };
        const job_details = {
            salary_slip: formData?.salary_slip,
            form16: formData?.form16,
            job_experience: formData?.job_experience,
            designation: formData?.designation,
            current_salary: formData?.current_salary,
            company_name: formData?.company_name,
            current_job_experience: formData?.current_job_experience,
            office_building_name: formData?.office_building_name,
            office_street_name: formData?.office_street_name,
            office_city_name: formData?.city_name,
            office_landmark: formData?.office_landmark,
            office_district: formData?.office_district,
            office_state: formData?.office_state,
            office_pincode: formData?.office_pincode,
        }
        const co_applicant_kyc = {
            co_name: formData?.co_name,
            co_date_of_birth: formData?.co_date_of_birth,
            occupation: formData?.occupation,
            co_relation: formData?.co_relation,
        }
        // const random = Math.floor(Math.random() * 100).toString();
        // const newDate = new Date().getTime().toString();
        // const lastFourDigit = newDate.slice(0, -7);
        // const application_no = `PARV${random}${lastFourDigit}`;

        const latestSubmission = await PersonalLoanForm.find().sort({_id:-1}).limit(1);

    // let nextApplicationNumber = 'PARVHL0001'; // Initial application number
    let nextApplicationNumber ; // Initial application number

    if ( latestSubmission[0]?.application_no) {
        const lastNumber = parseInt(latestSubmission[0].application_no.substring(6)); // Extract number part
        nextApplicationNumber = 'PARVPL' + String('0000' + (lastNumber + 1)).slice(-4); // Increment and format
    }else{
      nextApplicationNumber = 'PARVPL0001';
    }

        // Create a new user document
        const newForm = new PersonalLoanForm({
            userID: formData.userID,
            applicant_banking_details: dividendArr || [],
            loan_history: dividendArr1 || [],
            applicant_kyc: applicant_kyc,
            job_details: job_details,
            co_applicant_kyc: co_applicant_kyc,
            connector_id,
            application_no:nextApplicationNumber,
            loan_status: "Received"
        });

        // Save the new user document
        await newForm.save();

        res.status(200).send({ id: newForm._id });
    } catch (error) {
        console.error("Error creating new user:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.post("/personalformUploadfiles/:id",
    upload.fields([
        { name: "adhar_front", maxCount: 1 },
        { name: "adhar_back", maxCount: 1 },
        { name: "pancard", maxCount: 1 },
        { name: "applicant_photo", maxCount: 1 },
        { name: "address_proof", maxCount: 1 },
        { name: "first_month_salary", maxCount: 1 },
        { name: "second_month_salary", maxCount: 1 },
        { name: "third_month_salary", maxCount: 1 },
        { name: "itr1", maxCount: 1 },
        { name: "itr2", maxCount: 1 },
        { name: "other1", maxCount: 1 },
        { name: "other2", maxCount: 1 },
        { name: "other3", maxCount: 1 },
        { name: "co_adhar_front", maxCount: 1 },
        { name: "co_adhar_back", maxCount: 1 },
        { name: "co_pancard", maxCount: 1 },
        { name: "co_applicant_photo", maxCount: 1 },
    ]),
    async (req, res) => {
        try {
            const formid = req.params.id;
            if (!mongoose.Types.ObjectId.isValid(formid)) {
                return res.status(400).send("Invalid formid");
            }

            const form = await PersonalLoanForm.findById(formid);
            if (!form) {
                return res.status(404).send("Form does not found");
            }

            const uploadPromises = [];
            for (const fieldName in req.files) {
                const files = req.files[fieldName];
                for (const file of files) {
                    const random = Math.random().toString().substr(2, 6);
                    const destinationFileName = `persoanlloan/${random}${file.originalname}`;
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
            // Wait for all the files to be uploaded to S3
            const uploadedPromises = await Promise.all(uploadPromises);

            // Update the form document with S3 file details and save
            for (const uploadedFile of uploadedPromises) {
                form.files.push({
                    fieldName: uploadedFile.fieldName, // replace with your field name
                    url: uploadedFile.url,
                    path: uploadedFile.path, // S3 file URL
                });
            }
            await form.save();
            // ================================

            let mailOptions = {
                from: 'parvmultiservices@gmail.com',
                // to: form?.applicant_kyc?.email, // replace with the applicant's email
                to: form?.applicant_kyc?.email, // replace with the applicant's email
                subject: ' Personal Loan Application Received',
                // text: `Dear ${form?.applicant_kyc?.fname} ${form?.applicant_kyc?.mname} ${form?.applicant_kyc?.lname},\n\nThank you for applying for a Personal loan with Parv Finance. We have successfully received your application.\n\nOur team is currently reviewing your application, and we will get back to you within the next 3-5 business days. If we need any additional information, we will contact you via this email address.\n\nThank you for choosing Parv Finance.\n\nBest regards,\nParv Finance Team`,
                html: `<h3>Dear ${form?.applicant_kyc?.fname} ${form?.applicant_kyc?.mname} ${form?.applicant_kyc?.lname},</h3><p>Thank you for applying for a Personal loan with Parv Finance. We have successfully received your application. Your appliaction number is : <b>${form?.application_no}</b></p><p>Our team is currently reviewing your application, and we will get back to you within the next 3-5 business days. If we need any additional information, we will contact you via this email address.</p><p>Thank you for choosing Parv Finance.</p><p>Best regards,<br>Parv Finance Team</p>`

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
router.put("/update_personal_doc/:id",
    upload.fields([
        { name: "adhar_front", maxCount: 1 },
        { name: "adhar_back", maxCount: 1 },
        { name: "pancard", maxCount: 1 },
        { name: "applicant_photo", maxCount: 1 },
        { name: "address_proof", maxCount: 1 },
        { name: "first_month_salary", maxCount: 1 },
        { name: "second_month_salary", maxCount: 1 },
        { name: "third_month_salary", maxCount: 1 },
        { name: "itr1", maxCount: 1 },
        { name: "itr2", maxCount: 1 },
        { name: "other1", maxCount: 1 },
        { name: "other2", maxCount: 1 },
        { name: "other3", maxCount: 1 },
        { name: "co_adhar_front", maxCount: 1 },
        { name: "co_adhar_back", maxCount: 1 },
        { name: "co_pancard", maxCount: 1 },
        { name: "co_applicant_photo", maxCount: 1 },
    ]),
    async (req, res) => {
        try {
            const formid = req.params.id;
            if (!mongoose.Types.ObjectId.isValid(formid)) {
                return res.status(400).send("Invalid formid");
            }

            const form = await PersonalLoanForm.findById(formid);
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
                    const destinationFileName = `persoanlloan/${random}${file.originalname}`;
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
            // Wait for all the files to be uploaded to S3
            const uploadedPromises = await Promise.all(uploadPromises);

            // Update the form document with S3 file details and save
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


router.get("/get_all_personal_loan/:id", async (req, res) => {
    try {
        const { id } = req?.params;
        const goldloanform = await PersonalLoanForm.findById(id);
        res.status(200).send({ data: goldloanform });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});
router.get("/get_all_personal_loan", async (req, res) => {
    const page = parseInt(req?.query?.page) || 1;
    const limit = parseInt(req?.query?.limit) || 10;
    try {
        const personalLoanForm = await PersonalLoanForm.find()
        .sort({ _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
        const count = await PersonalLoanForm.countDocuments();
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
router.put("/update_personalLoan/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await PersonalLoanForm.findByIdAndUpdate(id, req?.body, { new: true })

        res.status(200).json({ Message: "updated successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ Message: "Internal server Erroe", error });
    }
});

router.put('/update_personal_status/:id', async (req, res) => {
    const itemId = req.params.id;
    const { status } = req.body;

    try {
        // Find the item by ID and update the 'approved' field to true
        const updatedItem = await PersonalLoanForm.findByIdAndUpdate(itemId, { loan_status: status }, { new: true });

        if (!updatedItem) {
            return res.status(404).json({ message: `Item with ID ${itemId} not found.` });
        }
        const form = await PersonalLoanForm.findById(itemId);
        sendLoanStatusEmail(form?.applicant_kyc?.email, form?._id, form?.loan_status);

        res.status(200).json(updatedItem);
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.put('/add_personal_loan_remark/:id', async (req, res) => {
    const { id } = req?.params;
    const { remark } = req?.body;
    try {
        const addremark = await PersonalLoanForm?.findByIdAndUpdate(id, { remarks: remark }, { new: true });
        if (!addremark) {
            return res.status(404).json({ message: `Item with ID ${itemId} not found.` });
        }
        // await addremark.save();
        res.status(200).json({ message: "Remark added successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server Error" });
    }
})

router.delete("/deletepersonalloan/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const Data = await PersonalLoanForm.findById(id);
        Data.files.forEach(async (file) => {
            const filepath = file?.path;
            // const deletefromfirebase = 
            await deleteFilefromfirebase(filepath);
            // console.log("deletefromfirebase", deletefromfirebase);
        });
        await PersonalLoanForm.findByIdAndDelete(id);
        res.status(200).json({ message: "deleted" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});
router.get("/Personaldownload/:id", async (req, res) => {
    // console.log("Hi")
    try {
        const fileid = req.params.id;

        const form = await PersonalLoanForm.findOne({
            files: { $elemMatch: { _id: fileid } },
        });

        const matchingFile = form.files.find(
            (file) => file._id.toString() === fileid
        );
        // Define the file path based on your uploads directory
        const filePath = matchingFile.path + matchingFile.originalFileName;


        // Send the file as a response
        res.download(filePath, (err) => {
            if (err) {
                console.error("Error downloading file:", err);
            }
        });
    } catch (error) {
        console.log(error)
        res.status(500).send("Error while downloading the file");
    }
});

module.exports = router;