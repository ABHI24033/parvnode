const express = require('express');
const router = express.Router();
const Image = require('../models/Images');
const multer = require('multer');
const Testimonials = require('../models/Testimonials');
const uuid4 = require('uuid4');
const path = require('path');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');
const Contacts = require('../models/Contacts');
const fs = require("fs");
const Blog = require('../models/Blog');
const Career = require('../models/Career');
// Import the AWS SDK
const AWS = require('aws-sdk');
const GalleryImages = require('../models/GalleryImages');
const { uploadImageAndGetUrl, deleteFilefromfirebase } = require("../utils/firebase");



let fileName;

// Ensure the 'uploads' directory exists
const uploadsPath = path.join(__dirname, '..', 'temp');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// Multer setup for handling image uploads
// const storage = multer.diskStorage({

//   destination: function (req, file, cb) {
//     // Specify the local destination path
//     // cb(null, 'C:/Users/yashc/OneDrive/Desktop/Gravitonweb/loanwebsite/src/assets/uploads/');
//     cb(null, uploadsPath);
//   },
//   filename: function (req, file, callback) {
//     fileName = file.originalname;
//     // const filename = fileName;
//     const filename = "file_" + uuid4() + fileName;
//     callback(null, filename);
//   },

// });

const storageimage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Specify the local destination path
    // cb(null, 'C:/Users/yashc/OneDrive/Desktop/Gravitonweb/loanwebsite/src/assets/uploads/');
    cb(null, uploadsPath);
  },
  filename: function (req, file, callback) {
    fileName = file.originalname;
    const filename = fileName;
    // const filename = "file_" + uuid4() + fileName;
    callback(null, filename);
  },
});
const storage2 = multer.diskStorage({

  destination: function (req, file, cb) {
    // Specify the local destination path
    // cb(null, 'C:/Users/yashc/OneDrive/Desktop/Gravitonweb/loanwebsite/src/assets/uploads/');
    cb(null, uploadsPath);
  },
  filename: function (req, file, callback) {
    fileName = file.originalname;
    const filename = fileName;
    callback(null, filename);
  },

});

const upload = multer({ storage: storageimage });
const upload2 = multer({ storage: storage2 })
const uploadimage = multer({ storage: storageimage })

router.get("/", (req, res) => {
  res.send("Backend runs successfully");
})

