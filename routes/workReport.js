
const express=require('express');
const RmdailyReport = require('../models/RMDailyReport');
const FSdailyReport = require('../models/FDDailyReport');
const router=express.Router();

router.post("/rm_daily_report",async(req,res)=>{
    try {
        const {formData}=req.body;
        const addReport=await new RmdailyReport(formData);
        await addReport.save();
        res.status(201).json({message:"Report Submitted"});
    } catch (error) {
        res.status(500).json({message:"Internal Server Error"});
    }
});

router.get("/rm_work_report",async(req,res)=>{
    try {
        const data=await RmdailyReport.find().sort({_id:-1});
        res.status(200).json({data,message:"Successfuly fetched"});
    } catch (error) {
        res.status(500).json({message:"Internal Server Error"});
    }
});

router.delete("/delete_work_report/:id",async(req,res)=>{
    try {
        const {id}=req?.params;
        await RmdailyReport.findByIdAndDelete(id);
        res.status(200).json({message:"Work report deleted"});
    } catch (error) {
        res.status(500).json({message:"Internal Server Error"});
    }
});

//field staff work report
router.post("/fieldStaff_daily_report",async(req,res)=>{
    try {
        const {formData}=req?.body;
        const post=await new FSdailyReport(formData);
        await post.save();
        res.status(201).json({message:"Work report submitted"});
    } catch (error) {
        res.status(500).json({message:"internal Server error",error});
    }
});
router.get("/fieldStaff",async(req,res)=>{
    try {
        const data=await FSdailyReport.find();
        res.status(200).json({data,message:"Successfuly fetched"});
    } catch (error) {
        res.status(500).json({message:"Internal Server Error"});
    }
});

router.delete("/delete_fieldstaff_report/:id",async(req,res)=>{
    try {
        const {id}=req?.params;
        await FSdailyReport.findByIdAndDelete(id);
        res.status(200).json({message:"Work report deleted"});
    } catch (error) {
        res.status(500).json({message:"Internal Server Error"});
    }
});

module.exports=router;