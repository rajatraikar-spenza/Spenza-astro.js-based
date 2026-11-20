// The eight forms this endpoint accepts, keyed by their Gravity Forms id (the id the site's
// markup and hubspot-forms.js already use, so the browser needs no new naming).
//
// `required` and `email` mirror public/scripts/hubspot-forms.js. `labels` are what the alert
// email and the archive call each input. Add a form here and nothing else is accepted.
export const FORMS = {
  5:  { title: 'Download Now (mobility policy)', required: ['input_1.3', 'input_8.6', 'input_2', 'input_3', 'input_4', 'input_6'], email: ['input_2'],
        labels: { 'input_1.3': 'First name', 'input_8.6': 'Last name', input_2: 'Email', input_3: 'Company', input_4: 'Job title', input_5: 'Phone', input_6: 'Employees', 'input_7.6': 'Country' } },
  15: { title: 'Get Started popup', required: ['input_2'], email: ['input_2'], labels: { input_2: 'Email', input_5: 'Phone' } },
  16: { title: 'Download PDF popup', required: ['input_2'], email: ['input_2'], labels: { input_2: 'Email', input_4: 'PDF' } },
  19: { title: 'Book A Free Demo', required: ['input_3'], email: ['input_3'], labels: { input_3: 'Email' } },
  20: { title: 'Contact Us', required: ['input_1', 'input_4', 'input_6', 'input_10'], email: ['input_4'],
        labels: { input_1: 'Name', input_4: 'Email', input_5: 'Mobile', input_6: 'Company', input_10: 'Solution of interest' } },
  21: { title: 'MVNO calculator report', required: ['input_1', 'input_2'], email: ['input_1'], labels: { input_1: 'Email', input_2: 'Phone' } },
  22: { title: 'Request Integration Review (AI phone number)', required: ['input_1', 'input_2', 'input_3'], email: ['input_2'],
        labels: { input_1: 'Name', input_2: 'Email', input_3: 'Company', input_4: 'Phone', input_5: 'Current telephony provider', input_6: 'Voice AI use case',
                  input_7: 'Expected monthly call volume', input_8: 'Number of agents', input_9: 'Required capabilities' } },
  // Guest Postings: the "Get in touch" form on the guest blogs pages, for people who want to write for us.
  // Its alert goes to the two people who review topics (not the sales list), and its thank-you is sent
  // whatever SEND_CLIENT_REPLY says, because WordPress never had this form and so cannot be sending it.
  23: { title: 'Guest Postings', required: ['input_2', 'input_3'], email: ['input_2'],
        alertTo: ['siva.sai@spenza.com', 'om.satyam@spenza.com'], alwaysReply: true,
        labels: { input_1: 'Name', input_2: 'Email', input_3: 'Topic they want to write about' } },
};

export function labelFor(formId, key) {
  const labels = FORMS[formId]?.labels ?? {};
  return labels[key] ?? labels[key.replace(/[._]\d+$/, '')] ?? key;
}
