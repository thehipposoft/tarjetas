"use client";

import type { Company, Person } from "@/types/card";
import { personPhone } from "@/lib/contact";
import { UserPlusIcon } from "@/components/icons";
import {
  RowButtonContent,
  rowButtonClasses,
  rowButtonStyle,
} from "@/components/cta-button";

/**
 * "Agregar contacto": saves this person straight into the visitor's phone.
 * A bare Android browser supports a direct `android.intent.action.INSERT`
 * intent (skips any file/share prompt); everything else (iOS Safari,
 * desktop, and in-app browsers like Instagram/WhatsApp, which can't resolve
 * `intent:` URIs at all) falls back to navigating to this person's vCard —
 * iOS opens its native "Add Contact" preview for a `text/vcard` response.
 * Person-page only: there's no equivalent "save this company" action.
 */
export function AddContactButton({
  person,
  company,
  primaryColor,
  className = "",
}: {
  person: Person;
  company: Company;
  primaryColor: string;
  className?: string;
}) {
  function handleClick() {
    const ua = navigator.userAgent;
    const isAndroid = /Android/i.test(ua);
    const isInAppBrowser = /Instagram|FBAN|FBAV|WhatsApp|LinkedInApp/i.test(
      ua
    );

    if (isAndroid && !isInAppBrowser) {
      const e = encodeURIComponent;
      const phone = personPhone(person);
      const org = company.name || company.slug;
      const fields = [
        `S.name=${e(`${person.firstName} ${person.lastName}`)}`,
        phone && `S.phone=${e(phone)}`,
        person.email && `S.email=${e(person.email)}`,
        `S.company=${e(org)}`,
        person.jobTitle && `S.job_title=${e(person.jobTitle)}`,
      ].filter((part): part is string => Boolean(part));
      window.location.href = `intent:#Intent;action=android.intent.action.INSERT;type=vnd.android.cursor.dir/raw_contact;${fields.join(";")};end`;
      return;
    }

    // A real navigation (not next/navigation's router) so the browser
    // actually processes the response's Content-Type/Content-Disposition —
    // an API route isn't a page, so this isn't the router-vs-<a> case that
    // rule guards against.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = `/api/vcard/${company.slug}/${person.slug}`;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={rowButtonClasses(true, className)}
      style={rowButtonStyle(primaryColor)}
    >
      <RowButtonContent icon={UserPlusIcon} label="Agregar contacto" branded />
    </button>
  );
}
