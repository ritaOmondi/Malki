const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require ('path');

const dataFilePath = path.join(__dirname, '../user.json');

//reading the json data
function readDataFromFrile(){
    const data = fs.readFileSync(dataFilePath);
    return JSON.parse(data);
}
router.get('/users', (req,res)=>{
    const users = readDataFromFrile();
    res.send(users);
});
router.get('/profile', (req,res)=> res.send({
    message: 'Display the JSON File',
    path:dataFilePath

}))


module.exports = router;