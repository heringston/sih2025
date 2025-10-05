import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import { Block, chain } from "./blockchain.js";
import qrcode from "qrcode";
import { jsPDF } from "jspdf";

const app = express();
const PORT = process.env.PORT || 3000;
const saltrounds=10;
const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database:process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT),
  ssl: {
    rejectUnauthorized: false
  }
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});
app.get("/clogin", (req, res) => {
  res.render("clogin.ejs");
});

app.get("/cregister", (req, res) => {
  res.render("cregister.ejs");
});
app.get("/ulogin", (req, res) => {
  res.render("ulogin.ejs");
});

app.get("/uregister", (req, res) => {
  res.render("uregister.ejs");
});
app.post("/register", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE sid = $1", [
      username,
    ]);

    if (checkResult.rows.length > 0) {
      res.send("username already exists. Try logging in.");
    } else {
      bcrypt.hash(password,saltrounds,async (err,hash)=>{
        if(err){
          console.log(err);
        }
        else{
      const result = await db.query(
        "INSERT INTO users (sid, password) VALUES ($1, $2)",
        [username, hash]
      );
      console.log(result);
      res.redirect("/");
    }
      });
    }
    
  } catch (err) {
    console.log(err);
  }
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const result = await db.query("SELECT * FROM users WHERE sid = $1", [
      username,
    ]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedPassword = user.password;
      bcrypt.compare(password,storedPassword,(err,ismatch)=>{
      if (ismatch) {
        res.render("student.ejs");
      } else {
        res.send("Incorrect Password");
      }
      });
    } else {
      res.send("User not found");
    }
    
  } catch (err) {
    console.log(err);
  }
});

app.post("/cregister", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const checkResult = await db.query("SELECT * FROM employer WHERE company_id = $1", [
      username,
    ]);

    if (checkResult.rows.length > 0) {
      res.send("company already exists. Try logging in.");
    } else {
      bcrypt.hash(password,saltrounds,async (err,hash)=>{
        if(err){
          console.log(err);
        }
        else{
      const result = await db.query(
        "INSERT INTO employer (company_id, password) VALUES ($1, $2)",
        [username, hash]
      );
      console.log(result);
      
      res.redirect("/");
    }
      });
    }
    
  } catch (err) {
    console.log(err);
  }
});

app.post("/clogin", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const result = await db.query("SELECT * FROM employer WHERE company_id = $1", [
      username,
    ]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedPassword = user.password;
      bcrypt.compare(password,storedPassword,(err,ismatch)=>{
      if (ismatch) {
        
        res.render("employer.ejs");
      } else {
        res.send("Incorrect Password");
      }
      });
    } else {
      res.send("User not found");
    }
    
  } catch (err) {
    console.log(err);
  }
});

app.post("/uregister", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const checkResult = await db.query("SELECT * FROM university WHERE college_id = $1", [
      username,
    ]);

    if (checkResult.rows.length > 0) {
      res.send("university already exists. Try logging in.");
    } else {
      bcrypt.hash(password,saltrounds,async (err,hash)=>{
        if(err){
          console.log(err);
        }
        else{
      const result = await db.query(
        "INSERT INTO university (college_id, password) VALUES ($1, $2)",
        [username, hash]
      );
      console.log(result);
      
      res.redirect("/");
    }
      });
    }
    
  } catch (err) {
    console.log(err);
  }
});

app.post("/ulogin", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const result = await db.query("SELECT * FROM university WHERE college_id = $1", [
      username,
    ]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedPassword = user.password;
      bcrypt.compare(password,storedPassword,(err,ismatch)=>{
      if (ismatch) {
        
        res.render("form.ejs");
      } else {
        res.send("Incorrect Password");
      }
      });
    } else {
      res.send("User not found");
    }
    
  } catch (err) {
    console.log(err);
  }
});


app.get("/university",(req,res)=>{
    res.render("form.ejs");
});

app.get("/student",(req,res)=>{
    res.render("student.ejs");
});

app.get("/employer",(req,res)=>{
    res.render("employer.ejs");
});

app.post("/getCerts",(req,res)=>{
    let certs = chain.getBlock(req.body.id);
    console.log(certs.length);
    
    res.render("studentCerts.ejs",{certs:certs});
})

app.post("/certInfo",(req,res)=>{
    let block = new Block(0,req.body.sname,req.body.reg,req.body.course,req.body.fname,req.body.iid,new Date());
    chain.addBlock(block);
    const baseUrl = process.env.BASE_URL || "https://localhost:3000";
    const verifyUrl = `${baseUrl}/verify?id=${block.certid}`;
    const url = qrcode.toDataURL(verifyUrl,(err,url)=>{
        if(err) throw err;
        let result = {
            url:url,
            name:req.body.sname,
            regNo : req.body.reg,
            course:req.body.course,
        }
        block.qr = url;
        
       
        
        res.render("result.ejs",{block:block});
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
    res.render("certificates.ejs",chain);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export {db}