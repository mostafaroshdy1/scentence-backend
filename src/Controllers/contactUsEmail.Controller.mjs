import { validationResult } from 'express-validator';
import { UserModel } from '../Model/User.Model.mjs';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
	service: process.env.AUTH_SERVICE,
	auth: {
		user: process.env.AUTH_EMAIL,
		pass: process.env.AUTH_PASSWORD,
	},
});

transporter.verify((err, Success) => {
	if (err) {
		console.log(err);
		console.log("can't verify");
	} else {
		console.log('Ready for messages');
		console.log(Success);
	}
});

export { sendMail };

async function sendMail(req, res) {
	const erros = validationResult(req);

	if (!erros.isEmpty()) {
		return res.status(400).json({ errors: erros.array() });
	}

	const user = req.decodedUser;

	const isValidUser = await UserModel.findById(user.id);

	if (!isValidUser) {
		return res.status(404).json({ error: 'User not found' });
	}

	const subject = 'Contact Us Response';
	const text = 'We have received your email and we will reach back to you as soon as possible';
	const route = '/User/verify/';
	sendEmail(user.email, subject, text);

	return res.status(200).json({ response: 'email send successfully' });
}

const sendEmail = async (email, subject, text) => {
	const mailOptions = {
		from: process.env.AUTH_EMAIL,
		to: email,
		subject: subject,
		html: `<p>${text}</p>`,
	};

	transporter
		.sendMail(mailOptions)
		.then(() => {
			console.log('Success');
		})
		.catch((err) => {
			console.log('Failed to send Mail');
		});
};
