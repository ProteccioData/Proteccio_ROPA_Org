import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { addTranslationNamespace } from "../../i18n/config";

export default function TermsofService() {
  // useEffect(() => {
  //   addTranslationNamespace("en" , "pages" , "TermsofService"),
  //   addTranslationNamespace("hindi" , "pages" , "TermsofService"),
  //   addTranslationNamespace("telugu" , "pages" , "TermsofService"),
  //   addTranslationNamespace("sanskrit" , "pages" , "TermsofService")
  // } , [])

  const { t } = useTranslation("pages", { keyPrefix: "TermsofService" });

  const navigate = useNavigate();

  return (
    <main className="flex-1">
      {/* <div className=""> */}
      {/* HERO */}
      <div className="bg-gradient-to-r from-[#1cd35c] to-[#19b850] text-white py-16 rounded-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <i className="lucide lucide-file-text mx-auto text-6xl mb-6 opacity-90" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t("terms_of_service")}
            </h1>
            <p className="text-lg opacity-90">
              {t("ropa_application_by_proteccio_data")}
            </p>
            <div className="mt-4 flex justify-center gap-4">
              <span className="bg-white/20 px-4 py-2 rounded-full">
                {t("last_updated_dec_12_2025")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-6 py-4">
          <h3 className="text-sm font-semibold text-amber-900 mb-1">
            {t("language_disclaimer_title")}
          </h3>
          <p className="text-sm text-amber-800 leading-relaxed">
            {t("language_disclaimer_text")}
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <section className="bg-white rounded-xl shadow-lg p-8">
          <p className="text-gray-700 leading-relaxed">{t("welcome")}</p>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">{t("1_definitions")}</h2>
          <ol className="list-none ml-6 text-gray-700 space-y-2">
            <li>
              <strong>{t("1_1_application")}</strong>{" "}
              {t("refers_to_the_ropa_saas_platform_interfaces_system")}
            </li>
            <li>
              <strong>{t("1_2_customer_data")}</strong>{" "}
              {t("means_all_data_submitted_uploaded_imported_or_gene")}
            </li>
            <li>
              <strong>{t("1_3_service_services")}</strong> {t("means_access_to_the_application_features_and_any_s")}
            </li>
            <li>
              <strong>{t("1_4_user_account")}</strong> {t("means_an_account_created_by_an_individual_or_organ")}
            </li>
            <li>
              <strong>{t("1_5_applicable_laws")}</strong> {t("include the DPDPA 2023")}
            </li>
            <li>
              <strong>{t("1_6_third_party_processors")}</strong> {t("are_vendors_or_service_providers_who_support_hosti")}
            </li>
            <li>
              <strong>{t("1_7_documentation")}</strong> {t("means_manuals_onboarding_guides_instructions_or_su")}
            </li>
            <li>
              <strong>{t("1_8_beta_features")}</strong> {t("means_experimental_or_pre_release_functionalities_")}
            </li>
            <li>
              <strong>{t("1_9_confidential_information")}</strong> {t("means_any_non_public_information_disclosed_under_t")}
            </li>
          </ol>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">{t("2_purpose_scope")}</h2>
          <p className="text-gray-700 mb-4">
            {t("the_application_enables")}
          </p>

          <ul className="list-disc ml-6 text-gray-700 space-y-1">
            <li>{t("ropa_record_management")}</li>
            <li>{t("data_mapping")}</li>
            <li>{t("consent_tracking")}</li>
            <li>{t("vendor_processor_records")}</li>
            <li>{t("risk_analysis")}</li>
            <li>{t("dpia_lia_pia_support")}</li>
            <li>{t("compliance_dashboards")}</li>
            <li>{t("reporting_exports")}</li>
            <li>{t("audit_trails")}</li>
            <li>{t("metadata_management")}</li>
          </ul>

          <p className="text-gray-700 mt-4">
            {t("use_of_the_application_is_limited_to_lawful_compli")}
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">{t("3_eligibility")}</h2>
          <p className="text-gray-700 mb-3">
            {t("by_using_the_application_you_confirm_that")}
          </p>

          <ul className="list-disc ml-6 text-gray-700 space-y-1">
            <li>
              <strong>{t("age_requirement")}</strong> {t("you_are_at_least_18_years_old_and_legally_capable_")}
            </li>
            <li>
              <strong>{t("authority")}</strong> {t("you_have_the_necessary_authority_to_bind_your_orga")}
            </li>
            <li>
              <strong>{t("compliance")}</strong> You will comply with all applicable
              laws, regulations, and industry standards while using the
              Application, including but not limited to data protection,
              privacy, and intellectual property laws.
            </li>
            <li>
              <strong>{t("responsible_use")}</strong> You will not use the Application
              for any unlawful, harmful, or unauthorized purposes, and you agree
              to follow all guidelines and policies provided by the Application.
            </li>
            <li>
              <strong>{t("accuracy_of_information")}</strong> {t("any_information_you_provide_during_registration_or")}
            </li>
            <li>
              <strong>{t("security")}</strong> {t("you_will_maintain_the_confidentiality")}
            </li>
          </ul>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">
            {t("4_account_registration_responsibilities")}
          </h2>
          <ol className="list-none ml-6 text-gray-700 space-y-2">
            <li>
              <strong>{t("4_1_accurate_information")}</strong> {t("you_must_provide_accurate_complete_and_up_to_date_")}
            </li>
            <li>
              <strong>{t("4_2_account_security")}</strong> {t("you_are_solely_responsible")}
            </li>
            <li>
              <strong>{t("4_3_notification_of_breach")}</strong> {t("you_must_notify_us_immediately_if_you_become_aware")}
            </li>
            <li>
              <strong>{t("4_4_organizational_compliance")}</strong> {t("if_you_are_acting")}
            </li>
            <li>
              <strong>{t("4_5_prohibition_on_impersonation")}</strong> {t("you_must_not_impersonate_any_person_or_entity_misr")}
            </li>
            <li>
              <strong>{t("4_6_lawful_use")}</strong> {t("you_must_use_the_application_only_for_lawful_purpo")}
            </li>
            <li>
              <strong>{t("4_7_no_misuse_of_services")}</strong> {t("no_misuse")}
            </li>
            <li>
              <strong>{t("4_8_data_protection")}</strong> {t("you_are_responsible")}
            </li>
            <li>
              <strong>{t("4_9_intellectual_property_compliance")}</strong> {t("you_must_not_upload_share_or_use_content_that_infr")}
            </li>
            <li>
              <strong>{t("4_10_monitoring_and_auditing")}</strong> {t("you_agree_that_we_may_monitor_and_audit_your_use_o")}
            </li>
            <li>
              <strong>{t("4_11_third_party_access")}</strong> {t("you_must_not_share_your_account_credentials_with_u")}
            </li>
            <li>
              <strong>{t("4_12_updates_and_maintenance")}</strong> {t("you_agree_to_keep_your_systems_updated_and_compati")}
            </li>
          </ol>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">{t("5_license_grant")}</h2>
          <p className="text-gray-700 mb-4">
            {t("proteccio_data_grants")}
          </p>

          <p className="text-gray-700 mb-4">{t("you_shall_not")}</p>
          <ul className="list-disc ml-6 text-gray-700 space-y-1">
            <li>
              {t("copy_or_modify_copy_reproduce_alter_adapt_translat")}
            </li>
            <li>
              {t("reverse_engineering_attempt_to_reverse_engineer_de")}
            </li>
            <li>
              {t("bypass_security_attempt_to_disable_circumvent_or_b")}
            </li>
            <li>
              {t("compete_with_proteccio_data_use_the_application_to")}
            </li>
            <li>
              {t("resell_or_re_license_sell_lease_sublicense_distrib")}
            </li>
            <li>
              {t("interfere_with_performance")}
            </li>
            <li>
              {t("unauthorized_access_access_or_attempt_to_access_an")}
            </li>
            <li>
              {t("use_for_unlawful_purposes_use_the_application_for_")}
            </li>
          </ul>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">
            {t("6_customer_data_ownership")}
          </h2>
          <p className="text-gray-700 mb-4">
            <strong>{t("6_1_ownership")}</strong>
            <br />
            {t("you_retain_full_ownership")}
          </p>

          <p className="text-gray-700 mb-4">
            <strong>{t("6_2_limited_rights_of_use")}</strong>
            <br />
            {t("proteccio_data_does_not_claim_any_ownership_rights")}
          </p>

          <ul className="list-disc ml-6 text-gray-700 space-y-1">
            <li>{t("provide_the_service_and_ensure_its_functionality")}</li>
            <li>{t("improve_system_performance_and_enhance_user_experi")}</li>
            <li>{t("protect_against_security_threats_fraud_and_abuse")}</li>
            <li>
              {t("comply_with_legal_or_regulatory_requirements_inclu")}
            </li>
          </ul>

          <p className="text-gray-700 mb-4">
            <strong>{t("6_3_compliance_and_legality")}</strong>
            <br />
            {t("you_represent_and_warrant")}
          </p>

          <p className="text-gray-700 mb-4">
            <strong>{t("6_4_data_security")}</strong>
            <br />
            {t("proteccio_data_will_implement")}
          </p>

          <p className="text-gray-700">
            <strong>{t("6_5_data_processing_and_privacy")}</strong>
            <br />
            {t("any_processing_of_customer_data_will_be_carried_ou")}
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">
            {t("7_data_privacy_protection")}
          </h2>
          <p className="text-gray-700">
            {t("encryption_of_data_at_rest_and_in_transit_using_in")}
          </p>

          <ul className="list-disc ml-6 text-gray-700 space-y-1 mt-4">
            <li>
              {t("encryption_of_data_at_rest_and_in_transit_using_in")}
            </li>
            <li>
              {t("access_control_authentication_mechanisms_to_preven")}
            </li>
            <li>
             {t("logging_monitoring_of_system_activities_to_detect_")}
            </li>
            <li>
              {t("regular_vulnerability_assessments_and_security_tes")}
            </li>
            <li>
              {t("strict_role_based_access_permissions_ensuring_user")}
            </li>
            <li>
              {t("segregation_of_customer_environments_to_prevent_da")}
            </li>
          </ul>

          <p className="text-gray-700 mt-4">
            {t("a_detailed_description_of_these_measures_is_provid")}
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">
           {t("8_data_residency_storage_transfers")}
          </h2>

          <p className="text-gray-700 mb-3">
            <strong>{t("8_1_data_location")}</strong>
            <br />
            {t("customer_data_may_be_stored_and_processed_in_india")}
          </p>

          <p className="text-gray-700 mb-3">
            <strong>{t("8_2_cross_border_data_transfers")}</strong>
            <br />
            {t("if_cross_border_transfers_of_customer_data_are_req")}
          </p>

          <ul className="list-disc ml-6 text-gray-700 space-y-1">
            <li>
              Standard Contractual Clauses (SCCs) approved by relevant
              authorities.
            </li>
            <li>
              {t("adequacy_requirements_under_applicable_data_protec")}
            </li>
            <li>
              {t("dpdpa_gdpr_compliant_transfer_mechanisms_or_equiva")}
            </li>
          </ul>

          <p className="text-gray-700 mt-4">
            <strong>{t("8_3_third_party_processors")}</strong>
            <br />
            {t("proteccio_data_may_engage_trusted")}
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">
            {t("9_backups_availability_business_continuity")}
          </h2>

          <ul className="list-none ml-6 text-gray-700 space-y-1">
            <li>
              <strong>{t("9_1_automated_backups")}</strong>
              <br />
              {t("proteccio_data_performs_automated_backups_at_regul")}
            </li>
            <li>
              <strong>{t("9_2_disaster_recovery")}</strong>
              <br />
              {t("we_maintain_disaster_recovery_procedures_designed_")}
            </li>
            <li>
              <strong>{t("9_3_downtime")}</strong>
              <br />
              {t("downtime")}
            </li>
            <li>
              <strong>{t("9_4_no_guarantee_of_uninterrupted_service")}</strong>
              <br />
              {t("while_we_strive")}
            </li>
          </ul>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">{t("10_acceptable_use_policy")}</h2>
          <p className="text-gray-700 mb-3">
            {t("you_agree_not_to_engage_in_any_of_the_following_ac")}
          </p>

          <ul className="list-disc ml-6 text-gray-700 space-y-1">
            <li>
              <strong>{t("upload_harmful_content")}</strong>
              <br />
              {t("do_not_upload_malware_spyware_spam_or_any_harmful_")}
            </li>
            <li>
              <strong>{t("unauthorized_access")}</strong>
              <br />
              {t("do_not_attempt_to_gain_unauthorized_access_to_any_")}
            </li>
            <li>
              <strong>{t("automated_tools")}</strong>
              <br />
              {t("do_not_use_bots_scrapers_or_automated_extraction_t")}
            </li>
            <li>
              <strong>{t("illegal_or_sensitive_content")}</strong>
              <br />
              Do not upload illegal, sensitive, or prohibited content unless
              explicitly required for Records of Processing Activities (RoPA)
              compliance.
            </li>
            <li>
              <strong>{t("unlawful_activities")}</strong>
              <br />
              {t("do_not_use_the_application_for_any_activity_that_v")}
            </li>
            <li>
              <strong>{t("resource_abuse")}</strong>
              <br />
              {t("do_not_introduce_excessive_load_disrupt_performanc")}
            </li>
          </ul>

          <p className="text-gray-700 mt-3">
            {t("violation_of_this")}
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">
            {t("11_third_party_integrations")}
          </h2>

          <p className="text-gray-700 mb-3">
            <strong>{t("11_1_integration_features")}</strong>
            <br />
            {t("certain_features_of_the_application_may_integrate_")}
          </p>

          <p className="text-gray-700 mb-3">
            <strong>{t("11_2_disclaimer_of_responsibility")}</strong>
            <br />
            {t("proteccio_data_is_not_resposible")}
          </p>

          <p className="text-gray-700">
            <strong>{t("11_3_third_party_terms")}</strong>
            <br />
            {t("third_party_terms")}
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">
            {t("12_support_maintenance_slas")}
          </h2>

          <p className="text-gray-700 mb-3">
            <strong>{t("support_includes")}</strong>
          </p>
          <ul className="list-disc ml-6 text-gray-700 space-y-1">
            <li>
              {t("email_based_support_for_general_inquiries_and_tech")}
            </li>
            <li>
              {t("access_to_a_ticketing_system_for_issue_tracking_an")}
            </li>
            <li>{t("issue_resolution_prioritized_based_on_severity_lev")}</li>
            <li>
              {t("deployment_of_patches_updates_and_security_release")}
            </li>
          </ul>

          <p className="text-gray-700 mt-3">
            <strong>{t("indicative_response_times")}</strong>
          </p>
          <ul className="list-disc ml-6 text-gray-700 space-y-1">
            <li>{t("critical_issues_response_within_24_hours")}</li>
            <li>{t("high_severity_response_within_48_hours")}</li>
            <li>{t("medium_severity_response_within_3_5_business_days")}</li>
            <li>{t("low_severity_response_within_7_10_business_days")}</li>
          </ul>

          <p className="text-gray-700 mt-3">
            <strong>{t("important_note")}</strong> {t("these_sla_timelines")}
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">{t("13_beta_features")}</h2>
          <p className="text-gray-700 mb-2">
            <strong>{t("as_is_basis")}</strong>
            <br />
            {t("beta_features_are_provided")}
          </p>
          <p className="text-gray-700 mb-2">
            <strong>{t("subject_to_change")}</strong>
            <br />
            {t("beta_features_may_change_break_or_be_removed_at_an")}
          </p>
          <p className="text-gray-700">
            <strong>{t("assumption_of_risk")}</strong>
            <br />
            {t("by_using_beta_features")}
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">
            {t("14_fees_subscriptions_payments")}
          </h2>

          <p className="text-gray-700 mb-3">
            <strong>{t("14_1_pricing_and_renewal")}</strong>
            <br />
            {t("details_of_paid_plans_licensing_models_and_renewal")}
          </p>

          <p className="text-gray-700 mb-3">
            <strong>{t("14_2_non_refundable_fees")}</strong>
            <br />
            {t("all_fees_charges_and_payments_made_to_proteccio_da")}
          </p>

          <p className="text-gray-700 mb-3">
            <strong>{t("14_3_non_payment_consequences")}</strong>
            <br />
            {t("failure_to_make_timely_payments_may_result_in_serv")}
          </p>

          <p className="text-gray-700">
            <strong>{t("14_4_taxes_and_levies")}</strong>
            <br />
            {t("all_applicable_taxes_duties_or_levies_imposed_by_l")}
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">{t("15_confidentiality")}</h2>

          <p className="text-gray-700 mb-3">{t("both_parties_agree_to")}</p>
          <ul className="list-disc ml-6 text-gray-700 space-y-1">
            <li>
              <strong>{t("protect_confidential_information")}</strong> {t("maintain_the_confidentiality_of_all_proprietary_or")}
            </li>
            <li>
              <strong>{t("restrict_disclosure")}</strong> {t("not_disclose_confidential_information_to_any_unaut")}
            </li>
            <li>
              <strong>{t("limit_use")}</strong> {t("use_confidential_information_strictly_for_the_inte")}
            </li>
          </ul>

          <p className="text-gray-700 mt-3">
            {t("exceptions")}
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">
            {t("16_security_incidents_breach_notification")}
          </h2>

          <p className="text-gray-700 mb-3">
            <strong>{t("proteccio_data_obligations")}</strong>
            <br />
            {t("in_the_event_of_a_confirmed_security_incident_invo")}
          </p>
          <ul className="list-disc ml-6 text-gray-700 space-y-1">
            <li>
              {t("notify_you_within_a_reasonable_timeframe_after_bec")}
            </li>
            <li>
              {t("provide_all_known_details_regarding_the_nature_and")}
            </li>
            <li>
              {t("cooperate_with_you_in_remediation_efforts_to_mitig")}
            </li>
            <li>
              {t("support_you_in_fulfilling_any_legal_or_regulatory_")}
            </li>
          </ul>

          <p className="text-gray-700 mt-3">
            <strong>{t("customer_obligations")}</strong>
            <br />
            {t("you_must_inform")}
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">
            {t("17_data_retention_export_deletion")}
          </h2>

          <p className="text-gray-700 mb-2">
            <strong>{t("17_1_retention_during_subscription")}</strong>
            <br />
            {t("customer_data_will_be_retained_for_as_long_as_your")}
          </p>
          <p className="text-gray-700 mb-2">
            <strong>{t("17_2_data_export")}</strong>
            <br />
            {t("you_may_export_your_customer_data_at_any_time_usin")}
          </p>
          <p className="text-gray-700">
            <strong>{t("17_3_post_termination_handling")}</strong>
            <br />
            {t("upon_termination_of_your_subscription")}
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">{t("18_audit_rights")}</h2>

          <p className="text-gray-700 mb-3">
            {t("enterprise_customers_may_request_the_following_com")}
          </p>

          <ul className="list-disc ml-6 text-gray-700 space-y-1">
            <li>{t("security_compliance_reports")}</li>
            <li>
              {t("documentation_of_implemented_security_measures_and")}
            </li>
            <li>
              {t("access_logs_detailed_logs_of_user_and_system_acces")}
            </li>
            <li>
              {t("artifacts_or_attestations_evidence_of_adherence_to")}
            </li>
            <li>
              {t("third_party_audit_results_summaries_or_reports_fro")}
            </li>
          </ul>

          <p className="text-gray-700 mt-3">
            {t("important_limitation_no_physical_or_on_site_audits")}
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">{t("19_intellectual_property")}</h2>

          <p className="text-gray-700">
            {t("all_intellectual_property_rights_related_to_the_ap")}
          </p>

          <ul className="list-disc ml-6 text-gray-700 space-y-1 mt-4">
            <li>{t("source_code")}</li>
            <li>{t("design_and_architecture")}</li>
            <li>{t("workflow_logic")}</li>
            <li>{t("ux_ui_components")}</li>
            <li>{t("documentation_and_training_materials")}</li>
            <li>{t("branding_and_trademarks")}</li>
            <li>{t("algorithms_and_data_models")}</li>
            <li>{t("proprietary_frameworks_and_tools")}</li>
          </ul>

          <p className="text-gray-700 mt-4">
            {t("you_gain_no_rights")}
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">
            {t("20_warranties_disclaimers")}
          </h2>

          <p className="text-gray-700 mb-3">
            {t("proteccio_data_does_not_warrant_or_guarantee_that")}
          </p>
          <ul className="list-disc ml-6 text-gray-700 space-y-1">
            <li>{t("the_application_will_be_error_free_or_uninterrupte")}</li>
            <li>{t("data_will_never_be_lost_corrupted_or_inaccessible")}</li>
            <li>{t("third_party_integrations_will_always_function_as_e")}</li>
            <li>
              {t("the_service_will_meet_all_compliance_obligations_o")}
            </li>
            <li>
              {t("reports_or_outputs_generated_by_the_application_wi")}
            </li>
          </ul>

          <p className="text-gray-700 mt-3">
            {t("disclaimer")}
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">
            {t("21_limitation_of_liability")}
          </h2>

          <p className="text-gray-700">
            {t("to_the_maximum_extent_permitted_by_law")}
          </p>
          <ul className="list-disc ml-6 text-gray-700 space-y-1 mt-3">
            <li>
             {t("no_indirect_or_consequence")}
            </li>
            <li>
              {t("liability_cap")}
            </li>
            <li>
              {t("risk_assumption")}
            </li>
          </ul>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">{t("22_indemnification")}</h2>

          <p className="text-gray-700">
            {t("you_agree_to_indemnify")}
          </p>

          <ul className="list-disc ml-6 text-gray-700 space-y-1 mt-3">
            <li>{t("misuse_of_the_application")}</li>
            <li>
              {t("any_use_of_the_application_in_violation_of_these_t")}
            </li>
            <li>
              {t("illegal_data_submissions_uploading_or_processing_d")}.
            </li>
            <li>
              {t("violation_of_applicable_laws_failure_to_comply_wit")}
            </li>
            <li>
              {t("breach_of_these_terms_any_breach_of_your_obligatio")}
            </li>
            <li>
              {t("third_party_interactions_issues_arising_from_your_")}
            </li>
          </ul>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">{t("23_termination")}</h2>

          <p className="text-gray-700 mb-3">
            {t("proteccio_data_may_suspend_or_terminate_your_acces")}
          </p>
          <ul className="list-disc ml-6 text-gray-700 space-y-1">
            <li>{t("you_breach_these_terms")}</li>
            <li>{t("you_violate_the_acceptable_use_policy")}</li>
            <li>{t("you_misuse_the_service_or_engage_in_prohibited_act")}</li>
            <li>
              {t("suspension_or_termination_is_required_by_law_or_re")}
            </li>
          </ul>

          <p className="text-gray-700 mt-3">
            <strong>{t("customer_termination_rights")}</strong> {t("you_may_terminate_your_account_at_any_time_by_foll")}
          </p>

          <p className="text-gray-700 mt-3">
            <strong>{t("effects_of_termination")}</strong>
          </p>
          <ul className="list-disc ml-6 text-gray-700 space-y-1">
            <li>
              {t("access_revoked_all_access_to_the_application_will_")}
            </li>
            <li>
              {t("data_handling_data_deletion_timelines_outlined_in_")}
            </li>
            <li>
              {t("outstanding_payments_any_unpaid_fees_or_charges_re")}
            </li>
          </ul>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">
            {t("24_modifications_to_terms")}
          </h2>

          <p className="text-gray-700">
            {t("modification_to_terms")}
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">
            {t("25_governing_law_jurisdiction")}
          </h2>

          <p className="text-gray-700">
            {t("governing_law_jurisdiction")}
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">{t("26_dispute_resolution")}</h2>

          <p className="text-gray-700 mb-3">
            {t("any_disputes_arising_under_or_in_connection_with_t")}
          </p>

          <ul className="list-disc ml-6 text-gray-700 space-y-1">
            <li>
              <strong>{t("good_faith_negotiations")}</strong> {t("the_parties_shall_first_attempt_to_resolve_the_dis")}
            </li>
            <li>
              <strong>{t("mediation")}</strong> - {t("if_negotiations_fail_the_parties_may_mutually_agre")}
            </li>
            <li>
              <strong>{t("arbitration")}</strong> {t("if_the_dispute_remains_unaddressed")}
              <ul className="list-disc ml-6 text-gray-700 mt-2">
                <li>{t("seat_of_arbitration_hyderabad_telangana_india")}</li>
                <li>{t("language_english")}</li>
                <li>
                  {t("arbitrator_a_single_arbitrator_appointed_mutually_")}
                </li>
              </ul>
            </li>
          </ul>

          <p className="text-gray-700 mt-3">
            {t("the_decision_of_the_arbitrator_shall_be_final_and_")}
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">{t("27_notices")}</h2>

          <p className="text-gray-700">{t("all_notices_should_be_sent_to")}</p>
          <p className="text-gray-700 mt-2">
            {t("proteccio_data")}
            <br />
            {t("email_contact_protecciodata_com")}
            <br />
            {t("address_please_refer_to_registered_address_on_webs")}
          </p>

          <p className="text-gray-700 mt-3">
            {t("notices_sent_electronically_are_considered_deliver")}
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">{t("28_entire_agreement")}</h2>

          <p className="text-gray-700">
            {t("entire_agreement")}
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">{t("29_severability")}</h2>

          <p className="text-gray-700">
            {t("if_any_provision")}
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">{t("30_waiver")}</h2>

          <p className="text-gray-700">
            {t("failure_by_either_party")}
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">{t("31_force_majeure")}</h2>

          <p className="text-gray-700">
            {t("proteccio_data_shall_not_be_held")}
          </p>

          <ul className="list-disc ml-6 text-gray-700 space-y-1 mt-3">
            <li>Natural disasters (e.g., earthquakes, floods, storms)</li>
            <li>{t("power_outages_or_utility_failures")}</li>
            <li>{t("cyber_attacks_or_other_malicious_activities")}</li>
            <li>{t("wars_civil_unrest_or_acts_of_terrorism")}</li>
            <li>{t("government_regulations_restrictions_or_orders")}</li>
            <li>{t("internet_or_telecommunications_service_disruptions")}</li>
          </ul>

          <p className="text-gray-700 mt-3">
            {t("such_events_shall_excuse_proteccio_data_from_its_o")}
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">{t("32_assignment")}</h2>

          <p className="text-gray-700 mb-3">
            {t("you_may_not_assign_or_transfer_these_terms_in_whol")}
          </p>

          <p className="text-gray-700">
           {t("proteccio_data_may_assign")}
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">{t("33_contact")}</h2>

          <p className="text-gray-700">
            {t("for_any_queries_support_or_assistance_please_reach")}
          </p>
          <p className="text-gray-700 mt-2">
            <strong>{t("email")}</strong> contact@protecciodata.com
            <br />
            <strong>{t("website")}</strong> www.protecciodata.com
          </p>
        </section>

        {/* Footer CTA */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-md bg-[#5DE992] text-black font-medium hover:opacity-90 transition"
          >
            {t("home")}
          </button>

          <a
            href="mailto:contact@protecciodata.com?subject=Terms Inquiry"
            className="inline-flex items-center gap-2 bg-[#5DE992] text-black px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
          >
            {t("contact_support")}
          </a>
        </div>
      </div>
      {/* </div> */}
    </main>
  );
}
