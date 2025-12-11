import { useNavigate } from "react-router-dom";

export default function PrivacyNotice() {
  const navigate = useNavigate();

  return (
    <>
      <main className="flex-1">
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
          {/* HERO */}
          <div className="bg-gradient-to-r from-[#1cd35c] to-[#19b850] text-white py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <button
                onClick={() => navigate("/login")}
                className="mb-6 px-4 py-2 rounded-md bg-[#5DEE92] text-black font-medium hover:opacity-90 transition"
              >
                ← Go Back
              </button>

              <div className="text-center">
                <i className="lucide lucide-shield-check mx-auto text-6xl mb-6 opacity-90" />
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Notice</h1>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-lg">
                  <span className="bg-white/20 px-4 py-2 rounded-full">
                    Last Updated: December 12, 2025
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">

            {/* Intro */}
            <section className="bg-white rounded-xl shadow-lg p-8">
              <p className="text-gray-700 leading-relaxed">
                Proteccio Data (“Company”, “we”, “us”, or “our”) is committed to safeguarding the
                privacy and personal data of all users (“you”, “your”, or “User”) who access the RoPA
                Application (“Application”). This Privacy Notice explains how we collect, use, store,
                share, retain, transfer, and secure personal data when you use the Application. By
                accessing or using the Application, you acknowledge that you have read, understood,
                and agreed to the terms of this Privacy Notice.
              </p>
            </section>

            {/* 1. Scope */}
            <section className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4">1. Scope of This Privacy Notice</h2>

              <p className="text-gray-700 mb-3">This Privacy Notice applies to:</p>
              <ul className="list-disc ml-6 text-gray-700 space-y-1">
                <li>Users of the RoPA Application</li>
                <li>Administrators, employees, consultants, and authorized personnel using the platform</li>
                <li>Visitors accessing the Application interface, API, or modules</li>
              </ul>

              <p className="text-gray-700 mt-4 mb-2">This Notice does not apply to:</p>
              <ul className="list-disc ml-6 text-gray-700 space-y-1">
                <li>
                  Customer Data (e.g., RoPA entries, processing records, DPIA inputs), which is governed
                  by the Data Processing Agreement (DPA) between you and Proteccio Data
                </li>
                <li>Third-party websites or services not controlled by Proteccio Data</li>
              </ul>
            </section>

            {/* 2. Definitions */}
            <section className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4">2. Definitions</h2>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li>
                  <strong>“Personal Data”</strong> – Any information that identifies or relates to an
                  identifiable individual.
                </li>
                <li>
                  <strong>“Customer Data”</strong> – Data entered by the Customer into the Application
                  relating to RoPA records, DPIAs, vendors, processes, etc. (Proteccio Data acts as a
                  Processor for such data.)
                </li>
                <li>
                  <strong>“Processing”</strong> – Any operation performed on Personal Data.
                </li>
                <li>
                  <strong>“Data Fiduciary” / “Data Controller”</strong> – The entity that determines the
                  purpose and means of processing (usually you, the customer).
                </li>
                <li>
                  <strong>“Data Processor”</strong> – The entity that processes data on behalf of the
                  controller (Proteccio Data acts as a Processor).
                </li>
              </ul>
            </section>

            {/* 3. Categories */}
            <section className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4">3. Categories of Personal Data We Collect</h2>

              <h3 className="font-semibold mb-2">3.1 Data You Provide Directly</h3>
              <ul className="list-disc ml-6 text-gray-700 space-y-1">
                <li>Name</li>
                <li>Email address</li>
                <li>Job title and role</li>
                <li>Organization details</li>
                <li>Login credentials (stored in hashed form)</li>
                <li>Support requests and communications</li>
                <li>Configuration choices/settings</li>
              </ul>

              <h3 className="font-semibold mt-6 mb-2">3.2 Data Automatically Collected</h3>
              <ul className="list-disc ml-6 text-gray-700 space-y-1">
                <li>IP address</li>
                <li>Device identifiers</li>
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>Access logs</li>
                <li>Session duration</li>
                <li>Features used</li>
                <li>Clickstream data</li>
                <li>Error logs</li>
                <li>API usage patterns</li>
              </ul>

              <h3 className="font-semibold mt-6 mb-2">3.3 Sensitive Personal Data</h3>
              <p className="text-gray-700">
                Proteccio Data does NOT intentionally collect sensitive personal data of Users unless
                provided voluntarily or required for compliance purposes.
              </p>

              <h3 className="font-semibold mt-6 mb-2">3.4 Data Processed on Behalf of Customers (Customer Data)</h3>
              <p className="text-gray-700">
                This includes RoPA entries such as IP Address, Email, Names. Proteccio Data only
                processes this data as a Data Processor.
              </p>
            </section>

            {/* 4. Legal Basis */}
            <section className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4">4. Legal Basis for Processing Personal Data</h2>
              <p className="text-gray-700 mb-4">
                Where the GDPR or similar data protection frameworks apply, Proteccio Data relies on one
                or more of the following legal bases for processing:
              </p>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li>
                  <strong>Performance of a Contract</strong> – To deliver application functionality and
                  fulfill our obligations under the Terms of Service.
                </li>
                <li>
                  <strong>Legitimate Interests</strong> – For purposes such as application security, usage
                  analytics, and product improvements, provided these do not override your rights and
                  freedoms.
                </li>
                <li>
                  <strong>Consent</strong> – Where you voluntarily provide specific data or agree to optional
                  features.
                </li>
                <li>
                  <strong>Compliance with Law</strong> – When processing is required to meet regulatory
                  obligations or respond to lawful requests from authorities.
                </li>
              </ul>
            </section>

            {/* 5. How We Use */}
            <section className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4">5. How We Use Personal Data</h2>

              <h3 className="font-semibold mb-2">5.1 To Provide the Application</h3>
              <ul className="list-disc ml-6 text-gray-700 space-y-1">
                <li>User authentication</li>
                <li>Account setup and management</li>
                <li>Access permissions and role-based controls</li>
              </ul>

              <h3 className="font-semibold mt-4 mb-2">5.2 To Maintain and Improve System Performance</h3>
              <p className="text-gray-700">Analytics and usage metrics, load performance monitoring, feature optimization, debugging and error resolution.</p>

              <h3 className="font-semibold mt-4 mb-2">5.3 For Communication</h3>
              <ul className="list-disc ml-6 text-gray-700 space-y-1">
                <li>Notifications</li>
                <li>Service alerts</li>
                <li>Maintenance announcements</li>
                <li>Customer support interactions</li>
              </ul>

              <h3 className="font-semibold mt-4 mb-2">5.4 For Security & Fraud Prevention</h3>
              <p className="text-gray-700">Monitoring suspicious activity, preventing unauthorized access, validating login attempts, incident detection and response.</p>

              <h3 className="font-semibold mt-4 mb-2">5.5 For Compliance</h3>
              <p className="text-gray-700">Meeting legal obligations, regulatory reporting (if required), responding to lawful requests.</p>

              <p className="text-gray-800 mt-4 font-semibold">We never sell, rent, or trade Personal Data.</p>
            </section>

            {/* 6. How We Process Customer Data */}
            <section className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4">6. How We Process Customer Data (RoPA Records)</h2>
              <p className="text-gray-700 mb-4">
                Customer Data entered into the Application (including RoPA details, DPIA content, processing activities, reports, etc.) remains solely owned by the Customer.
              </p>

              <p className="text-gray-700 mb-4">
                Proteccio Data processes Customer Data only for:
              </p>
              <ul className="list-disc ml-6 text-gray-700 space-y-1">
                <li>Hosting</li>
                <li>Storage</li>
                <li>Display within the Application</li>
                <li>Backups</li>
                <li>Technical troubleshooting</li>
                <li>Security monitoring</li>
              </ul>

              <p className="text-gray-700 mt-4">Proteccio Data does NOT:</p>
              <ul className="list-disc ml-6 text-gray-700 space-y-1">
                <li>Use Customer Data for analytics</li>
                <li>Sell or share Customer Data</li>
                <li>Access Customer Data except when authorized for support purposes</li>
                <li>Combine Customer Data with other datasets</li>
                <li>Use Customer Data for advertising or profiling</li>
              </ul>
            </section>

            {/* 7. Cookies */}
            <section className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4">7. Cookies & Tracking Technologies</h2>
              <p className="text-gray-700 mb-4">
                The Application may use the following technologies:
              </p>
              <ul className="list-disc ml-6 text-gray-700 space-y-1">
                <li>Essential Cookies – For authentication and security</li>
                <li>Performance Cookies – For usage analytics and improving functionality</li>
                <li>Session Storage – To maintain temporary session data</li>
                <li>Local Storage – For storing user preferences and settings</li>
                <li>Token-Based Tracking – For secure session management</li>
                <li>Error-Tracking Tools – To identify and resolve technical issues</li>
              </ul>
              <p className="text-gray-700 mt-4">
                We do not use advertising cookies. You may disable non-essential cookies through your browser settings; however, essential cookies are required for core functionality.
              </p>
            </section>

            {/* 8. Sharing */}
            <section className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4">8. Sharing of Personal Data</h2>
              <p className="text-gray-700 mb-4">
                Proteccio Data may share limited Personal Data with the following categories of recipients:
              </p>

              <h3 className="font-semibold mb-2">8.1 Third-Party Service Providers</h3>
              <p className="text-gray-700 mb-2">
                Examples include cloud hosting providers (e.g., AWS, Azure, GCP), email delivery services, error logging systems, analytics tools, backup services.
              </p>
              <p className="text-gray-700 mb-2">
                These processors operate under strict contractual obligations ensuring: no unauthorized use, confidentiality, robust security controls, compliance with data protection laws.
              </p>

              <h3 className="font-semibold mt-4 mb-2">8.2 Legal or Regulatory Authorities</h3>
              <p className="text-gray-700 mb-2">
                We may disclose Personal Data when required by law, responding to lawful requests, preventing fraud or misuse, or protecting rights, property, or safety.
              </p>

              <h3 className="font-semibold mt-4 mb-2">8.3 Business Transfers</h3>
              <p className="text-gray-700">
                If Proteccio Data undergoes a merger, acquisition, restructuring, or sale of assets, Personal Data may be part of the transaction, subject to appropriate safeguards. Proteccio Data never sells Personal Data.
              </p>
            </section>

            {/* 9. Retention */}
            <section className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4">9. Data Retention</h2>
              <p className="text-gray-700 mb-3">Proteccio Data retains personal data based on the following principles:</p>

              <h3 className="font-semibold mb-2">9.1 Application Usage</h3>
              <p className="text-gray-700">While your account remains active; until contract termination; until you request deletion.</p>

              <h3 className="font-semibold mt-4 mb-2">9.2 Legal Requirements</h3>
              <p className="text-gray-700">Certain logs and records may be retained longer to comply with: DPDPA, IT Act 2000, GDPR (if applicable), audit and accounting obligations.</p>

              <h3 className="font-semibold mt-4 mb-2">9.3 Customer Data</h3>
              <p className="text-gray-700">Retained as long as your subscription is active. Deleted or anonymized within 30–90 days after account termination, unless required otherwise by law.</p>
            </section>

            {/* 10. Security */}
            <section className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4">10. Data Storage, Security & Protection</h2>
              <p className="text-gray-700 mb-4">
                Proteccio Data implements industry-standard security measures to protect Personal Data and Customer Data, including:
              </p>

              <ul className="list-disc ml-6 text-gray-700 space-y-1">
                <li>Encryption: AES-256 for data at rest and TLS 1.2/1.3 for data in transit</li>
                <li>Role-Based Access Control (RBAC)</li>
                <li>Multi-Factor Authentication (MFA) (where applicable)</li>
                <li>Secure Audit Logs</li>
                <li>Firewalls & Threat Detection Systems</li>
                <li>Regular Vulnerability Assessments & Penetration Testing</li>
                <li>Backup Redundancies</li>
                <li>Least Privilege Access Principle</li>
                <li>Segregated Environments for production and development</li>
              </ul>

              <p className="text-gray-700 mt-4">
                Detailed security practices are documented separately in our Security Statement.
              </p>
            </section>

            {/* 11. Transfers */}
            <section className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4">11. Data Transfer & Cross-Border Processing</h2>
              <p className="text-gray-700 mb-4">
                Personal Data and Customer Data may be processed or stored in India (primary location) and other approved jurisdictions as required for service delivery.
              </p>
              <p className="text-gray-700">
                All cross-border transfers follow strict compliance measures, including: DPDPA requirements, Standard Contractual Clauses (SCCs), adequacy arrangements under applicable laws, and contractual safeguards to ensure data protection.
              </p>
            </section>

            {/* 12. Your Rights */}
            <section className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4">12. Your Rights (as applicable by law)</h2>
              <p className="text-gray-700 mb-3">Depending on your jurisdiction, you may have the right to:</p>
              <ul className="list-disc ml-6 text-gray-700 space-y-1">
                <li>Access your personal data</li>
                <li>Correct inaccurate or incomplete data</li>
                <li>Delete personal data</li>
                <li>Restrict processing under certain conditions</li>
                <li>Withdraw consent where processing is based on consent</li>
                <li>Data portability (receive your data in a structured, machine-readable format)</li>
                <li>Object to processing for specific purposes</li>
                <li>Lodge complaints with relevant data protection authorities</li>
              </ul>
              <p className="text-gray-700 mt-4">You may contact us at any time to exercise these rights.</p>
            </section>

            {/* 13. Children */}
            <section className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4">13. Children’s Data</h2>
              <p className="text-gray-700">
                The Application is not intended for individuals under the age of 18. Proteccio Data does not knowingly collect or process personal data of children. If we become aware that such data has been provided, we will take steps to delete it promptly.
              </p>
            </section>

            {/* 14. Breach */}
            <section className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4">14. Data Breach Notifications</h2>
              <p className="text-gray-700 mb-3">
                In the event of a confirmed personal data breach, Proteccio Data will:
              </p>
              <ul className="list-disc ml-6 text-gray-700 space-y-1">
                <li>Notify affected customers promptly</li>
                <li>Provide all known details regarding the breach</li>
                <li>Cooperate fully with remedial steps to mitigate impact</li>
                <li>Assist with regulatory notifications where applicable</li>
              </ul>
            </section>

            {/* 15. Third-Party Links */}
            <section className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4">15. Third-Party Links</h2>
              <p className="text-gray-700">
                The Application may contain links to third-party tools, documentation, or integrations. Proteccio Data is not responsible for the privacy practices, content, or security measures of external websites or services. We encourage you to review the privacy policies of any third-party services you interact with.
              </p>
            </section>

            {/* 16. Automated Decision-Making */}
            <section className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4">16. Automated Decision-Making</h2>
              <p className="text-gray-700">
                Proteccio Data does not use automated decision-making or profiling that produces legal or similarly significant effects on users.
              </p>
            </section>

            {/* 17. Changes */}
            <section className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4">17. Changes to This Privacy Notice</h2>
              <p className="text-gray-700">
                Proteccio Data may update this Privacy Notice from time to time. Changes will become effective when posted within the Application. Continued use of the Application after updates constitutes your acceptance of the revised Notice.
              </p>
            </section>

            {/* 18. Contact */}
            <section className="bg-gradient-to-r from-[#1cd35c] to-[#19b850] text-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4">18. Contact Information</h2>
              <p className="leading-relaxed mb-4 opacity-90">
                For privacy-related queries, rights requests, or complaints, contact:
              </p>

              <div className="bg-white/10 rounded-lg p-6 mb-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <i className="lucide lucide-mail text-xl opacity-80" />
                    <div>
                      <p className="text-sm opacity-80">Email</p>
                      <p className="font-medium">contact@protecciodata.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <i className="lucide lucide-map-pin text-xl opacity-80" />
                    <div>
                      <p className="text-sm opacity-80">Address</p>
                      <p className="font-medium">Please refer to website for registered address</p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm opacity-90">
                We strive to respond to privacy requests and will guide you through exercising your rights.
              </p>
            </section>

            {/* 19. Grievance Officer */}
            <section className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4">19. Grievance Officer (Required for India – DPDPA 2023)</h2>
              <p className="text-gray-700 mb-2">
                Email: contact@protecciodata.com
              </p>
              <p className="text-gray-700">
                Address: Please refer to website for registered address
              </p>
            </section>

            {/* 20. Effective Date */}
            <section className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4">20. Effective Date</h2>
              <p className="text-gray-700">
                This Privacy Notice is effective from December 12, 2025.
              </p>
            </section>

            {/* Footer CTA */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 rounded-md bg-[#5DEE92] text-black font-medium hover:opacity-90 transition"
              >
                ← Home
              </button>

              <a
                href="mailto:contact@protecciodata.com?subject=Privacy Inquiry"
                className="inline-flex items-center gap-2 bg-[#1cd35c] text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
              >
                Contact Our DPO
              </a>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}
