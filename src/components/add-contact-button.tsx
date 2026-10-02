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
    const vcardPath = `/api/vcard/${company.slug}/${person.slug}`;

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
        // If no app can resolve the intent (or the device blocks it),
        // Chrome falls back to this URL instead of silently doing nothing.
        `S.browser_fallback_url=${e(window.location.origin + vcardPath)}`,
      ].filter((part): part is string => Boolean(part));
      // `vnd.android.cursor.dir/contact` (ContactsContract.Contacts, the
      // "create a new contact" UI) — not `.../raw_contact`, which is a
      // lower-level sync-adapter table that no ordinary app registers to
      // handle, so that variant silently resolves to nothing at all.
      window.location.href = `intent://contact#Intent;action=android.intent.action.INSERT;type=vnd.android.cursor.dir/contact;${fields.join(";")};end`;
      return;
    }

    // A real navigation (not next/navigation's router) so the browser
    // actually processes the response's Content-Type/Content-Disposition —
    // an API route isn't a page, so this isn't the router-vs-<a> case that
    // rule guards against.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = vcardPath;
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
