const express = require('express');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const user_route = express();
const docxToPdfConverter = require('docx-to-pdf');

const bodyParser = require('body-parser');

// We need to set this for knowing login or logout of user!
const session = require("express-session");
const { SESSION_SECRET } = process.env;
user_route.use(session({ secret: SESSION_SECRET }));

user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({ extended: true }));

user_route.set('view engine', 'ejs');
user_route.set('views', './views');

user_route.use(express.static('public'));

const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/images'));
    },
    filename: function (req, file, cb) {
        const name = Date.now() + "-" + file.originalname;
        cb(null, name);
    }
});

const upload = multer({ storage: storage });

const userController = require('../controllers/userController');

const auth = require('../middlewares/auth');

user_route.get('/register', auth.isLogout, userController.registerLoad);
user_route.post('/register', upload.single('avatar'), userController.register);

user_route.get('/', auth.isLogout, userController.loadLogin);
user_route.post('/', userController.login);
user_route.get('/logout', auth.isLogin, userController.logout);

user_route.get('/dashboard', auth.isLogin, userController.loadDashboard);

// Implementing the chat page for mugbit!
user_route.get('/chat', auth.isLogin, userController.loadChatPg);
user_route.post('/save-chat', userController.saveChat);

user_route.get('*', function (req, res) {
    res.redirect('/');
})


// MugBit Document Creator implementation code!
const templateFile = fs.readFileSync(path.resolve(__dirname, '../public/Sample_template_certificate.docx'), 'binary');
const zip = new PizZip(templateFile);
const templateFilePath = path.resolve(__dirname, '../public/Sample_template_certificate.docx');

user_route.get('/form', auth.isLogin, userController.loadDashboard);

user_route.post('/form', (req, res) => {
    console.log(req.body);
    let docname = req.body.uname;
    try {
        // Read the template file fresh for each form submission
        const templateFile = fs.readFileSync(templateFilePath, 'binary');
        const zip = new PizZip(templateFile);
        let outputDocument = new Docxtemplater(zip);

        const dataToAdd = {
            STUDENT_NAME: req.body.uname,
            COI: req.body.student_enr,
            MICROPROJECT_TITLE: req.body.microproject_title,
            TEACHER_NAME: req.body.teacher_name,
            STUDENT_ENR: req.body.enrollmentNo
        };

        // Set the data we wish to add to the document
        outputDocument.setData(dataToAdd);

        try {
            // Attempt to render the document (Add data to the template)
            outputDocument.render();

            // Create a buffer to store the output data
            let outputDocumentBuffer = outputDocument.getZip().generate({ type: 'nodebuffer' });

            // Save the buffer to a file
            fs.writeFileSync(path.resolve(__dirname, `../public/files/${docname}-certificate.docx`), outputDocumentBuffer);
        } catch (error) {
            console.error(`ERROR Filling out Template:`);
            console.error(error);
        }
    } catch (error) {
        console.error(`ERROR Loading Template:`);
        console.error(error);
    }
    
    res.redirect('/dashboard');
});


module.exports = user_route;
