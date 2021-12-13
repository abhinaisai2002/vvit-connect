const smtpTransport = require('nodemailer-smtp-transport');
const nodemailer = require('nodemailer');

const sendEmail = async (email, subject,url) => {
  try {
    const transporter = nodemailer.createTransport(smtpTransport({
      host: process.env.HOST,
      service: process.env.SERVICE,
      port: 587,
      secure: false,
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    }));
    await transporter.sendMail({
      from: process.env.USER,
      to: email,
      subject,
      html: ` <div class="card">
                <div class="card-header">
                  CONNECT WITH VVIT
                </div>
                <div class="card-body">
                  <h5 class="card-title">Thanks fot creating an acoount</h5>
                  <p class="card-text">Please click verify in order to activate your account.</p>
                  <a href=${url} class="btn btn-primary">Verify</a>
                </div>
              </div>`,  
    });
  } catch (err) {
    console.log(process.env.USER);
    console.log(err);
    return next({
      error: 'Cannot send a mail to verify.',
      status: 500,
    });
  }
};

module.exports = sendEmail;