router.post("/uploadImage", uploadimage.single("file"), async (req, res) => {
  try {
    const date = new Date().getTime();
    const destinationFileName = `carousel/${date}${req.file.originalname}`;
    uploadImageAndGetUrl(req.file.path, destinationFileName).then(async (url) => {
      const image = new Image({
        fileName: req.file.originalname,  // Save the S3 key in the database
        path: destinationFileName,
        url: url,
        body: {
          heading: req.body.body.heading,
          description: req.body.body.description,
        }
      });
      await image.save();
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        } else {
          console.log('File deleted successfully:');
        }
      });
    });
    res.status(201).send({
      message: "Image uploaded successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error by Abhisek kuamr");
  }
});
// deleting uploaded image
router.delete("/deleteImage/:id", async (req, res) => {
  try {
    // const s3 = new AWS.S3();
    const imageId = req.params.id;
    // Find the image by its id
    const image = await Image.findById(imageId);
    if (!image) {
      return res.status(404).send("Image not found");
    }
    const imagePath = image?.path;
    await deleteFilefromfirebase(imagePath);
    await Image.findByIdAndDelete(imageId);
    res.status(200).send({ message: "Image deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
// router.use('/getImages', express.static(path.join(__dirname, 'uploads')));
router.get("/getImages", async (req, res) => {
  try {
    const images = await Image.find({}).sort({ _id: -1 });
    res.status(200).send({ images: images });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/careers", upload.single("resume"), async (req, res) => {
  try {
    // console.log(typeof upload);
    const { name, email, phone, message, job_id } = req.body;
    if (!name || !email || !phone || !message)
      return res.status(400).json("Missing fields");

    const date = new Date().getTime();
    const destinationFileName = `resume/${date}${req.file.originalname}`;
    let upload
    if (req?.file) {
      upload = await uploadImageAndGetUrl(req?.file?.path, destinationFileName);
    }
    const resume = {
      url: upload,
      path: destinationFileName,
      name: req?.file?.fieldname,
    }

    const object = {
      name: name,
      email: email,
      phone: phone,
      resume,
      job_id,
      // password: password,
      message: message,
    };

    const careers = new Career(object);

    await careers.save();
    res.status(201).send({ message: "Thank you for connecting with us!" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
router.get("/careers", async (req, res) => {
  try {
    const careers = await Career.find({}).sort({ _id: -1 });
    res.status(200).send(careers);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
})
router.delete("/delete_career/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Career.findById(id);
    if (!data) {
      res.status(404).json({ Message: "No Data found" });
    }
    const imagePath = data?.resume?.path;
    await deleteFilefromfirebase(imagePath);
    await Career.findByIdAndDelete(id);
    res.status(200).send({ message: "Deleted Successfully" });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
})

router.post("/uploadTestimonials", async (req, res) => {
  try {
    const { name, testimonial } = req.body;
    if (!name || !testimonial) return res.status(400).json("Missing fields");

    const currenttestimonial = new Testimonials({
      name: name,
      testimonial: testimonial,
    });

    await currenttestimonial.save();
    res.status(201).send({ message: "testimonial uploaded succesfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/getTestimonials", async (req, res) => {
  try {
    const images = await Testimonials.find({}).sort({ _id: -1 });

    res.status(200).send({ images: images });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.delete("/deleteTestimonial/:id", async (req, res) => {
  try {
    const testimonialId = req.params.id;
    // Find the testimonial by its id
    const testimonial = await Testimonials.findById(testimonialId);
    if (!testimonial) {
      return res.status(404).send("Testimonial not found");
    }
    // Delete the testimonial from the database
    await Testimonials.findByIdAndDelete(testimonialId);
    res.status(200).send({ message: "Testimonial deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});


router.post("/sendNotification", async (req, res) => {
  try {
    const { content, notificationSeen, email, subject } = req.body;
    // if (!content || !notificationSeen || !email || !subject)
    //   return res.status(400).json("Missing fields");

    const notification = new Notification({
      content: content,
      // notificationSeen: notificationSeen,
      email: email,
      subject: subject,
    });

    await notification.save();
    res.status(201).send({ message: "notification uploaded succesfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/notification/:id", async (req, res) => {
  try {
    await Notification.find(
      { _id: req.params.id },
      { $set: { notificationSeen: true } }
    );

    res.status(200).send({ message: "Notification seen successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/getNotification", async (req, res) => {
  try {
    const notifications = await Notification.find({}).sort({ _id: -1 });
    res.status(200).send({ notifications: notifications });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// deleting Notification
router.delete("/deleteNotification/:id", async (req, res) => {
  try {
    const notifictaionId = req.params.id;
    // Find the Notification by its id
    const notification = await Notification.findById(notifictaionId);
    if (!notification) {
      return res.status(404).send("Testimonial not found");
    }
    // Delete the Notification from the database
    await Notification.findByIdAndDelete(notifictaionId);
    res.status(200).send({ message: "Testimonial deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/contacts", async (req, res) => {
  // console.log("Hii");
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !phone || !message)
      return res.status(400).json("Missing fields");

    const object = {
      name: name,
      email: email,
      phone: phone,
      message: message,
      date:new Date(),
    };

    const contacts = new Contacts(object);

    await contacts.save();
    res.status(201).send({ message: "Thank you for connecting with us!" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get('/getAllContacts', async (req, res) => {
  try {
    const page = parseInt(req?.query?.page) || 1;
    const limit = parseInt(req?.query?.limit) || 10;
    const contacts = await Contacts.find({})
      .sort({ _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const count = await Contacts.countDocuments();
    res.status(201)
      .send({
        data: contacts,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
})
router.delete('/contact_delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // const deleteItem=
    await Contacts.findByIdAndDelete(id);
    res.status(201).send({ message: "Deleted Successfully" });
    // const contacts = await Contacts.find({});
    // res.status(201).send({ data: contacts });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
})

// to create the blogs
router.post("/sendblog", async (req, res) => {

  try {
    const { heading, description, category } = req.body;
    if (!heading || !description || !category)
      return res.status(400).json("Missing fields");

    const object = {
      heading: heading,
      description: description,
      category: category,
    };

    const blog = new Blog(object);

    await blog.save();
    res.status(201).send({ id: blog._id });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
router.post("/uploadImage/:id", upload2.single("image"), async (req, res) => {
  try {
    const s3 = new AWS.S3();

    const blogId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(400).send('Invalid formid');
    }

    // Find the blog by its _id
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).send('Blog not found');
    }

    // Generate a unique key for the S3 object
    const s3Key = `${uuid4()}${req.file.originalname}`;

    // Configure the S3 upload parameters
    const params = {
      Bucket: 'gravitonweb',
      Key: s3Key,
      Body: fs.createReadStream(req.file.path),  // Assuming 'buffer' contains the file data
      ACL: 'public-read',  // Set ACL to public-read if you want the uploaded files to be publicly accessible
    };

    // Upload the image to S3
    s3.upload(params, async (err, data) => {
      if (err) {
        console.error('Error uploading file to S3:', err);
        return res.status(500).send("Internal Server Error");
      } else {
        // Update the image field in the blog document with S3 URL
        blog.image = {
          key: s3Key,
          path: data.Location, // S3 URL
          originalFileName: req.file.originalname,
        };

        // Save the updated blog document
        await blog.save();

        // Delete the local file after upload
        fs.unlink(req.file.path, (err) => {
          if (err) {
            console.error('Error deleting file:', err);
          } else {
            console.log('File deleted successfully:');
          }
        });

        // Send success response with S3 URL
        res.status(201).send({
          message: "Blog uploaded successfully",
          s3Url: data.Location,
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
// deleting Blog
router.delete("/deleteBlog/:id", async (req, res) => {
  try {
    const blogId = req.params?.id;
    const blog = await Blog.findByIdAndDelete(blogId);
    if (!blog) {
      return res.status(404).send("Image not found");
    }
    res.status(200).json({ message: "Deleted Successfully" })
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
router.get("/getBlogsbyId/:id", async (req, res) => {
  try {
    const { id } = req?.params;
    const data = await Blog.findById(id);
    if (!data) {
      res.status(400).json({ message: "Blog Not Found" });
    }
    res.status(200).json({ data, message: "fetched successfully" });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
})


router.get("/getBlogs", async (req, res) => {
  try {
    const blogs = await Blog.find({});
    res.status(200).send({ data: blogs });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
})



router.post('/upload_gallery_images', upload.array('images', 10), async (req, res) => {
  const files = req.files;
  // console.log("Gallery", files);

  if (!files || files.length === 0) {
    return res.status(400).send('No images uploaded.');
  }

  // =================================
  const uploadPromises = [];
  // for (const fieldName in req.files) {
  // const files = req.files[fieldName];
  for (const file of files) {
    // console.log("file :-", file);
    const random = Math.random().toString().substr(2, 6);
    const destinationFileName = `galleryImages/${random}${file.originalname}`;
    const uploadfile = await uploadImageAndGetUrl(file?.path, destinationFileName);

    // uploadPromises.push(abhi);
    uploadPromises.push({ filename: file.filename, url: uploadfile, path: destinationFileName });

    fs.unlink(file.path, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      } else {
        console.log('File deleted successfully:');
      }
    })
  }
  // }
  // Wait for all the files to be uploaded to S3
  const uploadedPromises = await Promise.all(uploadPromises);

  // Update the form document with S3 file details and save
  for (const uploadedFile of uploadedPromises) {
    // console.log("uploaded File ::::", uploadedFile.url);
    // form.files.push({
    const data = await new GalleryImages({
      filename: uploadedFile.filename, // replace with your field name
      url: uploadedFile.url,
      // fileName: uploadedFile.Key.split('/').pop(), // get the filename from S3 key
      path: uploadedFile.path, // S3 file URL
      // originalFileName: uploadedFile.originalname, // or modify based on your requirements
    });
    console.log(data);
    await data.save();
  }
  // await form.save();

  // =================================

  // Store image metadata in MongoDB
  // const images = files.map((file) => ({
  //   filename: file.filename,
  //   originalname: file.originalname,
  //   mimetype: file.mimetype,
  //   size: file.size,
  // }));

  try {
    // await GalleryImages.insertMany(uploadedPromises);
    res.status(201).send({
      message: 'Images uploaded successfully!',
      // files: images,
    });
  } catch (error) {
    res.status(500).send('Error storing image metadata.');
  }
});
router.get('/getAllGalleryImages', async (req, res) => {
  try {
    const images = await GalleryImages.find({}).sort({ _id: -1 });
    res.status(200).send(images)
  } catch (error) {
    res.status(500).send("Error while fetching the file");
  }
})
router.delete("/delete_image/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const image = await GalleryImages.findById(id)
    const filepath = image?.path;
    await deleteFilefromfirebase(filepath);
    await GalleryImages.findByIdAndDelete(id);
    res.status(200).json({ message: "image deleted successfully" });
  } catch (error) {
    res.status(500).send("Error while deleting the file");
  }
})
module.exports = router;
