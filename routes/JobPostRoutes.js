const express = require('express');
const router = express.Router();
const JobPostModel = require('../models/JobPostModel');

router.post('/jobposts', async (req, res) => {
    try {
      const jobPost = new JobPostModel(req.body);
      await jobPost.save();
      res.status(201).send(jobPost);
    } catch (error) {
      res.status(400).send(error);
    }
  });
  
  // Get all job posts
  router.get('/jobposts', async (req, res) => {
    try {
      const jobPosts = await JobPostModel.find().sort({_id:-1});
      res.status(200).send(jobPosts);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  
  // Get a job post by ID
  router.get('/jobposts/:id', async (req, res) => {
    try {
      const jobPost = await JobPostModel.findById(req.params.id);
      if (!jobPost) {
        return res.status(404).send();
      }
      res.status(200).send(jobPost);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  
  // Update a job post by ID
  router.put('/jobposts/:id', async (req, res) => {
    try {
      const jobPost = await JobPostModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!jobPost) {
        return res.status(404).send();
      }
      res.status(200).send(jobPost);
    } catch (error) {
      res.status(400).send(error);
    }
  });
  
  // Delete a job post by ID
  router.delete('/jobposts/:id', async (req, res) => {
    try {
      const jobPost = await JobPostModel.findByIdAndDelete(req.params.id);
      if (!jobPost) {
        return res.status(404).send();
      }
      res.status(200).send(jobPost);
    } catch (error) {
      res.status(500).send(error);
    }
  });


  module.exports=router;