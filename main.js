import { Block, chain } from "./blockchain.js";
// const block = require("./blockchain/Block");
import { BlockChain } from "./blockchain.js";
// const blockchain = require("./blockchain/BlockChain");
import express from "express";
import bodyParser from "body-parser";
import qrcode from "qrcode";
import { jsPDF } from "jspdf";

const app = express();
const port = 3000;

app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");

app.get("/",(req,res)=>{
    res.render("form");
});

app.get("/student",(req,res)=>{
    res.render("student");
});

app.get("/employer",(req,res)=>{
    res.render("employer");
});

app.post("/getCerts",(req,res)=>{
    let certs = chain.getBlock(req.body.id);
    console.log(certs.length);
    
    res.render("studentCerts",{certs:certs});
})

app.post("/certInfo",(req,res)=>{
    let block = new Block(0,req.body.sname,req.body.reg,req.body.course,req.body.fname,req.body.iid,new Date());
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
        
       
        
        res.render("result",{block:block});
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
    res.render("certificates",chain);
});

app.get("/download",(req,res)=>{
    const doc = new jsPDF();
    doc.text("hello world",10,10);
    doc.save("demo.pdf");
    res.end();
})

app.listen(port,"0.0.0.0",()=>{
    console.log('Server Running on port '+port);
});