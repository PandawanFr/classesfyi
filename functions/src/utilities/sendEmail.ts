import * as functions from "firebase-functions";
import * as sendgrid from "@sendgrid/mail";
import * as handlebars from "handlebars";
import { promises as fs } from "fs";

sendgrid.setApiKey(
  functions.config()?.sendgrid?.key ?? "",
);

interface EmailData {
  email: string;
  classesData: {
    [campusName: string]: {
      name: string;
      crn: number;
      changes: string[];
    }[];
  };
}

const rootDir = process.cwd();

// Cache the template so we don't have to compile it multiple times
let cachedTemplate: handlebars.TemplateDelegate | null = null;

async function formatEmail(data: EmailData): Promise<string> {
  if (cachedTemplate === null) {
    const templateStr = await fs.readFile(
      `${rootDir}/templates/email.inline.hbs`,
      "utf8",
    );
    cachedTemplate = handlebars.compile(templateStr);
  }

  return Promise.resolve(cachedTemplate(data));
}

export async function sendEmail(data: EmailData) {
  const content = await formatEmail(data);

  return await sendgrid.send({
    from: { email: "help@classes.fyi" },
    to: { email: data.email },
    subject: "Classes.fyi: Updates about your classes",
    content: [{ type: "text/html", value: content }],
  });
}
