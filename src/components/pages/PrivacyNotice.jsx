import { useNavigate } from "react-router-dom";

export default function PrivacyNotice() {
  const navigate = useNavigate();

  return (
    <>
      <main class="flex-1">
        <div class="min-h-screen bg-gradient-to-br from-gray-50 to-white ">
          <div class="bg-gradient-to-r from-[#1cd35c] to-[#19b850] text-white py-16">
            <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => navigate("/login")}
              className="mb-6 px-4 py-2 rounded-md bg-[#5DEE92] text-black font-medium hover:opacity-90 transition"
            >
              ← Go Back
            </button>
              <div class="text-center">
                <i class="lucide lucide-shield-check mx-auto text-6xl mb-6 opacity-90"></i>
                <h1 class="text-4xl md:text-5xl font-bold mb-4">
                  Privacy Notice
                </h1>
                <div class="flex flex-col sm:flex-row justify-center items-center gap-4 text-lg">
                  <span class="bg-white/20 px-4 py-2 rounded-full">
                    Effective Date: March 21, 2025
                  </span>
                  <span class="bg-white/20 px-4 py-2 rounded-full">
                    Last Updated: October 3, 2025
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
              <div class="flex items-start gap-4">
                <i class="lucide lucide-info text-[#1cd35c] text-2xl mt-1 flex-shrink-0"></i>
                <div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-4">
                    Our Commitment to Your Privacy
                  </h2>
                  <p class="text-gray-700 leading-relaxed mb-4">
                    At Proteccio Data, we truly value your privacy. This Privacy
                    Notice explains how we gather, use, share, and protect your
                    personal information when you visit our website, use our
                    services, or reach out to us through any means.
                  </p>
                  <p class="text-gray-700 leading-relaxed mb-4">
                    We recognize how crucial it is to safeguard your personal
                    data, and we are dedicated to adhering to the{" "}
                    <strong>
                      Digital Personal Data Protection Act, 2023 (DPDPA)
                    </strong>
                    , along with other relevant data protection laws. Our
                    approach is grounded in principles like legality, fairness,
                    purpose limitation, data minimization, accuracy, storage
                    limitation, and accountability.
                  </p>
                  <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 class="font-semibold text-green-900 mb-2">
                      This notice provides transparent information about:
                    </h3>
                    <ul class="text-green-800 text-sm space-y-1">
                      <li>• The types of personal data we collect</li>
                      <li>• The reasons we process your data</li>
                      <li>• The legal grounds for that processing</li>
                      <li>• Your rights as a Data Principal under the DPDPA</li>
                      <li>• How you can take control of your personal data</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">
                What Data We Collect
              </h2>
              <p class="text-gray-700 leading-relaxed mb-8">
                At Proteccio Data, we gather personal information to enhance and
                tailor your experience with our website and services. We're
                committed to collecting only the data that's necessary for
                legitimate business needs, all in line with the Digital Personal
                Data Protection Act, 2023 (DPDPA).
              </p>

              <div class="grid gap-6">
                <div class="bg-blue-50 border-blue-200 border rounded-lg p-6">
                  <div class="flex items-start gap-4">
                    <i class="lucide lucide-user text-blue-600 text-2xl mt-1"></i>
                    <div class="flex-1">
                      <h3 class="text-xl font-semibold text-blue-600 mb-2">
                        Personally Identifiable Information (PII)
                      </h3>
                      <p class="text-gray-700 mb-4">
                        Information you provide directly through forms and
                        interactions
                      </p>
                      <div class="bg-white/50 rounded-lg p-4">
                        <h4 class="font-semibold text-gray-900 mb-2">
                          Data we collect:
                        </h4>
                        <ul class="space-y-1">
                          <li class="flex items-center gap-2 text-gray-700 text-sm">
                            <span class="text-[#1cd35c]">•</span>
                            <span>First Name & Last Name</span>
                          </li>
                          <li class="flex items-center gap-2 text-gray-700 text-sm">
                            <span class="text-[#1cd35c]">•</span>
                            <span>Business Email Address</span>
                          </li>
                          <li class="flex items-center gap-2 text-gray-700 text-sm">
                            <span class="text-[#1cd35c]">•</span>
                            <span>Company Name</span>
                          </li>
                          <li class="flex items-center gap-2 text-gray-700 text-sm">
                            <span class="text-[#1cd35c]">•</span>
                            <span>Phone Number</span>
                          </li>
                          <li class="flex items-center gap-2 text-gray-700 text-sm">
                            <span class="text-[#1cd35c]">•</span>
                            <span>Contact Form Details</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="bg-purple-50 border-purple-200 border rounded-lg p-6">
                  <div class="flex items-start gap-4">
                    <i class="lucide lucide-monitor text-purple-600 text-2xl mt-1"></i>
                    <div class="flex-1">
                      <h3 class="text-xl font-semibold text-purple-600 mb-2">
                        Technical and Usage Information
                      </h3>
                      <p class="text-gray-700 mb-4">
                        Automatically collected data to improve your experience
                      </p>
                      <div class="bg-white/50 rounded-lg p-4">
                        <h4 class="font-semibold text-gray-900 mb-2">
                          Data we collect:
                        </h4>
                        <ul class="space-y-1">
                          <li class="flex items-center gap-2 text-gray-700 text-sm">
                            <span class="text-[#1cd35c]">•</span>
                            <span>Country and City (from IP address)</span>
                          </li>
                          <li class="flex items-center gap-2 text-gray-700 text-sm">
                            <span class="text-[#1cd35c]">•</span>
                            <span>Browser Type and Version</span>
                          </li>
                          <li class="flex items-center gap-2 text-gray-700 text-sm">
                            <span class="text-[#1cd35c]">•</span>
                            <span>Device and Operating System</span>
                          </li>
                          <li class="flex items-center gap-2 text-gray-700 text-sm">
                            <span class="text-[#1cd35c]">•</span>
                            <span>Time spent on site</span>
                          </li>
                          <li class="flex items-center gap-2 text-gray-700 text-sm">
                            <span class="text-[#1cd35c]">•</span>
                            <span>Page interactions and navigation</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p class="text-yellow-800 text-sm">
                  <strong>Data Minimization:</strong> We make sure to aggregate
                  and anonymize technical data whenever possible, using it
                  solely to enhance your experience, monitor website
                  performance, and customize our content based on your interests
                  and location.
                </p>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">
                Legal Basis for Processing
              </h2>
              <p class="text-gray-700 leading-relaxed mb-6">
                At Proteccio Data, we take your privacy seriously and handle
                personal data in strict accordance with the Digital Personal
                Data Protection Act, 2023 (DPDPA). We clearly define the legal
                grounds for processing your personal data:
              </p>

              <div class="grid gap-4">
                <div class="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div class="flex items-start gap-3">
                    <i class="lucide lucide-check-circle text-green-600 text-xl mt-1"></i>
                    <div>
                      <h3 class="font-semibold text-green-900 mb-2">Consent</h3>
                      <p class="text-green-800 text-sm mb-3">
                        When you share personal data through forms like "Book a
                        Demo" or "Contact Us," we obtain your explicit and
                        informed consent. This consent is voluntary and specific
                        to outlined purposes.
                      </p>
                      <div class="bg-green-100 rounded p-3">
                        <p class="text-green-700 text-xs">
                          <strong>Your Control:</strong> You're in complete
                          control of your consent preferences and can withdraw
                          consent at any time.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div class="flex items-start gap-3">
                    <i class="lucide lucide-shield text-blue-600 text-xl mt-1"></i>
                    <div>
                      <h3 class="font-semibold text-blue-900 mb-2">
                        Legitimate Interests
                      </h3>
                      <p class="text-blue-800 text-sm mb-3">
                        We process technical and usage data (browser type,
                        location, device info) to serve legitimate interests
                        like improving website performance, enhancing user
                        experience, preventing fraud, and maintaining security.
                      </p>
                      <div class="bg-blue-100 rounded p-3">
                        <p class="text-blue-700 text-xs">
                          <strong>Balanced Approach:</strong> We always weigh
                          these interests against your privacy rights with
                          appropriate safeguards.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <div class="flex items-start gap-3">
                    <i class="lucide lucide-file-text text-purple-600 text-xl mt-1"></i>
                    <div>
                      <h3 class="font-semibold text-purple-900 mb-2">
                        Legal Compliance
                      </h3>
                      <p class="text-purple-800 text-sm">
                        Sometimes we process or retain data to meet legal or
                        regulatory requirements, including DPDPA obligations.
                        This may involve maintaining logs, responding to
                        government inquiries, or keeping records for auditing
                        purposes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">
                Your Rights Under DPDPA
              </h2>
              <p class="text-gray-700 leading-relaxed mb-8">
                Under the Digital Personal Data Protection Act, 2023 (DPDPA),
                you're recognized as a <strong>Data Principal</strong>, which
                means you have important rights regarding your personal data. At
                Proteccio Data, we're dedicated to respecting these rights and
                making it easy for you to exercise them.
              </p>

              <div class="grid gap-6">
                <div class="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div class="flex items-start gap-4">
                    <i class="lucide lucide-eye text-[#1cd35c] text-2xl mt-1"></i>
                    <div>
                      <h3 class="text-lg font-semibold text-gray-900 mb-2">
                        Access Your Personal Data
                      </h3>
                      <p class="text-gray-700 text-sm leading-relaxed">
                        Request details about the personal data we have on you,
                        including what types of data we hold and why we're
                        processing it.
                      </p>
                    </div>
                  </div>
                </div>

                <div class="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div class="flex items-start gap-4">
                    <i class="lucide lucide-edit text-[#1cd35c] text-2xl mt-1"></i>
                    <div>
                      <h3 class="text-lg font-semibold text-gray-900 mb-2">
                        Correct or Update Data
                      </h3>
                      <p class="text-gray-700 text-sm leading-relaxed">
                        Request corrections or updates if you think any personal
                        data we have about you is wrong, outdated, or
                        incomplete.
                      </p>
                    </div>
                  </div>
                </div>

                <div class="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div class="flex items-start gap-4">
                    <i class="lucide lucide-user-x text-[#1cd35c] text-2xl mt-1"></i>
                    <div>
                      <h3 class="text-lg font-semibold text-gray-900 mb-2">
                        Withdraw Consent
                      </h3>
                      <p class="text-gray-700 text-sm leading-relaxed">
                        Take back your consent at any time for data processing
                        based on consent, such as form submissions.
                      </p>
                    </div>
                  </div>
                </div>

                <div class="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div class="flex items-start gap-4">
                    <i class="lucide lucide-trash-2 text-[#1cd35c] text-2xl mt-1"></i>
                    <div>
                      <h3 class="text-lg font-semibold text-gray-900 mb-2">
                        Request Data Deletion
                      </h3>
                      <p class="text-gray-700 text-sm leading-relaxed">
                        Ask us to delete your personal data when it's no longer
                        needed or if you withdraw your consent.
                      </p>
                    </div>
                  </div>
                </div>

                <div class="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div class="flex items-start gap-4">
                    <i class="lucide lucide-alert-triangle text-[#1cd35c] text-2xl mt-1"></i>
                    <div>
                      <h3 class="text-lg font-semibold text-gray-900 mb-2">
                        File a Grievance
                      </h3>
                      <p class="text-gray-700 text-sm leading-relaxed">
                        Submit a complaint to our Data Protection Officer if
                        you're concerned about how your data is being managed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-8 bg-[#1cd35c] text-white rounded-lg p-6">
                <h3 class="font-semibold mb-3">
                  📧 How to Exercise Your Rights
                </h3>
                <p class="text-sm mb-4 opacity-90">
                  To exercise any of these rights, please reach out to our Data
                  Protection Officer (DPO). We might need to confirm your
                  identity before processing your request to ensure your data
                  stays safe from unauthorized access.
                </p>
                <div class="flex flex-col sm:flex-row gap-4">
                  <a
                    href="mailto:contact@protecciodata.com"
                    class="inline-flex items-center gap-2 bg-white text-[#1cd35c] px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    <i class="lucide lucide-mail"></i>
                    contact@protecciodata.com
                  </a>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">
                Data Security
              </h2>
              <p class="text-gray-700 leading-relaxed mb-6">
                At Proteccio Data, we take the protection of your personal data
                very seriously. Our top priority is to create a strong and
                multi-layered security system that keeps your information safe
                from unauthorized access, changes, sharing, or destruction.
              </p>

              <div class="grid md:grid-cols-2 gap-6 mb-6">
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div class="flex items-start gap-3">
                    <i class="lucide lucide-lock text-[#1cd35c] text-xl mt-1"></i>
                    <div>
                      <h4 class="font-semibold text-gray-900 mb-2">
                        SSL Encryption
                      </h4>
                      <p class="text-gray-700 text-sm">
                        All data transmitted between your browser and our
                        website is protected with Secure Socket Layer
                        encryption.
                      </p>
                    </div>
                  </div>
                </div>

                <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div class="flex items-start gap-3">
                    <i class="lucide lucide-users text-[#1cd35c] text-xl mt-1"></i>
                    <div>
                      <h4 class="font-semibold text-gray-900 mb-2">
                        Access Controls
                      </h4>
                      <p class="text-gray-700 text-sm">
                        Role-based access controls ensure only authorized
                        personnel can access your data, following the principle
                        of least privilege.
                      </p>
                    </div>
                  </div>
                </div>

                <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div class="flex items-start gap-3">
                    <i class="lucide lucide-clipboard-check text-[#1cd35c] text-xl mt-1"></i>
                    <div>
                      <h4 class="font-semibold text-gray-900 mb-2">
                        Regular Audits
                      </h4>
                      <p class="text-gray-700 text-sm">
                        Our systems undergo regular security audits,
                        vulnerability assessments, and continuous monitoring.
                      </p>
                    </div>
                  </div>
                </div>

                <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div class="flex items-start gap-3">
                    <i class="lucide lucide-database text-[#1cd35c] text-xl mt-1"></i>
                    <div>
                      <h4 class="font-semibold text-gray-900 mb-2">
                        Secure Storage
                      </h4>
                      <p class="text-gray-700 text-sm">
                        Data is stored in secure environments with controlled
                        access, and sensitive information is encrypted at rest.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 class="font-semibold text-blue-900 mb-3">
                  🛡️ Our Security Commitment
                </h3>
                <ul class="text-blue-800 text-sm space-y-2">
                  <li>
                    • <strong>Privacy-by-Design:</strong> Our team follows
                    secure development practices from the ground up
                  </li>
                  <li>
                    • <strong>Continuous Monitoring:</strong> Regular assessment
                    and updating of security protocols
                  </li>
                  <li>
                    • <strong>Incident Response:</strong> Solid response plan to
                    quickly tackle potential data breaches
                  </li>
                  <li>
                    • <strong>Compliance:</strong> Adherence to DPDPA
                    requirements and international security standards
                  </li>
                </ul>
              </div>

              <div class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p class="text-yellow-800 text-sm">
                  <strong>Important:</strong> While we maintain top-notch
                  security, no system is completely risk-free. We recommend
                  taking your own precautions, like avoiding sharing sensitive
                  information through unsecured channels.
                </p>
              </div>
            </div>

            <div class="bg-gradient-to-r from-[#1cd35c] to-[#19b850] text-white rounded-xl shadow-lg p-8">
              <h2 class="text-2xl font-bold mb-6">Contact Us</h2>
              <p class="leading-relaxed mb-6 opacity-90">
                We truly appreciate your trust and are here to help with any
                questions, concerns, or requests you might have about your
                personal data and privacy. If you'd like to exercise your rights
                under the Digital Personal Data Protection Act, 2023 (DPDPA),
                our dedicated Data Protection Officer (DPO) is ready to assist
                you.
              </p>

              <div class="bg-white/10 rounded-lg p-6 backdrop-blur-sm mb-6">
                <h3 class="font-semibold mb-4">
                  Data Protection Officer (DPO)
                </h3>
                <div class="grid md:grid-cols-2 gap-4">
                  <div class="flex items-center gap-3">
                    <i class="lucide lucide-mail text-xl opacity-80"></i>
                    <div>
                      <p class="text-sm opacity-80">Email</p>
                      <p class="font-medium">contact@protecciodata.com</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <i class="lucide lucide-map-pin text-xl opacity-80"></i>
                    <div>
                      <p class="text-sm opacity-80">Location</p>
                      <p class="font-medium">Hyderabad, India</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-white/10 rounded-lg p-4 mb-6">
                <p class="text-sm opacity-90">
                  <strong>For urgent matters:</strong> Please include "Privacy
                  Concern – Urgent" in your email subject line so we can
                  prioritize your request. We strive to respond to all
                  privacy-related inquiries quickly and will guide you through
                  exercising your rights.
                </p>
              </div>

              <div class="flex flex-col sm:flex-row gap-4">
                <a
                  href="mailto:contact@protecciodata.com?subject=Privacy Inquiry"
                  class="inline-flex items-center justify-center gap-2 bg-white text-[#1cd35c] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  <i class="lucide lucide-mail"></i>
                  Contact Our DPO
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

{
  /* <script>
        // Simple script for dropdown functionality
        document.addEventListener('DOMContentLoaded', function() {
            // Add click handlers for dropdowns
            const dropdownButtons = document.querySelectorAll('.group button');
            dropdownButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const dropdown = this.nextElementSibling;
                    if (dropdown && dropdown.classList.contains('hidden')) {
                        dropdown.classList.remove('hidden');
                    } else if (dropdown) {
                        dropdown.classList.add('hidden');
                    }
                });
            });
            
            // Close dropdowns when clicking outside
            document.addEventListener('click', function(event) {
                if (!event.target.closest('.group')) {
                    document.querySelectorAll('.group ul').forEach(dropdown => {
                        dropdown.classList.add('hidden');
                    });
                }
            });
        });
    </script> */
}
