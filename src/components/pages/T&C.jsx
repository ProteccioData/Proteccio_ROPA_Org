import { useNavigate } from "react-router-dom";

export default function TandCPage() {
  const navigate = useNavigate();
  return (
    <div className="p-8 max-w-5xl mx-auto bg-white dark:bg-gray-900 dark:text-gray-100 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <button
        onClick={() => navigate("/login")}
        className="mb-6 px-4 py-2 rounded-md bg-[#5DEE92] text-black font-medium hover:opacity-90 transition"
      >
        ← Go Back
      </button>
      <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Terms of Service for Admin Portal
      </h1>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Effective Date: March 21, 2025 <br />
        Last Updated: September 14, 2025
      </p>

      <p className="mb-4">
        These Terms of Service (“Terms”) govern your access to, and use of the
        Admin Portal (“Portal”) provided by Proteccio Data (“Company”, “we”,
        “us”, or “our”). The Portal is a secure, internal web-based application
        designed for authorized administrators to manage system configurations,
        user accounts, permissions, and organizational data. By accessing or
        using the Portal, you agree to comply with these Terms. If you do not
        agree, you must not use the Portal.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        1. Eligibility and Access Control
      </h2>
      <p className="mb-2">
        Access to the Admin Portal is strictly limited to individuals who have
        been granted administrative privileges by Proteccio Data. These
        privileges are typically assigned based on job role, department, or
        specific operational responsibilities.
      </p>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li>
          You must be an employee, contractor, or authorized representative of
          the Company.
        </li>
        <li>
          You must have received formal approval from your manager or system
          owner to access the Portal.
        </li>
        <li>
          You must complete any required training or onboarding related to data
          handling and system administration.
        </li>
      </ul>
      <p className="mb-4">
        Access credentials are unique and non-transferable. Sharing login
        details or allowing unauthorized individuals to access the Portal is a
        violation of these Terms and may result in disciplinary action or legal
        consequences.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        2. User Responsibilities
      </h2>
      <p className="mb-2">
        As an administrator, you are entrusted with elevated access that can
        affect the integrity, security, and performance of the organization’s
        systems. You are expected to:
      </p>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li>
          Protect your credentials: Use strong passwords, enable multi-factor
          authentication (MFA), and never share your login information.
        </li>
        <li>
          Maintain system hygiene: Regularly audit user roles, permissions, and
          access logs to ensure compliance and minimize risk.
        </li>
        <li>
          Act with integrity: Avoid making unauthorized changes, and ensure all
          actions taken within the Portal are aligned with your role and
          responsibilities.
        </li>
        <li>
          Report issues promptly: Notify the IT or Security team immediately if
          you suspect a breach, data leak, or system malfunction.
        </li>
      </ul>
      <p className="mb-4">
        You are accountable for all actions performed under your account. Misuse
        of administrative privileges may result in revocation of access and
        further investigation.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        3. Data Privacy and Confidentiality
      </h2>
      <p className="mb-2">
        The Portal may provide access to sensitive data, including personal
        information, financial records, operational metrics, and proprietary
        business content. You agree to:
      </p>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li>
          Comply with applicable laws: Handle data in accordance with
          regulations such as GDPR, DPDPA, or local data protection laws.
        </li>
        <li>
          Limit data exposure: Do not download, export, or share data unless
          explicitly authorized and necessary for business operations.
        </li>
        <li>
          Respect confidentiality: Do not disclose internal data to external
          parties or use it for personal gain.
        </li>
      </ul>
      <p className="mb-4">
        All data accessed through the Portal is considered confidential.
        Breaches of data privacy may result in disciplinary action, termination,
        or legal liability.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        4. Acceptable Use Policy
      </h2>
      <p className="mb-2">
        You agree to use the Portal responsibly and ethically. Prohibited
        activities include:
      </p>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li>
          Unauthorized access: Attempting to access systems, data, or features
          beyond your assigned privileges.
        </li>
        <li>
          Malicious behavior: Uploading viruses, malware, or engaging in
          activities that disrupt system performance.
        </li>
        <li>
          Abuse of power: Using administrative privileges to harass, intimidate,
          or discriminate against users.
        </li>
        <li>
          Automation misuse: Deploying bots, scripts, or tools that interfere
          with normal Portal operations or violate usage limits.
        </li>
      </ul>
      <p className="mb-4">
        All actions within the Portal are logged and monitored. Violations of
        this policy may result in immediate suspension or termination of access.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        5. Account Suspension and Termination
      </h2>
      <p className="mb-4">
        We reserve the right to suspend or terminate your access to the Portal
        under the following conditions:
      </p>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li>
          Policy violations: Breach of these Terms, internal policies, or
          applicable laws.
        </li>
        <li>
          Security concerns: Suspected compromise of your account or
          unauthorized activity.
        </li>
        <li>
          Role changes: Transfer, resignation, or termination of employment that
          no longer requires administrative access.
        </li>
        <li>
          Operational needs: System upgrades, audits, or restructuring that
          necessitate access changes.
        </li>
      </ul>
      <p className="mb-4">
        Suspension or termination may occur without prior notice in cases of
        urgent security or compliance risks.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        6. Intellectual Property Rights
      </h2>
      <p className="mb-4">
        All content, software, designs, and documentation within the Portal are
        the intellectual property of Proteccio Data or its licensors. You agree
        not to:
      </p>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li>
          Copy or redistribute: Do not reproduce or share Portal content outside
          authorized channels.
        </li>
        <li>
          Reverse-engineer: Do not attempt to decompile, disassemble, or extract
          source code from the Portal.
        </li>
        <li>
          Use for external purposes: Do not use Portal materials for personal
          projects, commercial ventures, or non-business activities.
        </li>
      </ul>
      <p className="mb-4">
        Unauthorized use of intellectual property may result in legal action and
        termination of access.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        7. Disclaimer of Warranties
      </h2>
      <p className="mb-4">
        The Portal is provided “as is” and “as available.” While we strive to
        maintain high availability and performance, we do not guarantee:
      </p>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li>
          Uninterrupted access: The Portal may be subject to maintenance,
          outages, or technical issues.
        </li>
        <li>
          Error-free operation: Bugs, glitches, or data inconsistencies may
          occur.
        </li>
        <li>
          Fitness for purpose: The Portal may not meet every administrative need
          or expectation.
        </li>
      </ul>
      <p className="mb-4">
        We disclaim all warranties, express or implied, including
        merchantability, fitness for a particular purpose, and non-infringement.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        8. Limitation of Liability
      </h2>
      <p className="mb-4">
        To the maximum extent permitted by law, Proteccio Data shall not be
        liable for:
      </p>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li>
          Indirect or consequential damages: Including loss of data, revenue, or
          business opportunities.
        </li>
        <li>
          User errors: Mistakes made by administrators that result in data loss
          or system misconfiguration.
        </li>
        <li>
          Security breaches: Arising from negligence, credential sharing, or
          failure to follow security protocols.
        </li>
      </ul>
      <p className="mb-4">
        Your sole remedy for dissatisfaction with the Portal is to discontinue
        use.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        9. Modifications to Terms
      </h2>
      <p className="mb-4">
        We may update these Terms periodically to reflect changes in law,
        technology, or business practices. You will be notified of significant
        changes via:
      </p>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li>Email notifications</li>
        <li>In-Portal alerts</li>
        <li>Internal communications</li>
      </ul>
      <p className="mb-4">
        Continued use of the Portal after changes are posted constitutes
        acceptance of the revised Terms. It is your responsibility to review
        updates regularly.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        10. Governing Law and Dispute Resolution
      </h2>
      <p className="mb-4">
        These Terms shall be governed by the laws of India. Any disputes arising
        from these Terms or use of the Portal shall be resolved through:
      </p>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li>
          Internal resolution: Mediation or arbitration as per company policy.
        </li>
        <li>
          Legal proceedings: If necessary, in the courts of Hyderabad, India.
        </li>
      </ul>
      <p className="mb-4">
        You agree to cooperate fully in any investigation or legal process
        related to Portal usage.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        11. Contact Information
      </h2>
      <p className="mb-4">
        For questions, concerns, or support related to these Terms or the Admin
        Portal, please contact:
      </p>
      <p className="mb-4">
        IT Helpdesk / Legal Department <br />
        Email:{" "}
        <a
          href="mailto:Contact@protecciodata.com"
          className="text-green-600 underline"
        >
          Contact@protecciodata.com
        </a>
      </p>
    </div>
  );
}
