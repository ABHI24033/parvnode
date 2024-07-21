const express = require("express");
const router = express.Router();
const Users = require("../models/User.model");
const nodemailer = require('nodemailer');
const mustache = require('mustache');
const fs = require('fs');
const Employee = require("../models/Employee");
const multer = require("multer");
const path = require("path");
const { uploadImageAndGetUrl, deleteFilefromfirebase } = require("../utils/firebase");
const OtpModal = require("../models/otp");

// Create a transporter using your Gmail credentials
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'parvmultiservices@gmail.com',
        pass: 'bijfijgfloicmwhn',
    },
});
let fileName;

// Ensure the 'uploads' directory exists
const uploadsPath = path.join(__dirname, '..', 'temp');
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
}

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


async function sendMail(email, fullname, user_type, password) {
    try {
        // const templatePath = 'index.html';
        // const template = fs.readFileSync(templatePath, 'utf8');
        // const htmlContent = mustache.render(template, { fullname });
        let mailContent;
        if (user_type === "Connector") {
            mailContent = `
            <p><b>Dear ${fullname},</b></p>

        <p>Thank you for signing up with PARV Finance! We're excited to have you join our community. </p>

        <p>Your account is currently pending verification by our team. We are reviewing your details to ensure
            everything is in order.</p>
        <p>Our team will review your information as soon as possible.
            You will receive a confirmation email once your account has been verified and activated, after that you can login with given credentials. </p>

            <p>To get started, please find your login credentials below:
            <ul>
            <li><b>Email:</b> ${email}</li>
            <li><b>Password:</b> ${password}</li>
            </ul>
            </p>
        <p>If you have any questions or need assistance in the meantime, feel free to reach out to our support team at
            <a href="parvmultiservices@gmail.com">parvmultiservices@gmail.com</a>. We're here to help!

        <p><b>Best regards,</b><br>PARV Financial Services Team</p>
            `
        } else {
            mailContent = `
              <p>Welcome aboard to [Company Name]! We are excited to have you join our team and look forward to the
            contributions you will make here. Your expertise and skills will surely add tremendous value to our projects
            and goals.</p>

        <p>To get started, please find your login credentials below:
        <ul>
            <li><b>Email:</b> ${email}</li>
            <li><b>assword:</b>P ${password}</li>
        </ul>
        </p>

        <p>If you have any questions or need assistance with anything during your onboarding process, please don't
            hesitate to reach out to your manager or the HR department. We are here to help and ensure a smooth
            transition for you.
        </p>
        <p>
            Once again, welcome to the team! We're thrilled to have you with us.
        </p>
        <p><b>Best regards,</b><br>PARV Financial Services </p>
            `
        }

        const mailOptions = {
            from: 'parvmultiservices@gmail.com',
            to: email,
            subject: 'Welcome to Parv Financial Services-',
            // html: htmlContent,
            html: mailContent,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error; // Re-throw the error to be caught by the calling code
    }
}

router.post("/register", async (req, res) => {

    try {
        const { email, password, mobile_number, whats_app_number, full_name, current_profession, company_name,
            street, city, pincode, landmark, district, state, user_type } = req.body;

        const userExist = await Users.findOne({ email: req?.body?.email });
        // if (userExist) {
        //     return res.status(200).json({ message: "User already exist" })
        // }

        if (!email || !password) return res.status(400).json("email and password is required");
        const address = {
            street,
            landmark,
            city,
            district,
            pincode,
            state,
        }
        const newUser = new Users({
            email,
            password,
            address: address,
            mobile_number,
            whats_app_number,
            full_name,
            current_profession,
            company_name,
            approved: null,
            user_type,

        });

        const user = await newUser.save();
        await sendMail(email, full_name, user_type, password);

        res.status(201).json({ message: "Application submitted successfully", userid: user?._id });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
})


router.post("/login", async (req, res) => {
    try {
        const { email, password, user_type } = req.body;
        if (!email || !password) return res.status(400).json("email and password is required");

        const user = await Users.findOne({ email });
        if (!user) {
            return res.status(200).json({ message: "User not found" });
        }

        if (user_type !== user?.user_type) {
            return res.status(200).json({ message: "User not found" });
        }

        if (user) {
            if (user_type === "Connector") {
                if (user?.approved !== true) {
                    return res.status(200).json({ message: "You not approved by Admin" });
                }
            }
            if (password === user?.password) {
                return res.status(200).json({ user, message: "User login successfully" });
            }
            else {
                return res.status(401).json({ message: "password not matched" });
            }
        }
        else {
            return res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        return res.status(500).send('Internal Server Error');
    }
});

// connector details
router.get("/getallconnectorUser", async (req, res) => {
    const page = parseInt(req?.query?.page) || 1;
    const limit = parseInt(req?.query?.limit) || 10;
    try {
        const user = await Users.find({ user_type: "Connector" })
            .sort({ _id: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const count = await Users.countDocuments({ user_type: "Connector" });
        res.status(200).json({
            user,
            message: "User fetched successfully",
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

router.put('/update_connector_status/:id', async (req, res) => {
    const itemId = req.params.id;

    try {
        // Find the item by ID and update the 'approved' field to true
        const updatedItem = await Users.findByIdAndUpdate(itemId, { approved: true }, { new: true });
        if (!updatedItem) {
            return res.status(404).json({ message: `Item with ID ${itemId} not found.` });
        }

        res.status(200).json(updatedItem);
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
router.put('/reject_connector_status/:id', async (req, res) => {
    const itemId = req.params.id;
    try {
        const updatedItem = await Users.findByIdAndUpdate(itemId, { approved: false }, { new: true });
        if (!updatedItem) {
            return res.status(404).json({ message: `Item with ID ${itemId} not found.` });
        }

        res.status(200).json(updatedItem);
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
router.delete('/delete_connector/:id', async (req, res) => {
    const itemId = req.params.id;
    try {
        const user = await Users?.findById(itemId);
        if (!user) {
            return res.status(200).json({ message: "user not found" });
        }
        user?.files?.forEach(async (item) => {
            await deleteFilefromfirebase(item?.path);
        })
        const updatedItem = await Users.findByIdAndDelete(itemId);
        if (!updatedItem) {
            return res.status(404).json({ message: `Item with ID ${itemId} not found.` });
        }
        res.status(200).json(updatedItem);
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.put("/upload_users_doc/:id",
    upload.fields([
        { name: "adhar_front", maxCount: 1 },
        { name: "adhar_back", maxCount: 1 },
        { name: "pancard", maxCount: 1 },
        { name: "applicant_photo", maxCount: 1 },
        { name: "address_proof", maxCount: 1 },
        //business documents
        { name: "other1", maxCount: 1 },
        { name: "other2", maxCount: 1 },
        { name: "other3", maxCount: 1 },
    ]),
    // upload.any(),
    async (req, res) => {
        try {
            const formid = req?.params.id;
            const form = await Users.findById(formid);

            if (!form) {
                return res.status(404).send("Form does not found");
            }
            const uploadPromises = [];
            for (const fieldName in req.files) {
                const files = req.files[fieldName];
                //   const filtered=form?.files?.filter((item)=>item?.fieldName===fieldName);

                //   if(filtered){
                //   await deleteFilefromfirebase(filtered[0]?.path);
                //   }
                //   form?.files?.splice(form?.files?.findIndex((item)=>item?.fieldName===fieldName),1);
                for (const file of files) {
                    const random = Math.random().toString().substr(2, 6);
                    const destinationFileName = `users_doc/${random}${file.originalname}`;
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
                    path: uploadedFile.path,
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

router.get("/getuserbyid/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const user = await Users.findById(id);
        if (!user) {
            res.status(400).json({ message: "user not found" });
        }
        res.status(201).json({ user, message: "User fetched successfully" });
    } catch (error) {
        res.status(500).json({ error, message: "Internal Server Error" });
    }
});

router.post("/add_employee", async (req, res) => {
    try {
        const { email, password, mobile_number, whats_app_number, full_name, current_profession, company_name,
            street, city, pincode, landmark, district, state, user_type } = req.body;

        const userExist = await Employee.findOne({ email: req.body.email });
        if (userExist) {
            return res.status(400).json({ message: "User already exist" })
        }

        if (!email || !password) return res.status(400).json("email and password is required");
        const address = {
            street,
            landmark,
            city,
            district,
            pincode,
            state,
        }
        const newUser = new Employee({
            email,
            password,
            address: address,
            mobile_number,
            whats_app_number,
            full_name,
            // current_profession,
            // company_name,
            user_type,

        });

        const user = await newUser.save();
        await sendMail(email, full_name);

        res.status(201).json({ message: "user created successfully" });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

router.get("/get_employee", async (req, res) => {
    try {
        // const users = await Users.find({user_type:"Employee-1"} || {user_type:"Employee-2"} || {user_type:"Employee-3"});
        const users = await Users.find().sort({ _id: -1 });
        const filterDataForEmployee = users?.filter((item) => (item?.user_type === "Employee-1" || item?.user_type === "Employee-2" || item?.user_type === "Employee-3"))
        res.status(200).json(filterDataForEmployee);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

router.delete("/delete_employee/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const deleteItem = await Users.findByIdAndDelete(id);
        if (!deleteItem) {
            res.status(404).send("No item found");
        }
        res.status(200).send("Item deleted successfully");
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

// forgot password
router.post("/req_otp", async (req, res) => {
    const { email } = req?.body;
    // console.log();
    console.log(email);
    try {
        await OtpModal.deleteMany({});
        const user = await Users.findOne({ email });
        if (!user) {
            res.status(404).json({ message: "Email not found",success:false });
            return;
        }
        const otp = Math.floor(Math.random() * 100000);
        const storeotp = await new OtpModal({
            otp: otp,
            email: user?.email,
        });
        await storeotp.save();
        if (user?.email) {
            const mailOptions = {
                from: 'parvmultiservices@gmail.com',
                to: user?.email,
                subject: 'Verification for Reset Password',
                html: `<p>Your OTP for Reset Password is : <b>${otp}</b></p>`,
            };

            transporter?.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Email Sent :", info?.response);
                }
            });
        }

        res.status(200).json({ 
            message: "OTP send to your E-mail", 
            storeotp: storeotp?._id,
            success:true,
         });
    } catch (error) {
        console.log("Error while try to get OTP", error);
    }
});

router.post("/verify_otp", async (req, res) => {
    try {
        const { otp, email } = req?.body;
        const otpColl = await OtpModal.findOne({ email, otp });
        if (!otpColl) {
            res.status(404).json({ message: "OTP mismstch please try again !" });
            return;
        }
        if (otpColl?.otp == otp) {
            res.status(200).json({ message: "OTP Verified" });
        } else {
            res.status(400).json({ message: "OTP Not Verified" });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.patch("/updatePassword", async (req, res) => {
    const { email, newpassword } = req?.body;
    try {
        const user = await Users.findOneAndUpdate({ email }, { password: newpassword }, { new: true });
        console.log(user);
        if (!user) {
            res.status(400).json({ message: "Something went wron! " });
        }
        res.status(200).json({ message: "Password Updated Successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server Error" });
    }
})

module.exports = router;

