import type { SplitLanguageCode } from '../languages';

/**
 * Texts for the optional "send my registration details" box. Change the purpose to match yours.
 * Chinese and Russian keep these same two texts at the end of zh.ts and ru.ts.
 */
export const registrationTexts: Record<SplitLanguageCode, Record<string, string>> = {
  en: {
    'registration.consent':
      "I agree to send my name, email, phone number and year of birth to the app's server, so the developer can contact me about the app (support and important updates).",
    'registration.hint':
      'Optional. Your health data (periods, symptoms, mood) is never sent. You can delete this data any time with "Delete all my data".',
  },
  ar: {
    'registration.consent':
      'أوافق على إرسال اسمي وبريدي الإلكتروني ورقم هاتفي وسنة ميلادي إلى خادم التطبيق، ليتمكن المطوّر من التواصل معي بخصوص التطبيق (الدعم والتحديثات المهمة).',
    'registration.hint':
      'اختياري. بياناتك الصحية (الدورة والأعراض والمزاج) لا تُرسل أبداً. يمكنك حذف هذه البيانات في أي وقت من "حذف كل بياناتي".',
  },
  fr: {
    'registration.consent':
      "J'accepte d'envoyer mon nom, mon e-mail, mon numéro de téléphone et mon année de naissance au serveur de l'application, afin que le développeur puisse me contacter au sujet de l'application (assistance et mises à jour importantes).",
    'registration.hint':
      'Facultatif. Vos données de santé (règles, symptômes, humeur) ne sont jamais envoyées. Vous pouvez supprimer ces données à tout moment avec « Supprimer toutes mes données ».',
  },
  es: {
    'registration.consent':
      'Acepto enviar mi nombre, correo electrónico, número de teléfono y año de nacimiento al servidor de la app, para que el desarrollador pueda contactarme sobre la app (soporte y novedades importantes).',
    'registration.hint':
      'Opcional. Tus datos de salud (regla, síntomas, ánimo) nunca se envían. Puedes borrar estos datos en cualquier momento con «Borrar todos mis datos».',
  },
  de: {
    'registration.consent':
      'Ich bin damit einverstanden, meinen Namen, meine E-Mail-Adresse, meine Telefonnummer und mein Geburtsjahr an den Server der App zu senden, damit der Entwickler mich zur App kontaktieren kann (Support und wichtige Neuigkeiten).',
    'registration.hint':
      'Freiwillig. Deine Gesundheitsdaten (Periode, Beschwerden, Stimmung) werden nie gesendet. Du kannst diese Daten jederzeit mit „Alle meine Daten löschen“ entfernen.',
  },
  pt: {
    'registration.consent':
      'Aceito enviar o meu nome, e-mail, número de telefone e ano de nascimento para o servidor da app, para que o programador possa contactar-me sobre a app (apoio e novidades importantes).',
    'registration.hint':
      'Opcional. Os seus dados de saúde (menstruação, sintomas, humor) nunca são enviados. Pode apagar estes dados a qualquer momento com «Apagar todos os meus dados».',
  },
};