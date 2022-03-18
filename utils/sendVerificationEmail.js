import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const OAuth2 = google.auth.OAuth2;

const clientId = process.env.OAUTH_CLIENTID;
const clientSecret = process.env.OAUTH_CLIENT_SECRET;
const refresh_token = process.env.OAUTH_REFRESH_TOKEN;

const oauth2Client = new OAuth2(
  clientId, // clientID
  clientSecret, //Clientsecret
  'https://developers.google.com/oauthplayground' //RedirectURL
);

oauth2Client.setCredentials({
  refresh_token: refresh_token,
});

const accessToken = oauth2Client.getAccessToken();

const sendVerficaitonEmail = async ({ to, link }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: 'agsiddiqui91@gmail.com',
      clientId: process.env.OAUTH_CLIENTID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN,
    },
  });

  // const verificationHTML = `<b>Kinldy Verify your Email by...</b><a href=${link}>click here ${link}</a>`;

  const message = {
    from: 'NO-REPLY - verification email <agsiddiqui91@gmial.com>',
    to: to,
    subject: 'Email Verification from IOMS',
    html: `<b>Kinldy Verify your Email by...</b><a href=${link}>click here ${link}</a>`,
  };

  transporter.sendMail(message, (err, info) => {
    if (err) {
      console.log('Error Occured' + err);
      return process.exit(1);
    }
  });
};

export default sendVerficaitonEmail;
