
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'parvmultiservices@gmail.com',
        pass: 'bijfijgfloicmwhn',
    },
  });

// Function to send email
 function sendLoanStatusEmail(to, loanId, newStatus) {
    // Set up email data
    let mailOptions = {
        from: 'parvmultiservices@gmail.com', // sender address
        to: to, // list of receivers
        subject: 'Loan Status Update', // Subject line
// Style Hub Team`,
        html: `<p>Dear Customer,</p>
               <p>We wanted to inform you that the status of your loan application (ID: <strong>${loanId}</strong>) has been updated to: <strong>${newStatus}</strong>.</p>
               <p>Thank you for choosing our services.</p>
               <p>Best regards,<br>Parv Finance Team</p>`
    };

    // Send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
    });
}

module.exports={sendLoanStatusEmail};
