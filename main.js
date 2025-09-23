import { Block, chain } from "./blockchain.js";
// const block = require("./blockchain/Block");
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { BlockChain } from "./blockchain.js";
// const blockchain = require("./blockchain/BlockChain");
import express from "express";
import ejs from "ejs";
import bodyParser from "body-parser";
import qrcode from "qrcode";
import {pool} from "./db.js";

const app = express();
const port = 3000;

app.use(express.static("public"));

async function dataToPdf() {
    const pdfDoc = await PDFDocument.create()

// Embed the Times Roman font
const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)

// Add a blank page to the document
const page = pdfDoc.addPage()

// Get the width and height of the page
const { width, height } = page.getSize()

// Draw a string of text toward the top of the page
const fontSize = 30
page.drawText('Creating PDFs in JavaScript is awesome!', {
  x: 50,
  y: height - 4 * fontSize,
  size: fontSize,
  font: timesRomanFont,
  color: rgb(0, 0.53, 0.71),
})

// Serialize the PDFDocument to bytes (a Uint8Array)
const pdfBytes = await pdfDoc.save();
let blob = new Blob([pdfBytes],{type:"application/pdf"});
return blob;
// console.log(pdfBytes);

}

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");

app.get("/",(req,res)=>{
    res.render("form");
});

app.post("/certInfo",(req,res)=>{
    let block = new Block(0,req.body.sname,req.body.reg,req.body.course,req.body.fname,req.body.iid);
    chain.addBlock(block);
    const verifyUrl = `https://localhost:3000/verify?id=${block.certid}`;
    const url = qrcode.toDataURL(verifyUrl,(err,url)=>{
        if(err) throw err;
        let result = {
            url:url,
            name:req.body.sname,
            regNo : req.body.reg,
            course:req.body.course,
        }
        block.qr = url;
        
        let pdf = dataToPdf();
        
        res.render("result",{pdf:pdf});
    })
});

app.get("/verify",(req,res)=>{
    let id = req.query.id;
    let block = chain.getBlock(id);
    // console.log(block);
    
    if(chain.isChainValid() && block.hash == block.calculateHash())
        res.send("Valid");
    else
        res.send("Invalid");
});

app.get("/view",(req,res)=>{
    pool.query("Select * from certificates",(err,result)=>{
        if(err) throw err;
        
        else
            console.log(result.rows);            
    });    
    res.render("certificates",chain);
});

app.listen(port,"0.0.0.0",()=>{
    console.log('Server Running on port '+port);
});