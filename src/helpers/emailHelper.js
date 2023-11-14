import { createTransport } from "nodemailer";
import pkg from "aws-sdk";
import { GLOBAL_MESSAGES, GLOBAL_ENV } from "../config/globalConfig.js";

const { config, SES } = pkg;

config.update({
  accessKeyId: GLOBAL_ENV.awsAccessKey,
  secretAccessKey: GLOBAL_ENV.awsSecretAccessKey,
  region: GLOBAL_ENV.awsRegion,
});

const sendCodeToEmail = async (email, name, confirmCode, type, req, res) => {
  new Promise(async (resolve, reject) => {
    if (!email || !confirmCode) {
      return res.status(400).json(GLOBAL_MESSAGES.invalidRequest);
    }

    const emailTransfer = createTransport({
      SES: new SES({
        apiVersion: "2010-12-01",
      }),
    });

    let body = "";
    //NOTE: You can customize the message that will be sent to the newly registered users according to your pleasure.
    if (type == "register") {
      body = `Hello ${name}!\r\n\r\nHere is your confirm code: ${confirmCode}`;
    } else {
      body = `Here is your confirm code: ${confirmCode}`;
    }

    const emailInfo = {
      from: "info@(APPNAME).com",
      to: email,
      subject: "Verification Code",
      text: body,
    };

    try {
      await emailTransfer.sendMail(emailInfo);
      return resolve("Success");
    } catch (err) {
      return reject(err);
    }
  });
};

export { sendCodeToEmail };
