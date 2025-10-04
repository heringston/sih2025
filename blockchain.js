// import { SHA256 } from "crypto-js";
import CryptoJS from "crypto-js";

class Block{
    constructor(certid = 0,sname, reg, course,fname, iid ,timestamp,qr=0, prevHash=''){
        this.certid = certid;
        this.sname = sname;
        this.reg = reg;
        this.course = course;
        this.fname = fname;
        this.iid = iid;
        this.timestamp = timestamp;
        this.hash = this.calculateHash();
        this.prevHash = prevHash;
        this.nonce = 0;
        this.qr = qr;
        // console.log(this.hash);
    }
    calculateHash(){
        return CryptoJS.SHA256(this.certid+this.sname+this.reg+this.course+this.fname+this.iid+ this.nonce).toString();
    }
    mineBlock(difficulty){
        while(this.hash.substring(0,difficulty) != Array(difficulty+1).join("0")){
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("block mined : "+this.hash);
        
    }

}
class BlockChain{
    constructor(){
        this.chain = [this.genesisBlock()];
        this.difficulty = 2;
    }
    addBlock(newBlock){
        newBlock.prevHash = this.chain[this.chain.length-1].hash;
        newBlock.certid = this.chain[this.chain.length - 1].certid + 1;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }
    genesisBlock(){
        return new Block(0,"Genesis","0","None","Genesis","0","0");
    }
    isChainValid(){
        for(let i=1;i < this.chain.length;i++){
            // console.log(this.chain[i].hash);
            // console.log(this.chain[i].calculateHash());
            if(this.chain[i].hash != this.chain[i].calculateHash()){
                return false;
            }
            if(this.chain[i-1].hash != this.chain[i].prevHash){
                return false; 
            }
        }
        return true;
    }
    getBlock(id){    
        let certs = [];
        for(let i=0;i<this.chain.length;i++){
            if(this.chain[i].reg == id)
                certs.push(this.chain[i]);
        }
        return certs;
    }
    getCert(certid){
        let cert=null;
        for(let i=0;i<this.chain.length;i++){
            if(this.chain[i].certid == certid){
                cert = this.chain[i]
                break;
            }
        }
        return cert;
    }
}

var chain = new BlockChain();

// console.log("mining block 1...");
// chain.addBlock(new Block("Thomas","2025","BlockChain"));
// console.log("mining block 2...");
// chain.addBlock(new Block("Sanjay","2026","Backend"));

// console.log(JSON.stringify(chain.chain,null,4));

// chain.chain[1].domain = "Full Stack";                        to check tampering
// chain.chain[1].hash = chain.chain[1].calculateHash();    

// console.log(chain.isChainValid());


// console.log(JSON.stringify(chain,null,4));


// console.log(sha256("thoams","hello","omain").toString());

export {Block,BlockChain,chain};