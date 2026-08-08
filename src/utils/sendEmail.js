// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/*
ABOUT THIS NODE.JS EXAMPLE: This example works with the AWS SDK for JavaScript version 3 (v3),
which is available at https://github.com/aws/aws-sdk-js-v3. This example is in the 'AWS SDK for JavaScript v3 Developer Guide' at
https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/s3-example-creating-buckets.html.

Purpose:
ses_sendemail.js demonstrates how to send an email using Amazon SES.

Running the code:
node ses_sendemail.js

*/
// snippet-start:[ses.JavaScript.email.sendEmailV3]
const { SendEmailCommand } = require("@aws-sdk/client-ses");
const { sesClient } = require("./sesClient");

const createSendEmailCommand = (toAddress, fromAddress,fromUser,toUser) => {
  return new SendEmailCommand({
    Destination: {
      CcAddresses: [],
      ToAddresses: [toAddress],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Welcome Email</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, Helvetica, sans-serif;">

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f4; padding:40px 0;">
    <tr>
      <td align="center">

        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#2563eb; color:white; padding:24px; text-align:center;">
              <h1 style="margin:0;">My Company</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px; color:#333333;">
              <h2 style="margin-top:0;">Hello John 👋</h2>

              <p style="line-height:1.6;">
                Thank you for signing up with us. We're excited to have you on board!
              </p>

              <p style="line-height:1.6;">
                Click the button below to verify your email address and activate your account.
              </p>

              <div style="text-align:center; margin:32px 0;">
                <a href="https://example.com/verify"
                   style="background:#2563eb; color:white; text-decoration:none; padding:14px 28px; border-radius:6px; display:inline-block; font-weight:bold;">
                  Verify Email
                </a>
              </div>

              <p style="line-height:1.6;">
                If you didn't create this account, you can safely ignore this email.
              </p>

              <hr style="border:none; border-top:1px solid #eeeeee; margin:30px 0;">

              <p style="font-size:14px; color:#777777;">
                Need help? Reply to this email or contact our support team.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f8f8; padding:20px; text-align:center; color:#888888; font-size:13px;">
              © 2026 My Company. All rights reserved.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`,
        },
        Text: {
          Charset: "UTF-8",
          Data: "Hello, World!\r\nThis email was sent with Amazon SES using the AWS SDK for JavaScript in Node.js.",
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: `Hey ${toUser}, ${fromUser} is interested in connecting with you!`,
      },
    },
    Source: fromAddress,
    ReplyToAddresses: [],
  });
};

const run = async (fromUser, toUser) => {
  const sendEmailCommand = createSendEmailCommand(
    "bojjaganeshkumar1@gmail.com",
    "ganesh@ganeshbojja.site",
    fromUser,
    toUser
  );

  try {
    return await sesClient.send(sendEmailCommand);
  } catch (caught) {
    if (caught instanceof Error && caught.name === "MessageRejected") {
      /** @type { import('@aws-sdk/client-ses').MessageRejected} */
      const messageRejectedError = caught;
      return messageRejectedError;
    }
    throw caught;
  }
};

// snippet-end:[ses.JavaScript.email.sendEmailV3]
module.exports = { run };
